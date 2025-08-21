// Flatten nested dbRights to match defaultRights keys
function flattenRights(obj, prefix = "") {
  let result = {};
  for (const key in obj) {
    const val = obj[key];
    const path = prefix ? `${prefix}/${key}` : `/${key}`;
    if (val !== null && typeof val === "object" && !Array.isArray(val)) {
      Object.assign(result, flattenRights(val, path));
    } else {
      result[path] = val;
    }
  }
  return result;
}

export function mergeRights(defaultRights, dbRights) {
  const merged = { ...defaultRights };
  const flatDb = flattenRights(dbRights);

  // Step 1: merge DB values into defaults
  Object.keys(defaultRights).forEach((key) => {
    const defaultVal = defaultRights[key];
    const dbVal = flatDb[key];
    merged[key] = dbVal === true ? true : defaultVal;
  });

  // Step 2: update parent if all children are true
  Object.keys(merged).forEach((key) => {
    // only check parent paths (like "/CandidateRights")
    const children = Object.keys(merged).filter(
      (childKey) => childKey.startsWith(key + "/")
    );

    if (children.length > 0) {
      const allChildrenTrue = children.every((c) => merged[c] === true);
      if (allChildrenTrue) {
        merged[key] = true;
      }
    }
  });

  return merged;
}

