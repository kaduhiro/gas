import fetch from 'node-fetch';

let _options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {};

const _setOptions = (options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions) => {
  _options = { ..._options, ...options };
};

const _fetch = async (url: string, options?: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions) => {
  const args: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = { method: 'get', ..._options, ...options };

  if (typeof UrlFetchApp === 'undefined') {
    return await _nodeFetch(url, args);
  }

  const res = UrlFetchApp.fetch(url, args);
  if (res.getResponseCode() !== 200) {
    Promise.reject(new Error(`fetch '${url}' failed.`));
  }

  return res.getContentText();
};

const _nodeFetch = async (url: string, options?: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions) => {
  const res = await fetch(url, options);
  if (!res.ok) {
    Promise.reject(new Error(`fetch '${url}' failed.`));
  }

  return await res.text();
};

export namespace Url {
  export const setOptions = _setOptions;
  export const fetch = _fetch;
}
