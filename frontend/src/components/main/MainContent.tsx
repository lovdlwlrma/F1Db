import React from "react";
import Sidebar from "@/components/Sidebar";
import PageRouter from "@/components/main/PageRouter";
import SidebarLayout from "@/layouts/SidebarLayout";

interface MainContentProps {
  open: boolean;
  activePage: string;
  onToggleSidebar: () => void;
  onPageChange: (page: string) => void;
}

const MainContent: React.FC<MainContentProps> = ({
  open,
  activePage,
  onToggleSidebar,
  onPageChange,
}) => {
  return (
    <SidebarLayout
      open={open}
      sidebar={
        <Sidebar
          open={open}
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
  );
};

export default MainContent;
