import React from "react";
import MainLayout from "@/layouts/MainLayout";
import { useSidebarState } from "@/hooks/useSidebarState";
import { useNavigation } from "@/hooks/useRouteNavigation";

const Main: React.FC = () => {
  const { open, toggleSidebar } = useSidebarState(true);
  const { activePage, navigateToPage } = useNavigation();

  return (
    <MainLayout
      sidebarOpen={open}
      activePage={activePage}
      onToggleSidebar={toggleSidebar}
      onPageChange={navigateToPage}
    />
  );
};

export default Main;