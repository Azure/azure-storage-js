import { HttpHeaders, WebResource } from "ms-rest-js";

import {
    AppendBlobAccessConditions, HTTPAccessConditions as IHTTPAccessConditions,
    LeaseAccessConditions as ILeaseAccessConditions, PageBlobAccessConditions
} from "./generated/models";

export {
  HTTPAccessConditions as IHTTPAccessConditions,
  LeaseAccessConditions as ILeaseAccessConditions
} from "./generated/models";

export interface IMetadata {
  [propertyName: string]: string;
}

export interface IContainerAccessConditions {
  HTTPAccessConditions?: IHTTPAccessConditions;
  leaseAccessConditions?: ILeaseAccessConditions;
}

export interface IBlobAccessConditions {
  HTTPAccessConditions?: IHTTPAccessConditions;
  leaseAccessConditions?: ILeaseAccessConditions;
}

export interface IPageBlobAccessConditions extends IBlobAccessConditions {
  pageBlobAccessConditions?: PageBlobAccessConditions;
}

export interface IAppendBlobAccessConditions extends IBlobAccessConditions {
  appendBlobAccessConditions?: AppendBlobAccessConditions;
}

export interface ICommonResponse {
  /**
   * The raw request
   */
  request: WebResource;
  /**
   * The HTTP response status (e.g. 200)
   */
  status: number;
  /**
   * The HTTP response headers.
   */
  headers: HttpHeaders;
}

export interface IDownloadResponse extends ICommonResponse {
  /**
   * The response body as a Blob.
   * Always undefined in node.js.
   */
  blobBody?: (() => Promise<Blob>);
  /**
   * The response body as a node.js Readable stream.
   * Always undefined in the browser.
   */
  readableStreamBody?: NodeJS.ReadableStream;
}

export interface IDownloadResponse extends ICommonResponse {
  /**
   * The response body as a Blob.
   * Always undefined in node.js.
   */
  blobBody?: (() => Promise<Blob>);
  /**
   * The response body as a node.js Readable stream.
   * Always undefined in the browser.
   */
  readableStreamBody?: NodeJS.ReadableStream;
}
