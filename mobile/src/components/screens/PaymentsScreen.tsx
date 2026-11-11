import React, { useState } from 'react';
import { Calendar, ChevronRight, CheckCircle2 } from 'lucide-react';
import { MobileHeader } from '../layout/MobileHeader';
import { useApp } from '../../context/AppContext';

export const PaymentsScreen: React.FC = () => {
  const { payments, periodString, navigateTo, setSelectedPaymentId } = useApp();
  const [tab, setTab] = useState<'a_pagar' | 'pago'>('a_pagar');

  const filtered = payments.filter((p) => p.status === tab);
  const toPayCount = payments.filter((p) => p.status === 'a_pagar').length;
  const paidCount = payments.filter((p) => p.status === 'pago').length;

  const handleCardClick = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    navigateTo('payment_detail');
  };

  return (
    <div className="flex flex-col min-h-full bg-stone-100 text-stone-900 pb-6">
      <MobileHeader title="Pagamentos" showBack showFilter />

      <div className="p-4 space-y-3.5 flex-1">
        {/* Date range selector */}
        <div className="bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 flex items-center justify-between shadow-2xs">
          <span className="text-xs font-semibold text-stone-700">
            {periodString}
          </span>
          <Calendar className="w-4 h-4 text-stone-400" />
        </div>

        {/* Tab switcher: A Pagar (6) | Pagos (3) */}
        <div className="grid grid-cols-2 p-1 bg-stone-200/80 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setTab('a_pagar')}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              tab === 'a_pagar'
                ? 'bg-[#14532d] text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            A Pagar ({toPayCount})
          </button>
          <button
            onClick={() => setTab('pago')}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              tab === 'pago'
                ? 'bg-[#14532d] text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Pagos ({paidCount})
          </button>
        </div>

        {/* Cards list */}
        <div className="space-y-2.5">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-xs text-stone-400 border border-stone-200">
              Nenhum pagamento nesta categoria.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => handleCardClick(item.id)}
                className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs hover:border-emerald-500 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    {item.workerName}
                  </h3>
                  <div className="text-xs text-stone-500 mt-1 font-medium">
                    Total: <strong className="text-stone-900 font-bold">R$ {item.netTotal.toFixed(2).replace('.', ',')}</strong>
                  </div>
                  {item.paidAt && (
                    <div className="text-[10px] text-emerald-700 mt-0.5 flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Pago em {item.paidAt}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      item.status === 'a_pagar'
                        ? 'border-red-200 bg-red-50 text-red-700'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {item.status === 'a_pagar' ? 'A pagar' : 'Pago'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
