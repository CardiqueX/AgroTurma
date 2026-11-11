import React, { useState } from 'react';
import { Calendar, Info } from 'lucide-react';
import { MobileHeader } from '../layout/MobileHeader';
import { useApp } from '../../context/AppContext';

export const LaunchDailyScreen: React.FC = () => {
  const { workers, addLaunch } = useApp();

  const [date, setDate] = useState('15/06/2025');
  const [workerId, setWorkerId] = useState(
    workers.find((w) => w.name.includes('Maria'))?.id || workers[0]?.id || 'w2'
  );
  const [dailyValue, setDailyValue] = useState<number | ''>(80.0);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const worker = workers.find((w) => w.id === workerId) || workers[0];
    const val = typeof dailyValue === 'number' ? dailyValue : 80.0;

    addLaunch({
      date,
      workerId: worker.id,
      workerName: worker.name,
      type: 'diaria',
      description: 'Diária',
      totalValue: val,
      notes: notes.trim(),
    });
  };

  return (
    <div className="flex flex-col min-h-full bg-stone-100 text-stone-900 pb-6">
      <MobileHeader title="Lançar Diária" showBack showBell />

      <form onSubmit={handleSubmit} className="p-4 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-3.5 bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
          {/* Data */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Data
            </label>
            <div className="relative">
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-emerald-800">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Trabalhador * */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Trabalhador *
            </label>
            <select
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all cursor-pointer"
            >
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} {w.status === 'inativo' ? '(Inativo)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Valor da diária (R$) * */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Valor da diária (R$) *
            </label>
            <input
              type="number"
              step="5.00"
              required
              value={dailyValue}
              onChange={(e) =>
                setDailyValue(e.target.value === '' ? '' : Number(e.target.value))
              }
              placeholder="80,00"
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
            />
          </div>

          {/* Observação (opcional) */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Observação (opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Digite uma observação"
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <button
            type="submit"
            className="w-full py-3 px-4 bg-[#14532d] hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm cursor-pointer"
          >
            Salvar Lançamento
          </button>

          {/* Info callout */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center space-x-2.5 text-blue-900 text-xs">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-700">
              <Info className="w-4 h-4" />
            </div>
            <span className="leading-tight text-[11px] font-medium">
              Essa diária será somada no cálculo de pagamento do trabalhador no período.
            </span>
          </div>
        </div>
      </form>
    </div>
  );
};
