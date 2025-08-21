// src/pages/TabsPage.jsx
import React, { useState } from "react";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import { styled } from "@mui/system";
import Role from "./Role";
import UserRight from "./UserRight";
import User from "./User";

// TabPanel for content
const TabPanel = ({ children, value, index }) => (
  <Box
    role="tabpanel"
    hidden={value !== index}
    sx={{
      flexGrow: 1,
      height: "calc(100vh - 200px)", // viewport height minus AppBar, Tabs, BottomBar
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
  const [tabIndex, setTabIndex] = useState(0);

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
        <StyledTab label="Role" />
        <StyledTab label="User Right" />
        <StyledTab label="User" />
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
        <TabPanel value={tabIndex} index={0}>
          <Role />
        </TabPanel>
        <TabPanel value={tabIndex} index={1}>
          <UserRight />
        </TabPanel>
        <TabPanel value={tabIndex} index={2}>
          <User />
        </TabPanel>
      </Box>
    </Box>
  );
}
