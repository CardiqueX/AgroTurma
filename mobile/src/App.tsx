/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { MobileAppContainer } from './components/layout/MobileAppContainer';
import { DesktopLayout } from './components/responsive/DesktopLayout';
import { QuickLaunchModal } from './components/layout/QuickLaunchModal';
import { NotificationDrawer } from './components/layout/NotificationDrawer';
import { SideMenuDrawer } from './components/layout/SideMenuDrawer';

function MainContent() {
  const { toastMessage } = useApp();
  const [viewMode, setViewMode] = useState<'desktop' | 'simulator'>('simulator');
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const isMobile = window.innerWidth < 768;
      setIsMobileScreen(isMobile);
      if (isMobile) {
        setViewMode('simulator');
      }
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'desktop' ? 'simulator' : 'desktop'));
  };

  return (
    <div className="relative min-h-screen bg-stone-100 font-sans text-stone-900">
      {viewMode === 'desktop' && !isMobileScreen ? (
        <>
          <DesktopLayout
            onToggleViewMode={toggleViewMode}
            isSimulatorMode={false}
          />
          <QuickLaunchModal />
          <NotificationDrawer />
          <SideMenuDrawer />
        </>
      ) : (
        <div className="relative">
          {!isMobileScreen && (
            <div className="fixed top-4 right-4 z-50">
              <button
                onClick={toggleViewMode}
                className="px-3.5 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold shadow-xl hover:bg-stone-800 transition-all cursor-pointer flex items-center space-x-2 border border-stone-700"
              >
                <span>Alternar para Modo Desktop</span>
              </button>
            </div>
          )}
          <MobileAppContainer />
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900/95 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl backdrop-blur-xs flex items-center space-x-2 border border-stone-800 animate-in fade-in slide-in-from-bottom duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}