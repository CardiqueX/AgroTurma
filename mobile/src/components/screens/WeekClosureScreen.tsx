
import React from 'react';
import { Calendar, Lock, Unlock, CheckCircle } from 'lucide-react';
import { MobileHeader } from '../layout/MobileHeader';
import { useApp } from '../../context/AppContext';

export const WeekClosureScreen: React.FC = () => {
  const {
    weekClosure,
    toggleWeekClosure,
    closureStartDate,
    closureEndDate,
    setClosureStartDate,
    setClosureEndDate,
  } = useApp();

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      <MobileHeader title="Fechamento da Semana" />

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              Data inicial
            </label>
            <input
              type="date"
              value={closureStartDate}
              onChange={(e) => setClosureStartDate(e.target.value)}
              className="w-full rounded-lg border p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Data final
            </label>
            <input
              type="date"
              value={closureEndDate}
              min={closureStartDate}
              onChange={(e) => setClosureEndDate(e.target.value)}
              className="w-full rounded-lg border p-2"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="text-green-600" />
            <h2 className="font-semibold">Resumo do período</h2>
          </div>

          <p className="text-sm text-gray-500">
            {weekClosure.period}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-sm text-gray-500">Trabalhadores</p>
              <p className="text-xl font-bold">{weekClosure.activeWorkers}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Dias trabalhados</p>
              <p className="text-xl font-bold">{weekClosure.workedDays}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Caixas</p>
              <p className="text-xl font-bold">{weekClosure.totalBoxes}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Faltas</p>
              <p className="text-xl font-bold">{weekClosure.absencesCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <h2 className="font-semibold">Valores do período</h2>

          <div className="flex justify-between">
            <span>Produção</span>
            <span>R$ {weekClosure.totalProductionValue?.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Diárias</span>
            <span>R$ {weekClosure.totalDailyValue?.toFixed(2)}</span>
          </div>

          <div className="flex justify-between border-t pt-3 font-bold">
            <span>Total a pagar</span>
            <span>R$ {weekClosure.totalPayable?.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={toggleWeekClosure}
          className={`w-full rounded-xl p-4 text-white font-semibold flex items-center justify-center gap-2 ${
            weekClosure.isClosed
              ? 'bg-orange-600'
              : 'bg-green-600'
          }`}
        >
          {weekClosure.isClosed ? (
            <>
              <Unlock size={20} />
              Reabrir período
            </>
          ) : (
            <>
              <Lock size={20} />
              Fechar período
            </>
          )}
        </button>

        {weekClosure.isClosed && (
          <div className="flex items-center gap-2 text-green-700 text-sm">
            <CheckCircle size={18} />
            Período fechado com sucesso.
          </div>
        )}
      </div>
    </div>
  );
};
