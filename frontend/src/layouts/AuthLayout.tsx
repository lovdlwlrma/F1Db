import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="absolute top-0 right-10 h-full w-full md:w-[30%] flex items-start justify-center pt-16 px-6">
      {children}
    </div>
  );
};

export default AuthLayout;
