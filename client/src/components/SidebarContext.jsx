import { createContext, useContext, useState } from 'react';

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [isCompact, setIsCompact] = useState(false);

  return (
    <SidebarContext.Provider value={{ isCompact, setIsCompact }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}