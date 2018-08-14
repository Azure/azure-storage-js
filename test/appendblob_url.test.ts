import * as assert from "assert";

import { BlobDownloadResponse } from "../lib";
import { AppendBlobURL } from "../lib/AppendBlobURL";
import { ContainerURL } from "../lib/ContainerURL";
import { getBSU, getUniqueName } from "./utils";

describe("AppendBlobURL", () => {
  const serviceURL = getBSU();
  let containerName: string = getUniqueName("container");
  let containerURL = ContainerURL.fromServiceURL(serviceURL, containerName);
  let blobName: string = getUniqueName("blob");
  let appendBlobURL = AppendBlobURL.fromContainerURL(containerURL, blobName);

  beforeEach(async () => {
    containerName = getUniqueName("container");
    containerURL = ContainerURL.fromServiceURL(serviceURL, containerName);
    await containerURL.create();
    blobName = getUniqueName("blob");
    appendBlobURL = AppendBlobURL.fromContainerURL(containerURL, blobName);
  });

  afterEach(async () => {
    await containerURL.delete();
  });

  it("create with default parameters", async () => {
    appendBlobURL.create();

    let exceptedError: any;
    appendBlobURL
      .download()
      .then(
        (result: BlobDownloadResponse) => {
          assert.notEqual(result, null);
        },
        (reason: any) => {
          exceptedError = reason;
        }
      )
      .then(() => {
        assert.notEqual(exceptedError, null);
      });
    // Only Node.js 10+ supports Promise.prototype.finally
  });

  it("create with all parameters configured", async () => {
    appendBlobURL.create();

    const content = "Hello World!";
    // const options: AppendBlobsAppendBlockOptionalParams = {};
    appendBlobURL.appendBlock(content, content.length, {});

    let exceptedError: any;
    appendBlobURL
      .download()
      .then(
        (result: BlobDownloadResponse) => {
          assert.notEqual(result, null);
        },
        (reason: any) => {
          exceptedError = reason;
        }
      )
      .then(() => {
        assert.notEqual(exceptedError, null);
      });
    // Only Node.js 10+ supports Promise.prototype.finally
  });
});
