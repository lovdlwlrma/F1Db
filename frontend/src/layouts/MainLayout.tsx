import React from "react";
import SidebarLayout from "@/layouts/SidebarLayout";
import Sidebar from "@/components/Sidebar";
import PageRouter from "@/components/main/PageRouter";

interface MainLayoutProps {
  sidebarOpen: boolean;
  activePage: string;
  onToggleSidebar: () => void;
  onPageChange: (page: string) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  sidebarOpen,
  activePage,
  onToggleSidebar,
  onPageChange,
}) => {
  return (
    <div className="h-screen flex flex-col">
      <SidebarLayout
        open={sidebarOpen}
        sidebar={
          <Sidebar
            open={sidebarOpen}
            onToggle={onToggleSidebar}
            activePage={activePage}
            onPageChange={onPageChange}
          />
        }
      >
        <main className="flex-1 p-4 transition-[padding] duration-700">
          <PageRouter activePage={activePage} />
        </main>
      </SidebarLayout>
    </div>
  );
};

export default MainLayout;
