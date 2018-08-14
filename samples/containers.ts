import { BlobURL } from "../lib/BlobURL";
import { BlockBlobURL } from "../lib/BlockBlobURL";
import { ContainerURL } from "../lib/ContainerURL";
import { SharedKeyCredential } from "../lib/credentials/SharedKeyCredential";
import { ServiceListContainersSegmentResponse, ServiceURL } from "../lib/ServiceURL";
import { StorageURL } from "../lib/StorageURL";

// tslint:disable:no-console
async function executeSample() {
  const pipeline = StorageURL.newPipeline(
    new SharedKeyCredential("account", "accountkey")
  );

  // List containers
  const serviceURL = new ServiceURL(
    "https://account.blob.core.windows.net",
    pipeline
  );

  let marker;
  do {
    const listContainersResponse: ServiceListContainersSegmentResponse = await serviceURL.listContainersSegment(
      marker
    );

    marker = listContainersResponse.marker;
    for (const container of listContainersResponse.containerItems!) {
      console.log(`Container: ${container.name}`);
    }
  } while (marker);

  // Create a container
  const containerName = `newcontainer${new Date().getTime()}`;
  const containerURL = ContainerURL.fromServiceURL(serviceURL, containerName);

  const createContainerResponse = await containerURL.create();
  console.log(
    `Create container ${containerName} successfully`,
    createContainerResponse.requestId
  );

  // Create a blob
  const content = "hello";
  const blobName = "newblob" + new Date().getTime();
  const blobURL = BlobURL.fromContainerURL(containerURL, blobName);
  const blockBlobURL = BlockBlobURL.fromBlobURL(blobURL);
  const uploadBlobResponse = await blockBlobURL.upload(content, content.length);
  console.log(
    `Upload block blob ${blobName} successfully`,
    uploadBlobResponse.contentMD5
  );

  // Get blob content
  const downloadBlockBlobResponse = await blobURL.download();
  console.log(
    "Downloaded blob content",
    downloadBlockBlobResponse
      .readableStreamBody!.read(content.length)
      .toString()
  );
  console.log(`[headers]:${downloadBlockBlobResponse.headers}`);
  console.log(`[parsed headers]:${JSON.stringify(downloadBlockBlobResponse)}`);

  // Delete container
  await containerURL.delete();

  console.log("deleted container");
}

// An async method returns a Promise object, which is compatible with then().catch() coding style.
executeSample()
  .then(() => {
    console.log("Successfully executed sample.");
  })
  .catch(err => {
    // TODO: Protocol layer de-serialization error message body bug, err.code
    // and err.message should be err.Code and err.Message
    console.log(err.message);
  });
