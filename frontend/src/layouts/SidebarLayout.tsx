import React from "react";

interface SidebarLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  open: boolean;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  sidebar,
  children,
  open,
}) => {
  return (
    <div className="flex h-screen bg-black text-white">
      <aside
        className={`
            flex flex-col bg-black/90 border-r border-red-500/30
            transition-all duration-300 ease-in-out
            ${open ? "w-48" : "w-16"}
          `}
      >
        {sidebar}
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
};

export default SidebarLayout;
