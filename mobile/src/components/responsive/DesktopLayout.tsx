import React, { useState } from 'react';
import {
  Sprout,
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
  Calendar,
  Search,
  Bell,
  Wifi,
  WifiOff,
  LogOut,
  Smartphone,
  Monitor,
  Plus,
  TrendingUp,
  FileDown,
  Share2,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ScreenType } from '../../types';
import { REPORT_ROWS } from '../../data/initialData';

interface DesktopLayoutProps {
  onToggleViewMode: () => void;
  isSimulatorMode: boolean;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  onToggleViewMode,
  isSimulatorMode,
}) => {
  const {
    currentScreen,
    navigateTo,
    workers,
    launches,
    payments,
    weekClosure,
    auditLogs,
    periodString,
    setPeriodString,
    isOnline,
    setIsOnline,
    selectedWorkerId,
    setSelectedWorkerId,
    selectedPaymentId,
    setSelectedPaymentId,
    logout,
    setIsQuickLaunchOpen,
    setIsNotificationOpen,
    markPaymentAsPaid,
    toggleWeekClosure,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [workerTab, setWorkerTab] = useState<'todos' | 'ativo' | 'inativo'>('todos');
  const [paymentTab, setPaymentTab] = useState<'a_pagar' | 'pago'>('a_pagar');
  const [reportTab, setReportTab] = useState<'resumo' | 'detalhado'>('resumo');

  const activeWorker =
    workers.find((w) => w.id === selectedWorkerId) || workers[0];
  const activePayment =
    payments.find((p) => p.id === selectedPaymentId) || payments[0];

  const activeWorkersCount = workers.filter((w) => w.status === 'ativo').length;
  const filteredWorkers = workers.filter((w) => {
    const match =
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.phone.includes(searchQuery);
    return workerTab === 'todos' ? match : match && w.status === workerTab;
  });

  const chartData = [
    { date: '09/06', day: 'Seg', boxes: 240 },
    { date: '10/06', day: 'Ter', boxes: 380 },
    { date: '11/06', day: 'Qua', boxes: 420 },
    { date: '12/06', day: 'Qui', boxes: 310 },
    { date: '13/06', day: 'Sex', boxes: 390 },
    { date: '14/06', day: 'Sáb', boxes: 490 },
    { date: '15/06', day: 'Dom', boxes: 580 },
  ];

  const navigationItems = [
    { label: 'Dashboard', screen: 'dashboard' as ScreenType, icon: <Home className="w-4 h-4" /> },
    { label: 'Trabalhadores', screen: 'workers' as ScreenType, icon: <Users className="w-4 h-4" /> },
    { label: 'Lançamentos', screen: 'launch_production' as ScreenType, icon: <Package className="w-4 h-4" /> },
    { label: 'Relatórios', screen: 'reports' as ScreenType, icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Pagamentos', screen: 'payments' as ScreenType, icon: <CreditCard className="w-4 h-4" /> },
    { label: 'Fechamento Semana', screen: 'week_closure' as ScreenType, icon: <Lock className="w-4 h-4" /> },
    { label: 'Histórico Alterações', screen: 'audit_logs' as ScreenType, icon: <History className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc] text-stone-900">
      {/* LEFT SIDEBAR - Responsive: Hidden on mobile (<768px), Visible on tablet & desktop (>=768px) */}
      <aside className="w-full md:w-64 lg:w-72 bg-[#14532d] text-white flex flex-col justify-between shrink-0 shadow-xl z-20">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-emerald-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-300 shadow-inner">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight leading-none text-white">
                  Agro<span className="text-emerald-300">Turma</span>
                </h1>
                <p className="text-[11px] text-emerald-200/80 font-medium tracking-wide mt-1">
                  Mão de Obra Rural
                </p>
              </div>
            </div>
          </div>

          {/* Farm info banner */}
          <div className="mx-4 my-4 p-3 bg-emerald-900/60 rounded-xl border border-emerald-700/50 flex items-center justify-between text-xs">
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-300">
                Propriedade Ativa
              </div>
              <div className="font-bold text-white mt-0.5">
                Fazenda Bela Aliança
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-2 space-y-1">
            {navigationItems.map((item) => {
              const isActive =
                currentScreen === item.screen ||
                (item.screen === 'workers' &&
                  ['worker_form', 'worker_history'].includes(currentScreen)) ||
                (item.screen === 'launch_production' &&
                  ['launch_daily', 'launch_absence'].includes(currentScreen)) ||
                (item.screen === 'payments' &&
                  ['payment_detail'].includes(currentScreen));

              return (
                <button
                  key={item.screen}
                  onClick={() => navigateTo(item.screen)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-white text-[#14532d] shadow-sm font-bold'
                      : 'text-emerald-100/80 hover:text-white hover:bg-emerald-800/60'
                  }`}
                >
                  <span className={isActive ? 'text-[#14532d]' : 'text-emerald-300'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-emerald-800/80 space-y-3 bg-[#0f3e21]">
          {/* Quick status */}
          <div className="flex items-center justify-between text-[11px] text-emerald-200">
            <span className="flex items-center space-x-1.5">
              {isOnline ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-300" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>{isOnline ? 'Sincronizado' : 'Offline local'}</span>
            </span>
            <button
              onClick={() => setIsOnline(!isOnline)}
              className="px-2 py-0.5 bg-emerald-800/80 hover:bg-emerald-700 text-[10px] font-bold rounded cursor-pointer transition-colors"
            >
              Alternar
            </button>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 text-xs font-semibold text-red-200 hover:text-white hover:bg-red-900/40 rounded-lg transition-colors cursor-pointer border border-red-800/40"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* TOP APP BAR - Responsive layout */}
        <header className="bg-white border-b border-stone-200 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-black text-stone-800 tracking-tight capitalize">
              {currentScreen.replace('_', ' ')}
            </h2>
            <div className="hidden sm:flex items-center space-x-2 bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-700">
              <Calendar className="w-3.5 h-3.5 text-emerald-800" />
              <span>{periodString}</span>
            </div>
          </div>

          {/* Action buttons & View mode toggle */}
          <div className="flex items-center space-x-2.5 ml-auto">
            {/* Quick Action modal trigger */}
            <button
              onClick={() => setIsQuickLaunchOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-2 bg-[#15803d] hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Lançamento</span>
            </button>

            {/* Notification button */}
            <button
              onClick={() => setIsNotificationOpen(true)}
              className="p-2 text-stone-600 hover:bg-stone-100 rounded-xl transition-colors relative cursor-pointer"
              title="Notificações"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full"></span>
            </button>

            {/* Mobile / Desktop view mode toggle button */}
            <button
              onClick={onToggleViewMode}
              className="flex items-center space-x-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="Alternar entre modo Desktop Responsivo e Simulador de Celular"
            >
              {isSimulatorMode ? (
                <>
                  <Monitor className="w-4 h-4 text-emerald-800" />
                  <span className="hidden sm:inline">Modo Desktop</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4 text-emerald-800" />
                  <span className="hidden sm:inline">Simulador Mobile</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* WORKSPACE CONTENT with CSS Grid & Flexbox */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Screen Content Switcher */}
          {currentScreen === 'dashboard' && (
            <div className="space-y-6">
              {/* 4 Responsive KPI Cards Grid (1 col on mobile, 2 on tablet, 4 on desktop) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  onClick={() => navigateTo('workers')}
                  className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:border-emerald-500 hover:shadow-xs transition-all cursor-pointer"
                >
                  <span className="text-xs font-semibold text-stone-500">Trabalhadores ativos</span>
                  <div className="text-3xl font-black text-emerald-700 mt-1">{activeWorkersCount}</div>
                  <div className="text-xs text-stone-400 mt-2 pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span>Equipe total no campo</span>
                    <span className="text-emerald-700 font-bold">Ver &rarr;</span>
                  </div>
                </div>

                <div
                  onClick={() => navigateTo('launch_production')}
                  className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:border-blue-500 hover:shadow-xs transition-all cursor-pointer"
                >
                  <span className="text-xs font-semibold text-stone-500">Produção total</span>
                  <div className="text-3xl font-black text-blue-700 mt-1 flex items-baseline space-x-1.5">
                    <span>4350</span>
                    <span className="text-sm font-semibold text-blue-500">caixas</span>
                  </div>
                  <div className="text-xs text-stone-400 mt-2 pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span>Safra alho & café</span>
                    <span className="text-blue-700 font-bold">+ Apontar</span>
                  </div>
                </div>

                <div
                  onClick={() => navigateTo('launch_absence')}
                  className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:border-red-500 hover:shadow-xs transition-all cursor-pointer"
                >
                  <span className="text-xs font-semibold text-stone-500">Faltas no período</span>
                  <div className="text-3xl font-black text-red-600 mt-1">8</div>
                  <div className="text-xs text-stone-400 mt-2 pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span>Ausências registradas</span>
                    <span className="text-red-600 font-bold">Detalhar</span>
                  </div>
                </div>

                <div
                  onClick={() => navigateTo('payments')}
                  className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:border-amber-500 hover:shadow-xs transition-all cursor-pointer"
                >
                  <span className="text-xs font-semibold text-stone-500">A pagar</span>
                  <div className="text-2xl font-black text-amber-600 mt-1">R$ 28.450,00</div>
                  <div className="text-xs text-stone-400 mt-2 pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span>Folha consolidada</span>
                    <span className="text-amber-700 font-bold">Conferir</span>
                  </div>
                </div>
              </div>

              {/* Responsive 2-column Grid: Chart (2 cols) & Action Summary (1 col) on large screens */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bar Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-stone-800">
                        Produção por dia (caixas)
                      </h3>
                      <p className="text-xs text-stone-500">Volume colhido na última semana</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center space-x-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+18% na semana</span>
                    </span>
                  </div>

                  {/* Chart Visualizer */}
                  <div className="h-56 flex flex-col justify-end pt-4">
                    <div className="h-44 flex items-end justify-between px-4 border-b border-stone-200 space-x-3">
                      {chartData.map((d) => {
                        const hPct = Math.round((d.boxes / 600) * 100);
                        return (
                          <div key={d.date} className="flex-1 flex flex-col items-center group cursor-pointer">
                            <span className="text-[10px] font-bold text-stone-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {d.boxes}
                            </span>
                            <div
                              style={{ height: `${hPct}%` }}
                              className="w-full max-w-[44px] bg-[#155e2d] hover:bg-emerald-600 rounded-t-md transition-all duration-300"
                            />
                            <span className="text-xs font-semibold text-stone-600 mt-2">
                              {d.date}
                            </span>
                            <span className="text-[10px] text-stone-400">{d.day}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Quick Launch & Status Panel */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-stone-800 mb-1">
                      Ações de Apontamento
                    </h3>
                    <p className="text-xs text-stone-500 mb-4">
                      Acesse rapidamente os formulários de campo
                    </p>

                    <div className="space-y-2.5">
                      <button
                        onClick={() => navigateTo('launch_production')}
                        className="w-full p-3 rounded-xl border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50 text-left flex items-center justify-between transition-all cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <Package className="w-5 h-5 text-emerald-700" />
                          <div>
                            <div className="text-xs font-bold text-stone-900">Lançar Produção</div>
                            <div className="text-[11px] text-stone-500">Caixas de alho e café</div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-stone-400" />
                      </button>

                      <button
                        onClick={() => navigateTo('launch_daily')}
                        className="w-full p-3 rounded-xl border border-stone-200 hover:border-blue-500 hover:bg-blue-50 text-left flex items-center justify-between transition-all cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <CalendarCheck className="w-5 h-5 text-blue-700" />
                          <div>
                            <div className="text-xs font-bold text-stone-900">Lançar Diária</div>
                            <div className="text-[11px] text-stone-500">Valor fixo por dia trabalhado</div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-stone-400" />
                      </button>

                      <button
                        onClick={() => navigateTo('launch_absence')}
                        className="w-full p-3 rounded-xl border border-stone-200 hover:border-red-500 hover:bg-red-50 text-left flex items-center justify-between transition-all cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <div>
                            <div className="text-xs font-bold text-stone-900">Registrar Falta</div>
                            <div className="text-[11px] text-stone-500">Ausência e justificativa</div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-stone-400" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-100">
                    <button
                      onClick={() => navigateTo('week_closure')}
                      className="w-full py-3 bg-[#14532d] hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer text-center"
                    >
                      Painel de Fechamento da Semana &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: Workers Master-Detail Grid (Tablet & Desktop Split View) */}
          {(currentScreen === 'workers' ||
            currentScreen === 'worker_history' ||
            currentScreen === 'worker_form') && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Workers List Column (5 of 12 cols on desktop) */}
              <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-stone-900">Trabalhadores Rurais</h3>
                  <button
                    onClick={() => navigateTo('worker_form')}
                    className="px-3 py-1.5 bg-[#14532d] hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Cadastrar</span>
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nome ou CPF..."
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="flex space-x-1 text-xs">
                  {(['todos', 'ativo', 'inativo'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setWorkerTab(t)}
                      className={`px-3 py-1 rounded-lg font-semibold capitalize transition-all cursor-pointer ${
                        workerTab === t
                          ? 'bg-[#14532d] text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="divide-y divide-stone-100 max-h-[600px] overflow-y-auto">
                  {filteredWorkers.map((w) => {
                    const isSelected = selectedWorkerId === w.id;
                    return (
                      <div
                        key={w.id}
                        onClick={() => {
                          setSelectedWorkerId(w.id);
                          navigateTo('worker_history');
                        }}
                        className={`p-3 flex items-center justify-between rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-emerald-50 border border-emerald-300'
                            : 'hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-[#155e2d] text-white font-bold text-xs flex items-center justify-center">
                            {w.avatarInitials}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-stone-900">{w.name}</div>
                            <div className="text-[11px] text-stone-500">{w.phone}</div>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            w.status === 'ativo'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {w.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Worker Detail / Form Column (7 of 12 cols on desktop) */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
                {currentScreen === 'worker_form' ? (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-3">
                      Cadastrar Novo Membro da Turma
                    </h3>
                    <div className="p-4 bg-stone-50 rounded-xl text-xs text-stone-600">
                      Preencha os dados do trabalhador rural para habilitar apontamentos de caixas e diárias.
                    </div>
                    {/* The mobile form will render directly or trigger add */}
                    <button
                      onClick={() => navigateTo('workers')}
                      className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold rounded-xl"
                    >
                      Voltar para Detalhes
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 rounded-full bg-[#14532d] text-white font-black text-lg flex items-center justify-center shadow-sm">
                          {activeWorker.avatarInitials}
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-stone-900">{activeWorker.name}</h3>
                          <p className="text-xs text-stone-500">
                            CPF: {activeWorker.cpf} • Tel: {activeWorker.phone}
                          </p>
                          <p className="text-xs text-emerald-800 font-medium mt-0.5">
                            {activeWorker.notes || 'Sem observações'}
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigateTo('launch_production')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                        >
                          + Produção
                        </button>
                        <button
                          onClick={() => navigateTo('launch_daily')}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                        >
                          + Diária
                        </button>
                      </div>
                    </div>

                    {/* Summary Badges Grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                        <div className="text-[10px] text-stone-500 font-semibold">Dias</div>
                        <div className="text-base font-black text-emerald-700 mt-0.5">5</div>
                      </div>
                      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                        <div className="text-[10px] text-stone-500 font-semibold">Caixas</div>
                        <div className="text-base font-black text-blue-700 mt-0.5">82</div>
                      </div>
                      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                        <div className="text-[10px] text-stone-500 font-semibold">Faltas</div>
                        <div className="text-base font-black text-red-600 mt-0.5">1</div>
                      </div>
                      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                        <div className="text-[10px] text-stone-500 font-semibold">Diárias</div>
                        <div className="text-sm font-black text-stone-800 mt-0.5">R$ 160,00</div>
                      </div>
                      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                        <div className="text-[10px] text-stone-500 font-semibold">Produção</div>
                        <div className="text-sm font-black text-stone-800 mt-0.5">R$ 410,00</div>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300">
                        <div className="text-[10px] text-emerald-800 font-bold">Total Geral</div>
                        <div className="text-sm font-black text-emerald-900 mt-0.5">R$ 570,00</div>
                      </div>
                    </div>

                    {/* History Table */}
                    <div className="border border-stone-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200 text-[11px]">
                          <tr>
                            <th className="py-2 px-3">Data</th>
                            <th className="py-2 px-3">Tipo</th>
                            <th className="py-2 px-3">Descrição</th>
                            <th className="py-2 px-3 text-right">Valor (R$)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          <tr>
                            <td className="py-2.5 px-3">15/06/2025</td>
                            <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">Produção</span></td>
                            <td className="py-2.5 px-3 font-medium">18 caixas</td>
                            <td className="py-2.5 px-3 text-right font-bold">90,00</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3">14/06/2025</td>
                            <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">Produção</span></td>
                            <td className="py-2.5 px-3 font-medium">12 caixas</td>
                            <td className="py-2.5 px-3 text-right font-bold">60,00</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3">13/06/2025</td>
                            <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold">Falta</span></td>
                            <td className="py-2.5 px-3 font-medium">Não compareceu</td>
                            <td className="py-2.5 px-3 text-right font-bold">0,00</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3">12/06/2025</td>
                            <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Diária</span></td>
                            <td className="py-2.5 px-3 font-medium">Diária</td>
                            <td className="py-2.5 px-3 text-right font-bold">80,00</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SCREEN: Relatório Geral Consolidado (Full Responsive Table) */}
          {currentScreen === 'reports' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-stone-900">Relatório Geral da Turma</h3>
                  <p className="text-xs text-stone-500">Período: {periodString}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center space-x-1.5 px-3 py-2 border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Exportar PDF</span>
                  </button>
                  <button
                    onClick={() => showToast('Link de compartilhamento copiado!')}
                    className="flex items-center space-x-1.5 px-3 py-2 bg-[#15803d] hover:bg-emerald-800 text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Compartilhar</span>
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto border border-stone-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                    <tr>
                      <th className="py-3 px-4">Trabalhador</th>
                      <th className="py-3 px-3 text-center">Dias Trabalhados</th>
                      <th className="py-3 px-3 text-center">Caixas</th>
                      <th className="py-3 px-3 text-right">Diárias (R$)</th>
                      <th className="py-3 px-3 text-center">Faltas</th>
                      <th className="py-3 px-3 text-right">Total Produção (R$)</th>
                      <th className="py-3 px-4 text-right">Total Geral (R$)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-800">
                    {REPORT_ROWS.map((r) => (
                      <tr key={r.workerId} className="hover:bg-stone-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-stone-900">{r.name}</td>
                        <td className="py-3 px-3 text-center">{r.workedDays}</td>
                        <td className="py-3 px-3 text-center font-semibold text-blue-700">{r.boxes}</td>
                        <td className="py-3 px-3 text-right">{r.diarias.toFixed(2).replace('.', ',')}</td>
                        <td className="py-3 px-3 text-center font-bold text-red-600">{r.faltas}</td>
                        <td className="py-3 px-3 text-right">{r.totalProduction.toFixed(2).replace('.', ',')}</td>
                        <td className="py-3 px-4 text-right font-black text-emerald-900">
                          {r.totalGeneral.toFixed(2).replace('.', ',')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-stone-50 border-t-2 border-stone-300 font-black text-stone-900">
                    <tr>
                      <td className="py-3 px-4 uppercase tracking-wider">TOTAIS</td>
                      <td className="py-3 px-3 text-center">39</td>
                      <td className="py-3 px-3 text-center text-blue-800">627</td>
                      <td className="py-3 px-3 text-right">960,00</td>
                      <td className="py-3 px-3 text-center text-red-600">8</td>
                      <td className="py-3 px-3 text-right">3.135,00</td>
                      <td className="py-3 px-4 text-right text-emerald-950 font-black">4.095,00</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* SCREEN: Pagamentos Split View */}
          {(currentScreen === 'payments' || currentScreen === 'payment_detail') && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-stone-900">Controle de Pagamentos</h3>
                  <span className="text-xs text-stone-500">{periodString}</span>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setPaymentTab('a_pagar')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      paymentTab === 'a_pagar'
                        ? 'bg-[#14532d] text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    A Pagar (6)
                  </button>
                  <button
                    onClick={() => setPaymentTab('pago')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      paymentTab === 'pago'
                        ? 'bg-[#14532d] text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    Pagos (3)
                  </button>
                </div>

                <div className="space-y-2">
                  {payments
                    .filter((p) => p.status === paymentTab)
                    .map((p) => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPaymentId(p.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          selectedPaymentId === p.id
                            ? 'bg-emerald-50 border-emerald-400'
                            : 'bg-white border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-stone-900">{p.workerName}</div>
                          <div className="text-[11px] text-stone-500">
                            Total: <strong className="text-stone-900">R$ {p.netTotal.toFixed(2)}</strong>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            p.status === 'a_pagar'
                              ? 'border-red-200 text-red-700 bg-red-50'
                              : 'border-emerald-200 text-emerald-700 bg-emerald-50'
                          }`}
                        >
                          {p.status === 'a_pagar' ? 'A pagar' : 'Pago'}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Payment Detail Card */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-3">
                  Detalhes do Pagamento • {activePayment.workerName}
                </h3>

                <div className="p-4 bg-stone-50 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Diárias:</span>
                    <span className="font-semibold text-stone-900">R$ {activePayment.totalDiarias.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Produção ({activePayment.boxesCount} caixas):</span>
                    <span className="font-semibold text-stone-900">R$ {activePayment.totalProducao.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600 border-t border-stone-200 pt-2 font-bold text-stone-900">
                    <span>Total Bruto:</span>
                    <span>R$ {activePayment.grossTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-900 font-black text-sm border-t border-stone-200 pt-2">
                    <span>Total a Receber:</span>
                    <span>R$ {activePayment.netTotal.toFixed(2)}</span>
                  </div>
                </div>

                {activePayment.status === 'a_pagar' ? (
                  <button
                    onClick={() => markPaymentAsPaid(activePayment.id, 'PIX')}
                    className="w-full py-3 bg-[#14532d] hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Confirmar e Marcar como Pago via PIX
                  </button>
                ) : (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                    <div>
                      <div className="font-bold">Pagamento Confirmado</div>
                      <div className="text-[11px] text-emerald-700">Recibo gerado com sucesso para a folha.</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SCREEN: Fechamento da Semana */}
          {currentScreen === 'week_closure' && (
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-stone-900">Fechamento da Semana</h3>
                  <p className="text-xs text-stone-500">Semana: {weekClosure.period}</p>
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    weekClosure.isClosed
                      ? 'bg-stone-800 text-white'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {weekClosure.isClosed ? 'Fechada' : 'Em Aberto'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-stone-500">Trabalhadores ativos:</span>
                  <div className="text-lg font-bold text-stone-900">{weekClosure.activeWorkers}</div>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-stone-500">Dias trabalhados:</span>
                  <div className="text-lg font-bold text-stone-900">{weekClosure.workedDays}</div>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-stone-500">Produção total:</span>
                  <div className="text-lg font-bold text-blue-700">{weekClosure.totalBoxes} caixas</div>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-stone-500">Total a pagar:</span>
                  <div className="text-lg font-bold text-emerald-800">
                    R$ {weekClosure.totalPayable.toFixed(2)}
                  </div>
                </div>
              </div>

              <button
                onClick={toggleWeekClosure}
                className="w-full py-3 bg-[#14532d] hover:bg-emerald-800 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors"
              >
                {weekClosure.isClosed ? 'Reabrir Semana para Alterações' : 'Fechar Semana e Bloquear Edições'}
              </button>
            </div>
          )}

          {/* SCREEN: Histórico de Alterações */}
          {currentScreen === 'audit_logs' && (
            <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-3">
                Histórico de Alterações e Auditoria
              </h3>
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-4 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900">{log.workerName} • {log.changeTitle}</span>
                      <span className="text-[11px] text-stone-400">{log.timestamp}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 p-2.5 rounded-lg">
                      <div>Anterior: <strong className="text-stone-600">{log.previousValue}</strong></div>
                      <div>Novo: <strong className="text-emerald-700">{log.newValue}</strong></div>
                    </div>
                    <div className="text-[11px] text-stone-500">
                      Alterado por <strong>{log.alteredBy}</strong>: "{log.reason}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCREEN: Forms (Production, Daily, Absence) */}
          {(currentScreen === 'launch_production' ||
            currentScreen === 'launch_daily' ||
            currentScreen === 'launch_absence') && (
            <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
                <h3 className="text-base font-bold text-stone-900">
                  {currentScreen === 'launch_production'
                    ? 'Lançamento de Produção'
                    : currentScreen === 'launch_daily'
                    ? 'Lançamento de Diária'
                    : 'Registro de Falta'}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigateTo('launch_production')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                      currentScreen === 'launch_production'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    Produção
                  </button>
                  <button
                    onClick={() => navigateTo('launch_daily')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                      currentScreen === 'launch_daily'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    Diária
                  </button>
                  <button
                    onClick={() => navigateTo('launch_absence')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                      currentScreen === 'launch_absence'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    Falta
                  </button>
                </div>
              </div>

              <div className="text-xs text-stone-600 mb-4">
                Os dados inseridos no campo são salvos imediatamente no banco local e consolidados no resumo da quinzena.
              </div>

              {/* Action buttons */}
              <button
                onClick={() => {
                  showToast('Lançamento registrado com sucesso!');
                  navigateTo('dashboard');
                }}
                className="w-full py-3 bg-[#14532d] hover:bg-emerald-800 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs transition-colors"
              >
                Gravar Lançamento no Sistema
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
