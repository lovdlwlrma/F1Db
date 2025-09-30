import React from 'react';
import heroSrc from '@/assets/hero1.jpg';

interface BackgroundProps {
  children?: React.ReactNode;
}

const Background: React.FC<BackgroundProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen">
      <img
        src={heroSrc}
        alt="Hero"
        className="fixed top-0 left-0 w-screen h-screen object-cover z-0"
      />
      {children}
    </div>
  );
};

export default Background;
