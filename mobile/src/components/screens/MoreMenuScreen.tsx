import React from 'react';
import {
  Users,
  CreditCard,
  Lock,
  History,
  FileSpreadsheet,
  ChevronRight,
  ShieldCheck,
  Building,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { MobileHeader } from '../layout/MobileHeader';
import { useApp } from '../../context/AppContext';

export const MoreMenuScreen: React.FC = () => {
  const { navigateTo, logout, isOnline, setIsOnline, showToast } = useApp();

  const sections = [
    {
      title: 'Gestão de Turma',
      items: [
        {
          label: 'Trabalhadores Rurais',
          desc: 'Cadastro, edição e status de atividade',
          icon: <Users className="w-5 h-5 text-emerald-700" />,
          onClick: () => navigateTo('workers'),
        },
        {
          label: 'Folha de Pagamentos',
          desc: 'Controle de valores a pagar e pagos',
          icon: <CreditCard className="w-5 h-5 text-blue-700" />,
          onClick: () => navigateTo('payments'),
        },
        {
          label: 'Fechamento da Semana',
          desc: 'Bloqueio de período e conferência',
          icon: <Lock className="w-5 h-5 text-amber-700" />,
          onClick: () => navigateTo('week_closure'),
        },
        {
          label: 'Histórico de Alterações',
          desc: 'Auditoria e justificativas de correções',
          icon: <History className="w-5 h-5 text-purple-700" />,
          onClick: () => navigateTo('audit_logs'),
        },
      ],
    },
    {
      title: 'Relatórios & Exportações',
      items: [
        {
          label: 'Relatório Geral Consolidado',
          desc: 'Resumo por trabalhador, diárias e produção',
          icon: <FileSpreadsheet className="w-5 h-5 text-teal-700" />,
          onClick: () => navigateTo('reports'),
        },
      ],
    },
    {
      title: 'Sistema & Sincronização',
      items: [
        {
          label: isOnline ? 'Modo Online (Sincronizado)' : 'Modo Offline Ativo',
          desc: 'Clique para alternar teste de rede',
          icon: <RefreshCw className="w-5 h-5 text-emerald-600" />,
          onClick: () => {
            const next = !isOnline;
            setIsOnline(next);
            showToast(next ? 'Sincronizado com o servidor!' : 'Modo offline ativado.');
          },
        },
        {
          label: 'Fazenda Bela Aliança',
          desc: 'Apontador: Maria Aparecida • CNPJ 12.345.678/0001-90',
          icon: <Building className="w-5 h-5 text-stone-600" />,
          onClick: () => showToast('Propriedade ativa: Fazenda Bela Aliança - Alfenas/MG'),
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col min-h-full bg-stone-100 text-stone-900 pb-6">
      <MobileHeader title="Mais Opções" showMenu />

      <div className="p-4 space-y-4">
        {sections.map((sec, idx) => (
          <div key={idx} className="space-y-2">
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider px-1">
              {sec.title}
            </h3>
            <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs divide-y divide-stone-100 overflow-hidden">
              {sec.items.map((item, i) => (
                <div
                  key={i}
                  onClick={item.onClick}
                  className="p-3.5 flex items-center justify-between hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-stone-50 rounded-xl border border-stone-100 shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900">
                        {item.label}
                      </h4>
                      <p className="text-[11px] text-stone-500">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-2">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-white hover:bg-red-50 text-red-600 font-bold rounded-2xl border border-red-200 transition-colors text-xs cursor-pointer shadow-2xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair da Conta (Logout)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
