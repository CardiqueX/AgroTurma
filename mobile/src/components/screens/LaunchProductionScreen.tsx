import React, { useState, useEffect } from 'react';
import { Calendar, Lock } from 'lucide-react';
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

export const LaunchProductionScreen: React.FC = () => {
  const { workers, addLaunch, weekClosure, showToast } = useApp();

  const activeWorkers = workers.filter((w) => w.status === 'ativo');

  const [date, setDate] = useState<string>(getTodayIso);
  const [workerId, setWorkerId] = useState<string>(activeWorkers[0]?.id || '');
  const [productService, setProductService] = useState<string>('Caixa de Alho');
  const [quantity, setQuantity] = useState<string>('');
  const [unitValue, setUnitValue] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Garante que sempre haja um trabalhador ativo selecionado ao carregar da API
  useEffect(() => {
    const ativos = workers.filter((w) => w.status === 'ativo');
    if (ativos.length > 0 && !ativos.some((w) => w.id === workerId)) {
      setWorkerId(ativos[0].id);
    } else if (ativos.length === 0) {
      setWorkerId('');
    }
  }, [workers, workerId]);

  const numericQty = Number(quantity) || 0;
  const numericUnit = Number(String(unitValue).replace(',', '.')) || 0;
  const totalValue = numericQty * numericUnit;

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

    if (numericQty <= 0) {
      showToast('Informe a quantidade de caixas.');
      return;
    }

    if (numericUnit <= 0) {
      showToast('Informe o valor por caixa.');
      return;
    }

    addLaunch({
      date: formatIsoToBr(date),
      workerId: selectedWorker.id,
      workerName: selectedWorker.name,
      type: 'producao',
      description: `${numericQty} caixas`,
      productService,
      quantity: numericQty,
      unitValue: numericUnit,
      totalValue,
      notes: notes.trim(),
    });
  };

  return (
    <div className="flex flex-col min-h-full bg-stone-100 text-stone-900 pb-6">
      <MobileHeader title="Lançar Produção" showBack />

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
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
              <Calendar className="w-4 h-4 text-emerald-700 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none hidden" />
            </div>
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

          {/* Produto / Serviço */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Produto / Serviço *
            </label>
            <select
              value={productService}
              onChange={(e) => setProductService(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            >
              <option value="Caixa de Alho">Caixa de Alho</option>
              <option value="Corte de Alho">Corte de Alho</option>
              <option value="Arranquio">Arranquio</option>
              <option value="Toalete / Limpeza">Toalete / Limpeza</option>
            </select>
          </div>

          {/* Quantidade */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Quantidade (caixas) *
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Digite a quantidade de caixas"
              required
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Valor por caixa */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Valor por caixa (R$) *
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={unitValue}
              onChange={(e) => setUnitValue(e.target.value)}
              placeholder="Ex: 5,00"
              required
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Total calculado */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5">
            <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
              Total (R$)
            </div>
            <div className="text-2xl font-black text-stone-900 mt-0.5">
              {totalValue.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
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
          Salvar Lançamento
        </button>
      </form>
    </div>
  );
};