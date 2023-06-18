import { KVS } from '#/constants/kvs';

const defaultTable = 'kvs';
const secretsRegExp = /^[0-9A-Z_-]+$/;

const store: Partial<{ [key: string]: string }> = { [defaultTable]: '{}' };

const _getProperty = (key: string) => {
  return store[key];
};
const _setProperty = (key: string, value: string) => {
  store[key] = value;
};

const DefaultKvs = {
  getProperty: _getProperty,
  setProperty: _setProperty,
};

const _get = (key: string, table?: string) => {
  if (typeof table === 'undefined') {
    table = defaultTable;
  }

  const scriptProperties =
    typeof PropertiesService !== 'undefined' ? PropertiesService.getScriptProperties() : DefaultKvs;

  if (table === KVS.SECRETS_TABLE) {
    return scriptProperties.getProperty(key);
  }

  const property = scriptProperties.getProperty(table);
  if (property === null || typeof property === 'undefined') {
    return undefined;
  }

  const propertyJson = JSON.parse(property);
  if (!propertyJson) {
    return property;
  }

  return propertyJson[key];
};

const _getSecrets = (key: string) => {
  if (!key.match(secretsRegExp)) {
    return false
  }

  return _get(key, KVS.SECRETS_TABLE);
};

const _set = (key: string, value: any, table?: string) => {
  if (typeof table === 'undefined') {
    table = defaultTable;
  }

  const scriptProperties =
    typeof PropertiesService !== 'undefined' ? PropertiesService.getScriptProperties() : DefaultKvs;

  if (table === KVS.SECRETS_TABLE) {
    scriptProperties.setProperty(key, value);
    return true;
  }

  let property = scriptProperties.getProperty(table);
  if (property === null || typeof property === 'undefined') {
    property = '{}';
  }

  const propertyJson = JSON.parse(property);
  if (!propertyJson) {
    return false;
  }

  propertyJson[key] = value;

  scriptProperties.setProperty(table, JSON.stringify(propertyJson));

  return true;
};

const _setSecrets = (key: string, value: boolean | number | string) => {
  if (!key.match(secretsRegExp)) {
    return false;
  }

  return _set(key, value.toString(), KVS.SECRETS_TABLE);
};

const _del = (key: string, table?: string) => {
  if (typeof table === 'undefined') {
    table = defaultTable;
  }

  const scriptProperties =
    typeof PropertiesService !== 'undefined' ? PropertiesService.getScriptProperties() : DefaultKvs;

  const property = scriptProperties.getProperty(table);
  if (property === null || typeof property === 'undefined') {
    return false;
  }

  const propertyJson = JSON.parse(property);
  if (!propertyJson) {
    return false;
  }

  delete propertyJson[key];

  scriptProperties.setProperty(table, JSON.stringify(propertyJson));

  return true;
};

export namespace Kvs {
  export const get = _get;
  export const getSecrets = _getSecrets;
  export const set = _set;
  export const setSecrets = _setSecrets;
  export const del = _del;
}
