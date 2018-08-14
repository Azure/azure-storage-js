import { Readable } from "stream";

export class MemoryStream extends Readable {
    public chunkSize: number;
    private offset: number = 0;
    private readonly buffer: Buffer;
    private readonly length: number;

    public constructor(buffer: Buffer, chunkSize: number = 4 * 1024 * 1024) {
        super();
        this.chunkSize = chunkSize;
        this.buffer = buffer;
        this.length = buffer.length;
    }

    public _read(size: number): void {
        if (this.offset >= this.length) {
            this.push(null);
            return;
        }

        let data: Buffer | null;
        do {
            data = this.tryRead(this.offset + size);
            if (data) {
                this.push(data);
            }
        } while (data);
    }

    /**
     * Read data from internal offset to tail parameter. Every time call this method will return most chunkSize of data.
     * Call this method repeatly to get all the data chunks.
     *
     * @private
     * @param {number} tail
     * @returns {(Buffer | null)} Return null when no data avaiable
     * @memberof MemoryStream
     */
    private tryRead(tail: number): Buffer | null {
        let data = null;
        tail = Math.min(tail, this.length);

        if (this.offset < tail) {
            let end = this.offset + this.chunkSize;
            end = Math.min(end, tail);
            data = this.buffer.slice(this.offset, end);
            this.offset = end;
        }

        return data;
    }
}
