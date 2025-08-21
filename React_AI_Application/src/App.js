import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./components/routes/AppRoutes";
import { BottomBarProvider } from "./components/layout/BottomBarContext";

function App() {
  return (
    <BrowserRouter>
      <BottomBarProvider>
        <AppRoutes />
      </BottomBarProvider>
    </BrowserRouter>
  );
}

export default App;
