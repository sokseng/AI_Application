import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { getAccessToken, isTokenExpired } from "../utils/authUtils";
import MainLayout from "../components/layout/MainLayout";  // import MainLayout here
import { Box, CircularProgress } from "@mui/material";    // MUI spinner & Box

const AuthGuard = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null); // null = loading

  useEffect(() => {
    const checkAuth = async () => {
      const token = getAccessToken();

      if (!token) {
        setIsAuth(false);
        return;
      }

      const expired = await isTokenExpired(token);

      if (expired) {
        setIsAuth(false);
      } else {
        setIsAuth(true);
      }
    };

    checkAuth();
  }, []);

  if (isAuth === false) {
    return <Navigate to="/" replace />;
  }

  // Render loading spinner inside MainLayout content area
  if (isAuth === null) {
    return (
      <MainLayout>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
            flexDirection: "column",
            gap: 1,               // space between spinner and text
            color: "text.secondary", // use MUI theme text color for subtle look
            fontSize: "1.25rem",  // slightly larger text
            fontWeight: 500,
            userSelect: "none",   // prevent text selection while loading
          }}
        >
          <CircularProgress />
          <div>Loading...</div>
        </Box>

      </MainLayout>
    );
  }

  // Render protected page wrapped in layout
  return <MainLayout>{children}</MainLayout>;
};

export default AuthGuard;
