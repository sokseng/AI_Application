// Flatten nested dbRights to match defaultRights keys
// function flattenRights(obj, prefix = "") {
//   let result = {};
//   for (const key in obj) {
//     const val = obj[key];
//     const path = prefix ? `${prefix}/${key}` : `/${key}`;
//     if (val !== null && typeof val === "object" && !Array.isArray(val)) {
//       Object.assign(result, flattenRights(val, path));
//     } else {
//       result[path] = val;
//     }
//   }
//   return result;
// }

// Utility: flatten nested rights into "/path/to/key" = true/false
function flattenRights(obj, parentKey = "") {
  let result = {};
  Object.keys(obj).forEach((key) => {
    const path = parentKey ? `${parentKey}/${key}` : `/${key}`;
    if (typeof obj[key] === "object" && obj[key] !== null) {
      result = { ...result, ...flattenRights(obj[key], path) };
    } else {
      result[path] = obj[key];
    }
  });
  return result;
}

export function mergeRights(defaultRights, dbRights) {
  const merged = { ...defaultRights };
  const flatDb = flattenRights(dbRights);

  // Step 1: merge DB values into defaults
  Object.keys(defaultRights).forEach((key) => {
    const dbVal = flatDb[key];
    if (dbVal === true) merged[key] = true;
  });

  // Step 2: update parents if all children are true
  const sortedKeys = Object.keys(merged).sort(
    (a, b) => b.split("/").length - a.split("/").length
  );

  sortedKeys.forEach((key) => {
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


// export function mergeRights(defaultRights, dbRights) {
//   debugger
//   const merged = { ...defaultRights };
//   const flatDb = flattenRights(dbRights);

//   // Step 1: merge DB values into defaults
//   Object.keys(defaultRights).forEach((key) => {
//     const defaultVal = defaultRights[key];
//     const dbVal = flatDb[key];
//     merged[key] = dbVal === true ? true : defaultVal;
//   });

//   // Step 2: update parent if all children are true
//   Object.keys(merged).forEach((key) => {
//     // only check parent paths (like "/CandidateRights")
//     const children = Object.keys(merged).filter(
//       (childKey) => childKey.startsWith(key + "/")
//     );

//     if (children.length > 0) {
//       const allChildrenTrue = children.every((c) => merged[c] === true);
//       if (allChildrenTrue) {
//         merged[key] = true;
//       }
//     }
//   });

//   return merged;
// }

