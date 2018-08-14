import { HttpRequestBody } from "ms-rest-js";
import { TransferProgressEvent } from "ms-rest-js/typings/lib/webResource";

import * as Models from "../lib/generated/models";
import { BlobURL } from "./BlobURL";
import { ContainerURL } from "./ContainerURL";
import { AppendBlob } from "./generated/operations";
import { IAppendBlobAccessConditions, IBlobAccessConditions, ICommonResponse } from "./models";
import { Pipeline } from "./Pipeline";
import { URLConstants } from "./utils/constants";
import { appendToURLPath, setURLParameter } from "./utils/utils.common";

export interface IAppendBlobCreateOptions {
  accessConditions?: IBlobAccessConditions;
  blobHTTPHeaders?: Models.BlobHTTPHeaders;
  metadata?: { [propertyName: string]: string };
}

export declare type AppendBlobCreateResponse = ICommonResponse &
  Models.AppendBlobCreateHeaders;

export interface IAppendBlobAppendBlockOptions {
  accessConditions?: IAppendBlobAccessConditions;
  progress?: (progress: TransferProgressEvent) => void;
}
export declare type AppendBlobAppendBlockResponse = ICommonResponse &
  Models.AppendBlobAppendBlockHeaders;

/**
 * AppendBlobURL defines a set of operations applicable to append blobs.
 *
 * @export
 * @class AppendBlobURL
 * @extends {StorageURL}
 */
export class AppendBlobURL extends BlobURL {
  /**
   * Creates a AppendBlobURL object from ContainerURL instance.
   *
   * @static
   * @param {ContainerURL} containerURL
   * @param {string} blobName
   * @returns {AppendBlobURL}
   * @memberof AppendBlobURL
   */
  public static fromContainerURL(
    containerURL: ContainerURL,
    blobName: string
  ): AppendBlobURL {
    return new AppendBlobURL(
      appendToURLPath(containerURL.url, blobName),
      containerURL.pipeline
    );
  }

  /**
   * Creates a AppendBlobURL object from BlobURL instance.
   *
   * @static
   * @param {BlobURL} blobURL
   * @returns {AppendBlobURL}
   * @memberof AppendBlobURL
   */
  public static fromBlobURL(blobURL: BlobURL): AppendBlobURL {
    return new AppendBlobURL(blobURL.url, blobURL.pipeline);
  }

  /**
   * appendBlobsContext provided by protocol layer.
   *
   * @private
   * @type {AppendBlobs}
   * @memberof AppendBlobURL
   */
  private appendBlobContext: AppendBlob;

  /**
   * Creates an instance of AppendBlobURL.
   * @param {string} url
   * @param {Pipeline} pipeline
   * @memberof AppendBlobURL
   */
  constructor(url: string, pipeline: Pipeline) {
    super(url, pipeline);
    this.appendBlobContext = new AppendBlob(this.storageClientContext);
  }

  /**
   * Creates a new AppendBlobURL object identical to the source but with the
   * specified request policy pipeline.
   *
   * @param {Pipeline} pipeline
   * @returns {AppendBlobURL}
   * @memberof AppendBlobURL
   */
  public withPipeline(pipeline: Pipeline): AppendBlobURL {
    return new AppendBlobURL(this.url, pipeline);
  }

  /**
   * Creates a new AppendBlobURL object identical to the source but with the
   * specified snapshot timestamp.
   * Provide "" will remove the snapshot and return a URL to the base blob.
   *
   * @param {string} snapshot
   * @returns {AppendBlobURL}
   * @memberof AppendBlobURL
   */
  public withSnapshot(snapshot: string): AppendBlobURL {
    return new AppendBlobURL(
      setURLParameter(
        this.url,
        URLConstants.Parameters.SNAPSHOT,
        snapshot.length === 0 ? undefined : snapshot
      ),
      this.pipeline
    );
  }

  /**
   * Create creates a 0-length append blob. Call AppendBlock to append data to an append blob.
   * @see https://docs.microsoft.com/rest/api/storageservices/put-blob
   *
   * @param {IAppendBlobCreateOptions} [options]
   * @returns {Promise<AppendBlobsCreateResponse>}
   * @memberof AppendBlobURL
   */
  public async create(
    options: IAppendBlobCreateOptions = {}
  ): Promise<AppendBlobCreateResponse> {
    options.accessConditions = options.accessConditions || {};
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.appendBlobContext.create(0, {
      blobHTTPHeaders: options.blobHTTPHeaders,
      hTTPAccessConditions: options.accessConditions.HTTPAccessConditions,
      leaseAccessConditions: options.accessConditions.leaseAccessConditions,
      metadata: options.metadata
    });
    return { ...result, ...parsedHeaders! };
  }

  /**
   * Commits a new block of data to the end of the existing append blob.
   * @see https://docs.microsoft.com/rest/api/storageservices/append-block
   *
   * @param {HttpRequestBody} body
   * @param {number} contentLength
   * @param {IAppendBlobAppendBlockOptions} [options]
   * @returns {Promise<AppendBlobsAppendBlockResponse>}
   * @memberof AppendBlobURL
   */
  public async appendBlock(
    body: HttpRequestBody,
    contentLength: number,
    options: IAppendBlobAppendBlockOptions = {}
  ): Promise<AppendBlobAppendBlockResponse> {
    options.accessConditions = options.accessConditions || {};
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.appendBlobContext.appendBlock(body, contentLength, {
      appendBlobAccessConditions:
        options.accessConditions.appendBlobAccessConditions,
      hTTPAccessConditions: options.accessConditions.HTTPAccessConditions,
      leaseAccessConditions: options.accessConditions.leaseAccessConditions,
      onUploadProgress: options.progress
    });
    return { ...result, ...parsedHeaders! };
  }
}
