import { AnonymousCredential } from "../lib/credentials/AnonymousCredential";
import { SharedKeyCredential } from "../lib/credentials/SharedKeyCredential";
import { ServiceURL } from "../lib/ServiceURL";
import { StorageURL } from "../lib/StorageURL";

export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getUniqueName(prefix: string): string {
  return `${prefix}${new Date().getTime()}${Math.floor(Math.random() * 10000).toString().padStart(5, "00000")}`;
}

export function getGenericBSU(accountType: string, accountNameSuffix: string = ""): ServiceURL {
  const accountNameEnvVar = `${accountType}ACCOUNT_NAME`;
  const accountKeyEnvVar = `${accountType}ACCOUNT_KEY`;

  let accountName: string | undefined;
  let accountKey: string | undefined;
  if (isBrowser()) {
    accountName = (window as any).__env__[accountNameEnvVar];
    accountKey = (window as any).__env__[accountKeyEnvVar];
  } else {
    accountName = process.env[accountNameEnvVar];
    accountKey = process.env[accountKeyEnvVar];
  }

  if (!accountName || !accountKey || accountName === "" || accountKey === "") {
    throw new Error(`${accountNameEnvVar} and/or ${accountKeyEnvVar} environment variables not specified.`);
  }

  const credentials = isBrowser() ? new AnonymousCredential() : new SharedKeyCredential(accountName, accountKey);
  const pipeline = StorageURL.newPipeline(credentials);
  const blobPrimaryURL = `https://${accountName}${accountNameSuffix}.blob.core.windows.net/`;
  return new ServiceURL(blobPrimaryURL, pipeline);
}

export function getBSU(): ServiceURL {
  return getGenericBSU("");
}

export function getAlternateBSU(): ServiceURL {
  return getGenericBSU("SECONDARY_", "-secondary");
}

export async function sleep(time: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, time);
  });
}

export function base64encode(content: string): string {
  return isBrowser() ? btoa(content) : Buffer.from(content).toString("base64");
}

export function base64decode(encodedString: string): string {
  return isBrowser() ? atob(encodedString) : Buffer.from(encodedString, "base64").toString();
}
