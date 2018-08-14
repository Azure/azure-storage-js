import {
    BaseRequestPolicy, delay, HttpOperationResponse, RequestPolicy, RequestPolicyFactory,
    RequestPolicyOptions, WebResource
} from "ms-rest-js";

import { IRetryOptions } from "../RetryPolicyFactory";
import { setURLHost } from "../utils/utils.common";

/**
 * A factory method used to generated a RetryPolicy factory.
 *
 * @export
 * @param {IRetryOptions} retryOptions
 * @returns
 */
export function NewRetryPolicyFactory(
  retryOptions?: IRetryOptions
): RequestPolicyFactory {
  return {
    create: (
      nextPolicy: RequestPolicy,
      options: RequestPolicyOptions
    ): RetryPolicy => {
      return new RetryPolicy(nextPolicy, options, retryOptions);
    }
  };
}

/**
 * RetryPolicy types.
 *
 * @export
 * @enum {number}
 */
export enum RetryPolicyType {
  /**
   * Exponential retry. Retry time delay grows exponentially.
   */
  EXPONENTIAL,
  /**
   * Linear retry. Retry time delay grows linearly.
   */
  FIXED
}

// Default values of IRetryOptions.
const DEFAULT_RETRY_OPTIONS: IRetryOptions = {
  retryPolicyType: RetryPolicyType.EXPONENTIAL,
  // tslint:disable-next-line:object-literal-sort-keys
  maxTries: 4,
  tryTimeoutInMs: 30 * 1000,
  retryDelayInMs: 4 * 1000,
  maxRetryDelayInMs: 120 * 1000,
  secondaryHost: ""
};

/**
 * Retry policy with exponential retry and linear retry implemented.
 *
 * @class RetryPolicy
 * @extends {BaseRequestPolicy}
 */
export class RetryPolicy extends BaseRequestPolicy {
  /**
   * RetryOptions.
   *
   * @private
   * @type {IRetryOptions}
   * @memberof RetryPolicy
   */
  private readonly retryOptions: IRetryOptions;

  /**
   * Creates an instance of RetryPolicy.
   *
   * @param {RequestPolicy} nextPolicy
   * @param {RequestPolicyOptions} options
   * @param {IRetryOptions} [retryOptions=DEFAULT_RETRY_OPTIONS]
   * @memberof RetryPolicy
   */
  constructor(
    nextPolicy: RequestPolicy,
    options: RequestPolicyOptions,
    retryOptions: IRetryOptions = DEFAULT_RETRY_OPTIONS
  ) {
    super(nextPolicy, options);

    // Initialize retry options
    this.retryOptions = {
      retryPolicyType: retryOptions.retryPolicyType
        ? retryOptions.retryPolicyType
        : DEFAULT_RETRY_OPTIONS.retryPolicyType,

      maxTries:
        retryOptions.maxTries && retryOptions.maxTries >= 1
          ? Math.floor(retryOptions.maxTries)
          : DEFAULT_RETRY_OPTIONS.maxTries,

      tryTimeoutInMs:
        retryOptions.tryTimeoutInMs && retryOptions.tryTimeoutInMs >= 0
          ? retryOptions.tryTimeoutInMs
          : DEFAULT_RETRY_OPTIONS.tryTimeoutInMs,

      retryDelayInMs:
        retryOptions.retryDelayInMs && retryOptions.retryDelayInMs >= 0
          ? Math.min(
              retryOptions.retryDelayInMs,
              retryOptions.maxRetryDelayInMs
                ? retryOptions.maxRetryDelayInMs
                : DEFAULT_RETRY_OPTIONS.maxRetryDelayInMs!
            )
          : DEFAULT_RETRY_OPTIONS.retryDelayInMs,

      maxRetryDelayInMs:
        retryOptions.maxRetryDelayInMs && retryOptions.maxRetryDelayInMs >= 0
          ? retryOptions.maxRetryDelayInMs
          : DEFAULT_RETRY_OPTIONS.maxRetryDelayInMs,

      secondaryHost: retryOptions.secondaryHost
        ? retryOptions.secondaryHost
        : DEFAULT_RETRY_OPTIONS.secondaryHost
    };
  }

  /**
   * Sends request.
   *
   * @param {WebResource} request
   * @returns {Promise<HttpOperationResponse<any, any>>}
   * @memberof RetryPolicy
   */
  public async sendRequest(
    request: WebResource
  ): Promise<HttpOperationResponse<any, any>> {
    return this.attemptSendRequest(request, false, 1);
  }

  /**
   * Decide and perform next retry. Won't mutate request parameter.
   *
   * @protected
   * @param {WebResource} request
   * @param {HttpOperationResponse} response
   * @param {boolean} secondaryHas404  If attempt was against the secondary & it returned a StatusNotFound (404), then
   *                                   the resource was not found. This may be due to replication delay. So, in this
   *                                   case, we'll never try the secondary again for this operation.
   * @param {number} attempt           How many retries has been attempted to performed, starting from 1, which includes
   *                                   the attempt will be performed by this method call.
   * @returns {Promise<HttpOperationResponse>}
   * @memberof RetryPolicy
   */
  protected async attemptSendRequest(
    request: WebResource,
    secondaryHas404: boolean,
    attempt: number
  ): Promise<HttpOperationResponse> {
    const newRequest: WebResource = request.clone();

    const isPrimaryRetry =
      secondaryHas404 ||
      !this.retryOptions.secondaryHost ||
      !(
        request.method === "GET" ||
        request.method === "HEAD" ||
        request.method === "OPTIONS"
      ) ||
      attempt % 2 === 1;

    if (!isPrimaryRetry) {
      newRequest.url = setURLHost(
        newRequest.url,
        this.retryOptions.secondaryHost!
      );
    }

    // TODO: ms-rest-js doesn't expose HTTP request timeout, cannot set tryTimeout currently
    const response: HttpOperationResponse = await this._nextPolicy.sendRequest(
      newRequest
    );
    if (!this.shouldRetry(response, isPrimaryRetry, attempt)) {
      return response;
    }

    await this.delay(isPrimaryRetry, attempt);

    secondaryHas404 =
      secondaryHas404 || (!isPrimaryRetry && response.status === 404);
    return await this.attemptSendRequest(request, secondaryHas404, ++attempt);
  }

  /**
   * Decide whether to retry according to last HTTP response and retry counters.
   *
   * @protected
   * @param {HttpOperationResponse} response
   * @param {boolean} isPrimaryRetry
   * @param {number} attempt
   * @returns {boolean}
   * @memberof RetryPolicy
   */
  protected shouldRetry(
    response: HttpOperationResponse,
    isPrimaryRetry: boolean,
    attempt: number
  ): boolean {
    if (attempt >= this.retryOptions.maxTries!) {
      return false;
    }

    // TODO: Handle connection rest

    // If attempt was against the secondary & it returned a StatusNotFound (404), then
    // the resource was not found. This may be due to replication delay. So, in this
    // case, we'll never try the secondary again for this operation.
    if (!isPrimaryRetry && response.status === 404) {
      return true;
    }

    if (response.status === 503 || response.status === 500) {
      return true;
    }

    return false;
  }

  /**
   * Delay a calculated time between retries.
   *
   * @private
   * @param {boolean} isPrimaryRetry
   * @param {number} attempt
   * @returns
   * @memberof RetryPolicy
   */
  private async delay(isPrimaryRetry: boolean, attempt: number) {
    let delayTimeInMs: number = 0;

    if (isPrimaryRetry) {
      switch (this.retryOptions.retryPolicyType) {
        case RetryPolicyType.EXPONENTIAL:
          delayTimeInMs = Math.min(
            (Math.pow(2, attempt - 1) - 1) * this.retryOptions.retryDelayInMs!,
            this.retryOptions.maxRetryDelayInMs!
          );
          break;
        case RetryPolicyType.FIXED:
          delayTimeInMs = this.retryOptions.retryDelayInMs!;
          break;
      }
    } else {
      delayTimeInMs = Math.random() * 1000;
    }

    return delay(delayTimeInMs);
  }
}
