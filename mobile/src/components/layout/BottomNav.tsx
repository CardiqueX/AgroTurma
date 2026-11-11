import React from 'react';
import { Home, ArrowUpRightFromCircle, BarChart3, LayoutGrid } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ScreenType } from '../../types';

export const BottomNav: React.FC = () => {
  const { currentScreen, navigateTo, setIsQuickLaunchOpen } = useApp();

  const isTabActive = (tab: 'inicio' | 'lancamentos' | 'relatorios' | 'mais') => {
    switch (tab) {
      case 'inicio':
        return currentScreen === 'dashboard';
      case 'lancamentos':
        return [
          'launch_production',
          'launch_daily',
          'launch_absence',
        ].includes(currentScreen);
      case 'relatorios':
        return currentScreen === 'reports';
      case 'mais':
        return [
          'more_menu',
          'workers',
          'worker_form',
          'worker_history',
          'payments',
          'payment_detail',
          'week_closure',
          'audit_logs',
        ].includes(currentScreen);
      default:
        return false;
    }
  };

  return (
    <div className="bg-white border-t border-stone-200 py-2 px-3 flex items-center justify-around select-none">
      <button
        onClick={() => navigateTo('dashboard')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
          isTabActive('inicio') ? 'text-[#15803d] font-bold' : 'text-stone-400 hover:text-stone-600'
        }`}
      >
        <Home className={`w-5 h-5 ${isTabActive('inicio') ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[11px] mt-1 font-medium">Início</span>
      </button>

      <button
        onClick={() => setIsQuickLaunchOpen(true)}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
          isTabActive('lancamentos') ? 'text-[#15803d] font-bold' : 'text-stone-400 hover:text-stone-600'
        }`}
      >
        <ArrowUpRightFromCircle className={`w-5 h-5 ${isTabActive('lancamentos') ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[11px] mt-1 font-medium">Lançamentos</span>
      </button>

      <button
        onClick={() => navigateTo('reports')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
          isTabActive('relatorios') ? 'text-[#15803d] font-bold' : 'text-stone-400 hover:text-stone-600'
        }`}
      >
        <BarChart3 className={`w-5 h-5 ${isTabActive('relatorios') ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[11px] mt-1 font-medium">Relatórios</span>
      </button>

      <button
        onClick={() => navigateTo('more_menu')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
          isTabActive('mais') ? 'text-[#15803d] font-bold' : 'text-stone-400 hover:text-stone-600'
        }`}
      >
        <LayoutGrid className={`w-5 h-5 ${isTabActive('mais') ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[11px] mt-1 font-medium">Mais</span>
      </button>
    </div>
  );
};
