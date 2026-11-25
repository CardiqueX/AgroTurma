
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

const money = (value: number) =>
  (value || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const toIsoDate = (value: string): string => {
  if (!value) return '';

  // Data no formato YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  // Data no formato DD/MM/YYYY
  const brDate = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (brDate) {
    return `${brDate[3]}-${brDate[2]}-${brDate[1]}`;
  }

  return '';
};

export const ReportScreen: React.FC = () => {
  const {
    workers,
    launches,
    closureStartDate,
    closureEndDate,
    setClosureStartDate,
    setClosureEndDate,
    setSelectedWorkerId,
    navigateTo,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'resumo' | 'detalhado'>('resumo');
  const [typeFilter, setTypeFilter] = useState<
    'todos' | 'producao' | 'diaria' | 'falta'
  >('todos');

  // Filtra os lançamentos pelo período selecionado
  const periodLaunches = launches.filter((launch) => {
    const date = toIsoDate(launch.date);

    return (
      date &&
      date >= closureStartDate &&
      date <= closureEndDate
    );
  });

  const totalBoxes = periodLaunches
    .filter((l) => l.type === 'producao')
    .reduce((acc, l) => acc + (l.quantity || 0), 0);

  const totalAbsences = periodLaunches.filter(
    (l) => l.type === 'falta'
  ).length;

  const totalProducaoValor = periodLaunches
    .filter((l) => l.type === 'producao')
    .reduce((acc, l) => acc + l.totalValue, 0);

  const totalDiariasValor = periodLaunches
    .filter((l) => l.type === 'diaria')
    .reduce((acc, l) => acc + l.totalValue, 0);

  const totalGeral = totalProducaoValor + totalDiariasValor;

  // Resumo por trabalhador
  const workerSummaries = workers.map((worker) => {
    const workerLaunches = periodLaunches.filter(
      (l) => l.workerId === worker.id
    );

    const production = workerLaunches.filter(
      (l) => l.type === 'producao'
    );

    const daily = workerLaunches.filter(
      (l) => l.type === 'diaria'
    );

    const absences = workerLaunches.filter(
      (l) => l.type === 'falta'
    );

    const boxes = production.reduce(
      (acc, l) => acc + (l.quantity || 0),
      0
    );

    const productionValue = production.reduce(
      (acc, l) => acc + l.totalValue,
      0
    );

    const dailyValue = daily.reduce(
      (acc, l) => acc + l.totalValue,
      0
    );

    return {
      worker,
      boxes,
      absences: absences.length,
      productionValue,
      dailyValue,
      total: productionValue + dailyValue,
    };
  });

  const filteredLaunches =
    typeFilter === 'todos'
      ? periodLaunches
      : periodLaunches.filter((l) => l.type === typeFilter);

  const formatType = (type: string) => {
    if (type === 'producao') return 'Produção';
    if (type === 'diaria') return 'Diária';
    return 'Falta';
  };

  const formatDate = (date: string) => {
    const iso = toIsoDate(date);
    if (!iso) return date;

    const [year, month, day] = iso.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleExportPdf = () => {
    if (
      !closureStartDate ||
      !closureEndDate ||
      closureStartDate > closureEndDate
    ) {
      showToast('Selecione um período válido.');
      return;
    }

    if (periodLaunches.length === 0) {
      showToast('Não existem lançamentos neste período.');
      return;
    }

    window.print();
  };

  return (
    <div className="report-screen flex flex-col min-h-full bg-stone-100 text-stone-900 pb-6">
      <style>{`
        @page {
          size: A4 landscape;
          margin: 12mm;
        }

        @media print {
          body * {
            visibility: hidden !important;
          }

          .report-print,
          .report-print * {
            visibility: visible !important;
          }

          .report-print {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: #111827 !important;
            font-family: Arial, sans-serif;
            font-size: 10px;
          }

          .report-print table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
          }

          .report-print th,
          .report-print td {
            border: 1px solid #9ca3af;
            padding: 6px;
            text-align: left;
          }

          .report-print th {
            background: #e5e7eb !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .report-print h2 {
            font-size: 14px;
            margin-top: 20px;
            font-weight: bold;
          }

          .report-print .print-total {
            font-weight: bold;
            background: #f3f4f6 !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>

      <div className="no-print">
        <MobileHeader title="Relatório Geral" showMenu showBell />
      </div>

      <div className="no-print p-4 space-y-4">
        {/* Seleção do período */}
        <div className="bg-white border border-stone-200 rounded-xl p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-sm font-semibold">
            <Calendar className="w-4 h-4 text-emerald-700" />
            Período do relatório
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-stone-500 mb-1">
                Data inicial
              </label>
              <input
                type="date"
                value={closureStartDate}
                onChange={(e) => setClosureStartDate(e.target.value)}
                className="w-full border rounded-lg p-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-500 mb-1">
                Data final
              </label>
              <input
                type="date"
                min={closureStartDate}
                value={closureEndDate}
                onChange={(e) => setClosureEndDate(e.target.value)}
                className="w-full border rounded-lg p-2 text-sm"
              />
            </div>
          </div>

          <p className="text-xs text-stone-500 mt-2">
            {formatDate(closureStartDate)} até {formatDate(closureEndDate)}
          </p>
        </div>

        {/* Botão PDF */}
        <button
          onClick={handleExportPdf}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm"
        >
          <Download className="w-4 h-4" />
          Baixar relatório em PDF
        </button>

        {/* Resumo geral */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white p-3 rounded-xl border border-stone-200">
            <div className="flex items-center justify-between text-blue-600 mb-1">
              <span className="text-[10px] font-bold text-stone-500">
                Caixas
              </span>
              <Package className="w-3.5 h-3.5" />
            </div>
            <div className="text-lg font-black text-blue-700">
              {totalBoxes}
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-stone-200">
            <div className="flex items-center justify-between text-red-500 mb-1">
              <span className="text-[10px] font-bold text-stone-500">
                Faltas
              </span>
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <div className="text-lg font-black text-red-600">
              {totalAbsences}
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-stone-200">
            <div className="flex items-center justify-between text-emerald-600 mb-1">
              <span className="text-[10px] font-bold text-stone-500">
                Total
              </span>
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <div className="text-sm font-black text-emerald-700 mt-1">
              R$ {money(totalGeral)}
            </div>
          </div>
        </div>

        {/* Abas */}
        <div className="grid grid-cols-2 bg-stone-200 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('resumo')}
            className={`py-2 rounded-lg text-xs font-bold ${
              activeTab === 'resumo'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-stone-600'
            }`}
          >
            Por Trabalhador
          </button>

          <button
            onClick={() => setActiveTab('detalhado')}
            className={`py-2 rounded-lg text-xs font-bold ${
              activeTab === 'detalhado'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-stone-600'
            }`}
          >
            Detalhado ({periodLaunches.length})
          </button>
        </div>

        {activeTab === 'resumo' ? (
          <div className="space-y-2.5">
            {workerSummaries.map((item) => (
              <div
                key={item.worker.id}
                onClick={() => {
                  setSelectedWorkerId(item.worker.id);
                  navigateTo('worker_history');
                }}
                className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-full ${
                        item.worker.status === 'inativo'
                          ? 'bg-amber-600'
                          : 'bg-[#155e2d]'
                      } text-white font-bold text-xs flex items-center justify-center`}
                    >
                      {item.worker.avatarInitials}
                    </div>

                    <div>
                      <div className="text-sm font-bold">
                        {item.worker.name}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {item.boxes} caixas • {item.absences} faltas
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <div className="text-right">
                      <div className="text-sm font-black text-emerald-700">
                        R$ {money(item.total)}
                      </div>
                      <div className="text-[10px] text-stone-400">
                        Prod: {money(item.productionValue)} | Diár:{' '}
                        {money(item.dailyValue)}
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
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {(['todos', 'producao', 'diaria', 'falta'] as const).map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                      typeFilter === type
                        ? 'bg-[#14532d] text-white'
                        : 'bg-white text-stone-600 border'
                    }`}
                  >
                    {type === 'todos' ? 'Todos' : formatType(type)}
                    {type === 'todos' ? '' : 's'}
                  </button>
                )
              )}
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
              {filteredLaunches.length === 0 ? (
                <div className="p-6 text-center text-stone-500">
                  <FileText className="w-8 h-8 mx-auto mb-2" />
                  Nenhum lançamento encontrado neste período.
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {filteredLaunches.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold">
                            {item.workerName}
                          </span>
                          <span className="text-[10px] font-bold">
                            {formatType(item.type)}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {formatDate(item.date)} • {item.description}
                        </div>
                      </div>

                      <div className="text-xs font-extrabold">
                        R$ {money(item.totalValue)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo exclusivo do PDF */}
      <div className="report-print hidden p-4">
        <h1 style={{ fontSize: '22px', fontWeight: 'bold' }}>
          AgroTurma - Relatório Geral
        </h1>

        <p style={{ marginTop: '6px' }}>
          Período: {formatDate(closureStartDate)} até{' '}
          {formatDate(closureEndDate)}
        </p>

        <h2>Resumo geral</h2>

        <table>
          <thead>
            <tr>
              <th>Total de caixas</th>
              <th>Total de faltas</th>
              <th>Valor da produção</th>
              <th>Valor das diárias</th>
              <th>Total a pagar</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{totalBoxes}</td>
              <td>{totalAbsences}</td>
              <td>R$ {money(totalProducaoValor)}</td>
              <td>R$ {money(totalDiariasValor)}</td>
              <td className="print-total">R$ {money(totalGeral)}</td>
            </tr>
          </tbody>
        </table>

        <h2>Resumo por trabalhador</h2>

        <table>
          <thead>
            <tr>
              <th>Trabalhador</th>
              <th>Caixas</th>
              <th>Faltas</th>
              <th>Produção</th>
              <th>Diárias</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {workerSummaries.map((item) => (
              <tr key={item.worker.id}>
                <td>{item.worker.name}</td>
                <td>{item.boxes}</td>
                <td>{item.absences}</td>
                <td>R$ {money(item.productionValue)}</td>
                <td>R$ {money(item.dailyValue)}</td>
                <td>R$ {money(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Lançamentos detalhados</h2>

        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Trabalhador</th>
              <th>Tipo</th>
              <th>Descrição</th>
              <th>Caixas</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {periodLaunches.map((item) => (
              <tr key={item.id}>
                <td>{formatDate(item.date)}</td>
                <td>{item.workerName}</td>
                <td>{formatType(item.type)}</td>
                <td>{item.description}</td>
                <td>{item.quantity || 0}</td>
                <td>R$ {money(item.totalValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p style={{ marginTop: '20px', textAlign: 'right' }}>
          Relatório gerado pelo sistema AgroTurma.
        </p>
      </div>
    </div>
  );
};
