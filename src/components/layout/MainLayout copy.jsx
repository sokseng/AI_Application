import React, { useState } from "react";
import { Box, CssBaseline, Toolbar } from "@mui/material";
import Sidebar from "./Sidebar";
import TopAppBar from "./AppBar";
import BottomBar from "./BottomBar";

const MainLayout = ({ children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const toggleSidebar = () => {
    setIsDrawerOpen((prev) => !prev);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />

      {/* Sidebar */}
      <Sidebar isDrawerOpen={isDrawerOpen} onToggle={toggleSidebar} />

      {/* Main content wrapper */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Top AppBar */}
        <TopAppBar onMenuClick={toggleSidebar} />

        {/* Main scrollable content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 1,
            py: 1,
            mt: "64px", // height of AppBar
            mb: "10px", // height of BottomBar
            overflowY: "auto",
          }}
        >
          {children}
        </Box>

        {/* Bottom Bar fixed */}
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: isDrawerOpen ? 240 : 60, // match sidebar width
            right: 0,
            zIndex: (theme) => theme.zIndex.appBar,
          }}
        >
          <BottomBar />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
