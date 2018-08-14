import { URLBuilder } from "ms-rest-js";

/**
 * Append a string to URL path. Will remove duplicated "/" in front of the string
 * when URL path ends with a "/".
 *
 * @export
 * @param {string} url Source URL string.
 * @param {string} name String to be appended to URL.
 * @returns {string} An updated URL string.
 */
export function appendToURLPath(url: string, name: string): string {
  const urlParsered = URLBuilder.parse(url);

  let path = urlParsered.getPath();
  path = path ? (path.endsWith("/") ? `${path}${name}` : `${path}/${name}`) : name;
  urlParsered.setPath(path);

  return urlParsered.toString();
}

/**
 * Set URL parameter name and value. If name exists in URL parameters, old value
 * will be replaced by name key. If not provide value, the parameter will be deleted.
 *
 * @export
 * @param {string} url Source URL string.
 * @param {string} name Parameter name.
 * @param {string} [value] Parameter value.
 * @returns {string} An updated URL string.
 */
export function setURLParameter(url: string, name: string, value?: string): string {
  const urlParsered = URLBuilder.parse(url);

  urlParsered.setQueryParameter(name, value);

  return urlParsered.toString();
}

/**
 * Set URL host.
 *
 * @export
 * @param {string} url Source URL string.
 * @param {string} host New host string.
 * @returns An updated URL string.
 */
export function setURLHost(url: string, host: string): string {
  const urlParsered = URLBuilder.parse(url);

  urlParsered.setHost(host);

  return urlParsered.toString();
}

/**
 * Get URL path from an URL string.
 *
 * @export
 * @param {string} url Source URL string.
 * @returns {(string | undefined)}
 */
export function getURLPath(url: string): string | undefined {
  const urlParsered = URLBuilder.parse(url);
  return urlParsered.getPath();
}

/**
 * Get URL query key value pairs from an URL string.
 *
 * @export
 * @param {string} url
 * @returns {{[key: string]: string}}
 */
export function getURLQueries(url: string): { [key: string]: string } {
  let queryString = URLBuilder.parse(url).getQuery();
  if (!queryString) {
    return {};
  }

  queryString = queryString.trim();
  queryString = queryString.startsWith("?") ? queryString.substr(1) : queryString;

  let querySubStrings: string[] = queryString.split("&");
  querySubStrings = querySubStrings.filter((value: string) => {
    const indexOfEqual = value.indexOf("=");
    const lastIndexOfEqual = value.lastIndexOf("=");
    return indexOfEqual > 0 && indexOfEqual === lastIndexOfEqual && lastIndexOfEqual < (value.length - 1);
  });

  const queries: { [key: string]: string } = {};
  for (const querySubString of querySubStrings) {
    const splitResults = querySubString.split("=");
    const key: string = splitResults[0];
    const value: string = splitResults[1];
    queries[key] = value;
  }

  return queries;
}

/**
 * Rounds a date off to seconds.
 *
 * @export
 * @param {Date} date Input date
 * @returns {string} Date string in ISO8061 format, with no milliseconds component
 */
export function truncatedISO8061Date(date: Date): string {
  const dateString = date.toISOString();
  return dateString.substring(0, dateString.length - 5) + "Z";
}
