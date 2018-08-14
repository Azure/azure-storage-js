import { BlockBlobURL } from "./BlockBlobURL";
import { ICommonResponse, IUploadToBlockBlobOptions } from "./highlevel.common";
import { Batch } from "./utils/Batch";
import {
    BLOB_DEFAULT_DOWNLOAD_BLOCK_BYTES, BLOCK_BLOB_MAX_BLOCKS, BLOCK_BLOB_MAX_STAGE_BLOCK_BYTES,
    BLOCK_BLOB_MAX_UPLOAD_BLOB_BYTES
} from "./utils/constants";

/**
 * ONLY AVAILABLE IN BROWSERS.
 *
 * Uploads a browser Blob/File/ArrayBuffer/ArrayBufferView object to block blob.
 *
 * When buffer length <= 256MB, this method will use 1 upload call to finish the upload.
 * Otherwise, this method will call stageBlock to upload blocks, and finally call commitBlockList
 * to commit the block list.
 *
 * @export
 * @param {Blob | File | ArrayBuffer | ArrayBufferView} browserData
 * @param {BlockBlobURL} blockBlobURL
 * @param {IUploadToBlockBlobOptions} options
 * @returns {Promise<ICommonResponse>}
 */
export async function UploadBrowserDataToBlockBlob(
  browserData: Blob | File | ArrayBuffer | ArrayBufferView,
  blockBlobURL: BlockBlobURL,
  options: IUploadToBlockBlobOptions
): Promise<ICommonResponse> {
  const browserBlob = new Blob([browserData]);
  return UploadSeekableBlobToBlockBlob(
    (offset: number, size: number): Blob => {
      return browserBlob.slice(offset, offset + size);
    },
    browserBlob.size,
    blockBlobURL,
    options
  );
}

/**
 * ONLY AVAILABLE IN BROWSERS.
 *
 * Uploads a browser Blob object to block blob. Requires a blobFactory as the data source,
 * which need to return a Blob object with the offset and size provided.
 *
 * When buffer length <= 256MB, this method will use 1 upload call to finish the upload.
 * Otherwise, this method will call stageBlock to upload blocks, and finally call commitBlockList
 * to commit the block list.
 *
 * @param {(offset: number, size: number) => Blob} blobFactory
 * @param {number} size
 * @param {BlockBlobURL} blockBlobURL
 * @param {IUploadToBlockBlobOptions} options
 * @returns {Promise<ICommonResponse>}
 */
async function UploadSeekableBlobToBlockBlob(
  blobFactory: (offset: number, size: number) => Blob,
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
    return blockBlobURL.upload(blobFactory(0, size), size, options);
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
        const blockID = btoa(i.toString().padStart(5, "00000"));
        const start = options.blockSize * i;
        const end = i === numBlocks - 1 ? size : start + options.blockSize;
        const contentLength = end - start;
        blockList.push(blockID);
        await blockBlobURL.stageBlock(
          blockID,
          blobFactory(start, contentLength),
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
