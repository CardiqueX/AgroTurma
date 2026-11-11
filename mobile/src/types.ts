export type ScreenType =
  | 'login'
  | 'dashboard'
  | 'workers'
  | 'worker_form'
  | 'worker_history'
  | 'launch_production'
  | 'launch_daily'
  | 'launch_absence'
  | 'reports'
  | 'payments'
  | 'payment_detail'
  | 'week_closure'
  | 'audit_logs'
  | 'more_menu';

export interface Worker {
  id: string;
  name: string;
  phone: string;
  cpf: string;
  notes: string;
  status: 'ativo' | 'inativo';
  avatarInitials: string;
  avatarColor?: string;
  photoUrl?: string;
  createdAt: string;
}

export type LaunchType = 'producao' | 'diaria' | 'falta';

export interface Launch {
  id: string;
  date: string; // DD/MM/YYYY or YYYY-MM-DD
  workerId: string;
  workerName: string;
  type: LaunchType;
  description: string;
  productService?: string;
  quantity?: number;
  unitValue?: number;
  totalValue: number;
  reason?: string;
  notes?: string;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  workerId: string;
  workerName: string;
  period: string;
  totalDiarias: number;
  totalProducao: number;
  boxesCount: number;
  grossTotal: number;
  discounts: number;
  netTotal: number;
  status: 'a_pagar' | 'pago';
  paidAt?: string;
  paymentMethod?: string;
}

export interface AuditLog {
  id: string;
  date: string;
  timestamp: string;
  workerId: string;
  workerName: string;
  changeTitle: string;
  previousValue: string;
  newValue: string;
  alteredBy: string;
  reason: string;
}

export interface WeekClosure {
  id: string;
  period: string;
  activeWorkers: number;
  workedDays: number;
  totalBoxes: number;
  absencesCount: number;
  totalProductionValue: number;
  totalDailyValue: number;
  totalPayable: number;
  isClosed: boolean;
  closedAt?: string;
  closedBy?: string;
}
