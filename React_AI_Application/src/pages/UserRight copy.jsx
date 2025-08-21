import React, { useState } from "react";

const treeData = [
  {
    label: "Setting Rights",
    path: "/SettingRights/CanAccessModule",
    children: [
      {
        label: "User Role",
        path: "/SettingRights/UserRole/CanVisualize",
        children: [
          { label: "Can Add", path: "/SettingRights/UserRole/CanAdd" },
          { label: "Can Edit", path: "/SettingRights/UserRole/CanEdit" },
          { label: "Can Delete", path: "/SettingRights/UserRole/CanDelete" },
          { label: "Can Export", path: "/SettingRights/UserRole/CanExport" },
          {
            label: "Role",
            path: "/SettingRights/UserRole/Role/CanVisualize",
            children: [
              { label: "Can Edit", path: "/SettingRights/UserRole/Role/CanEdit" },
            ],
          },
        ],
      },
    ],
  },
  {
    label: "Categories",
    path: "/Categories/CanAccessModule",
    children: [
      { label: "Can Visualize", path: "/Categories/CanVisualize" },
      { label: "Can Add", path: "/Categories/CanAdd" },
      { label: "Can Edit", path: "/Categories/CanEdit" },
      { label: "Can Delete", path: "/Categories/CanDelete" },
      { label: "Can Export", path: "/Categories/CanExport" },
    ],
  },
];

// Generate default rights state
const getDefaultRights = (nodes) => {
  let result = {};
  nodes.forEach((node) => {
    result[node.path] = false;
    if (node.children) {
      result = { ...result, ...getDefaultRights(node.children) };
    }
  });
  return result;
};

// Convert flat { path: boolean } → nested object
const buildNestedObject = (rights) => {
  const result = {};
  Object.entries(rights).forEach(([path, value]) => {
    const keys = path.split("/").filter(Boolean);
    let current = result;
    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        current[key] = value;
      } else {
        if (!current[key]) current[key] = {};
        current = current[key];
      }
    });
  });
  return result;
};

export default function UserRightTree() {
  const [rights, setRights] = useState(getDefaultRights(treeData));
  const [expanded, setExpanded] = useState({}); // tracks open/close state

  const handleChange = (node, checked) => {
    const updated = { ...rights };

    const setChildren = (n, value) => {
      updated[n.path] = value;
      if (n.children) n.children.forEach((c) => setChildren(c, value));
    };

    setChildren(node, checked);
    setRights(updated);
  };

  const toggleExpand = (path) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const renderTree = (nodes, level = 0) =>
    nodes.map((node) => {
      const hasChildren = !!node.children;
      const isOpen = expanded[node.path] || false;

      return (
        <div key={node.path} style={{ marginLeft: level * 20, marginTop: 5 }}>
          {hasChildren && (
            <span
              style={{
                cursor: "pointer",
                marginRight: 5,
                userSelect: "none",
                fontWeight: "bold",
              }}
              onClick={() => toggleExpand(node.path)}
            >
              {isOpen ? "−" : "+"}
            </span>
          )}
          {!hasChildren && <span style={{ width: 12, display: "inline-block" }} />}

          <label>
            <input
              type="checkbox"
              checked={rights[node.path]}
              onChange={(e) => handleChange(node, e.target.checked)}
            />{" "}
            {node.label}
          </label>

          {hasChildren && isOpen && renderTree(node.children, level + 1)}
        </div>
      );
    });

  const handleSubmit = () => {
    const nested = buildNestedObject(rights);
    alert("UserRights:\n" + JSON.stringify(nested, null, 2));
  };

  return (
    <div>
      <h2>User Rights</h2>
      {renderTree(treeData)}
      <button onClick={handleSubmit} style={{ marginTop: 10 }}>
        Submit
      </button>
    </div>
  );
}
