import React from "react";

interface CalendarLayoutProps {
  year: number;
  children: React.ReactNode;
}

export const CalendarLayout: React.FC<CalendarLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-8">{children}</div>
    </div>
  );
};
