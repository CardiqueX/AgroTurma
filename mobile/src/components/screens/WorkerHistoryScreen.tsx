import React from 'react';
import { Calendar, Plus, Power, FileText } from 'lucide-react';
import { MobileHeader } from '../layout/MobileHeader';
import { useApp } from '../../context/AppContext';

export const WorkerHistoryScreen: React.FC = () => {
  const {
    workers,
    selectedWorkerId,
    launches,
    periodString,
    navigateTo,
    updateWorkerStatus,
  } = useApp();

  const worker =
    workers.find((w) => w.id === selectedWorkerId) || workers[0];

  if (!worker) return null;

  // Filtra apenas os lançamentos reais do trabalhador vindos do MariaDB
  const workerLaunches = launches.filter((l) => l.workerId === worker.id);

  const productionLaunches = workerLaunches.filter((l) => l.type === 'producao');
  const dailyLaunches = workerLaunches.filter((l) => l.type === 'diaria');
  const absenceLaunches = workerLaunches.filter((l) => l.type === 'falta');

  // Conta dias distintos trabalhados (produção ou diária)
  const daysWorked = new Set(
    [...productionLaunches, ...dailyLaunches].map((l) => l.date)
  ).size;

  const boxes = productionLaunches.reduce((acc, l) => acc + (l.quantity || 0), 0);
  const absences = absenceLaunches.length;
  const totalDiarias = dailyLaunches.reduce((acc, l) => acc + l.totalValue, 0);
  const totalProducao = productionLaunches.reduce((acc, l) => acc + l.totalValue, 0);
  const totalGeral = totalDiarias + totalProducao;

  const handleToggleStatus = () => {
    const nextStatus = worker.status === 'ativo' ? 'inativo' : 'ativo';
    updateWorkerStatus(worker.id, nextStatus);
  };

  return (
    <div className="flex flex-col min-h-full bg-stone-100 text-stone-900 pb-6">
      <MobileHeader title="Histórico do Trabalhador" showBack />

      <div className="p-4 space-y-3.5">
        {/* Cabeçalho do trabalhador com botão Ativar/Inativar */}
        <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-2xs">
          <div className="flex items-center space-x-3.5">
            <div
              className={`w-12 h-12 rounded-full ${
                worker.status === 'inativo' ? 'bg-amber-600' : 'bg-[#155e2d]'
              } text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0`}
            >
              {worker.avatarInitials}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-extrabold text-stone-900">{worker.name}</h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    worker.status === 'ativo'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {worker.status === 'ativo' ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-stone-500 text-xs mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>Período: {periodString}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleToggleStatus}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer border ${
              worker.status === 'ativo'
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
            }`}
            title={worker.status === 'ativo' ? 'Inativar trabalhador' : 'Reativar trabalhador'}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{worker.status === 'ativo' ? 'Inativar' : 'Ativar'}</span>
          </button>
        </div>

        {/* 6 Cards de indicadores reais */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-2xs text-center">
            <div className="text-[10px] font-semibold text-stone-500">
              Dias trabalhados
            </div>
            <div className="text-lg font-black text-emerald-600 mt-0.5">
              {daysWorked}
            </div>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-2xs text-center">
            <div className="text-[10px] font-semibold text-stone-500">Caixas</div>
            <div className="text-lg font-black text-blue-600 mt-0.5">
              {boxes}
            </div>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-2xs text-center">
            <div className="text-[10px] font-semibold text-stone-500">Faltas</div>
            <div className="text-lg font-black text-red-500 mt-0.5">
              {absences}
            </div>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-2xs text-center">
            <div className="text-[10px] font-semibold text-stone-500">
              Diárias (R$)
            </div>
            <div className="text-sm font-black text-blue-800 mt-1">
              {totalDiarias.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-2xs text-center">
            <div className="text-[10px] font-semibold text-stone-500">
              Produção (R$)
            </div>
            <div className="text-sm font-black text-blue-800 mt-1">
              {totalProducao.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-2xs text-center">
            <div className="text-[10px] font-semibold text-stone-500">
              Total geral (R$)
            </div>
            <div className="text-sm font-black text-emerald-800 mt-1">
              {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Tabela de Lançamentos Reais */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="px-3.5 py-2.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <span className="text-xs font-bold text-stone-800">
              Lançamentos do Período ({workerLaunches.length})
            </span>
            {worker.status === 'ativo' && (
              <button
                onClick={() => navigateTo('launch_production')}
                className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-900 flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo</span>
              </button>
            )}
          </div>

          {workerLaunches.length === 0 ? (
            <div className="p-6 text-center text-stone-400 space-y-2">
              <FileText className="w-8 h-8 mx-auto text-stone-300" />
              <p className="text-xs font-medium text-stone-500">
                Nenhum lançamento registrado no banco para {worker.name}.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-semibold text-[11px] bg-stone-50/50">
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-2">Tipo</th>
                  <th className="py-2.5 px-2">Descrição</th>
                  <th className="py-2.5 px-3 text-right">Valor (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {workerLaunches.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-stone-600 whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="py-2.5 px-2">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.type === 'producao'
                            ? 'bg-blue-100 text-blue-800'
                            : item.type === 'diaria'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.type === 'producao'
                          ? 'Produção'
                          : item.type === 'diaria'
                          ? 'Diária'
                          : 'Falta'}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-stone-800 font-medium">
                      {item.description}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-stone-900">
                      {item.totalValue.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};