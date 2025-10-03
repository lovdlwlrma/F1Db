import React from "react";

interface OverviewLayoutProps {
  children: React.ReactNode;
}

const OverviewLayout: React.FC<OverviewLayoutProps> = ({ children }) => {
  return <div className="min-h-screen bg-black text-white">{children}</div>;
};

export default OverviewLayout;
