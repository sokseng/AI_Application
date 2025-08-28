import React, { useState } from "react";
import useUserStore from "../../store/useUserStore";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Collapse,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import PersonIcon from "@mui/icons-material/Person";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import ArticleIcon from '@mui/icons-material/Article';
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ isDrawerOpen, onToggle, isMobile, drawerWidth, collapsedWidth }) {
  const { userRights } = useUserStore();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});

  const handleToggleMenu = (label) =>
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));

  const isSelected = (href) => location.pathname === href;
  const isChildSelected = (children) => children?.some((c) => location.pathname === c.href);
  
  const canAccessRole = userRights?.UserManagement?.RoleRights?.CanAccessModule ?? false;
  const canAccessUserRight = userRights?.UserManagement?.UserRightRights?.CanAccessModule ?? false;
  const canAccessUser = userRights?.UserManagement?.UserRights?.CanAccessModule ?? false;
  const canAccessCandidate = userRights?.CandidateRights?.CanAccessModule ?? false;

  const menuItems = [
    { label: "Dashboard", href: "/dashboard", icon: <DashboardIcon /> },
    (canAccessRole || canAccessUserRight || canAccessUser) && { label: "User management", href: "/user", icon: <PersonIcon /> },
    canAccessCandidate && {
      label: "Candidates",
      href: "/candidate",
      icon: <HowToRegIcon />,
    },
    { label: "Cover letter", href: "/cover-letter", icon: <ArticleIcon /> },
  ].filter(Boolean);

  const variant = isMobile ? "temporary" : "permanent";

  return (
    <Drawer
      variant={variant}
      open={isDrawerOpen}
      onClose={onToggle}
      ModalProps={{ keepMounted: true }} // better on mobile
      sx={{
        width: isMobile ? drawerWidth : (isDrawerOpen ? drawerWidth : collapsedWidth),
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isMobile ? drawerWidth : (isDrawerOpen ? drawerWidth : collapsedWidth),
          boxSizing: "border-box",
          backgroundColor: "#0f172a",
          color: "white",
          transition: "width 0.3s ease",
        },
      }}
    >
      <Toolbar />
      <List sx={{ py: 0 }}>
        {menuItems.map((item) => (
          <React.Fragment key={item.label}>
            <ListItem disablePadding>
              <ListItemButton
                component={item.href ? Link : "button"}
                to={item.href}
                onClick={() => {
                  if (isMobile) onToggle(); // close overlay on mobile
                  if (item.children && !isMobile && isDrawerOpen) handleToggleMenu(item.label);
                }}
                sx={{
                  backgroundColor:
                    isSelected(item.href) ||
                      (item.children && isChildSelected(item.children))
                      ? "rgba(255,255,255,0.1)"
                      : "transparent",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                  justifyContent: !isMobile && !isDrawerOpen ? "center" : "flex-start",
                  px: !isMobile && !isDrawerOpen ? 1 : 2.5,
                }}
              >
                <ListItemIcon
                  sx={{ color: "white", minWidth: !isMobile && !isDrawerOpen ? 40 : 56 }}
                >
                  {item.icon}
                </ListItemIcon>
                {!isMobile && isDrawerOpen && <ListItemText primary={item.label} />}
                {item.children && !isMobile && isDrawerOpen && (
                  openMenus[item.label] ? <ExpandLess /> : <ExpandMore />
                )}
              </ListItemButton>
            </ListItem>

            {item.children && !isMobile && isDrawerOpen && (
              <Collapse in={openMenus[item.label]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children.map((child) => (
                    <ListItem key={child.label} disablePadding sx={{ pl: 4 }}>
                      <ListItemButton
                        component={Link}
                        to={child.href}
                        sx={{
                          backgroundColor: isSelected(child.href)
                            ? "rgba(255,255,255,0.1)"
                            : "transparent",
                          "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                        }}
                      >
                        <ListItemText primary={child.label} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
}
