import React from "react";

interface StandingsLayoutProps {
  year: number;
  children: React.ReactNode;
}

export const StandingsLayout: React.FC<StandingsLayoutProps> = ({
  children,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      {/* Content */}
      <div className="max-w-7xl mx-auto space-y-8">{children}</div>
    </div>
  );
};
export default StandingsLayout;
