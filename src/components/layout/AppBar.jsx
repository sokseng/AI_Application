import React from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, IconButton, Toolbar, Typography, Box, Tooltip } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import axiosInstance from "../../utils/axiosInstance";

const TopAppBar = ({ onMenuClick }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const access_token = localStorage.getItem("access_token");

      if (!access_token) {
        // No token, just redirect
        localStorage.removeItem("access_token");
        navigate("/");
        return;
      }

      await axiosInstance.post("/user/logout", { access_token });

      // After successful logout
      localStorage.removeItem("access_token");
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      // Still clear token and redirect (force logout)
      localStorage.removeItem("access_token");
      navigate("/");
    }
  };


  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: "#0f172a", // match sidebar color
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
          aria-label="open drawer"
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" noWrap component="div">
          Admin Dashboard
        </Typography>

        <Box sx={{ flexGrow: 1 }} /> {/* push logout to the right */}

        <Tooltip title="Logout">
          <IconButton color="inherit" onClick={handleLogout} aria-label="logout">
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
};

export default TopAppBar;
