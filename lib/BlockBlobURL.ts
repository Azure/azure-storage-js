import { HttpRequestBody } from "ms-rest-js";
import { TransferProgressEvent } from "ms-rest-js/typings/lib/webResource";

import * as Models from "../lib/generated/models";
import { BlobURL } from "./BlobURL";
import { ContainerURL } from "./ContainerURL";
import { BlockBlob } from "./generated/operations";
import { IBlobAccessConditions, ICommonResponse } from "./models";
import { Pipeline } from "./Pipeline";
import { URLConstants } from "./utils/constants";
import { appendToURLPath, setURLParameter } from "./utils/utils.common";

export interface IBlockBlobUploadOptions {
  accessConditions?: IBlobAccessConditions;
  blobHTTPHeaders?: Models.BlobHTTPHeaders;
  metadata?: { [propertyName: string]: string };
  progress?: (progress: TransferProgressEvent) => void;
}

export declare type BlockBlobUploadResponse = ICommonResponse &
  Models.BlockBlobUploadHeaders;

export interface IBlockBlobStageBlockOptions {
  leaseAccessConditions?: Models.LeaseAccessConditions;
  progress?: (progress: TransferProgressEvent) => void;
}

export declare type BlockBlobStageBlockResponse = ICommonResponse &
  Models.BlockBlobStageBlockHeaders;

export interface IBlockBlobCommitBlockListOptions {
  accessConditions?: IBlobAccessConditions;
  blobHTTPHeaders?: Models.BlobHTTPHeaders;
  metadata?: { [propertyName: string]: string };
}

export declare type BlockBlobCommitBlockListResponse = ICommonResponse &
  Models.BlockBlobCommitBlockListHeaders;

export interface IBlockBlobGetBlockListOptions {
  leaseAccessConditions?: Models.LeaseAccessConditions;
}

export declare type BlockBlobGetBlockListResponse = ICommonResponse &
  Models.BlockBlobGetBlockListHeaders &
  Models.BlockList;

/**
 * BlockBlobURL defines a set of operations applicable to block blobs.
 *
 * @export
 * @class BlockBlobURL
 * @extends {StorageURL}
 */
export class BlockBlobURL extends BlobURL {
  /**
   * Creates a BlockBlobURL object from ContainerURL instance.
   *
   * @static
   * @param {ContainerURL} containerURL
   * @param {string} blobName
   * @returns {BlockBlobURL}
   * @memberof BlockBlobURL
   */
  public static fromContainerURL(
    containerURL: ContainerURL,
    blobName: string
  ): BlockBlobURL {
    return new BlockBlobURL(
      appendToURLPath(containerURL.url, blobName),
      containerURL.pipeline
    );
  }

  /**
   * Creates a BlockBlobURL object from BlobURL instance.
   *
   * @static
   * @param {BlobURL} blobURL
   * @returns {BlockBlobURL}
   * @memberof BlockBlobURL
   */
  public static fromBlobURL(blobURL: BlobURL): BlockBlobURL {
    return new BlockBlobURL(blobURL.url, blobURL.pipeline);
  }

  /**
   * blockBlobContext provided by protocol layer.
   *
   * @private
   * @type {BlockBlobs}
   * @memberof BlockBlobURL
   */
  private blockBlobContext: BlockBlob;

  /**
   * Creates an instance of BlockBlobURL.
   * @param {string} url
   * @param {Pipeline} pipeline
   * @memberof BlockBlobURL
   */
  constructor(url: string, pipeline: Pipeline) {
    super(url, pipeline);
    this.blockBlobContext = new BlockBlob(this.storageClientContext);
  }

  /**
   * Creates a new BlockBlobURL object identical to the source but with the
   * specified request policy pipeline.
   *
   * @param {Pipeline} pipeline
   * @returns {BlockBlobURL}
   * @memberof BlockBlobURL
   */
  public withPipeline(pipeline: Pipeline): BlockBlobURL {
    return new BlockBlobURL(this.url, pipeline);
  }

  /**
   * Creates a new BlockBlobURL object identical to the source but with the
   * specified snapshot timestamp.
   * Provide "" will remove the snapshot and return a URL to the base blob.
   *
   * @param {string} snapshot
   * @returns {BlockBlobURL}
   * @memberof BlockBlobURL
   */
  public withSnapshot(snapshot: string): BlockBlobURL {
    return new BlockBlobURL(
      setURLParameter(
        this.url,
        URLConstants.Parameters.SNAPSHOT,
        snapshot.length === 0 ? undefined : snapshot
      ),
      this.pipeline
    );
  }

  /**
   * Creates a new block blob, or updates the content of an existing block blob.
   * Updating an existing block blob overwrites any existing metadata on the blob.
   * Partial updates are not supported; the content of the existing blob is
   * overwritten with the new content. To perform a partial update of a block blob's,
   * use stageBlock and commitBlockList.
   * @see https://docs.microsoft.com/rest/api/storageservices/put-blob
   *
   * @param {HttpRequestBody} body
   * @param {number} contentLength
   * @param {IBlockBlobUploadOptions} [options]
   * @returns {Promise<BlockBlobUploadResponse>}
   * @memberof BlockBlobURL
   */
  public async upload(
    body: HttpRequestBody,
    contentLength: number,
    options: IBlockBlobUploadOptions = {}
  ): Promise<BlockBlobUploadResponse> {
    options.accessConditions = options.accessConditions || {};
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.blockBlobContext.upload(body, contentLength, {
      blobHTTPHeaders: options.blobHTTPHeaders,
      hTTPAccessConditions: options.accessConditions.HTTPAccessConditions,
      leaseAccessConditions: options.accessConditions.leaseAccessConditions,
      metadata: options.metadata,
      onUploadProgress: options.progress
    });
    return { ...result, ...parsedHeaders! };
  }

  /**
   * Uploads the specified block to the block blob's "staging area" to be later
   * committed by a call to commitBlockList.
   * @see https://docs.microsoft.com/rest/api/storageservices/put-block
   *
   * @param {string} blockId A 64-byte value that is base64-encoded
   * @param {HttpRequestBody} body
   * @param {number} contentLength
   * @param {IBlockBlobStageBlockOptions} [options]
   * @returns {Promise<BlockBlobStageBlockResponse>}
   * @memberof BlockBlobURL
   */
  public async stageBlock(
    blockId: string,
    body: HttpRequestBody,
    contentLength: number,
    options: IBlockBlobStageBlockOptions = {}
  ): Promise<BlockBlobStageBlockResponse> {
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.blockBlobContext.stageBlock(blockId, contentLength, body, {
      leaseAccessConditions: options.leaseAccessConditions,
      onUploadProgress: options.progress
    });
    return { ...result, ...parsedHeaders! };
  }

  /**
   * Writes a blob by specifying the list of block IDs that make up the blob.
   * In order to be written as part of a blob, a block must have been successfully written
   * to the server in a prior stageBlock operation. You can call commitBlockList to update a blob
   * by uploading only those blocks that have changed, then committing the new and existing
   * blocks together. Any blocks not specified in the block list and permanently deleted.
   * @see https://docs.microsoft.com/rest/api/storageservices/put-block-list
   *
   * @param {string[]} blocks  Array of 64-byte value that is base64-encoded
   * @param {IBlockBlobCommitBlockListOptions} [options]
   * @returns {Promise<BlockBlobCommitBlockListResponse>}
   * @memberof BlockBlobURL
   */
  public async commitBlockList(
    blocks: string[],
    options: IBlockBlobCommitBlockListOptions = {}
  ): Promise<BlockBlobCommitBlockListResponse> {
    options.accessConditions = options.accessConditions || {};
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.blockBlobContext.commitBlockList(
      { latest: blocks },
      {
        blobHTTPHeaders: options.blobHTTPHeaders,
        hTTPAccessConditions: options.accessConditions.HTTPAccessConditions,
        leaseAccessConditions: options.accessConditions.leaseAccessConditions,
        metadata: options.metadata
      }
    );
    return { ...result, ...parsedHeaders! };
  }

  /**
   * Returns the list of blocks that have been uploaded as part of a block blob
   * using the specified block list filter.
   * @see https://docs.microsoft.com/rest/api/storageservices/get-block-list
   *
   * @param {Models.BlockListType} listType
   * @param {IBlockBlobGetBlockListOptions} [options]
   * @returns {Promise<BlockBlobGetBlockListResponse>}
   * @memberof BlockBlobURL
   */
  public async getBlockList(
    listType: Models.BlockListType,
    options: IBlockBlobGetBlockListOptions = {}
  ): Promise<BlockBlobGetBlockListResponse> {
    const {
      bodyAsText,
      parsedBody,
      parsedHeaders,
      blobBody,
      readableStreamBody,
      ...result
    } = await this.blockBlobContext.getBlockList(listType, {
      leaseAccessConditions: options.leaseAccessConditions
    });
    return { ...result, ...parsedBody!, ...parsedHeaders };
  }
}
