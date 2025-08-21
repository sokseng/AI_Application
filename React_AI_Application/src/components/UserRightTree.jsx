import React, { useState } from "react";
import { treeData, getDefaultRights } from "../utils/rights";

export default function UserRightTree({ rights, setRights }) {
  const [expanded, setExpanded] = useState({});
  const defaultRights = getDefaultRights(treeData); // flat default structure

  // Recursive: update node and all children
  const setChildren = (node, value, updated) => {
    updated[node.path] = value !== defaultRights[node.path];
    if (node.children) node.children.forEach((c) => setChildren(c, value, updated));
  };

  // Recursive: update parents based on children state
  const updateParents = (nodes, updated) => {
    nodes.forEach((node) => {
      if (node.children) {
        node.children.forEach((child) => updateParents([child], updated));

        // Parent checked if all children are checked
        const allChildrenChecked = node.children.every(
          (c) => updated[c.path] || false
        );
        updated[node.path] = allChildrenChecked !== defaultRights[node.path];
      }
    });
  };

  // Handle checkbox change
  const handleChange = (node, checked) => {
    const updated = { ...rights };
    setChildren(node, checked, updated);
    updateParents(treeData, updated); // recalc parent states
    setRights(updated);
  };

  const toggleExpand = (path) =>
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));

  const renderTree = (nodes, level = 0) =>
    nodes.map((node) => {
      const hasChildren = !!node.children;
      const isOpen = expanded[node.path] || false;
      const isChecked = rights[node.path] || false;

      return (
        <div key={node.path} style={{ marginLeft: level * 20, marginTop: 5 }}>
          {hasChildren && (
            <span
              style={{ cursor: "pointer", marginRight: 5, fontWeight: "bold" }}
              onClick={() => toggleExpand(node.path)}
            >
              {isOpen ? "−" : "+"}
            </span>
          )}
          {!hasChildren && <span style={{ width: 12, display: "inline-block" }} />}
          <label>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => handleChange(node, e.target.checked)}
            />{" "}
            {node.label}
          </label>
          {hasChildren && isOpen && renderTree(node.children, level + 1)}
        </div>
      );
    });

  return <div>{renderTree(treeData)}</div>;
}
