import React, { useEffect, useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import { styled } from "@mui/system";
import Role from "./Role";
import UserRight from "./UserRight";
import User from "./User";
import useUserStore from "../store/useUserStore";

// TabPanel for content
const TabPanel = ({ children, value, index }) => (
  <Box
    role="tabpanel"
    hidden={value !== index}
    sx={{
      flexGrow: 1,
      height: "calc(100vh - 200px)",
      overflowY: "auto",
      animation: value === index ? "fadeIn 0.3s ease-in-out" : "none",
      "@keyframes fadeIn": {
        from: { opacity: 0, transform: "translateY(5px)" },
        to: { opacity: 1, transform: "translateY(0)" },
      },
    }}
  >
    {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
  </Box>
);

// Tabs container style
const StyledTabs = styled(Tabs)({
  borderRadius: "8px 8px 0 0",
  marginTop: "6px",
  marginLeft: "14px",
  padding: "2px",
  minHeight: "36px",
});

// Tab style
const StyledTab = styled(Tab)({
  textTransform: "none",
  fontWeight: "500",
  fontSize: "0.85rem",
  minHeight: "32px",
  padding: "4px 12px",
  marginRight: "4px",
  color: "#555",
  backgroundColor: "#e0e0e0",
  borderRadius: "6px",
  "&.Mui-selected": {
    color: "#fff",
    backgroundColor: "#1976d2",
  },
});

export default function TabsPage() {
  const { userRights } = useUserStore();

  // ✅ Check access rights safely
  const canAccessRole =
    userRights?.UserManagement?.RoleRights?.CanAccessModule ?? false;
  const canAccessUserRight =
    userRights?.UserManagement?.UserRightRights?.CanAccessModule ?? false;
  const canAccessUser =
    userRights?.UserManagement?.UserRights?.CanAccessModule ?? false;

  // ✅ Tabs array with access control
  const tabs = [
    { label: "Role", component: <Role />, canAccess: canAccessRole },
    { label: "User Right", component: <UserRight />, canAccess: canAccessUserRight },
    { label: "User", component: <User />, canAccess: canAccessUser },
  ].filter((t) => t.canAccess); // remove inaccessible tabs

  const [tabIndex, setTabIndex] = useState(0);

  // ✅ Auto-select the first accessible tab
  useEffect(() => {
    if (tabs.length > 0) {
      setTabIndex(0);
    }
  }, [canAccessRole, canAccessUserRight, canAccessUser]);

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Tabs header */}
      <StyledTabs
        value={tabIndex}
        onChange={handleChange}
        variant="standard"
        TabIndicatorProps={{ style: { display: "none" } }}
      >
        {tabs.map((tab, index) => (
          <StyledTab key={index} label={tab.label} />
        ))}
      </StyledTabs>

      {/* Tab content */}
      <Box
        sx={{
          backgroundColor: "#fff",
          borderRadius: "0 0 10px 10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {tabs.map((tab, index) => (
          <TabPanel key={index} value={tabIndex} index={index}>
            {tab.component}
          </TabPanel>
        ))}
      </Box>
    </Box>
  );
}
