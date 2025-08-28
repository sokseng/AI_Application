import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../../pages/Dashboard";
import Login from "../../pages/Login";
import AuthGuard from "../../middleware/AuthGuard";
import TabsPage from "../../pages/TabsPage";
import Candidate from "../../pages/candidate";
import CoverLetter from "../../pages/CoverLetter";
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

  const canAccessCandidate =
    userRights?.CandidateRights?.CanAccessModule ?? false;

  return (
    <Routes>
      {/* login routes */}
      <Route path="/" element={<Login />} />

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
      <Route
        path="/user"
        element={
          <AuthGuard>
            <TabsPage />
          </AuthGuard>
        }
      />

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

      {/* order */}
      <Route
        path="/cover-letter"
        element={
          <AuthGuard>
            <CoverLetter />
          </AuthGuard>
        }
      />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
