import { useState, useCallback } from "react";

interface UseSidebarStateReturn {
  open: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useSidebarState = (
  initialState: boolean = true,
): UseSidebarStateReturn => {
  const [open, setOpen] = useState(initialState);

  const toggleSidebar = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const setSidebarOpen = useCallback((newState: boolean) => {
    setOpen(newState);
  }, []);

  return {
    open,
    toggleSidebar,
    setSidebarOpen,
  };
};
