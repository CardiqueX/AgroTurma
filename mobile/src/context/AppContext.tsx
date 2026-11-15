import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ScreenType,
  Worker,
  Launch,
  PaymentRecord,
  AuditLog,
  WeekClosure,
} from '../types';
import {
  INITIAL_WORKERS,
  INITIAL_LAUNCHES,
  INITIAL_PAYMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_WEEK_CLOSURE,
} from '../data/initialData';

interface AppContextType {
  currentScreen: ScreenType;
  screenHistory: ScreenType[];
  navigateTo: (screen: ScreenType) => void;
  goBack: () => void;

  // Selected entities
  selectedWorkerId: string | null;
  setSelectedWorkerId: (id: string | null) => void;
  selectedPaymentId: string | null;
  setSelectedPaymentId: (id: string | null) => void;

  // Data
  workers: Worker[];
  launches: Launch[];
  payments: PaymentRecord[];
  auditLogs: AuditLog[];
  weekClosure: WeekClosure;

  // Actions
  addWorker: (worker: Omit<Worker, 'id' | 'createdAt' | 'avatarInitials'>) => void;
  updateWorkerStatus: (id: string, status: 'ativo' | 'inativo') => void;
  addLaunch: (launch: Omit<Launch, 'id' | 'createdAt'>) => void;
  markPaymentAsPaid: (paymentId: string, method?: string) => void;
  toggleWeekClosure: () => void;

  // Global filters & states
  periodString: string;
  setPeriodString: (p: string) => void;
  isOnline: boolean;
  setIsOnline: (status: boolean) => void;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;

  // Modals & Drawers
  isQuickLaunchOpen: boolean;
  setIsQuickLaunchOpen: (open: boolean) => void;
  isNotificationOpen: boolean;
  setIsNotificationOpen: (open: boolean) => void;
  isMenuDrawerOpen: boolean;
  setIsMenuDrawerOpen: (open: boolean) => void;

  // Notification toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('dashboard');
  const [screenHistory, setScreenHistory] = useState<ScreenType[]>(['dashboard']);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>('w1');
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>('p1');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [periodString, setPeriodString] = useState<string>('01/06/2025 a 15/06/2025');
  const [isOnline, setIsOnline] = useState<boolean>(true);

  const [isQuickLaunchOpen, setIsQuickLaunchOpen] = useState<boolean>(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persistent state initialized from localStorage or defaults
  const [workers, setWorkers] = useState<Worker[]>(() => {
    const saved = localStorage.getItem('agroturma_workers');
    return saved ? JSON.parse(saved) : INITIAL_WORKERS;
  });

  const [launches, setLaunches] = useState<Launch[]>(() => {
    const saved = localStorage.getItem('agroturma_launches');
    return saved ? JSON.parse(saved) : INITIAL_LAUNCHES;
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const saved = localStorage.getItem('agroturma_payments');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('agroturma_audit');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [weekClosure, setWeekClosure] = useState<WeekClosure>(() => {
    const saved = localStorage.getItem('agroturma_closure');
    return saved ? JSON.parse(saved) : INITIAL_WEEK_CLOSURE;
  });

  useEffect(() => {
    localStorage.setItem('agroturma_workers', JSON.stringify(workers));
  }, [workers]);

  useEffect(() => {
    localStorage.setItem('agroturma_launches', JSON.stringify(launches));
  }, [launches]);

  useEffect(() => {
    localStorage.setItem('agroturma_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('agroturma_audit', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('agroturma_closure', JSON.stringify(weekClosure));
  }, [weekClosure]);

  // Carrega os trabalhadores reais do MariaDB ao iniciar
  useEffect(() => {
    fetch('/api/workers')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setWorkers(data);
          setSelectedWorkerId(data[0].id);
        }
      })
      .catch((err) => console.error('Erro ao buscar trabalhadores da API:', err));
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const navigateTo = (screen: ScreenType) => {
    setScreenHistory((prev) => [...prev, screen]);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (screenHistory.length > 1) {
      const nextHistory = [...screenHistory];
      nextHistory.pop();
      const prevScreen = nextHistory[nextHistory.length - 1];
      setScreenHistory(nextHistory);
      setCurrentScreen(prevScreen);
    } else {
      setCurrentScreen('dashboard');
    }
  };

  const addWorker = async (workerData: Omit<Worker, 'id' | 'createdAt' | 'avatarInitials'>) => {
    try {
      const res = await fetch('/api/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workerData),
      });
      if (!res.ok) throw new Error('Falha ao gravar no banco');
      const newWorker: Worker = await res.json();

      setWorkers((prev) => [newWorker, ...prev]);

      const newPayment: PaymentRecord = {
        id: 'p_' + Date.now(),
        workerId: newWorker.id,
        workerName: newWorker.name,
        period: periodString,
        totalDiarias: 0,
        totalProducao: 0,
        boxesCount: 0,
        grossTotal: 0,
        discounts: 0,
        netTotal: 0,
        status: 'a_pagar',
      };
      setPayments((prev) => [newPayment, ...prev]);
      showToast(`Trabalhador ${newWorker.name} cadastrado no banco!`);
      navigateTo('workers');
    } catch (err) {
      console.error(err);
      showToast('Erro ao cadastrar trabalhador no banco.');
    }
  };

  const updateWorkerStatus = async (id: string, status: 'ativo' | 'inativo') => {
    try {
      await fetch(`/api/workers/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setWorkers((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status } : w))
      );
      showToast('Status do trabalhador atualizado no banco!');
    } catch (err) {
      console.error(err);
      showToast('Erro ao atualizar status.');
    }
  };

  const addLaunch = (launchData: Omit<Launch, 'id' | 'createdAt'>) => {
    const newLaunch: Launch = {
      ...launchData,
      id: 'l_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setLaunches((prev) => [newLaunch, ...prev]);

    setPayments((prev) =>
      prev.map((p) => {
        if (p.workerId === launchData.workerId) {
          const addBoxes = launchData.quantity || 0;
          const addProd = launchData.type === 'producao' ? launchData.totalValue : 0;
          const addDiaria = launchData.type === 'diaria' ? launchData.totalValue : 0;
          const gross = p.grossTotal + launchData.totalValue;
          const net = gross - p.discounts;
          return {
            ...p,
            boxesCount: p.boxesCount + addBoxes,
            totalProducao: p.totalProducao + addProd,
            totalDiarias: p.totalDiarias + addDiaria,
            grossTotal: gross,
            netTotal: net,
          };
        }
        return p;
      })
    );

    const now = new Date();
    const timeStr = `${launchData.date} às ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const log: AuditLog = {
      id: 'a_' + Date.now(),
      date: launchData.date,
      timestamp: timeStr,
      workerId: launchData.workerId,
      workerName: launchData.workerName,
      changeTitle:
        launchData.type === 'producao'
          ? `Produção ${launchData.quantity} caixas`
          : launchData.type === 'diaria'
          ? `Diária - R$ ${launchData.totalValue.toFixed(2)}`
          : 'Falta',
      previousValue: 'Sem registro',
      newValue:
        launchData.type === 'falta'
          ? 'Falta'
          : `R$ ${launchData.totalValue.toFixed(2)}`,
      alteredBy: 'Maria Aparecida',
      reason: launchData.notes || 'Lançamento registrado via aplicativo',
    };
    setAuditLogs((prev) => [log, ...prev]);

    showToast('Lançamento salvo com sucesso!');
    navigateTo('dashboard');
  };

  const markPaymentAsPaid = (paymentId: string, method: string = 'PIX') => {
    const now = new Date();
    const paidAt = `${now.toLocaleDateString('pt-BR')} às ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? {
              ...p,
              status: 'pago',
              paidAt,
              paymentMethod: method,
            }
          : p
      )
    );
    showToast('Pagamento marcado como Pago!');
  };

  const toggleWeekClosure = () => {
    setWeekClosure((prev) => {
      const isClosing = !prev.isClosed;
      return {
        ...prev,
        isClosed: isClosing,
        closedAt: isClosing ? new Date().toLocaleString('pt-BR') : undefined,
        closedBy: isClosing ? 'Administrador da Fazenda' : undefined,
      };
    });
    showToast(
      weekClosure.isClosed
        ? 'Semana reaberta para edição!'
        : 'Semana fechada com sucesso! Dados bloqueados.'
    );
  };

  const login = () => {
    setIsLoggedIn(true);
    navigateTo('dashboard');
    showToast('Bem-vindo ao AgroTurma!');
  };

  const logout = () => {
    setIsLoggedIn(false);
    navigateTo('login');
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        screenHistory,
        navigateTo,
        goBack,
        selectedWorkerId,
        setSelectedWorkerId,
        selectedPaymentId,
        setSelectedPaymentId,
        workers,
        launches,
        payments,
        auditLogs,
        weekClosure,
        addWorker,
        updateWorkerStatus,
        addLaunch,
        markPaymentAsPaid,
        toggleWeekClosure,
        periodString,
        setPeriodString,
        isOnline,
        setIsOnline,
        isLoggedIn,
        login,
        logout,
        isQuickLaunchOpen,
        setIsQuickLaunchOpen,
        isNotificationOpen,
        setIsNotificationOpen,
        isMenuDrawerOpen,
        setIsMenuDrawerOpen,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};