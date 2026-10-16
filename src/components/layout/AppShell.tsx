import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { EvidenceDrawer } from './EvidenceDrawer';
import { ToastContainer } from './ToastContainer';

export const AppShell: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-canvas)] text-[var(--color-text-primary)] font-sans antialiased">
      <AppHeader />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Only show sidebar when navigating workspaces, not on the landing page */}
        {!isHomePage && <AppSidebar />}
        
        <main className="flex-1 overflow-y-auto min-w-0">
          <div className={`mx-auto p-4 sm:p-6 lg:p-8 ${isHomePage ? 'max-w-6xl' : 'max-w-7xl'}`}>
            <Outlet />
          </div>
        </main>
      </div>

      <EvidenceDrawer />
      <ToastContainer />
    </div>
  );
};
