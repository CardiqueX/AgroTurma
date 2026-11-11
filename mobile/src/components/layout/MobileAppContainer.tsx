import React from 'react';
import { useApp } from '../../context/AppContext';
import { MobileStatusBar } from './MobileStatusBar';
import { BottomNav } from './BottomNav';
import { OfflineBanner } from './OfflineBanner';
import { QuickLaunchModal } from './QuickLaunchModal';
import { NotificationDrawer } from './NotificationDrawer';
import { SideMenuDrawer } from './SideMenuDrawer';

// Screens
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { WorkersScreen } from '../screens/WorkersScreen';
import { WorkerFormScreen } from '../screens/WorkerFormScreen';
import { WorkerHistoryScreen } from '../screens/WorkerHistoryScreen';
import { LaunchProductionScreen } from '../screens/LaunchProductionScreen';
import { LaunchDailyScreen } from '../screens/LaunchDailyScreen';
import { LaunchAbsenceScreen } from '../screens/LaunchAbsenceScreen';
import { ReportScreen } from '../screens/ReportScreen';
import { PaymentsScreen } from '../screens/PaymentsScreen';
import { PaymentDetailScreen } from '../screens/PaymentDetailScreen';
import { WeekClosureScreen } from '../screens/WeekClosureScreen';
import { AuditLogScreen } from '../screens/AuditLogScreen';
import { MoreMenuScreen } from '../screens/MoreMenuScreen';
import { ScreenType } from '../../types';

export const MobileAppContainer: React.FC = () => {
  const { currentScreen, isLoggedIn, toastMessage, navigateTo } = useApp();

  const renderScreen = () => {
    if (!isLoggedIn) {
      return <LoginScreen />;
    }

    switch (currentScreen) {
      case 'login':
        return <LoginScreen />;
      case 'dashboard':
        return <DashboardScreen />;
      case 'workers':
        return <WorkersScreen />;
      case 'worker_form':
        return <WorkerFormScreen />;
      case 'worker_history':
        return <WorkerHistoryScreen />;
      case 'launch_production':
        return <LaunchProductionScreen />;
      case 'launch_daily':
        return <LaunchDailyScreen />;
      case 'launch_absence':
        return <LaunchAbsenceScreen />;
      case 'reports':
        return <ReportScreen />;
      case 'payments':
        return <PaymentsScreen />;
      case 'payment_detail':
        return <PaymentDetailScreen />;
      case 'week_closure':
        return <WeekClosureScreen />;
      case 'audit_logs':
        return <AuditLogScreen />;
      case 'more_menu':
        return <MoreMenuScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  const showBottomNav =
    isLoggedIn && currentScreen !== 'login';

  const mockScreensList: { key: ScreenType; label: string }[] = [
    { key: 'dashboard', label: '1. Dashboard' },
    { key: 'workers', label: '2. Trabalhadores' },
    { key: 'worker_form', label: '3. Cadastrar' },
    { key: 'launch_production', label: '4. Produção' },
    { key: 'launch_daily', label: '5. Diária' },
    { key: 'launch_absence', label: '6. Falta' },
    { key: 'reports', label: '7. Relatório' },
    { key: 'worker_history', label: '8. Histórico' },
    { key: 'payments', label: '9. Pagamentos' },
    { key: 'payment_detail', label: '10. Detalhes' },
    { key: 'week_closure', label: '11. Fechamento' },
    { key: 'audit_logs', label: '12. Auditoria' },
    { key: 'login', label: '13. Login' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-0 sm:py-6 px-0 sm:px-4 bg-stone-200">
      {/* Quick Screen Switcher Chips for testing each mockup screen */}
      <div className="w-full max-w-md mb-3 px-2 overflow-x-auto hidden sm:flex items-center space-x-1.5 scrollbar-none py-1">
        <span className="text-[11px] font-bold text-stone-600 shrink-0 mr-1">
          Telas do Mockup:
        </span>
        {mockScreensList.map((s) => (
          <button
            key={s.key}
            onClick={() => navigateTo(s.key)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-all cursor-pointer ${
              currentScreen === s.key
                ? 'bg-[#14532d] text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Phone Mockup Frame */}
      <div className="w-full sm:max-w-[400px] h-screen sm:h-[840px] sm:max-h-[92vh] bg-stone-100 sm:rounded-[44px] shadow-2xl overflow-hidden flex flex-col relative border-0 sm:border-8 sm:border-stone-800">
        {/* iOS Dynamic Island / Speaker notch simulation on desktop */}
        <div className="hidden sm:block absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-stone-800 rounded-full z-40 pointer-events-none" />

        {/* Status Bar */}
        <div className="bg-[#14532d] z-30 pt-1">
          <MobileStatusBar light={true} />
        </div>

        {/* Active Screen Scroll Container */}
        <div className="flex-1 overflow-y-auto relative flex flex-col bg-stone-100">
          {renderScreen()}
        </div>

        {/* Bottom Navigation */}
        {showBottomNav && (
          <div className="sticky bottom-0 z-30 shadow-lg">
            <BottomNav />
            <OfflineBanner />
          </div>
        )}

        {/* Modals & Drawers */}
        <QuickLaunchModal />
        <NotificationDrawer />
        <SideMenuDrawer />

        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute bottom-20 left-4 right-4 z-50 bg-stone-900/90 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl backdrop-blur-xs flex items-center justify-center text-center animate-in fade-in slide-in-from-bottom duration-200">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
};
