import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../../pages/Dashboard";
import Login from "../../pages/Login";
import ForgotPassword from "../../pages/ForgotPassword";
import AuthGuard from "../../middleware/AuthGuard";
import TabsPage from "../../pages/TabsPage";
import Candidate from "../../pages/candidate";
import CoverLetter from "../../pages/CoverLetter";
import SystemParamenter from "../../pages/SystemParamenter";
import useUserStore from "../../store/useUserStore";
import { Box, CircularProgress, Typography } from "@mui/material";

const AppRoutes = () => {
  const { userRights, hasHydrated } = useUserStore();

  // Wait until zustand rehydrated from localStorage
  if (!hasHydrated) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        flexDirection="column"
      >
        <CircularProgress />
        <Typography variant="body1" mt={2}>
          Loading...
        </Typography>
      </Box>
    );
  }

  const canAccessCandidate = userRights?.CandidateRights?.CanAccessModule ?? false;
  const canAccessCoverLetter = userRights?.CoverLetterRights?.CanAccessModule ?? false;
  const canAccessRole = userRights?.UserManagement?.RoleRights?.CanAccessModule ?? false;
  const canAccessUserRight = userRights?.UserManagement?.UserRightRights?.CanAccessModule ?? false;
  const canAccessUser = userRights?.UserManagement?.UserRights?.CanAccessModule ?? false;

  return (
    <Routes>
      {/* login routes */}
      <Route path="/" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* dashboard */}
      <Route
        path="/dashboard"
        element={
          <AuthGuard>
            <Dashboard />
          </AuthGuard>
        }
      />

      {/* user management */}
      {(canAccessRole || canAccessUserRight || canAccessUser) && (
        <Route
          path="/user"
          element={
            <AuthGuard>
              <TabsPage />
            </AuthGuard>
          }
        />
      )}


      {/* candidate */}
      {canAccessCandidate && (
        <Route
          path="/candidate"
          element={
            <AuthGuard>
              <Candidate />
            </AuthGuard>
          }
        />
      )}

      {/* cover letter */}
      {canAccessCoverLetter && (
        <Route
          path="/cover-letter"
          element={
            <AuthGuard>
              <CoverLetter />
            </AuthGuard>
          }
        />
      )}

      {/* system paramenter */}
      <Route
        path="/system-parameter"
        element={
          <AuthGuard>
            <SystemParamenter />
          </AuthGuard>
        }
      />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
