import React from "react";

interface OverviewLayoutProps {
  children: React.ReactNode;
}

const OverviewLayout: React.FC<OverviewLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
      {children}
    </div>
  );
};

export default OverviewLayout;
