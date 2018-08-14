import { isNode, RequestPolicy, RequestPolicyFactory, RequestPolicyOptions } from "ms-rest-js";
import * as os from "os";

import { TelemetryPolicy } from "./policies/TelemetryPolicy";
import { SERVICE_VERSION } from "./utils/constants";

/**
 * Interface of TelemetryPolicy options.
 *
 * @export
 * @interface ITelemetryOptions
 */
export interface ITelemetryOptions {
  value: string;
}

/**
 * TelemetryPolicyFactory is a factory class helping generating TelemetryPolicy objects.
 *
 * @export
 * @class TelemetryPolicyFactory
 * @implements {RequestPolicyFactory}
 */
export class TelemetryPolicyFactory implements RequestPolicyFactory {
  private telemetryString: string;

  /**
   * Creates an instance of TelemetryPolicyFactory.
   * @param {ITelemetryOptions} [telemetry]
   * @memberof TelemetryPolicyFactory
   */
  constructor(telemetry?: ITelemetryOptions) {
    const userAgentInfo: string[] = [];

    if (isNode) {
      if (telemetry) {
        const telemetryString = telemetry.value;
        if (
          telemetryString.length > 0 &&
          userAgentInfo.indexOf(telemetryString) === -1
        ) {
          userAgentInfo.push(telemetryString);
        }
      }

      const libInfo = `Azure-Storage/${SERVICE_VERSION}`;
      if (userAgentInfo.indexOf(libInfo) === -1) {
        userAgentInfo.push(libInfo);
      }

      const osInfo = `(${os.arch()}-${os.type()}-${os.release()})`;
      if (userAgentInfo.indexOf(osInfo) === -1) {
        userAgentInfo.push(osInfo);
      }

      const runtimeInfo = `Node/${process.version}`;
      if (userAgentInfo.indexOf(runtimeInfo) === -1) {
        userAgentInfo.push(runtimeInfo);
      }
    }

    this.telemetryString = userAgentInfo.join(" ");
  }

  public create(
    nextPolicy: RequestPolicy,
    options: RequestPolicyOptions
  ): TelemetryPolicy {
    return new TelemetryPolicy(nextPolicy, options, this.telemetryString);
  }
}
