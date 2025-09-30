import React from "react";

interface RegisterLayoutProps {
  children: React.ReactNode;
}

const RegisterLayout: React.FC<RegisterLayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {children}
    </div>
  );
};

export default RegisterLayout;
