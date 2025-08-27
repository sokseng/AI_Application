import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./components/routes/AppRoutes";
import { BottomBarProvider } from "./components/layout/BottomBarContext";
import { SnackbarProvider } from "./components/shared/SnackbarContext";
import { ConfirmProvider } from "./components/shared/ConfirmContext";

function App() {
  return (
    <BrowserRouter>
      <SnackbarProvider>
        <ConfirmProvider>
          <BottomBarProvider>
            <AppRoutes />
          </BottomBarProvider>
        </ConfirmProvider>
      </SnackbarProvider>
    </BrowserRouter>
  );
}

export default App;
