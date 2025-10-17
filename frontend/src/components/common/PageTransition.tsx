import React, { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  pageKey: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  pageKey,
}) => {
  return (
    <div
      key={pageKey}
      className="animate-in slide-in-from-left-4 duration-700"
    >
      {children}
    </div>
  );
};

export default PageTransition;