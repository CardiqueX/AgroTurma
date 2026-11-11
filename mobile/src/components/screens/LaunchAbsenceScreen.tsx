import React, { useState } from 'react';
import { Calendar, AlertTriangle } from 'lucide-react';
import { MobileHeader } from '../layout/MobileHeader';
import { useApp } from '../../context/AppContext';

export const LaunchAbsenceScreen: React.FC = () => {
  const { workers, addLaunch } = useApp();

  const [date, setDate] = useState('15/06/2025');
  const [workerId, setWorkerId] = useState(
    workers.find((w) => w.name.includes('Pedro'))?.id || workers[0]?.id || 'w3'
  );
  const [reason, setReason] = useState('Não compareceu');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const worker = workers.find((w) => w.id === workerId) || workers[0];

    addLaunch({
      date,
      workerId: worker.id,
      workerName: worker.name,
      type: 'falta',
      description: reason,
      totalValue: 0,
      reason,
      notes: notes.trim(),
    });
  };

  return (
    <div className="flex flex-col min-h-full bg-stone-100 text-stone-900 pb-6">
      <MobileHeader title="Registrar Falta" showBack showBell />

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

          {/* Motivo (opcional) */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Motivo (opcional)
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="Não compareceu">Não compareceu</option>
              <option value="Problema de saúde / Consulta">Problema de saúde / Consulta</option>
              <option value="Atestado médico">Atestado médico</option>
              <option value="Chuva forte / Tempo impróprio">Chuva forte / Tempo impróprio</option>
              <option value="Problema pessoal / Familiar">Problema pessoal / Familiar</option>
              <option value="Outros">Outros</option>
            </select>
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
            className="w-full py-3 px-4 bg-[#dc2626] hover:bg-red-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm cursor-pointer"
          >
            Registrar Falta
          </button>

          {/* Warning callout */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center space-x-2.5 text-red-900 text-xs">
            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span className="leading-tight text-[11px] font-medium">
              Essa falta será contabilizada no relatório do período.
            </span>
          </div>
        </div>
      </form>
    </div>
  );
};
