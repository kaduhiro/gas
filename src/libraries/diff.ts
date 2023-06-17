type TreeObject = Partial<{ [key: string]: any }>;

const _compareObject = (src: TreeObject, dst: TreeObject) => {
  const diff: TreeObject = {};

  for (const key in src) {
    if (src.hasOwnProperty(key) && dst.hasOwnProperty(key)) {
      if (typeof src[key] === 'object' && typeof dst[key] === 'object') {
        const nestedDiff = _compareObject(src[key], dst[key]);
        if (Object.keys(nestedDiff).length) {
          diff[key] = nestedDiff;
        }
      } else {
        if (src[key] != dst[key]) {
          diff[key] = dst[key];
        }
      }
    } else {
      diff[key] = dst[key];
    }
  }

  return diff;
};

export namespace Diff {
  export const compareObject = _compareObject;
}
