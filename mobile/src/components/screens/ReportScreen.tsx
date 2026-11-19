import React, { useState } from 'react';
import {
  Calendar,
  Download,
  Package,
  AlertTriangle,
  Wallet,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { MobileHeader } from '../layout/MobileHeader';
import { useApp } from '../../context/AppContext';

export const ReportScreen: React.FC = () => {
  const {
    workers,
    launches,
    periodString,
    setSelectedWorkerId,
    navigateTo,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'resumo' | 'detalhado'>('resumo');
  const [typeFilter, setTypeFilter] = useState<'todos' | 'producao' | 'diaria' | 'falta'>('todos');

  // Totais gerais reais vindos do banco
  const totalBoxes = launches
    .filter((l) => l.type === 'producao')
    .reduce((acc, l) => acc + (l.quantity || 0), 0);

  const totalAbsences = launches.filter((l) => l.type === 'falta').length;

  const totalProducaoValor = launches
    .filter((l) => l.type === 'producao')
    .reduce((acc, l) => acc + l.totalValue, 0);

  const totalDiariasValor = launches
    .filter((l) => l.type === 'diaria')
    .reduce((acc, l) => acc + l.totalValue, 0);

  const totalGeral = totalProducaoValor + totalDiariasValor;

  // Resumo consolidado por trabalhador
  const workerSummaries = workers.map((w) => {
    const wLaunches = launches.filter((l) => l.workerId === w.id);
    const prod = wLaunches.filter((l) => l.type === 'producao');
    const diar = wLaunches.filter((l) => l.type === 'diaria');
    const falt = wLaunches.filter((l) => l.type === 'falta');

    const boxes = prod.reduce((acc, l) => acc + (l.quantity || 0), 0);
    const prodVal = prod.reduce((acc, l) => acc + l.totalValue, 0);
    const diarVal = diar.reduce((acc, l) => acc + l.totalValue, 0);

    return {
      worker: w,
      boxes,
      absences: falt.length,
      prodVal,
      diarVal,
      total: prodVal + diarVal,
      count: wLaunches.length,
    };
  });

  // Lançamentos filtrados para a aba Detalhado
  const filteredLaunches =
    typeFilter === 'todos'
      ? launches
      : launches.filter((l) => l.type === typeFilter);

  // Exportação real em CSV (abre direto no Excel)
  const handleExportCsv = () => {
    const headers = ['Data', 'Trabalhador', 'Tipo', 'Descricao', 'Quantidade_Caixas', 'Valor_Total'];
    const rows = launches.map((l) => [
      l.date,
      `"${l.workerName}"`,
      l.type,
      `"${l.description}"`,
      l.quantity || 0,
      l.totalValue.toFixed(2).replace('.', ','),
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'relatorio_agroturma.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Relatório CSV exportado com sucesso!');
  };

  return (
    <div className="flex flex-col min-h-full bg-stone-100 text-stone-900 pb-6">
      <MobileHeader title="Relatório Geral" showMenu showBell />

      <div className="p-4 space-y-4">
        {/* Período e botão exportar */}
        <div className="flex items-center justify-between bg-white border border-stone-200/90 rounded-xl px-3.5 py-2.5 shadow-2xs">
          <div className="flex items-center space-x-2 text-xs font-semibold text-stone-700">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <span>{periodString}</span>
          </div>
          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>

        {/* Cards de resumo geral */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white p-3 rounded-xl border border-stone-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-blue-600 mb-1">
              <span className="text-[10px] font-bold text-stone-500">Caixas</span>
              <Package className="w-3.5 h-3.5" />
            </div>
            <div className="text-lg font-black text-blue-700">{totalBoxes}</div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-stone-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-red-500 mb-1">
              <span className="text-[10px] font-bold text-stone-500">Faltas</span>
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <div className="text-lg font-black text-red-600">{totalAbsences}</div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-stone-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-emerald-600 mb-1">
              <span className="text-[10px] font-bold text-stone-500">Total</span>
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <div className="text-sm font-black text-emerald-700 mt-1">
              R$ {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Abas Resumo / Detalhado */}
        <div className="grid grid-cols-2 bg-stone-200/80 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('resumo')}
            className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'resumo'
                ? 'bg-white text-emerald-800 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Por Trabalhador
          </button>
          <button
            onClick={() => setActiveTab('detalhado')}
            className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'detalhado'
                ? 'bg-white text-emerald-800 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Detalhado ({launches.length})
          </button>
        </div>

        {activeTab === 'resumo' ? (
          <div className="space-y-2.5">
            {workerSummaries.map(({ worker, boxes, absences, prodVal, diarVal, total }) => (
              <div
                key={worker.id}
                onClick={() => {
                  setSelectedWorkerId(worker.id);
                  navigateTo('worker_history');
                }}
                className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-2xs hover:border-emerald-400 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`w-9 h-9 rounded-full ${
                        worker.status === 'inativo' ? 'bg-amber-600' : 'bg-[#155e2d]'
                      } text-white font-bold text-xs flex items-center justify-center`}
                    >
                      {worker.avatarInitials}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-stone-900">{worker.name}</div>
                      <div className="text-[11px] text-stone-500">
                        {boxes} caixas • {absences} falta{absences !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="text-right">
                      <div className="text-sm font-black text-emerald-700">
                        R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-stone-400">
                        Prod: {prodVal.toFixed(0)} | Diár: {diarVal.toFixed(0)}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Filtro por tipo */}
            <div className="flex space-x-1.5 overflow-x-auto pb-1">
              {(['todos', 'producao', 'diaria', 'falta'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    typeFilter === t
                      ? 'bg-[#14532d] text-white'
                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {t === 'todos'
                    ? 'Todos'
                    : t === 'producao'
                    ? 'Produção'
                    : t === 'diaria'
                    ? 'Diárias'
                    : 'Faltas'}
                </button>
              ))}
            </div>

            {/* Lista detalhada */}
            <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
              {filteredLaunches.length === 0 ? (
                <div className="p-6 text-center text-stone-400 space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-stone-300" />
                  <p className="text-xs font-medium text-stone-500">
                    Nenhum lançamento encontrado para este filtro.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {filteredLaunches.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 flex items-center justify-between hover:bg-stone-50 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-stone-900">
                            {item.workerName}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
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
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {item.date} • {item.description}
                        </div>
                      </div>
                      <div className="text-xs font-extrabold text-stone-900">
                        R$ {item.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};