import React, { createContext, useContext, useState } from 'react';

interface LayoutContextType {
  mobileOpen: boolean;
  toggleSidebar: () => void;
}

const LayoutContext = createContext<LayoutContextType>({
  mobileOpen: false,
  toggleSidebar: () => {},
});

export const useLayout = () => useContext(LayoutContext);

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleSidebar = () => setMobileOpen(!mobileOpen);

  return (
    <LayoutContext.Provider value={{ mobileOpen, toggleSidebar }}>
      {children}
    </LayoutContext.Provider>
  );
};
