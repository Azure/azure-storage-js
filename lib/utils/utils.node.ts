import { Readable } from "stream";
import { MemoryStream } from "./MemoryStream";

/**
 * A quick converter transfer Node.js Buffer into a Readable stream.
 *
 * @export
 * @param {Buffer} buffer
 * @returns {Readable}
 */
export function bufferToReadableStream(buffer: Buffer): Readable {
  return new MemoryStream(buffer);
}

/**
 * Read a readable stream into buffer. Fill the buffer from offset to end.
 *
 * @export
 * @param {NodeJS.ReadableStream} stream A Node.js Readable stream
 * @param {Buffer} buffer Buffer to be filled, length must >= offset
 * @param {number} offset From which position to be filled
 * @param {number} end To which position to be filled
 * @param {string} [encoding] Encoding of the Readable stream
 * @returns {Promise<void>}
 */
export async function streamToBuffer(
  stream: NodeJS.ReadableStream,
  buffer: Buffer,
  offset: number,
  end: number,
  encoding?: string,
): Promise<void> {
  let pos = 0; // Position in stream
  const count = end - offset; // Total amount of data needed in stream

  // tslint:disable:no-console
  // console.log(`[streamToBuffer]: buffer.length:${buffer.length} offset:${offset} end:${end}`);

  return new Promise<void>((resolve, reject) => {
    stream.on("readable", () => {
      // console.log(`[readable]: pos:${pos} count:${count}`);

      if (pos >= count) {
        resolve();
        return;
      }

      let chunk = stream.read();
      // console.log(chunk);
      if (typeof chunk === "string") {
        chunk = Buffer.from(chunk, encoding);
      }

      // How much data needed in this chunk
      const chunkLength = (pos + chunk.length) > count ? (count - pos) : chunk.length;
      // console.log(`[read()]: chunkLength:${chunkLength}`);

      // console.log(chunk.slice(0, chunkLength));
      // console.log(`[fill()]: offset:${offset + pos} end:${offset + pos + chunkLength}`);

      buffer.fill(chunk.slice(0, chunkLength), offset + pos, offset + pos + chunkLength);
      pos += chunkLength;
    });

    stream.on("end", () => {
      if (pos < count) {
        reject(new Error(
          `Stream drains before getting enough data needed. Data read: ${pos}, data need: ${count}`,
        ));
      }
      resolve();
    });

    stream.on("error", (err) => {
      reject(err);
    });
  });
}
