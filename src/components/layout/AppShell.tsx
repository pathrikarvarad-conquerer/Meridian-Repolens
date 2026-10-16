import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { EvidenceDrawer } from './EvidenceDrawer';
import { ToastContainer } from './ToastContainer';
import { SearchModal } from './SearchModal';

export const AppShell: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans">
      <AppHeader onOpenSearch={() => setIsSearchOpen(true)} />
      
      <div className="flex-1 flex overflow-hidden">
        <AppSidebar />
        
        <main className="flex-1 overflow-y-auto min-w-0">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <EvidenceDrawer />
      <ToastContainer />
    </div>
  );
};
