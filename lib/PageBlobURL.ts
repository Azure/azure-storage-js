import { HttpRequestBody } from "ms-rest-js";
import { TransferProgressEvent } from "ms-rest-js/typings/lib/webResource";

import * as Models from "../lib/generated/models";
import { BlobURL } from "./BlobURL";
import { ContainerURL } from "./ContainerURL";
import { PageBlob } from "./generated/operations";
import { IBlobAccessConditions, ICommonResponse, IPageBlobAccessConditions } from "./models";
import { Pipeline } from "./Pipeline";
import { URLConstants } from "./utils/constants";
import { appendToURLPath, setURLParameter } from "./utils/utils.common";

export interface IPageBlobCreateOptions {
  accessConditions?: IBlobAccessConditions;
  blobSequenceNumber?: number;
  blobHTTPHeaders?: Models.BlobHTTPHeaders;
  metadata?: { [propertyName: string]: string };
}

export declare type PageBlobCreateResponse = ICommonResponse &
  Models.PageBlobCreateHeaders;

export interface IPageBlobUploadPagesOptions {
  accessConditions?: IPageBlobAccessConditions;
  range?: string;
  progress?: (progress: TransferProgressEvent) => void;
}

export declare type PageBlobUploadPagesResponse = ICommonResponse &
  Models.PageBlobUploadPagesHeaders;

export interface IPageBlobClearPagesOptions {
  accessConditions?: IPageBlobAccessConditions;
}

export declare type PageBlobClearPagesResponse = ICommonResponse &
  Models.PageBlobClearPagesHeaders;

export interface IPageBlobGetPageRangesOptions {
  accessConditions?: IBlobAccessConditions;
}

export declare type PageBlobGetPageRangesResponse = ICommonResponse &
  Models.PageBlobGetPageRangesHeaders &
  Models.PageList;

export interface IPageBlobGetPageRangesDiffOptions {
  accessConditions?: IBlobAccessConditions;
  range?: string;
}

export declare type PageBlobGetPageRangesDiffResponse = ICommonResponse &
  Models.PageBlobGetPageRangesDiffHeaders &
  Models.PageList;

export interface IPageBlobResizeOptions {
  accessConditions?: IBlobAccessConditions;
}

export declare type PageBlobResizeResponse = ICommonResponse &
  Models.PageBlobResizeHeaders;

export interface IPageBlobUpdateSequenceNumberOptions {
  accessConditions?: IBlobAccessConditions;
}

export declare type PageBlobUpdateSequenceNumberResponse = ICommonResponse &
  Models.PageBlobUpdateSequenceNumberHeaders;

export interface IPageBlobStartCopyIncrementalOptions {
  HTTPAccessConditions?: Models.HTTPAccessConditions;
  metadata?: { [propertyName: string]: string };
}

export declare type PageBlobStartCopyIncrementalResponse = ICommonResponse &
  Models.PageBlobCopyIncrementalHeaders;

/**
 * PageBlobURL defines a set of operations applicable to page blobs.
 *
 * @export
 * @class PageBlobURL
 * @extends {StorageURL}
 */
export class PageBlobURL extends BlobURL {
  /**
   * Creates a PageBlobURL object from ContainerURL instance.
   *
   * @static
   * @param {ContainerURL} containerURL
   * @param {string} blobName
   * @returns {PageBlobURL}
   * @memberof PageBlobURL
   */
  public static fromContainerURL(
    containerURL: ContainerURL,
    blobName: string
  ): PageBlobURL {
    return new PageBlobURL(
      appendToURLPath(containerURL.url, blobName),
      containerURL.pipeline
    );
  }

  /**
   * Creates a PageBlobURL object from BlobURL instance.
   *
   * @static
   * @param {BlobURL} blobURL
   * @returns {PageBlobURL}
   * @memberof PageBlobURL
   */
  public static fromBlobURL(blobURL: BlobURL): PageBlobURL {
    return new PageBlobURL(blobURL.url, blobURL.pipeline);
  }

  /**
   * pageBlobsContext provided by protocol layer.
   *
   * @private
   * @type {PageBlobs}
   * @memberof PageBlobURL
   */
  private pageBlobContext: PageBlob;

  /**
   * Creates an instance of PageBlobURL.
   * @param {string} url
   * @param {Pipeline} pipeline
   * @memberof PageBlobURL
   */
  constructor(url: string, pipeline: Pipeline) {
    super(url, pipeline);
    this.pageBlobContext = new PageBlob(this.storageClientContext);
  }

  /**
   * Creates a new PageBlobURL object identical to the source but with the
   * specified request policy pipeline.
   *
   * @param {Pipeline} pipeline
   * @returns {PageBlobURL}
   * @memberof PageBlobURL
   */
  public withPipeline(pipeline: Pipeline): PageBlobURL {
    return new PageBlobURL(this.url, pipeline);
  }

  /**
   * Creates a new PageBlobURL object identical to the source but with the
   * specified snapshot timestamp.
   * Provide "" will remove the snapshot and return a URL to the base blob.
   *
   * @param {string} snapshot
   * @returns {PageBlobURL}
   * @memberof PageBlobURL
   */
  public withSnapshot(snapshot: string): PageBlobURL {
    return new PageBlobURL(
      setURLParameter(
        this.url,
        URLConstants.Parameters.SNAPSHOT,
        snapshot.length === 0 ? undefined : snapshot
      ),
      this.pipeline
    );
  }

  /**
   * Creates a page blob of the specified length. Call uploadPages to upload data
   * data to a page blob.
   * @see https://docs.microsoft.com/rest/api/storageservices/put-blob
   *
   * @param {number} size
   * @param {IPageBlobCreateOptions} [options]
   * @returns {Promise<PageBlobCreateResponse>}
   * @memberof PageBlobURL
   */
  public async create(
    size: number,
    options: IPageBlobCreateOptions = {}
  ): Promise<PageBlobCreateResponse> {
    options.accessConditions = options.accessConditions || {};
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.pageBlobContext.create(0, size, {
      blobHTTPHeaders: options.blobHTTPHeaders,
      blobSequenceNumber: options.blobSequenceNumber,
      hTTPAccessConditions: options.accessConditions.HTTPAccessConditions,
      leaseAccessConditions: options.accessConditions.leaseAccessConditions,
      metadata: options.metadata
    });
    return { ...result, ...parsedHeaders! };
  }

  /**
   * Writes 1 or more pages to the page blob. The start and end offsets must be a multiple of 512.
   * @see https://docs.microsoft.com/rest/api/storageservices/put-page
   *
   * @param {HttpRequestBody} body
   * @param {number} contentLength
   * @param {IPageBlobUploadPagesOptions} [options]
   * @returns {Promise<PageBlobsUploadPagesResponse>}
   * @memberof PageBlobURL
   */
  public async uploadPages(
    body: HttpRequestBody,
    contentLength: number,
    options: IPageBlobUploadPagesOptions = {}
  ): Promise<PageBlobUploadPagesResponse> {
    options.accessConditions = options.accessConditions || {};
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.pageBlobContext.uploadPages(body, contentLength, {
      hTTPAccessConditions: options.accessConditions.HTTPAccessConditions,
      leaseAccessConditions: options.accessConditions.leaseAccessConditions,
      onUploadProgress: options.progress,
      pageBlobAccessConditions:
        options.accessConditions.pageBlobAccessConditions
    });
    return { ...result, ...parsedHeaders! };
  }

  /**
   * Frees the specified pages from the page blob.
   * @see https://docs.microsoft.com/rest/api/storageservices/put-page
   *
   * @param {number} offset
   * @param {number} count
   * @param {IPageBlobClearPagesOptions} [options]
   * @returns {Promise<PageBlobClearPagesResponse>}
   * @memberof PageBlobURL
   */
  public async clearPages(
    offset: number,
    count: number,
    options: IPageBlobClearPagesOptions = {}
  ): Promise<PageBlobClearPagesResponse> {
    options.accessConditions = options.accessConditions || {};
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.pageBlobContext.clearPages(0, {
      hTTPAccessConditions: options.accessConditions.HTTPAccessConditions,
      leaseAccessConditions: options.accessConditions.leaseAccessConditions,
      pageBlobAccessConditions:
        options.accessConditions.pageBlobAccessConditions,
      range: `bytes=${offset}-${offset + count - 1}`
    });
    return { ...result, ...parsedHeaders! };
  }

  /**
   * Returns the list of valid page ranges for a page blob or snapshot of a page blob.
   * @see https://docs.microsoft.com/rest/api/storageservices/get-page-ranges
   *
   * @param {number} offset
   * @param {number} count
   * @param {IPageBlobGetPageRangesOptions} [options]
   * @returns {Promise<PageBlobGetPageRangesResponse>}
   * @memberof PageBlobURL
   */
  public async getPageRanges(
    offset: number,
    count: number,
    options: IPageBlobGetPageRangesOptions = {}
  ): Promise<PageBlobGetPageRangesResponse> {
    options.accessConditions = options.accessConditions || {};
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.pageBlobContext.getPageRanges({
      hTTPAccessConditions: options.accessConditions.HTTPAccessConditions,
      leaseAccessConditions: options.accessConditions.leaseAccessConditions,
      range: `bytes=${offset}-${offset + count - 1}`
    });
    return { ...result, ...parsedHeaders!, ...parsedBody! };
  }

  /**
   * Gets the collection of page ranges that differ between a specified snapshot and this page blob.
   * @see https://docs.microsoft.com/rest/api/storageservices/get-page-ranges
   *
   * @param {number} offset
   * @param {number} count
   * @param {string} prevSnapshot
   * @param {IPageBlobGetPageRangesDiffOptions} [options]
   * @returns {Promise<PageBlobGetPageRangesDiffResponse>}
   * @memberof PageBlobURL
   */
  public async getPageRangesDiff(
    offset: number,
    count: number,
    prevSnapshot: string,
    options: IPageBlobGetPageRangesDiffOptions = {}
  ): Promise<PageBlobGetPageRangesDiffResponse> {
    options.accessConditions = options.accessConditions || {};
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.pageBlobContext.getPageRangesDiff({
      hTTPAccessConditions: options.accessConditions.HTTPAccessConditions,
      leaseAccessConditions: options.accessConditions.leaseAccessConditions,
      prevsnapshot: prevSnapshot,
      range: `bytes=${offset}-${offset + count - 1}`
    });
    return { ...result, ...parsedHeaders!, ...parsedBody! };
  }

  /**
   * Resizes the page blob to the specified size (which must be a multiple of 512).
   * @see https://docs.microsoft.com/rest/api/storageservices/set-blob-properties
   *
   * @param {number} size
   * @param {IPageBlobResizeOptions} [options]
   * @returns {Promise<PageBlobResizeResponse>}
   * @memberof PageBlobURL
   */
  public async resize(
    size: number,
    options: IPageBlobResizeOptions = {}
  ): Promise<PageBlobResizeResponse> {
    options.accessConditions = options.accessConditions || {};
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.pageBlobContext.resize(size, {
      hTTPAccessConditions: options.accessConditions.HTTPAccessConditions,
      leaseAccessConditions: options.accessConditions.leaseAccessConditions
    });
    return { ...result, ...parsedHeaders! };
  }

  /**
   * Sets a page blob's sequence number.
   *
   * @param {Models.SequenceNumberActionType} sequenceNumberAction
   * @param {number} sequenceNumber
   * @param {IPageBlobUpdateSequenceNumberOptions} [options]
   * @returns {Promise<PageBlobUpdateSequenceNumberResponse>}
   * @memberof PageBlobURL
   */
  public async updateSequenceNumber(
    sequenceNumberAction: Models.SequenceNumberActionType,
    sequenceNumber: number,
    options: IPageBlobUpdateSequenceNumberOptions = {}
  ): Promise<PageBlobUpdateSequenceNumberResponse> {
    options.accessConditions = options.accessConditions || {};
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.pageBlobContext.updateSequenceNumber(sequenceNumberAction, {
      blobSequenceNumber: sequenceNumber,
      hTTPAccessConditions: options.accessConditions.HTTPAccessConditions,
      leaseAccessConditions: options.accessConditions.leaseAccessConditions
    });
    return { ...result, ...parsedHeaders! };
  }

  /**
   * Begins an operation to start an incremental copy from one page blob's snapshot to this page blob.
   * The snapshot is copied such that only the differential changes between the previously
   * copied snapshot are transferred to the destination.
   * The copied snapshots are complete copies of the original snapshot and can be read or copied from as usual.
   * @see https://docs.microsoft.com/rest/api/storageservices/incremental-copy-blob
   * @see https://docs.microsoft.com/en-us/azure/virtual-machines/windows/incremental-snapshots
   *
   * @param {string} copySource Specifies the name of the source page blob snapshot. For example,
   *                            https://myaccount.blob.core.windows.net/mycontainer/myblob?snapshot=<DateTime>
   * @param {IPageBlobStartCopyIncrementalOptions} [options]
   * @returns {Promise<PageBlobStartCopyIncrementalResponse>}
   * @memberof PageBlobURL
   */
  public async startCopyIncremental(
    copySource: string,
    options: IPageBlobStartCopyIncrementalOptions = {}
  ): Promise<PageBlobStartCopyIncrementalResponse> {
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.pageBlobContext.copyIncremental(copySource, {
      hTTPAccessConditions: options.HTTPAccessConditions,
      metadata: options.metadata
    });
    return { ...result, ...parsedHeaders! };
  }
}
