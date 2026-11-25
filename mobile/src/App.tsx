
import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { MobileAppContainer } from './components/layout/MobileAppContainer';

function MainContent() {
  const { toastMessage } = useApp();

  return (
    <div className="relative min-h-screen bg-stone-100 font-sans text-stone-900">
      <MobileAppContainer />

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
