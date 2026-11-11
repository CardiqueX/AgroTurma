import React, { useState } from 'react';
import { Calendar, FileDown, Share2, Check, Filter } from 'lucide-react';
import { MobileHeader } from '../layout/MobileHeader';
import { useApp } from '../../context/AppContext';
import { REPORT_ROWS } from '../../data/initialData';

export const ReportScreen: React.FC = () => {
  const { periodString, setSelectedWorkerId, navigateTo, showToast } = useApp();
  const [viewMode, setViewMode] = useState<'resumo' | 'detalhado'>('resumo');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterWorker, setFilterWorker] = useState('');

  const rows = REPORT_ROWS.filter((r) =>
    r.name.toLowerCase().includes(filterWorker.toLowerCase())
  );

  const totals = rows.reduce(
    (acc, r) => ({
      workedDays: acc.workedDays + r.workedDays,
      boxes: acc.boxes + r.boxes,
      diarias: acc.diarias + r.diarias,
      faltas: acc.faltas + r.faltas,
      totalProduction: acc.totalProduction + r.totalProduction,
      totalGeneral: acc.totalGeneral + r.totalGeneral,
    }),
    {
      workedDays: 0,
      boxes: 0,
      diarias: 0,
      faltas: 0,
      totalProduction: 0,
      totalGeneral: 0,
    }
  );

  const handleExportPdf = () => {
    showToast('Gerando Relatório Geral em PDF para impressão...');
    window.print();
  };

  const handleShare = () => {
    const text = `*AgroTurma - Relatório Geral (${periodString})*\n` +
      `Trabalhadores: ${rows.length}\n` +
      `Total Caixas: ${totals.boxes}\n` +
      `Diárias: R$ ${totals.diarias.toFixed(2)}\n` +
      `Produção: R$ ${totals.totalProduction.toFixed(2)}\n` +
      `*Total Geral:* R$ ${totals.totalGeneral.toFixed(2)}`;

    if (navigator.share) {
      navigator.share({ title: 'Relatório AgroTurma', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      showToast('Relatório copiado para a área de transferência! Cole no WhatsApp.');
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-stone-100 text-stone-900 pb-4">
      <MobileHeader
        title="Relatório Geral"
        showFilter
        onFilterClick={() => setShowFilterModal(!showFilterModal)}
      />

      <div className="p-3 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Period selector */}
          <div className="bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 flex items-center justify-between shadow-2xs">
            <span className="text-xs font-semibold text-stone-700">
              {periodString}
            </span>
            <Calendar className="w-4 h-4 text-stone-400" />
          </div>

          {/* Segmented control: Resumo / Detalhado */}
          <div className="grid grid-cols-2 p-1 bg-stone-200/80 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('resumo')}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'resumo'
                  ? 'bg-[#14532d] text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Resumo
            </button>
            <button
              onClick={() => setViewMode('detalhado')}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'detalhado'
                  ? 'bg-[#14532d] text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Detalhado
            </button>
          </div>

          {/* Quick filter toggle */}
          {showFilterModal && (
            <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-xs">
              <label className="text-[11px] font-bold text-stone-600 block mb-1">
                Filtrar por nome
              </label>
              <input
                type="text"
                value={filterWorker}
                onChange={(e) => setFilterWorker(e.target.value)}
                placeholder="Ex: João..."
                className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs"
              />
            </div>
          )}

          {/* Main Table */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold">
                    <th className="py-2.5 px-2.5 whitespace-nowrap">Trabalhador</th>
                    <th className="py-2.5 px-2 text-center whitespace-nowrap">
                      Dias<br />Trabalhados
                    </th>
                    <th className="py-2.5 px-2 text-center whitespace-nowrap">Caixas</th>
                    <th className="py-2.5 px-2 text-right whitespace-nowrap">
                      Diárias<br />(R$)
                    </th>
                    <th className="py-2.5 px-2 text-center whitespace-nowrap">Faltas</th>
                    <th className="py-2.5 px-2 text-right whitespace-nowrap">
                      Total<br />Produção (R$)
                    </th>
                    <th className="py-2.5 px-2.5 text-right whitespace-nowrap">
                      Total<br />Geral (R$)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  {rows.map((row) => (
                    <tr
                      key={row.workerId}
                      onClick={() => {
                        setSelectedWorkerId(row.workerId);
                        navigateTo('worker_history');
                      }}
                      className="hover:bg-emerald-50/50 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-2.5 font-semibold text-stone-900 whitespace-nowrap">
                        {row.name}
                      </td>
                      <td className="py-2.5 px-2 text-center">{row.workedDays}</td>
                      <td className="py-2.5 px-2 text-center font-medium text-blue-700">
                        {row.boxes}
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        {row.diarias.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="py-2.5 px-2 text-center text-red-600 font-bold">
                        {row.faltas}
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        {row.totalProduction.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="py-2.5 px-2.5 text-right font-bold text-stone-900">
                        {row.totalGeneral.toFixed(2).replace('.', ',')}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-stone-50 border-t-2 border-stone-300 font-extrabold text-stone-900">
                    <td className="py-3 px-2.5 uppercase tracking-wider text-[10px]">
                      TOTAIS
                    </td>
                    <td className="py-3 px-2 text-center">{totals.workedDays}</td>
                    <td className="py-3 px-2 text-center text-blue-800 font-extrabold">
                      {totals.boxes}
                    </td>
                    <td className="py-3 px-2 text-right">
                      {totals.diarias.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3 px-2 text-center text-red-600">
                      {totals.faltas}
                    </td>
                    <td className="py-3 px-2 text-right text-emerald-800">
                      {totals.totalProduction.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-2.5 text-right text-emerald-950 font-black">
                      {totals.totalGeneral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Bottom Actions: Exportar PDF & Compartilhar */}
        <div className="grid grid-cols-2 gap-3 pt-3">
          <button
            onClick={handleExportPdf}
            className="flex items-center justify-center space-x-2 py-3 px-4 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-bold rounded-xl text-xs shadow-2xs transition-all cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-stone-600" />
            <span>Exportar PDF</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center justify-center space-x-2 py-3 px-4 bg-[#15803d] hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-white" />
            <span>Compartilhar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
