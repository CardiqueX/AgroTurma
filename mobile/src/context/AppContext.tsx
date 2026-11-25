
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

  selectedWorkerId: string | null;
  setSelectedWorkerId: (id: string | null) => void;
  selectedPaymentId: string | null;
  setSelectedPaymentId: (id: string | null) => void;

  workers: Worker[];
  launches: Launch[];
  payments: PaymentRecord[];
  auditLogs: AuditLog[];
  weekClosure: WeekClosure;

  addWorker: (worker: Omit<Worker, 'id' | 'createdAt' | 'avatarInitials'>) => void;
  updateWorkerStatus: (id: string, status: 'ativo' | 'inativo') => void;
  addLaunch: (launch: Omit<Launch, 'id' | 'createdAt'>) => void;
  markPaymentAsPaid: (paymentId: string, method?: string) => void;
  cancelPayment: (paymentId: string) => Promise<void>;

  closureStartDate: string;
  closureEndDate: string;
  setClosureStartDate: (date: string) => void;
  setClosureEndDate: (date: string) => void;
  refreshWeekClosure: () => void;
  toggleWeekClosure: () => void;

  periodString: string;
  setPeriodString: (p: string) => void;
  isOnline: boolean;
  setIsOnline: (status: boolean) => void;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;

  isQuickLaunchOpen: boolean;
  setIsQuickLaunchOpen: (open: boolean) => void;
  isNotificationOpen: boolean;
  setIsNotificationOpen: (open: boolean) => void;
  isMenuDrawerOpen: boolean;
  setIsMenuDrawerOpen: (open: boolean) => void;

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

  // Datas do fechamento semanal
  const getMonday = () => {
    const date = new Date();
    const day = date.getDay();

    date.setDate(date.getDate() - (day === 0 ? 6 : day - 1));

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayNumber = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${dayNumber}`;
  };

  const [closureStartDate, setClosureStartDate] = useState(getMonday);

  const [closureEndDate, setClosureEndDate] = useState(() => {
    const sunday = new Date(`${getMonday()}T12:00:00`);
    sunday.setDate(sunday.getDate() + 6);

    const year = sunday.getFullYear();
    const month = String(sunday.getMonth() + 1).padStart(2, '0');
    const day = String(sunday.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  });

  const [isQuickLaunchOpen, setIsQuickLaunchOpen] = useState<boolean>(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const refreshPayments = () => {
    fetch('/api/payments')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPayments(data);

          if (data.length > 0) {
            setSelectedPaymentId((curr) =>
              data.some((p) => p.id === curr) ? curr : data[0].id
            );
          }
        }
      })
      .catch((err) => console.error('Erro ao buscar pagamentos:', err));
  };

  const refreshAuditLogs = () => {
    fetch('/api/audit-logs')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAuditLogs(data);
        }
      })
      .catch((err) => console.error('Erro ao buscar auditoria:', err));
  };

  const refreshWeekClosure = async () => {
    try {
      const params = new URLSearchParams({
        startDate: closureStartDate,
        endDate: closureEndDate,
      });

      const res = await fetch(`/api/week-closure?${params}`);

      if (!res.ok) {
        throw new Error('Erro ao buscar fechamento semanal');
      }

      const data = await res.json();

      setWeekClosure((prev) => ({
        ...prev,
        ...data,
      }));

      if (data.period) {
        setPeriodString(data.period);
      }
    } catch (err) {
      console.error('Erro ao carregar fechamento:', err);
    }
  };

  // Carga inicial do banco de dados
  useEffect(() => {
    fetch('/api/workers')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setWorkers(data);
          setSelectedWorkerId(data[0].id);
        }
      })
      .catch((err) => console.error('Erro ao buscar trabalhadores:', err));

    fetch('/api/launches')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLaunches(data);
        }
      })
      .catch((err) => console.error('Erro ao buscar lançamentos:', err));

    refreshPayments();
    refreshAuditLogs();
    refreshWeekClosure();
  }, []);

  useEffect(() => {
    if (closureStartDate && closureEndDate && closureStartDate <= closureEndDate) {
      refreshWeekClosure();
      refreshPayments();
    }
  }, [closureStartDate, closureEndDate]);

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

  const addWorker = async (
    workerData: Omit<Worker, 'id' | 'createdAt' | 'avatarInitials'>
  ) => {
    try {
      const res = await fetch('/api/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workerData),
      });

      if (!res.ok) throw new Error('Falha ao gravar no banco');

      const newWorker: Worker = await res.json();

      setWorkers((prev) => [newWorker, ...prev]);
      refreshPayments();
      refreshAuditLogs();

      showToast(`Trabalhador ${newWorker.name} cadastrado no banco!`);
      navigateTo('workers');
    } catch (err) {
      console.error(err);
      showToast('Erro ao cadastrar trabalhador no banco.');
    }
  };

  const updateWorkerStatus = async (
    id: string,
    status: 'ativo' | 'inativo'
  ) => {
    try {
      await fetch(`/api/workers/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      setWorkers((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status } : w))
      );

      refreshAuditLogs();
      showToast('Status do trabalhador atualizado no banco!');
    } catch (err) {
      console.error(err);
      showToast('Erro ao atualizar status.');
    }
  };

  const addLaunch = async (launchData: Omit<Launch, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/launches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(launchData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Falha ao salvar lançamento no banco');
      }

      const newLaunch: Launch = await res.json();

      setLaunches((prev) => [newLaunch, ...prev]);
      refreshPayments();
      refreshAuditLogs();

      showToast('Lançamento salvo no banco de dados!');
      navigateTo('dashboard');
    } catch (err) {
      console.error(err);
      showToast(
        err instanceof Error ? err.message : 'Erro ao salvar lançamento no banco.'
      );
    }
  };

  const markPaymentAsPaid = async (
    paymentId: string,
    method: string = 'PIX'
  ) => {
    try {
      const payment = payments.find((p) => p.id === paymentId);
      if (!payment) return;

      const res = await fetch(`/api/payments/${payment.workerId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method,
          netTotal: payment.netTotal,
          workerName: payment.workerName,
        }),
      });

      if (!res.ok) throw new Error('Falha ao confirmar pagamento');

      const result = await res.json();

      setPayments((prev) =>
        prev.map((p) =>
          p.id === paymentId
            ? {
                ...p,
                status: 'pago',
                paidAt: result.paidAt,
                paymentMethod: result.paymentMethod,
              }
            : p
        )
      );

      refreshAuditLogs();
      showToast('Pagamento confirmado e salvo no banco!');
    } catch (err) {
      console.error(err);
      showToast('Erro ao confirmar pagamento no banco.');
    }
  };

  // Estornar pagamento
  const cancelPayment = async (paymentId: string) => {
    try {
      const payment = payments.find((p) => p.id === paymentId);
      if (!payment) return;

      const res = await fetch(`/api/payments/${payment.workerId}/unpay`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Falha ao estornar pagamento');

      setPayments((prev) =>
        prev.map((p) =>
          p.id === paymentId
            ? {
                ...p,
                status: 'a_pagar',
                paidAt: undefined,
                paymentMethod: undefined,
              }
            : p
        )
      );

      refreshAuditLogs();
      showToast('Pagamento estornado com sucesso!');
    } catch (err) {
      console.error(err);
      showToast('Erro ao estornar pagamento.');
    }
  };

  const toggleWeekClosure = async () => {
    try {
      if (!closureStartDate || !closureEndDate || closureStartDate > closureEndDate) {
        showToast('Selecione um período válido.');
        return;
      }

      const res = await fetch('/api/week-closure/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: closureStartDate,
          endDate: closureEndDate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Falha ao atualizar fechamento');
      }

      await refreshWeekClosure();
      refreshAuditLogs();

      showToast(
        data.isClosed
          ? 'Semana fechada com sucesso!'
          : 'Semana reaberta com sucesso.'
      );
    } catch (err) {
      console.error(err);

      showToast(
        err instanceof Error
          ? err.message
          : 'Erro ao atualizar fechamento da semana.'
      );
    }
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
        cancelPayment,

        closureStartDate,
        closureEndDate,
        setClosureStartDate,
        setClosureEndDate,
        refreshWeekClosure,
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
