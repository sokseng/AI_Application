import React, { useState } from "react";
import { Box, CssBaseline } from "@mui/material";
import Sidebar from "./Sidebar";
import TopAppBar from "./AppBar";
import BottomBar from "./BottomBar";
import { useBottomBar } from "./BottomBarContext";

const MainLayout = ({ children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const { buttons } = useBottomBar();

  const toggleSidebar = () => setIsDrawerOpen((prev) => !prev);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />
      <Sidebar isDrawerOpen={isDrawerOpen} onToggle={toggleSidebar} />
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <TopAppBar onMenuClick={toggleSidebar} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 1,
            py: 1,
            mt: "64px",
            mb: "10px",
            overflowY: "auto",
          }}
        >
          {children}
        </Box>
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: isDrawerOpen ? 240 : 60,
            right: 0,
            zIndex: (theme) => theme.zIndex.appBar,
          }}
        >
          <BottomBar buttons={buttons} />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
