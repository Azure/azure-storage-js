import * as fs from "fs";
import { TransferProgressEvent } from "ms-rest-js/typings/lib/webResource";
import { Readable } from "stream";

import { BlobURL } from "./BlobURL";
import { BlockBlobURL } from "./BlockBlobURL";
import { BlobHTTPHeaders } from "./generated/models";
import {
    ICommonResponse, IDownloadFromBlobOptions, IUploadToBlockBlobOptions
} from "./highlevel.common";
import { IBlobAccessConditions } from "./models";
import { Batch } from "./utils/Batch";
import { BufferScheduler } from "./utils/BufferScheduler";
import {
    BLOB_DEFAULT_DOWNLOAD_BLOCK_BYTES, BLOCK_BLOB_MAX_BLOCKS, BLOCK_BLOB_MAX_STAGE_BLOCK_BYTES,
    BLOCK_BLOB_MAX_UPLOAD_BLOB_BYTES
} from "./utils/constants";
import { bufferToReadableStream, streamToBuffer } from "./utils/utils.node";

/**
 * TODO: High CPU and Disk output usage when open multi file read streams for single file.
 * Considering using memory mapped file approach, or UploadStreamToBlockBlob().
 *
 * ONLY AVAILABLE IN NODE.JS RUNTIME.
 *
 * UploadFileToBlockBlob uploads a local file in blocks to a block blob.
 *
 * When file size <= 256MB, this method will use 1 upload call to finish the upload.
 * Otherwise, this method will call stageBlock to upload blocks, and finally call commitBlockList
 * to commit the block list.
 *
 * @export
 * @param {string} filePath Full path of local file
 * @param {BlockBlobURL} blockBlobURL BlockBlobURL
 * @param {IUploadToBlockBlobOptions} options IUploadToBlockBlobOptions
 * @returns {(Promise<ICommonResponse>)} ICommonResponse
 */
export async function UploadFileToBlockBlob(
  filePath: string,
  blockBlobURL: BlockBlobURL,
  options: IUploadToBlockBlobOptions
): Promise<ICommonResponse> {
  const size = fs.statSync(filePath).size;
  return UploadResetableStreamToBlockBlob(
    offset =>
      fs.createReadStream(filePath, {
        highWaterMark: options.blockSize,
        start: offset
      }),
    size,
    blockBlobURL,
    options
  );
}

/**
 * ONLY AVAILABLE IN NODE.JS RUNTIME.
 *
 * UploadResetableStreamToBlockBlob accepts a Node.js Readable stream factory, and uploads in blocks to a block blob.
 * The Readable stream factory must returns a Node.js Readable stream starting from the offset defined. The offset
 * is the offset in the block blob to be uploaded.
 *
 * When buffer length <= 256MB, this method will use 1 upload call to finish the upload.
 * Otherwise, this method will call stageBlock to upload blocks, and finally call commitBlockList
 * to commit the block list.
 *
 * @export
 * @param {(offset: number) => NodeJS.ReadableStream} streamFactory Returns a Node.js Readable stream starting
 *                                                                  from the offset defined
 * @param {number} size Size of the block blob
 * @param {BlockBlobURL} blockBlobURL BlockBlobURL
 * @param {IUploadToBlockBlobOptions} options IUploadToBlockBlobOptions
 * @returns {(Promise<ICommonResponse>)} ICommonResponse
 */
async function UploadResetableStreamToBlockBlob(
  streamFactory: (offset: number) => NodeJS.ReadableStream,
  size: number,
  blockBlobURL: BlockBlobURL,
  options: IUploadToBlockBlobOptions
): Promise<ICommonResponse> {
  if (
    options.blockSize < 0 ||
    options.blockSize > BLOCK_BLOB_MAX_UPLOAD_BLOB_BYTES
  ) {
    throw new Error(
      `blockSize option must be >= 0 and <= ${BLOCK_BLOB_MAX_UPLOAD_BLOB_BYTES}`
    );
  }
  if (options.blockSize === 0) {
    if (size > BLOCK_BLOB_MAX_STAGE_BLOCK_BYTES * BLOCK_BLOB_MAX_BLOCKS) {
      throw new Error(`${size} is too larger to upload to a block blob.`);
    }
    if (size > BLOCK_BLOB_MAX_UPLOAD_BLOB_BYTES) {
      options.blockSize = Math.ceil(size / BLOCK_BLOB_MAX_BLOCKS);
      if (options.blockSize < BLOB_DEFAULT_DOWNLOAD_BLOCK_BYTES) {
        options.blockSize = BLOB_DEFAULT_DOWNLOAD_BLOCK_BYTES;
      }
    }
  }
  if (!options.blobHTTPHeaders) {
    options.blobHTTPHeaders = {};
  }
  if (!options.accessConditions) {
    options.accessConditions = {};
  }

  if (size <= BLOCK_BLOB_MAX_UPLOAD_BLOB_BYTES) {
    return blockBlobURL.upload(() => streamFactory(0), size, options);
  }

  const numBlocks: number = Math.floor((size - 1) / options.blockSize) + 1;
  if (numBlocks > BLOCK_BLOB_MAX_BLOCKS) {
    throw new Error(
      `The buffer's size is too big or the BlockSize is too small;` +
        `the number of blocks must be <= ${BLOCK_BLOB_MAX_BLOCKS}`
    );
  }

  const blockList: string[] = [];
  let transferProgress: number = 0;

  const batch = new Batch(options.parallelism);
  for (let i = 0; i < numBlocks; i++) {
    batch.addOperation(
      async (): Promise<any> => {
        const blockID = Buffer.from(i.toString().padStart(5, "00000")).toString(
          "base64"
        );
        const start = options.blockSize * i;
        const end = i === numBlocks - 1 ? size : start + options.blockSize;
        const contentLength = end - start;
        blockList.push(blockID);
        await blockBlobURL.stageBlock(
          blockID,
          () => streamFactory(start),
          contentLength,
          {
            leaseAccessConditions: options.accessConditions!
              .leaseAccessConditions
          }
        );
        // Update progress after block is successfully uploaded to server, in case of block trying
        transferProgress += contentLength;
        if (options.progress) {
          options.progress({ loadedBytes: transferProgress, totalBytes: size });
        }
      }
    );
  }
  await batch.do();

  return blockBlobURL.commitBlockList(blockList, options);
}

/**
 * ONLY AVAILABLE IN NODE.JS RUNTIME.
 *
 * DownloadBlobToBuffer downloads an Azure Blob in parallel to a buffer.
 * Offset and count are optional, pass 0 for both to download the entire blob.
 *
 * @export
 * @param {BlobURL} blobURL A BlobURL object
 * @param {number} offset From which position of the block blob to download
 * @param {number} count How much data to be downloaded
 * @param {Buffer} buffer Buffer to be fill, must have length larger than count
 * @param {IDownloadFromBlobOptions} options IDownloadFromBlobOptions
 * @returns {Promise<void>}
 */
export async function DownloadBlobToBuffer(
  blobURL: BlobURL,
  offset: number,
  count: number,
  buffer: Buffer,
  options: IDownloadFromBlobOptions
): Promise<void> {
  if (options.blockSize < 0) {
    throw new Error("blockSize option must be >= 0");
  }
  if (options.blockSize === 0) {
    options.blockSize = BLOB_DEFAULT_DOWNLOAD_BLOCK_BYTES;
  }

  if (offset < 0) {
    throw new Error("offset option must be >= 0");
  }

  if (count < 0) {
    throw new Error("count option must be >= 0");
  }

  if (!options.accessConditions) {
    options.accessConditions = {};
  }

  // Customer doesn't specify length, get it
  if (count === 0) {
    const response = await blobURL.getProperties(options);
    count = parseInt(response.headers.get("content-length")!, 10) - offset;
    if (count < 0) {
      throw new Error(`count ${count} shouldn't be less than 0`);
    }
  }

  if (buffer.length < count) {
    throw new Error(
      `The buffer's size should be equal to or larger than the request count of bytes: ${count}`
    );
  }

  let transferProgress: number = 0;
  const batch = new Batch(options.parallelism);
  for (let off = offset; off < offset + count; off = off + options.blockSize) {
    batch.addOperation(async () => {
      const chunkEnd =
        off + options.blockSize < count ? off + options.blockSize : count;
      const response = await blobURL.download({
        accessConditions: options.accessConditions,
        range: `bytes=${off}-${chunkEnd}`
      });
      const stream = response.readableStreamBody!;
      await streamToBuffer(stream, buffer, off - offset, chunkEnd - offset);
      // Update progress after block is downloaded, in case of block trying
      // Could provide finer grained progress updating inside HTTP rquests,
      // only if convenience layer download try is enabled
      transferProgress += chunkEnd - off;
      if (options.progress) {
        options.progress({ loadedBytes: transferProgress, totalBytes: count });
      }
    });
  }
  await batch.do();
}

/**
 * Option interface for UploadStreamToBlockBlob.
 *
 * @export
 * @interface IUploadStreamToBlockBlobOptions
 */
export interface IUploadStreamToBlockBlobOptions {
  /**
   * Size of every buffer allocated.
   *
   * @type {number}
   * @memberof IUploadStreamToBlockBlobOptions
   */
  bufferSize: number;

  /**
   * Max buffers will allocate during uploading.
   *
   * @type {number}
   * @memberof IUploadStreamToBlockBlobOptions
   */
  maxBuffers: number;

  /**
   * Blob HTTP Headers.
   *
   * @type {BlobHTTPHeaders}
   * @memberof IUploadStreamToBlockBlobOptions
   */
  blobHTTPHeaders?: BlobHTTPHeaders;

  /**
   * Metadata of block blob.
   *
   * @type {{ [propertyName: string]: string }}
   * @memberof IUploadStreamToBlockBlobOptions
   */
  metadata?: { [propertyName: string]: string };

  /**
   * Access conditions headers.
   *
   * @type {IBlobAccessConditions}
   * @memberof IUploadStreamToBlockBlobOptions
   */
  accessConditions?: IBlobAccessConditions;

  /**
   * Progress updater.
   *
   * @memberof IUploadStreamToBlockBlobOptions
   */
  progress?: (progress: TransferProgressEvent) => void;
}

/**
 * ONLY AVAILABLE IN NODE.JS RUNTIME.
 *
 * Uploads a Node.js Readable stream into block blob.
 *
 * PERFORMANCE IMPROVEMENT TIPS:
 * * Input stream highWaterMark is better to set a same value with option.bufferSize
 *    parameter, which will avoid Buffer.concat() operations.
 *
 * @export
 * @param {Readable} stream
 * @param {BlockBlobURL} blockBlobURL
 * @param {IUploadStreamToBlockBlobOptions} options
 * @returns {Promise<ICommonResponse>}
 */
export async function UploadStreamToBlockBlob(
  stream: Readable,
  blockBlobURL: BlockBlobURL,
  options: IUploadStreamToBlockBlobOptions
): Promise<ICommonResponse> {
  if (!options.blobHTTPHeaders) {
    options.blobHTTPHeaders = {};
  }
  if (!options.accessConditions) {
    options.accessConditions = {};
  }

  let blockNum = 0;
  let transferProgress: number = 0;
  const blockList: string[] = [];

  const scheduler = new BufferScheduler(
    stream,
    options.bufferSize,
    options.maxBuffers,
    async (buffer: Buffer) => {
      const blockID = Buffer.from(
        blockNum.toString().padStart(5, "00000")
      ).toString("base64");
      blockList.push(blockID);
      blockNum++;

      await blockBlobURL.stageBlock(
        blockID,
        () => bufferToReadableStream(buffer),
        buffer.length,
        {
          leaseAccessConditions: options.accessConditions!.leaseAccessConditions
        }
      );

      // Update progress after block is successfully uploaded to server, in case of block trying
      transferProgress += buffer.length;
      if (options.progress) {
        options.progress({ loadedBytes: transferProgress });
      }
    },
    // Parallelism should set a smaller value than maxBuffers, which is helpful to
    // reduce the possibility when a outgoing handler waits for stream data, in
    // this situation, outgoing handlers are blocked.
    // Outgoing queue shouldn't be empty.
    Math.ceil((options.maxBuffers / 4) * 3)
  );
  await scheduler.do();

  return blockBlobURL.commitBlockList(blockList, options);
}
