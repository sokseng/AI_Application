import React, { createContext, useContext, useState } from "react";

const BottomBarContext = createContext();

export const BottomBarProvider = ({ children }) => {
  const [buttons, setButtons] = useState([]);
  return (
    <BottomBarContext.Provider value={{ buttons, setButtons }}>
      {children}
    </BottomBarContext.Provider>
  );
};

export const useBottomBar = () => useContext(BottomBarContext);
