import { TransferProgressEvent } from "ms-rest-js/typings/lib/webResource";

import * as Models from "../lib/generated/models";
import { ContainerURL } from "./ContainerURL";
import {
    BlobHTTPHeaders, DeleteSnapshotsOptionType, SourceHTTPAccessConditions
} from "./generated/models/index";
import { Blob } from "./generated/operations";
import { IBlobAccessConditions, ICommonResponse, IDownloadResponse } from "./models";
import { Pipeline } from "./Pipeline";
import { StorageURL } from "./StorageURL";
import { URLConstants } from "./utils/constants";
import { appendToURLPath, setURLParameter } from "./utils/utils.common";

export interface IBlobDownloadOptions {
  snapshot?: string;
  range?: string;
  rangeGetContentMD5?: boolean;
  accessConditions?: IBlobAccessConditions;
  progress?: (progress: TransferProgressEvent) => void;
}

export declare type BlobDownloadResponse = IDownloadResponse &
  Models.BlobDownloadHeaders;

export interface IBlobGetPropertiesOptions {
  accessConditions?: IBlobAccessConditions;
}

export declare type BlobGetPropertiesResponse = ICommonResponse &
  Models.BlobGetPropertiesHeaders;

export interface IBlobDeleteOptions {
  accessConditions?: IBlobAccessConditions;
  deleteSnapshots?: DeleteSnapshotsOptionType;
}

export declare type BlobDeleteResponse = ICommonResponse &
  Models.BlobDeleteHeaders;

export declare type BlobUndeleteResponse = ICommonResponse &
  Models.BlobUndeleteHeaders;

export interface IBlobSetHTTPHeadersOptions {
  accessConditions?: IBlobAccessConditions;
  blobHTTPHeaders?: BlobHTTPHeaders;
}

export declare type BlobSetHTTPHeadersResponse = ICommonResponse &
  Models.BlobSetHTTPHeadersHeaders;

export interface IBlobSetMetadataOptions {
  metadata?: { [propertyName: string]: string };
  accessConditions?: IBlobAccessConditions;
}

export declare type BlobSetMetadataResponse = ICommonResponse &
  Models.BlobSetMetadataHeaders;

export interface IBlobAcquireLeaseOptions {
  accessConditions?: Models.HTTPAccessConditions;
}

export declare type BlobAcquireLeaseResponse = ICommonResponse &
  Models.BlobAcquireLeaseHeaders;

export interface IBlobReleaseLeaseOptions {
  accessConditions?: Models.HTTPAccessConditions;
}

export declare type BlobReleaseLeaseResponse = ICommonResponse &
  Models.BlobReleaseLeaseHeaders;

export interface IBlobRenewLeaseOptions {
  accessConditions?: Models.HTTPAccessConditions;
}

export declare type BlobRenewLeaseResponse = ICommonResponse &
  Models.BlobRenewLeaseHeaders;

export interface IBlobChangeLeaseOptions {
  accessConditions?: Models.HTTPAccessConditions;
}

export declare type BlobChangeLeaseResponse = ICommonResponse &
  Models.BlobChangeLeaseHeaders;

export interface IBlobBreakLeaseOptions {
  accessConditions?: Models.HTTPAccessConditions;
}

export declare type BlobBreakLeaseResponse = ICommonResponse &
  Models.BlobBreakLeaseHeaders;

export interface IBlobCreateSnapshotOptions {
  metadata?: { [propertyName: string]: string };
  accessConditions?: IBlobAccessConditions;
}

export declare type BlobCreateSnapshotResponse = ICommonResponse &
  Models.BlobCreateSnapshotHeaders;

export interface IBlobStartCopyFromURLOptions {
  metadata?: { [propertyName: string]: string };
  accessConditions?: IBlobAccessConditions;
  sourceHTTPAccessConditions?: SourceHTTPAccessConditions;
}

export declare type BlobStartCopyFromURLResponse = ICommonResponse &
  Models.BlobStartCopyFromURLHeaders;

export interface IBlobAbortCopyFromURLOptions {
  leaseAccessConditions?: Models.LeaseAccessConditions;
}

export declare type BlobAbortCopyFromURLResponse = ICommonResponse &
  Models.BlobAbortCopyFromURLHeaders;

export declare type BlobSetTierResponse = ICommonResponse &
  Models.BlobSetTierHeaders;

/**
 * A BlobURL represents a URL to an Azure Storage blob; the blob may be a block blob,
 * append blob, or page blob.
 *
 * @export
 * @class BlobURL
 * @extends {StorageURL}
 */
export class BlobURL extends StorageURL {
  /**
   * Creates a BlobURL object from an ContainerURL object.
   *
   * @static
   * @param {ContainerURL} containerURL
   * @param {string} blobName
   * @returns
   * @memberof BlobURL
   */
  public static fromContainerURL(containerURL: ContainerURL, blobName: string) {
    return new BlobURL(
      appendToURLPath(containerURL.url, blobName),
      containerURL.pipeline
    );
  }

  /**
   * blobContext provided by protocol layer.
   *
   * @private
   * @type {Blobs}
   * @memberof BlobURL
   */
  private blobContext: Blob;

  /**
   * Creates an instance of BlobURL.
   * @param {string} url
   * @param {Pipeline} pipeline
   * @memberof BlobURL
   */
  constructor(url: string, pipeline: Pipeline) {
    super(url, pipeline);
    this.blobContext = new Blob(this.storageClientContext);
  }

  /**
   * Creates a new BlobURL object identical to the source but with the
   * specified request policy pipeline.
   *
   * @param {Pipeline} pipeline
   * @returns {BlobURL}
   * @memberof BlobURL
   */
  public withPipeline(pipeline: Pipeline): BlobURL {
    return new BlobURL(this.url, pipeline);
  }

  /**
   * Creates a new BlobURL object identical to the source but with the specified snapshot timestamp.
   * Provide "" will remove the snapshot and return a URL to the base blob.
   *
   * @param {string} snapshot
   * @returns {BlobURL} A new BlobURL object identical to the source but with the specified snapshot timestamp
   * @memberof BlobURL
   */
  public withSnapshot(snapshot: string): BlobURL {
    return new BlobURL(
      setURLParameter(
        this.url,
        URLConstants.Parameters.SNAPSHOT,
        snapshot.length === 0 ? undefined : snapshot
      ),
      this.pipeline
    );
  }

  /**
   * Reads or downloads a blob from the system, including its metadata and properties.
   * You can also call Get Blob to read a snapshot.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/get-blob
   *
   * @param {IBlobDownloadOptions} [options]
   * @returns {Promise<BlobDownloadResponse>}
   * @memberof BlobURL
   */
  public async download(
    options: IBlobDownloadOptions = {}
  ): Promise<BlobDownloadResponse> {
    options.accessConditions = options.accessConditions || {};

    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      ...result
    } = await this.blobContext.download({
      hTTPAccessConditions: options.accessConditions.HTTPAccessConditions,
      leaseAccessConditions: options.accessConditions.leaseAccessConditions,
      onUploadProgress: options.progress,
      range: options.range,
      rangeGetContentMD5: options.rangeGetContentMD5,
      snapshot: options.snapshot
    });
    return { ...result, ...parsedHeaders! };
  }

  /**
   * Returns all user-defined metadata, standard HTTP properties, and system properties
   * for the blob. It does not return the content of the blob.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/get-blob-properties
   *
   * @param {IBlobGetPropertiesOptions} [options]
   * @returns {Promise<BlobGetPropertiesResponse>}
   * @memberof BlobURL
   */
  public async getProperties(
    options: IBlobGetPropertiesOptions = {}
  ): Promise<BlobGetPropertiesResponse> {
    options.accessConditions = options.accessConditions || {};
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.blobContext.getProperties({
      hTTPAccessConditions: options.accessConditions.HTTPAccessConditions,
      leaseAccessConditions: options.accessConditions.leaseAccessConditions
    });
    return { ...result, ...parsedHeaders! };
  }

  /**
   * Marks the specified blob or snapshot for deletion. The blob is later deleted
   * during garbage collection. Note that in order to delete a blob, you must delete
   * all of its snapshots. You can delete both at the same time with the Delete
   * Blob operation.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/delete-blob
   *
   * @param {IBlobDeleteOptions} [options]
   * @returns {Promise<BlobDeleteResponse>}
   * @memberof BlobURL
   */
  public async delete(
    options: IBlobDeleteOptions = {}
  ): Promise<BlobDeleteResponse> {
    options.accessConditions = options.accessConditions || {};
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.blobContext.deleteMethod({
      deleteSnapshots: options.deleteSnapshots,
      hTTPAccessConditions: options.accessConditions.HTTPAccessConditions,
      leaseAccessConditions: options.accessConditions.leaseAccessConditions
    });
    return { ...result, ...parsedHeaders! };
  }

  /**
   * Restores the contents and metadata of soft deleted blob and any associated
   * soft deleted snapshots. Undelete Blob is supported only on version 2017-07-29
   * or later.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/undelete-blob
   *
   * @returns {Promise<BlobUndeleteResponse>}
   * @memberof BlobURL
   */
  public async undelete(): Promise<BlobUndeleteResponse> {
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.blobContext.undelete();
    return { ...result, ...parsedHeaders! };
  }

  /**
   * Sets system properties on the blob.
   *
   * If no option provided, or no value provided for the blob HTTP headers in the options,
   * these blob HTTP headers without a value will be cleared.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/set-blob-properties
   *
   * @param {IBlobSetHTTPHeadersOptions} [options]
   * @returns {Promise<BlobSetHTTPHeadersResponse>}
   * @memberof BlobURL
   */
  public async setHTTPHeaders(
    options: IBlobSetHTTPHeadersOptions = {}
  ): Promise<BlobSetHTTPHeadersResponse> {
    options.accessConditions = options.accessConditions || {};
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.blobContext.setHTTPHeaders({
      blobHTTPHeaders: options.blobHTTPHeaders,
      hTTPAccessConditions: options.accessConditions.HTTPAccessConditions,
      leaseAccessConditions: options.accessConditions.leaseAccessConditions
    });
    return { ...result, ...parsedHeaders! };
  }

  /**
   * Sets user-defined metadata for the specified blob as one or more name-value pairs.
   *
   * If no option provided, or no metadata defined in the option parameter, the blob
   * metadata will be removed.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/set-blob-metadata
   *
   * @param {IBlobSetMetadataOptions} [options]
   * @returns {Promise<BlobSetMetadataResponse>}
   * @memberof BlobURL
   */
  public async setMetadata(
    options: IBlobSetMetadataOptions = {}
  ): Promise<BlobSetMetadataResponse> {
    options.accessConditions = options.accessConditions || {};
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.blobContext.setMetadata({
      hTTPAccessConditions: options.accessConditions.HTTPAccessConditions,
      leaseAccessConditions: options.accessConditions.leaseAccessConditions,
      metadata: options.metadata
    });
    return { ...result, ...parsedHeaders! };
  }

  /**
   * Establishes and manages a lock on a blob for write and delete operations.
   * The lock duration can be 15 to 60 seconds, or can be infinite.
   * In versions prior to 2012-02-12, the lock duration is 60 seconds.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/lease-blob
   *
   * @param {string} proposedLeaseId Can be specified in any valid GUID string format
   * @param {number} duration The lock duration can be 15 to 60 seconds, or can be infinite
   * @param {IBlobAcquireLeaseOptions} [options]
   * @returns {Promise<BlobAcquireLeaseResponse>}
   * @memberof BlobURL
   */
  public async acquireLease(
    proposedLeaseId: string,
    duration: number,
    options: IBlobAcquireLeaseOptions = {}
  ): Promise<BlobAcquireLeaseResponse> {
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.blobContext.acquireLease({
      duration,
      hTTPAccessConditions: options.accessConditions,
      proposedLeaseId
    });
    return { ...result, ...parsedHeaders! };
  }

  /**
   * To free the lease if it is no longer needed so that another client may immediately
   * acquire a lease against the blob.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/lease-blob
   *
   * @param {string} leaseId
   * @param {IBlobReleaseLeaseOptions} [options]
   * @returns {Promise<BlobReleaseLeaseResponse>}
   * @memberof BlobURL
   */
  public async releaseLease(
    leaseId: string,
    options: IBlobReleaseLeaseOptions = {}
  ): Promise<BlobReleaseLeaseResponse> {
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.blobContext.releaseLease(leaseId, {
      hTTPAccessConditions: options.accessConditions
    });
    return { ...result, ...parsedHeaders! };
  }

  /**
   * To renew an existing lease.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/lease-blob
   *
   * @param {string} leaseId
   * @param {IBlobRenewLeaseOptions} [options]
   * @returns {Promise<BlobRenewLeaseResponse>}
   * @memberof BlobURL
   */
  public async renewLease(
    leaseId: string,
    options: IBlobRenewLeaseOptions = {}
  ): Promise<BlobRenewLeaseResponse> {
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.blobContext.renewLease(leaseId, {
      hTTPAccessConditions: options.accessConditions
    });
    return { ...result, ...parsedHeaders! };
  }

  /**
   * To change the ID of an existing lease.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/lease-blob
   *
   * @param {string} leaseId
   * @param {string} proposedLeaseId
   * @param {IBlobChangeLeaseOptions} [options]
   * @returns {Promise<BlobChangeLeaseResponse>}
   * @memberof BlobURL
   */
  public async changeLease(
    leaseId: string,
    proposedLeaseId: string,
    options: IBlobChangeLeaseOptions = {}
  ): Promise<BlobChangeLeaseResponse> {
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.blobContext.changeLease(leaseId, proposedLeaseId, {
      hTTPAccessConditions: options.accessConditions
    });
    return { ...result, ...parsedHeaders! };
  }

  /**
   * To end the lease but ensure that another client cannot acquire a new lease
   * until the current lease period has expired.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/lease-blob
   *
   * @param {number} [breakPeriod]
   * @param {IBlobBreakLeaseOptions} [options]
   * @returns {Promise<BlobBreakLeaseResponse>}
   * @memberof BlobURL
   */
  public async breakLease(
    breakPeriod?: number,
    options: IBlobBreakLeaseOptions = {}
  ): Promise<BlobBreakLeaseResponse> {
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.blobContext.breakLease({
      breakPeriod,
      hTTPAccessConditions: options.accessConditions
    });
    return { ...result, ...parsedHeaders! };
  }

  /**
   * Creates a read-only snapshot of a blob.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/snapshot-blob
   *
   * @param {IBlobCreateSnapshotOptions} [options]
   * @returns {Promise<BlobCreateSnapshotResponse>}
   * @memberof BlobURL
   */
  public async createSnapshot(
    options: IBlobCreateSnapshotOptions = {}
  ): Promise<BlobCreateSnapshotResponse> {
    options.accessConditions = options.accessConditions || {};
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.blobContext.createSnapshot({
      hTTPAccessConditions: options.accessConditions.HTTPAccessConditions,
      leaseAccessConditions: options.accessConditions.leaseAccessConditions,
      metadata: options.metadata
    });
    return { ...result, ...parsedHeaders! };
  }

  /**
   * Copies a blob to a destination within the storage account.
   * In version 2012-02-12 and later, the source for a Copy Blob operation can be
   * a committed blob in any Azure storage account.
   * Beginning with version 2015-02-21, the source for a Copy Blob operation can be
   * an Azure file in any Azure storage account.
   * Only storage accounts created on or after June 7th, 2012 allow the Copy Blob
   * operation to copy from another storage account.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/copy-blob
   *
   * @param {string} copySource
   * @param {IBlobStartCopyFromURLOptions} [options]
   * @returns {Promise<BlobStartCopyFromURLResponse>}
   * @memberof BlobURL
   */
  public async startCopyFromURL(
    copySource: string,
    options: IBlobStartCopyFromURLOptions = {}
  ): Promise<BlobStartCopyFromURLResponse> {
    options.accessConditions = options.accessConditions || {};
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.blobContext.startCopyFromURL(copySource, {
      hTTPAccessConditions: options.accessConditions.HTTPAccessConditions,
      leaseAccessConditions: options.accessConditions.leaseAccessConditions,
      metadata: options.metadata,
      sourceHTTPAccessConditions: options.sourceHTTPAccessConditions
    });
    return { ...result, ...parsedHeaders! };
  }

  /**
   * Aborts a pending Copy Blob operation, and leaves a destination blob with zero
   * length and full metadata. Version 2012-02-12 and newer.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/abort-copy-blob
   *
   * @param {string} copyId
   * @param {IBlobAbortCopyFromURLOptions} [options]
   * @returns {Promise<BlobAbortCopyFromURLResponse>}
   * @memberof BlobURL
   */
  public async abortCopyFromURL(
    copyId: string,
    options: IBlobAbortCopyFromURLOptions = {}
  ): Promise<BlobAbortCopyFromURLResponse> {
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.blobContext.abortCopyFromURL(copyId, {
      leaseAccessConditions: options.leaseAccessConditions
    });
    return { ...result, ...parsedHeaders! };
  }

  /**
   * Sets the tier on a blob. The operation is allowed on a page blob in a premium
   * storage account and on a block blob in a blob storage account (locally redundant
   * storage only). A premium page blob's tier determines the allowed size, IOPS,
   * and bandwidth of the blob. A block blob's tier determines Hot/Cool/Archive
   * storage type. This operation does not update the blob's ETag.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/set-blob-tier
   *
   * @param {Models.AccessTier} tier
   * @returns {Promise<BlobsSetTierResponse>}
   * @memberof BlobURL
   */
  public async setTier(tier: Models.AccessTier): Promise<BlobSetTierResponse> {
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.blobContext.setTier(tier);
    return { ...result, ...parsedHeaders! };
  }
}
