import * as Models from "../lib/generated/models";
import { ListContainersIncludeType } from "./generated/models/index";
import { Service } from "./generated/operations";
import { ICommonResponse } from "./models";
import { Pipeline } from "./Pipeline";
import { StorageURL } from "./StorageURL";

export declare type ServiceGetPropertiesResponse = ICommonResponse &
  Models.ServiceGetPropertiesHeaders &
  Models.StorageServiceProperties;

export declare type ServiceSetPropertiesResponse = ICommonResponse &
  Models.ServiceSetPropertiesHeaders;

export declare type ServiceGetStatisticsResponse = ICommonResponse &
  Models.ServiceGetStatisticsHeaders &
  Models.StorageServiceStats;

export interface IServiceListContainersSegmentOptions {
  /**
   * @member {string} [prefix] Filters the results to return only containers
   * whose name begins with the specified prefix.
   */
  prefix?: string
  /**
   * @member {string} [marker] A string value that identifies the portion of
   * the list of containers to be returned with the next listing operation. The
   * operation returns the NextMarker value within the response body if the
   * listing operation did not return all containers remaining to be listed
   * with the current page. The NextMarker value can be used as the value for
   * the marker parameter in a subsequent call to request the next page of list
   * items. The marker value is opaque to the client.
   */;
  marker?: string;
  /**
   * @member {number} [maxresults] Specifies the maximum number of containers
   * to return. If the request does not specify maxresults, or specifies a
   * value greater than 5000, the server will return up to 5000 items. Note
   * that if the listing operation crosses a partition boundary, then the
   * service will return a continuation token for retrieving the remainder of
   * the results. For this reason, it is possible that the service will return
   * fewer results than specified by maxresults, or than the default of 5000.
   */
  maxresults?: number;
  /**
   * @member {ListContainersIncludeType} [include] Include this parameter to
   * specify that the container's metadata be returned as part of the response
   * body. Possible values include: 'metadata'
   */
  include?: ListContainersIncludeType;
}

export declare type ServiceListContainersSegmentResponse = ICommonResponse &
  Models.ServiceListContainersSegmentHeaders &
  Models.ListContainersSegmentResponse;

/**
 * A ServiceURL represents a URL to the Azure Storage Blob service allowing you
 * to manipulate blob containers.
 *
 * @export
 * @class ServiceURL
 * @extends {StorageURL}
 */
export class ServiceURL extends StorageURL {
  /**
   * serviceContext provided by protocol layer.
   *
   * @private
   * @type {Service}
   * @memberof ServiceURL
   */
  private serviceContext: Service;

  /**
   * Creates an instance of ServiceURL.
   * @param {string} url
   * @param {Pipeline} pipeline
   * @memberof ServiceURL
   */
  constructor(url: string, pipeline: Pipeline) {
    super(url, pipeline);
    this.serviceContext = new Service(this.storageClientContext);
  }

  /**
   * Creates a new ServiceURL object identical to the source but with the
   * specified request policy pipeline.
   *
   * @param {Pipeline} pipeline
   * @returns {ServiceURL}
   * @memberof ServiceURL
   */
  public withPipeline(pipeline: Pipeline): ServiceURL {
    return new ServiceURL(this.url, pipeline);
  }

  /**
   * Gets the properties of a storage account’s Blob service, including properties
   * for Storage Analytics and CORS (Cross-Origin Resource Sharing) rules.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/get-blob-service-properties}
   *
   * @returns {Promise<ServiceGetPropertiesResponse>}
   * @memberof ServiceURL
   */
  public async getProperties(): Promise<ServiceGetPropertiesResponse> {
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.serviceContext.getProperties();
    return { ...result, ...parsedHeaders!, ...parsedBody! };
  }

  /**
   * Sets properties for a storage account’s Blob service endpoint, including properties
   * for Storage Analytics, CORS (Cross-Origin Resource Sharing) rules and soft delete settings.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/set-blob-service-properties}
   *
   * @param {Models.StorageServiceProperties} properties
   * @returns {Promise<ServiceSetPropertiesResponse>}
   * @memberof ServiceURL
   */
  public async setProperties(
    properties: Models.StorageServiceProperties
  ): Promise<ServiceSetPropertiesResponse> {
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.serviceContext.setProperties(
      properties
    );
    return { ...result, ...parsedHeaders! };
  }

  /**
   * Retrieves statistics related to replication for the Blob service. It is only
   * available on the secondary location endpoint when read-access geo-redundant
   * replication is enabled for the storage account.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/get-blob-service-stats}
   *
   * @returns {Promise<ServiceGetStatisticsResponse>}
   * @memberof ServiceURL
   */
  public async getStatistics(): Promise<ServiceGetStatisticsResponse> {
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.serviceContext.getStatistics();
    return { ...result, ...parsedHeaders!, ...parsedBody! };
  }

  /**
   * Returns a list of the containers under the specified account.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/list-containers2
   *
   * @param {string} [marker]
   * @param {IServiceListContainersSegmentOptions} [options]
   * @returns {Promise<ServiceListContainersSegmentResponse>}
   * @memberof ServiceURL
   */
  public async listContainersSegment(
    marker?: string,
    options: IServiceListContainersSegmentOptions = {}
  ): Promise<ServiceListContainersSegmentResponse> {
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.serviceContext.listContainersSegment(
      {
        marker,
        ...options
      }
    );
    return { ...result, ...parsedHeaders!, ...parsedBody! };
  }
}
