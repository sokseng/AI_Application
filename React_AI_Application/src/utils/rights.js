
export const treeData = [
  // {
  //   label: "Setting Rights",
  //   path: "/SettingRights/CanAccessModule",
  //   children: [
  //     {
  //       label: "User Role",
  //       path: "/SettingRights/UserRole/CanVisualize",
  //       children: [
  //         { label: "Can Add", path: "/SettingRights/UserRole/CanAdd" },
  //         { label: "Can Edit", path: "/SettingRights/UserRole/CanEdit" },
  //         { label: "Can Delete", path: "/SettingRights/UserRole/CanDelete" },
  //         { label: "Can Export", path: "/SettingRights/UserRole/CanExport" },
  //         {
  //           label: "Role",
  //           path: "/SettingRights/UserRole/Role/CanVisualize",
  //           children: [
  //             { label: "Can Edit", path: "/SettingRights/UserRole/Role/CanEdit" },
  //           ],
  //         },
  //       ],
  //     },
  //   ],
  // },
  {
    label: "User Management",
    path: "/UserManagement",
    children: [
      {
        label: "Role",
        path: "/UserManagement/RoleRights",
        children: [
          { label: "Can Access Module", path: "/UserManagement/RoleRights/CanAccessModule" },
        ],
      },
      {
        label: "User Right",
        path: "/UserManagement/UserRightRights",
        children: [
          { label: "Can Access Module", path: "/UserManagement/UserRightRights/CanAccessModule" },
          { label: "Can Add", path: "/UserManagement/UserRightRights/CanAdd" },
          { label: "Can Edit", path: "/UserManagement/UserRightRights/CanEdit" },
          { label: "Can Delete", path: "/UserManagement/UserRightRights/CanDelete" },
          { label: "Can Export", path: "/UserManagement/UserRightRights/CanExport" },
        ],
      },
      {
        label: "User",
        path: "/UserManagement/UserRights",
        children: [
          { label: "Can Access Module", path: "/UserManagement/UserRights/CanAccessModule" },
          { label: "Can Add", path: "/UserManagement/UserRights/CanAdd" },
          { label: "Can Edit", path: "/UserManagement/UserRights/CanEdit" },
          { label: "Can Delete", path: "/UserManagement/UserRights/CanDelete" },
          { label: "Can Export", path: "/UserManagement/UserRights/CanExport" },
        ],
      },
    ],
  },
  {
    label: "Candidate",
    path: "/CandidateRights",
    children: [
      { label: "Can Access Module", path: "/CandidateRights/CanAccessModule" },
      { label: "Can Add", path: "/CandidateRights/CanAdd" },
      { label: "Can Edit", path: "/CandidateRights/CanEdit" },
      { label: "Can Delete", path: "/CandidateRights/CanDelete" },
      { label: "Can Export", path: "/CandidateRights/CanExport" },
    ],
  },
];

// Generate default rights state (flat object)
export const getDefaultRights = (nodes) => {
  let result = {};
  nodes.forEach((node) => {
    result[node.path] = false;
    if (node.children) {
      result = { ...result, ...getDefaultRights(node.children) };
    }
  });
  return result;
};


export const buildNestedObject = (rights = {}) => {
  const result = {};
  Object.entries(rights || {}).forEach(([path, value]) => {
    const keys = path.split("/").filter(Boolean);
    let current = result;
    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        current[key] = value;
      } else {
        if (!current[key] || typeof current[key] !== "object") {
          current[key] = {};
        }
        current = current[key];
      }
    });
  });
  return result;
};
