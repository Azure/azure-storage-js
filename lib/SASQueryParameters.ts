import { SASProtocol } from "./IAccountSASSignatureValues";
import { IIPRange, ipRangeToString } from "./IIPRange";
import { truncatedISO8061Date } from "./utils/utils.common";

/**
 * Represents the components that make up an Azure Storage SAS' query parameters. This type is not constructed directly
 * by the user; it is only generated by the {@link AccountSASSignatureValues} and {@link ServiceSASSignatureValues}
 * types. Once generated, it can be encoded into a {@code String} and appended to a URL directly (though caution should
 * be taken here in case there are existing query parameters, which might affect the appropriate means of appending
 * these query parameters).
 *
 * NOTE: Instances of this class are immutable.
 *
 * @export
 * @class SASQueryParameters
 */
export class SASQueryParameters {
  /**
   * The storage API version.
   *
   * @type {string}
   * @memberof SASQueryParameters
   */
  public readonly version: string;

  /**
   * Optional. The allowed HTTP protocol(s).
   *
   * @type {SASProtocol}
   * @memberof SASQueryParameters
   */
  public readonly protocol?: SASProtocol;

  /**
   * Optional. The start time for this SAS token.
   *
   * @type {Date}
   * @memberof SASQueryParameters
   */
  public readonly startTime?: Date;

  /**
   * Optional only when identifier is provided. The expiry time for this SAS token.
   *
   * @type {Date}
   * @memberof SASQueryParameters
   */
  public readonly expiryTime?: Date;

  /**
   * Optional only when identifier is provided.
   * Please refer to {@link AccountSASPermission}, {@link BlobSASPermission}, or {@link ContainerSASPermission} for
   * more details.
   *
   * @type {string}
   * @memberof SASQueryParameters
   */
  public readonly permissions?: string;

  /**
   * Optional. The storage services being accessed (only for Account SAS). Please refer to {@link AccountSASServices}
   * for more details.
   *
   * @type {string}
   * @memberof SASQueryParameters
   */
  public readonly services?: string;

  /**
   * Optional. The storage resource types being accessed (only for Account SAS). Please refer to
   * {@link AccountSASResourceTypes} for more details.
   *
   * @type {string}
   * @memberof SASQueryParameters
   */
  public readonly resourceTypes?: string;

  /**
   * Optional. The signed identifier (only for {@link ServiceSASSignatureValues}).
   *
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/establishing-a-stored-access-policy
   *
   * @type {string}
   * @memberof SASQueryParameters
   */
  public readonly identifier?: string;

  /**
   * Optional. The storage container or blob (only for {@link ServiceSASSignatureValues}).
   *
   * @type {string}
   * @memberof SASQueryParameters
   */
  public readonly resource?: string;

  /**
   * The signature for the SAS token.
   *
   * @type {string}
   * @memberof SASQueryParameters
   */
  public readonly signature: string;

  /**
   * Inner value of getter ipRange.
   *
   * @private
   * @type {IIPRange}
   * @memberof SASQueryParameters
   */
  private readonly ipRangeInner?: IIPRange;

  /**
   * Optional. IP range allowed for this SAS.
   *
   * @readonly
   * @type {(IIPRange | undefined)}
   * @memberof SASQueryParameters
   */
  public get ipRange(): IIPRange | undefined {
    if (this.ipRangeInner) {
      return {
        end: this.ipRangeInner.end,
        start: this.ipRangeInner.start,
      };
    }
    return undefined;
  }

  /**
   * Creates an instance of SASQueryParameters.
   *
   * @param {string} version Representing the storage version
   * @param {string} signature Representing the signature for the SAS token
   * @param {string} [permissions] Representing the storage permissions
   * @param {string} [services] Representing the storage services being accessed (only for Account SAS)
   * @param {string} [resourceTypes] Representing the storage resource types being accessed (only for Account SAS)
   * @param {SASProtocol} [protocol] Representing the allowed HTTP protocol(s)
   * @param {Date} [startTime] Representing the start time for this SAS token
   * @param {Date} [expiryTime] Representing the expiry time for this SAS token
   * @param {IIPRange} [ipRange] Representing the range of valid IP addresses for this SAS token
   * @param {string} [identifier] Representing the signed identifier (only for Service SAS)
   * @param {string} [resource] Representing the storage container or blob (only for Service SAS)
   * @memberof SASQueryParameters
   */
  constructor(
    version: string,
    signature: string,
    permissions?: string,
    services?: string,
    resourceTypes?: string,
    protocol?: SASProtocol,
    startTime?: Date,
    expiryTime?: Date,
    ipRange?: IIPRange,
    identifier?: string,
    resource?: string,
  ) {
    this.version = version;
    this.services = services;
    this.resourceTypes = resourceTypes;
    this.expiryTime = expiryTime;
    this.permissions = permissions;
    this.protocol = protocol;
    this.startTime = startTime;
    this.ipRangeInner = ipRange;
    this.identifier = identifier;
    this.resource = resource;
    this.signature = signature;
  }

  /**
   * Encodes all SAS query parameters into a string that can be appended to a URL.
   *
   * @returns {string}
   * @memberof SASQueryParameters
   */
  public toString(): string {
    const params: string[] = [
      "sv",
      "ss",
      "srt",
      "spr",
      "st",
      "se",
      "sip",
      "si",
      "sr",
      "sp",
      "sig",
    ];
    const queries: string[] = [];

    for (const param of params) {
      switch (param) {
        case "sv":
          this.tryAppendQueryParameter(queries, param, this.version);
          break;
        case "ss":
          this.tryAppendQueryParameter(queries, param, this.services);
          break;
        case "srt":
          this.tryAppendQueryParameter(queries, param, this.resourceTypes);
          break;
        case "spr":
          this.tryAppendQueryParameter(queries, param, this.protocol);
          break;
        case "st":
          this.tryAppendQueryParameter(
            queries,
            param,
            this.startTime ? truncatedISO8061Date(this.startTime) : undefined,
          );
          break;
        case "se":
          this.tryAppendQueryParameter(
            queries,
            param,
            this.expiryTime ? truncatedISO8061Date(this.expiryTime) : undefined,
          );
          break;
        case "sip":
          this.tryAppendQueryParameter(
            queries,
            param,
            this.ipRange ? ipRangeToString(this.ipRange) : undefined,
          );
          break;
        case "si":
          this.tryAppendQueryParameter(queries, param, this.identifier);
          break;
        case "sr":
          this.tryAppendQueryParameter(queries, param, this.resource);
          break;
        case "sp":
          this.tryAppendQueryParameter(queries, param, this.permissions);
          break;
        case "sig":
          this.tryAppendQueryParameter(queries, param, this.signature);
          break;
      }
    }
    return queries.join("&");
  }

  /**
   * A private helper method used to filter and append query key/value pairs into an array.
   *
   * @private
   * @param {string[]} queries
   * @param {string} key
   * @param {string} [value]
   * @returns {void}
   * @memberof SASQueryParameters
   */
  private tryAppendQueryParameter(
    queries: string[],
    key: string,
    value?: string,
  ): void {
    if (!value) {
      return;
    }

    key = encodeURIComponent(key);
    value = encodeURIComponent(value);
    if (key.length > 0 && value.length > 0) {
      queries.push(`${key}=${value}`);
    }
  }
}
