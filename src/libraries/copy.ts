type CopyObject = Partial<{ [key: string]: any }>;

const _deep = (src: CopyObject, dst: CopyObject) => {
  switch(typeof dst) {
    case 'boolean':
    case 'number':
    case 'string':
      return dst;
  }

  if (typeof dst !== 'object' || dst === null) {
    return src;
  }

  if (typeof src !== 'object' || src === null) {
    return dst;
  }

  for (let key in dst) {
    if (!src.hasOwnProperty(key)) {
      src[key] = dst[key];
    } else {
      src[key] = _deep(src[key], dst[key]);
    }
  }

  return src;
};

export namespace Copy {
  export const deep = _deep;
}
