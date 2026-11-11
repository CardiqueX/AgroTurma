import React from 'react';
import {
  X,
  Home,
  Users,
  UserPlus,
  Package,
  CalendarCheck,
  AlertTriangle,
  BarChart3,
  CreditCard,
  Lock,
  History,
  LogOut,
  Sprout,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ScreenType } from '../../types';

export const SideMenuDrawer: React.FC = () => {
  const { isMenuDrawerOpen, setIsMenuDrawerOpen, navigateTo, logout, currentScreen } = useApp();

  if (!isMenuDrawerOpen) return null;

  const navItems: { label: string; screen: ScreenType; icon: React.ReactNode }[] = [
    { label: 'Dashboard', screen: 'dashboard', icon: <Home className="w-5 h-5" /> },
    { label: 'Trabalhadores', screen: 'workers', icon: <Users className="w-5 h-5" /> },
    { label: 'Cadastrar Trabalhador', screen: 'worker_form', icon: <UserPlus className="w-5 h-5" /> },
    { label: 'Lançar Produção', screen: 'launch_production', icon: <Package className="w-5 h-5" /> },
    { label: 'Lançar Diária', screen: 'launch_daily', icon: <CalendarCheck className="w-5 h-5" /> },
    { label: 'Registrar Falta', screen: 'launch_absence', icon: <AlertTriangle className="w-5 h-5" /> },
    { label: 'Relatório Geral', screen: 'reports', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Pagamentos', screen: 'payments', icon: <CreditCard className="w-5 h-5" /> },
    { label: 'Fechamento da Semana', screen: 'week_closure', icon: <Lock className="w-5 h-5" /> },
    { label: 'Histórico de Alterações', screen: 'audit_logs', icon: <History className="w-5 h-5" /> },
  ];

  const handleNav = (screen: ScreenType) => {
    navigateTo(screen);
    setIsMenuDrawerOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-4/5 max-w-xs bg-white h-full flex flex-col shadow-2xl justify-between animate-in slide-in-from-left duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="bg-[#14532d] text-white p-5 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold tracking-tight">AgroTurma</h2>
                <p className="text-[11px] text-emerald-200 font-medium">Fazenda Bela Aliança</p>
              </div>
            </div>
            <button
              onClick={() => setIsMenuDrawerOpen(false)}
              className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User info */}
          <div className="px-5 py-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="font-semibold text-stone-700">Maria Apontadora</span>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
              Admin
            </span>
          </div>

          {/* Nav items */}
          <div className="py-2 overflow-y-auto max-h-[62vh]">
            {navItems.map((item) => {
              const active = currentScreen === item.screen;
              return (
                <button
                  key={item.screen}
                  onClick={() => handleNav(item.screen)}
                  className={`w-full px-5 py-2.5 flex items-center space-x-3 text-sm font-medium transition-colors text-left cursor-pointer ${
                    active
                      ? 'bg-emerald-50 text-emerald-800 font-bold border-l-4 border-[#15803d]'
                      : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <span className={active ? 'text-[#15803d]' : 'text-stone-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer logout */}
        <div className="p-4 border-t border-stone-200 bg-stone-50">
          <div className="text-[10px] text-stone-400 mb-2 flex items-center justify-between">
            <span>Versão 1.0.0</span>
            <span className="flex items-center text-emerald-600">
              <CheckCircle2 className="w-3 h-3 mr-0.5" /> Offline pronto
            </span>
          </div>
          <button
            onClick={() => {
              setIsMenuDrawerOpen(false);
              logout();
            }}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair da Conta</span>
          </button>
        </div>
      </div>
      <div className="flex-1" onClick={() => setIsMenuDrawerOpen(false)} />
    </div>
  );
};
