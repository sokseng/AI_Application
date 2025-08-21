import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../../pages/Dashboard";
import Order from "../../pages/Order";
import Login from "../../pages/Login";
import AuthGuard from "../../middleware/AuthGuard";
import TabsPage from "../../pages/TabsPage";
import Candidate from "../../pages/candidate";
import useUserStore from "../../store/useUserStore";

const AppRoutes = () => {
  // ✅ Call the hook inside the component body
  const { userRights } = useUserStore();

  return (
    <Routes>
      {/* login routes */}
      <Route path="/" element={<Login />} />

      {/* dashboard routes */}
      <Route
        path="/dashboard"
        element={
          <AuthGuard>
            <Dashboard />
          </AuthGuard>
        }
      />

      {/* user routes */}
      <Route
        path="/user"
        element={
          <AuthGuard>
            <TabsPage />
          </AuthGuard>
        }
      />

      {/* candidate routes */}
      {userRights?.CandidateRights?.CanAccessModule && (
        <Route
          path="/candidate"
          element={
            <AuthGuard>
              <Candidate />
            </AuthGuard>
          }
        />
      )}

      {/* order routes */}
      <Route
        path="/order"
        element={
          <AuthGuard>
            <Order />
          </AuthGuard>
        }
      />

      {/* Redirect unknown routes to login */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
