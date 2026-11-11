import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { MobileHeader } from '../layout/MobileHeader';
import { useApp } from '../../context/AppContext';

export const LaunchProductionScreen: React.FC = () => {
  const { workers, addLaunch } = useApp();

  const [date, setDate] = useState('15/06/2025');
  const [workerId, setWorkerId] = useState(workers[0]?.id || 'w1');
  const [productService, setProductService] = useState('Caixa de Alho');
  const [quantity, setQuantity] = useState<number | ''>(18);
  const [unitValue, setUnitValue] = useState<number | ''>(5.0);
  const [totalValue, setTotalValue] = useState<number>(90.0);
  const [notes, setNotes] = useState('');

  // Dynamically compute total value
  useEffect(() => {
    const q = typeof quantity === 'number' ? quantity : 0;
    const v = typeof unitValue === 'number' ? unitValue : 0;
    setTotalValue(Number((q * v).toFixed(2)));
  }, [quantity, unitValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const worker = workers.find((w) => w.id === workerId) || workers[0];
    const qty = typeof quantity === 'number' ? quantity : 0;
    const uVal = typeof unitValue === 'number' ? unitValue : 0;

    addLaunch({
      date,
      workerId: worker.id,
      workerName: worker.name,
      type: 'producao',
      description: `${qty} caixas`,
      productService,
      quantity: qty,
      unitValue: uVal,
      totalValue,
      notes: notes.trim(),
    });
  };

  return (
    <div className="flex flex-col min-h-full bg-stone-100 text-stone-900 pb-6">
      <MobileHeader title="Lançar Produção" showBack />

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

          {/* Produto / Serviço * */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Produto / Serviço *
            </label>
            <select
              value={productService}
              onChange={(e) => setProductService(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="Caixa de Alho">Caixa de Alho</option>
              <option value="Colheita Café (Balaio)">Colheita Café (Balaio)</option>
              <option value="Cebola (Saco 20kg)">Cebola (Saco 20kg)</option>
              <option value="Tomate (Caixa 22kg)">Tomate (Caixa 22kg)</option>
              <option value="Laranja (Caixa)">Laranja (Caixa)</option>
            </select>
          </div>

          {/* Quantidade (caixas) * */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Quantidade (caixas) *
            </label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) =>
                setQuantity(e.target.value === '' ? '' : Number(e.target.value))
              }
              placeholder="0"
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
            />
          </div>

          {/* Valor por caixa (R$) */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Valor por caixa (R$)
            </label>
            <input
              type="number"
              step="0.50"
              min="0"
              value={unitValue}
              onChange={(e) =>
                setUnitValue(e.target.value === '' ? '' : Number(e.target.value))
              }
              placeholder="5,00"
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
            />
          </div>

          {/* Total (R$) Box */}
          <div className="bg-[#f0fdf4] border border-emerald-200 rounded-xl p-3.5">
            <span className="block text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
              Total (R$)
            </span>
            <span className="text-xl font-black text-emerald-950 mt-0.5 block">
              {totalValue.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
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

        <div className="pt-3">
          <button
            type="submit"
            className="w-full py-3 px-4 bg-[#14532d] hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm cursor-pointer"
          >
            Salvar Lançamento
          </button>
        </div>
      </form>
    </div>
  );
};
