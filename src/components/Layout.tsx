
import React from 'react';
import Navbar from './Navbar';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  hideNavbar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, className, hideNavbar = false }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <main 
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          className
        )}
      >
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
      
      {!hideNavbar && !isAuthPage && <Navbar />}
    </div>
  );
};

export default Layout;
