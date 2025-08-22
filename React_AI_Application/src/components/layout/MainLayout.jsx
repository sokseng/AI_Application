import React, { useEffect, useState } from "react";
import { Box, CssBaseline, useMediaQuery, useTheme, Toolbar } from "@mui/material";
import Sidebar from "./Sidebar";
import TopAppBar from "./AppBar";
import BottomBar from "./BottomBar";
import { useBottomBar } from "./BottomBarContext";

const DRAWER_WIDTH = 240;
const DRAWER_COLLAPSED = 72;   // nicer than 60 with MUI icons
const BOTTOMBAR_HEIGHT = 48;

const MainLayout = ({ children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const { buttons } = useBottomBar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Auto-close drawer on mobile, open on desktop
  useEffect(() => {
    setIsDrawerOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => setIsDrawerOpen(prev => !prev);

  // For the fixed BottomBar to align with content on desktop
  const leftGap = !isMobile ? (isDrawerOpen ? DRAWER_WIDTH : DRAWER_COLLAPSED) : 0;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />

      {/* Sidebar */}
      <Sidebar
        isDrawerOpen={isDrawerOpen}
        onToggle={toggleSidebar}
        isMobile={isMobile}
        drawerWidth={DRAWER_WIDTH}
        collapsedWidth={DRAWER_COLLAPSED}
      />

      {/* Main column */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopAppBar onMenuClick={toggleSidebar} />

        {/* Spacer for fixed AppBar */}
        <Toolbar />

        {/* Content area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",   // prevent scrollbars
            px: { xs: 1, sm: 2 },
          }}
        >
          {children}
        </Box>

        {/* Fixed BottomBar aligned with content */}
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: leftGap,
            right: 0,
            height: BOTTOMBAR_HEIGHT,
            bgcolor: "background.paper",
            borderTop: "1px solid",
            borderColor: "divider",
            zIndex: theme.zIndex.appBar, // above content
          }}
        >
          <BottomBar buttons={buttons} />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
