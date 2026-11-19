import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { MobileHeader } from '../layout/MobileHeader';
import { useApp } from '../../context/AppContext';

const getTodayIso = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatIsoToBr = (iso: string) => {
  if (!iso || !iso.includes('-')) return iso;
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

export const LaunchDailyScreen: React.FC = () => {
  const { workers, addLaunch, weekClosure, showToast } = useApp();

  const activeWorkers = workers.filter((w) => w.status === 'ativo');

  const [date, setDate] = useState<string>(getTodayIso);
  const [workerId, setWorkerId] = useState<string>(activeWorkers[0]?.id || '');
  const [role, setRole] = useState<string>('Diária Geral');
  const [dailyValue, setDailyValue] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    const ativos = workers.filter((w) => w.status === 'ativo');
    if (ativos.length > 0 && !ativos.some((w) => w.id === workerId)) {
      setWorkerId(ativos[0].id);
    } else if (ativos.length === 0) {
      setWorkerId('');
    }
  }, [workers, workerId]);

  const numericValue = Number(String(dailyValue).replace(',', '.')) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (weekClosure.isClosed) {
      showToast('Semana fechada! Reabra a semana para lançar.');
      return;
    }

    const selectedWorker = activeWorkers.find((w) => w.id === workerId);
    if (!selectedWorker) {
      showToast('Selecione um trabalhador ativo.');
      return;
    }

    if (numericValue <= 0) {
      showToast('Informe o valor da diária.');
      return;
    }

    addLaunch({
      date: formatIsoToBr(date),
      workerId: selectedWorker.id,
      workerName: selectedWorker.name,
      type: 'diaria',
      description: role,
      totalValue: numericValue,
      notes: notes.trim(),
    });
  };

  return (
    <div className="flex flex-col min-h-full bg-stone-100 text-stone-900 pb-6">
      <MobileHeader title="Lançar Diária" showBack />

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {weekClosure.isClosed && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center space-x-2 text-xs text-amber-800 font-medium">
            <Lock className="w-4 h-4 shrink-0" />
            <span>A semana atual está fechada para novos lançamentos.</span>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-2xs space-y-4">
          {/* Data */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Data
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Trabalhador (apenas ativos) */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Trabalhador *
            </label>
            <select
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              required
              disabled={activeWorkers.length === 0}
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            >
              {activeWorkers.length === 0 ? (
                <option value="">Nenhum trabalhador ativo cadastrado</option>
              ) : (
                activeWorkers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Função */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Função / Atividade *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            >
              <option value="Diária Geral">Diária Geral</option>
              <option value="Apontador">Apontador</option>
              <option value="Fiscal">Fiscal</option>
              <option value="Tratorista">Tratorista</option>
              <option value="Motorista">Motorista</option>
              <option value="Caixeiro">Caixeiro</option>
            </select>
          </div>

          {/* Valor da Diária */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Valor da diária (R$) *
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={dailyValue}
              onChange={(e) => setDailyValue(e.target.value)}
              placeholder="Ex: 80,00"
              required
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Observação */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Observação (opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Digite uma observação"
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={weekClosure.isClosed || activeWorkers.length === 0}
          className="w-full py-3.5 bg-[#14532d] hover:bg-[#166534] disabled:bg-stone-400 text-white font-bold text-sm rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          Salvar Diária
        </button>
      </form>
    </div>
  );
};