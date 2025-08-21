import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./components/routes/AppRoutes";
import { BottomBarProvider } from "./components/layout/BottomBarContext";
import { SnackbarProvider } from "./components/shared/SnackbarContext";

function App() {
  return (
    <BrowserRouter>
      <SnackbarProvider>
        <BottomBarProvider>
          <AppRoutes />
        </BottomBarProvider>
      </SnackbarProvider>
    </BrowserRouter>
  );
}

export default App;
