import React, { ReactNode } from "react";

interface Props {
  children: ReactNode;
  nextRace?: any;
  loading?: boolean;
}

const AnalyticsLayout: React.FC<Props> = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-gray-900 text-white">
    <main className="flex-1 p-4">{children}</main>
  </div>
);

export default AnalyticsLayout;