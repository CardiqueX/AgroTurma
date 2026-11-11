import React from 'react';
import { X, Bell, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NotificationDrawer: React.FC = () => {
  const { isNotificationOpen, setIsNotificationOpen, navigateTo } = useApp();

  if (!isNotificationOpen) return null;

  const notifications = [
    {
      id: 1,
      title: 'Fechamento da Semana Pendente',
      desc: 'A semana 09/06 a 15/06 ainda não foi fechada. 42 trabalhadores aguardando.',
      time: 'Há 25 minutos',
      type: 'warning',
      action: () => {
        setIsNotificationOpen(false);
        navigateTo('week_closure');
      },
    },
    {
      id: 2,
      title: '8 Faltas Registradas no Período',
      desc: 'Revise os motivos das faltas para fechar a folha sem divergências.',
      time: 'Hoje às 12:40',
      type: 'info',
      action: () => {
        setIsNotificationOpen(false);
        navigateTo('reports');
      },
    },
    {
      id: 3,
      title: 'Sincronização Offline Concluída',
      desc: '12 lançamentos foram sincronizados com sucesso na nuvem.',
      time: 'Hoje às 08:15',
      type: 'success',
      action: null,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="bg-[#14532d] text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-amber-300" />
              <h3 className="text-base font-bold">Notificações</h3>
            </div>
            <button
              onClick={() => setIsNotificationOpen(false)}
              className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-3 space-y-2.5 overflow-y-auto max-h-[80vh]">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => n.action && n.action()}
                className={`p-3 rounded-xl border transition-all ${
                  n.action ? 'cursor-pointer hover:shadow-xs' : ''
                } ${
                  n.type === 'warning'
                    ? 'bg-amber-50/70 border-amber-200'
                    : n.type === 'success'
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : 'bg-blue-50/70 border-blue-200'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
                  {n.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                  {n.type === 'info' && <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">{n.title}</h4>
                    <p className="text-[11px] text-stone-600 mt-1 leading-snug">{n.desc}</p>
                    <span className="text-[10px] text-stone-400 mt-1.5 block">{n.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 border-t border-stone-100 bg-stone-50">
          <button
            onClick={() => setIsNotificationOpen(false)}
            className="w-full py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 text-center cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
