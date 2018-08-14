import {
    ListBlobsIncludeItem, PublicAccessType, PublicAccessType as IPublicAccessType, SignedIdentifier
} from "../lib/generated/models";
import { Models } from "./";
import { Container } from "./generated/operations";
import {
    ICommonResponse, IContainerAccessConditions, IHTTPAccessConditions, ILeaseAccessConditions,
    IMetadata
} from "./models";
import { Pipeline } from "./Pipeline";
import { ServiceURL } from "./ServiceURL";
import { StorageURL } from "./StorageURL";
import { ETagNone } from "./utils/constants";
import { appendToURLPath } from "./utils/utils.common";

export interface IContainerCreateOptions {
  metadata?: IMetadata;
  access?: IPublicAccessType;
}

// TODO: Protocol layer: make blobBody and readableStreamBody not always optional; Be specific
export declare type ContainerCreateResponse = ICommonResponse &
  Models.ContainerCreateHeaders;

export interface IContainerGetPropertiesOptions {
  leaseAccessConditions?: ILeaseAccessConditions;
}

export declare type ContainerGetPropertiesResponse = ICommonResponse &
  Models.ContainerGetPropertiesHeaders;

export interface IContainerDeleteMethodOptions {
  accessConditions?: IContainerAccessConditions;
}

export declare type ContainerDeleteResponse = ICommonResponse &
  Models.ContainerDeleteHeaders;

export interface IContainerSetMetadataOptions {
  metadata?: IMetadata;
  accessConditions?: IContainerAccessConditions;
}

export declare type ContainerSetMetadataResponse = ICommonResponse &
  Models.ContainerSetMetadataHeaders;

export interface IContainerGetAccessPolicyOptions {
  leaseAccessConditions?: ILeaseAccessConditions;
}

export declare type ContainerGetAccessPolicyResponse = ICommonResponse &
  Models.ContainerGetAccessPolicyHeaders & {
    signedIdentifiers: SignedIdentifier[];
  };

export interface IContainerSetAccessPolicyOptions {
  accessConditions?: IContainerAccessConditions;
}

export declare type ContainerSetAccessPolicyResponse = ICommonResponse &
  Models.ContainerSetAccessPolicyHeaders;

export interface IContainerAcquireLeaseOptions {
  HTTPAccessConditions?: IHTTPAccessConditions;
}

export declare type ContainerAcquireLeaseResponse = ICommonResponse &
  Models.ContainerAcquireLeaseHeaders;

export interface IContainerReleaseLeaseOptions {
  HTTPAccessConditions?: IHTTPAccessConditions;
}

export declare type ContainerReleaseLeaseResponse = ICommonResponse &
  Models.ContainerReleaseLeaseHeaders;

export interface IContainerRenewLeaseOptions {
  HTTPAccessConditions?: IHTTPAccessConditions;
}

export declare type ContainerRenewLeaseResponse = ICommonResponse &
  Models.ContainerRenewLeaseHeaders;

export interface IContainerBreakLeaseOptions {
  HTTPAccessConditions?: IHTTPAccessConditions;
}

export declare type ContainerBreakLeaseResponse = ICommonResponse &
  Models.ContainerBreakLeaseHeaders;

export interface IContainerChangeLeaseOptions {
  HTTPAccessConditions?: IHTTPAccessConditions;
}

export declare type ContainerChangeLeaseResponse = ICommonResponse &
  Models.ContainerChangeLeaseHeaders;

export interface IContainerListBlobsSegmentOptions {
  /**
   * @member {string} [prefix] Filters the results to return only containers
   * whose name begins with the specified prefix.
   */
  prefix?: string;
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
   * @member {ListBlobsIncludeItem[]} [include] Include this parameter to
   * specify one or more datasets to include in the response.
   */
  include?: ListBlobsIncludeItem[];
}

export declare type ContainerListBlobFlatSegmentResponse = ICommonResponse &
  Models.ContainerListBlobFlatSegmentHeaders &
  Models.ListBlobsFlatSegmentResponse;

export declare type ContainerListBlobHierarchySegmentResponse = ICommonResponse &
  Models.ContainerListBlobHierarchySegmentHeaders &
  Models.ListBlobsHierarchySegmentResponse;

/**
 * A ContainerURL represents a URL to the Azure Storage container allowing you to manipulate its blobs.
 *
 * @export
 * @class ContainerURL
 * @extends {StorageURL}
 */
export class ContainerURL extends StorageURL {
  /**
   * Creates a ContainerURL object from ServiceURL
   * @param serviceURL
   * @param containerName
   */
  public static fromServiceURL(
    serviceURL: ServiceURL,
    containerName: string
  ): ContainerURL {
    return new ContainerURL(
      appendToURLPath(serviceURL.url, containerName),
      serviceURL.pipeline
    );
  }

  /**
   * containersContext provided by protocol layer.
   *
   * @private
   * @type {Containers}
   * @memberof ContainerURL
   */
  private containerContext: Container;

  /**
   * Creates an instance of ContainerURL.
   * @param {string} url
   * @param {Pipeline} pipeline
   * @memberof ContainerURL
   */
  constructor(url: string, pipeline: Pipeline) {
    super(url, pipeline);
    this.containerContext = new Container(this.storageClientContext);
  }

  /**
   * Creates a new ContainerURL object identical to the source but with the
   * specified request policy pipeline.
   *
   * @param {Pipeline} pipeline
   * @returns {ContainerURL}
   * @memberof ContainerURL
   */
  public withPipeline(pipeline: Pipeline): ContainerURL {
    return new ContainerURL(this.url, pipeline);
  }

  /**
   * Creates a new container under the specified account. If the container with
   * the same name already exists, the operation fails.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/create-container
   *
   * @param {IContainerCreateOptions} [options]
   * @returns {Promise<ContainerCreateResponse>}
   * @memberof ContainerURL
   */
  public async create(
    options: IContainerCreateOptions = {}
  ): Promise<ContainerCreateResponse> {
    // Spread operator in destructuring assignments,
    // this will filter out unwanted properties from the reponse object into result object
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.containerContext.create(options);
    return { ...result, ...parsedHeaders! };
  }

  /**
   * Returns all user-defined metadata and system properties for the specified
   * container. The data returned does not include the container's list of blobs.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/get-container-properties
   *
   * @param {IContainersGetPropertiesOptions} [options]
   * @returns {Promise<ContainerGetPropertiesResponse>}
   * @memberof ContainerURL
   */
  public async getProperties(
    options: IContainerGetPropertiesOptions = {}
  ): Promise<ContainerGetPropertiesResponse> {
    if (!options.leaseAccessConditions) {
      options.leaseAccessConditions = {};
    }

    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.containerContext.getProperties({
      ...options.leaseAccessConditions
    });
    return { ...result, ...parsedHeaders! };
  }

  /**
   * Marks the specified container for deletion. The container and any blobs
   * contained within it are later deleted during garbage collection.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/delete-container
   *
   * @param {Models.ContainersDeleteMethodOptionalParams} [options]
   * @returns {Promise<ContainerDeleteResponse>}
   * @memberof ContainerURL
   */
  public async delete(
    options: IContainerDeleteMethodOptions = {}
  ): Promise<ContainerDeleteResponse> {
    if (!options.accessConditions) {
      options.accessConditions = {};
    }

    if (!options.accessConditions.HTTPAccessConditions) {
      options.accessConditions.HTTPAccessConditions = {};
    }

    if (!options.accessConditions.leaseAccessConditions) {
      options.accessConditions.leaseAccessConditions = {};
    }

    if (
      (options.accessConditions.HTTPAccessConditions.ifMatch &&
        options.accessConditions.HTTPAccessConditions.ifMatch !== ETagNone) ||
      (options.accessConditions.HTTPAccessConditions.ifNoneMatch &&
        options.accessConditions.HTTPAccessConditions.ifNoneMatch !== ETagNone)
    ) {
      throw new Error(
        "the IfMatch and IfNoneMatch access conditions must have their default\
        values because they are ignored by the service"
      );
    }

    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.containerContext.deleteMethod({
      hTTPAccessConditions: options.accessConditions.HTTPAccessConditions,
      leaseAccessConditions: options.accessConditions.leaseAccessConditions
    });
    return { ...result, ...parsedHeaders! };
  }

  /**
   * Sets one or more user-defined name-value pairs for the specified container.
   *
   * If no option provided, or no metadata defined in the option parameter, the container
   * metadata will be removed.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/set-container-metadata
   *
   * @param {IContainerSetMetadataOptions} [options]
   * @returns {Promise<ContainerSetMetadataResponse>}
   * @memberof ContainerURL
   */
  public async setMetadata(
    options: IContainerSetMetadataOptions = {}
  ): Promise<ContainerSetMetadataResponse> {
    if (!options.accessConditions) {
      options.accessConditions = {};
    }

    if (!options.accessConditions.HTTPAccessConditions) {
      options.accessConditions.HTTPAccessConditions = {};
    }

    if (!options.accessConditions.leaseAccessConditions) {
      options.accessConditions.leaseAccessConditions = {};
    }

    if (
      options.accessConditions.HTTPAccessConditions.ifUnmodifiedSince ||
      (options.accessConditions.HTTPAccessConditions.ifMatch &&
        options.accessConditions.HTTPAccessConditions.ifMatch !== ETagNone) ||
      (options.accessConditions.HTTPAccessConditions.ifNoneMatch &&
        options.accessConditions.HTTPAccessConditions.ifNoneMatch !== ETagNone)
    ) {
      throw new Error(
        "the IfUnmodifiedSince, IfMatch, and IfNoneMatch must have their default values\
        because they are ignored by the blob service"
      );
    }

    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.containerContext.setMetadata({
      hTTPAccessConditions: options.accessConditions.HTTPAccessConditions,
      leaseAccessConditions: options.accessConditions.leaseAccessConditions,
      metadata: options.metadata
    });

    return { ...result, ...parsedHeaders! };
  }

  /**
   * Gets the permissions for the specified container. The permissions indicate
   * whether container data may be accessed publicly.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/get-container-acl
   *
   * @param {IContainerGetAccessPolicyOptions} [options]
   * @returns {Promise<ContainerGetAccessPolicyResponse>}
   * @memberof ContainerURL
   */
  public async getAccessPolicy(
    options: IContainerGetAccessPolicyOptions = {}
  ): Promise<ContainerGetAccessPolicyResponse> {
    if (!options.leaseAccessConditions) {
      options.leaseAccessConditions = {};
    }

    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.containerContext.getAccessPolicy({
      leaseAccessConditions: options.leaseAccessConditions
    });

    return {
      ...{ ...result, ...parsedHeaders! },
      ...{
        signedIdentifiers: parsedBody || []
      }
    };
  }

  /**
   * Sets the permissions for the specified container. The permissions indicate
   * whether blobs in a container may be accessed publicly.
   *
   * When you set permissions for a container, the existing permissions are replaced.
   * If no access or containerAcl provided, the existing container ACL will be
   * removed.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/set-container-acl
   *
   * @param {PublicAccessType} [access]
   * @param {SignedIdentifier[]} [containerAcl]
   * @param {IContainerSetAccessPolicyOptions} [options]
   * @returns {Promise<ContainerSetAccessPolicyResponse>}
   * @memberof ContainerURL
   */
  public async setAccessPolicy(
    access?: PublicAccessType,
    containerAcl?: SignedIdentifier[],
    options: IContainerSetAccessPolicyOptions = {}
  ): Promise<ContainerSetAccessPolicyResponse> {
    options.accessConditions = options.accessConditions || {};
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.containerContext.setAccessPolicy({
      access,
      containerAcl,
      hTTPAccessConditions: options.accessConditions.HTTPAccessConditions,
      leaseAccessConditions: options.accessConditions.leaseAccessConditions
    });

    return { ...result, ...parsedHeaders };
  }

  /**
   * Establishes and manages a lock on a container for delete operations.
   * The lock duration can be 15 to 60 seconds, or can be infinite.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/lease-container
   *
   * @param {string} proposedLeaseId Can be specified in any valid GUID string format
   * @param {number} duration Must be between 15 to 60 seconds, or infinite (-1)
   * @param {IContainerAcquireLeaseOptions} [options]
   * @returns {Promise<ContainerAcquireLeaseResponse>}
   * @memberof ContainerURL
   */
  public async acquireLease(
    proposedLeaseId: string,
    duration: number,
    options: IContainerAcquireLeaseOptions = {}
  ): Promise<ContainerAcquireLeaseResponse> {
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.containerContext.acquireLease({
      duration,
      hTTPAccessConditions: options.HTTPAccessConditions,
      proposedLeaseId
    });
    return { ...result, ...parsedHeaders };
  }

  /**
   * To free the lease if it is no longer needed so that another client may
   * immediately acquire a lease against the container.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/lease-container
   *
   * @param {string} leaseId
   * @param {IContainerReleaseLeaseOptions} [options]
   * @returns {Promise<ContainerReleaseLeaseResponse>}
   * @memberof ContainerURL
   */
  public async releaseLease(
    leaseId: string,
    options: IContainerReleaseLeaseOptions = {}
  ): Promise<ContainerReleaseLeaseResponse> {
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.containerContext.releaseLease(
      leaseId,
      {
        hTTPAccessConditions: options.HTTPAccessConditions
      }
    );
    return { ...result, ...parsedHeaders };
  }

  /**
   * To renew an existing lease.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/lease-container
   *
   * @param {string} leaseId
   * @param {IContainerRenewLeaseOptions} [options]
   * @returns {Promise<ContainerRenewLeaseResponse>}
   * @memberof ContainerURL
   */
  public async renewLease(
    leaseId: string,
    options: IContainerRenewLeaseOptions = {}
  ): Promise<ContainerRenewLeaseResponse> {
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.containerContext.renewLease(
      leaseId,
      {
        hTTPAccessConditions: options.HTTPAccessConditions
      }
    );
    return { ...result, ...parsedHeaders };
  }

  /**
   * To end the lease but ensure that another client cannot acquire a new lease
   * until the current lease period has expired.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/lease-container
   *
   * @param {number} period break period
   * @param {IContainerBreakLeaseOptions} [options]
   * @returns {Promise<ContainerBreakLeaseResponse>}
   * @memberof ContainerURL
   */
  public async breakLease(
    period: number,
    options: IContainerBreakLeaseOptions = {}
  ): Promise<ContainerBreakLeaseResponse> {
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.containerContext.breakLease({
      breakPeriod: period,
      hTTPAccessConditions: options.HTTPAccessConditions
    });
    return { ...result, ...parsedHeaders };
  }

  /**
   * To change the ID of an existing lease.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/lease-container
   *
   * @param {string} leaseId
   * @param {string} proposedLeaseId
   * @param {IContainerChangeLeaseOptions} [options]
   * @returns {Promise<ContainerChangeLeaseResponse>}
   * @memberof ContainerURL
   */
  public async changeLease(
    leaseId: string,
    proposedLeaseId: string,
    options: IContainerChangeLeaseOptions = {}
  ): Promise<ContainerChangeLeaseResponse> {
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.containerContext.changeLease(
      leaseId,
      proposedLeaseId,
      {
        hTTPAccessConditions: options.HTTPAccessConditions
      }
    );
    return { ...result, ...parsedHeaders };
  }

  /**
   * listBlobFlatSegment returns a single segment of blobs starting from the
   * specified Marker. Use an empty Marker to start enumeration from the beginning.
   * After getting a segment, process it, and then call ListBlobsFlatSegment again
   * (passing the the previously-returned Marker) to get the next segment.
   * @see https://docs.microsoft.com/rest/api/storageservices/list-blobs
   *
   * @param {string} [marker]
   * @param {IContainerListBlobsSegmentOptions} [options]
   * @returns {Promise<ContainerListBlobFlatSegmentResponse>}
   * @memberof ContainerURL
   */
  public async listBlobFlatSegment(
    marker?: string,
    options: IContainerListBlobsSegmentOptions = {}
  ): Promise<ContainerListBlobFlatSegmentResponse> {
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.containerContext.listBlobFlatSegment(
      {
        marker,
        ...options
      }
    );
    return { ...result, ...parsedBody!, ...parsedHeaders! };
  }

  /**
   * listBlobHierarchySegment returns a single segment of blobs starting from
   * the specified Marker. Use an empty Marker to start enumeration from the
   * beginning. After getting a segment, process it, and then call ListBlobsHierarchicalSegment
   * again (passing the the previously-returned Marker) to get the next segment.
   * @see https://docs.microsoft.com/rest/api/storageservices/list-blobs
   *
   * @param {string} delimiter
   * @param {IContainerListBlobsSegmentOptions} [options]
   * @returns {Promise<ContainerListBlobHierarchySegmentResponse>}
   * @memberof ContainerURL
   */
  public async listBlobHierarchySegment(
    delimiter: string,
    marker?: string,
    options: IContainerListBlobsSegmentOptions = {}
  ): Promise<ContainerListBlobHierarchySegmentResponse> {
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.containerContext.listBlobHierarchySegment(
      delimiter,
      {
        marker,
        ...options
      }
    );
    return { ...result, ...parsedBody!, ...parsedHeaders! };
  }
}
