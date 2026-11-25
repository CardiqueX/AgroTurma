import React, { useState } from 'react';
import { Calendar, Info, CheckCircle, Receipt, ArrowRight } from 'lucide-react';
import { MobileHeader } from '../layout/MobileHeader';
import { useApp } from '../../context/AppContext';

export const PaymentDetailScreen: React.FC = () => {
  const {
    payments,
    selectedPaymentId,
    markPaymentAsPaid,
    cancelPayment,
    goBack,
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'Dinheiro' | 'Transferência'>('PIX');
  const [showMethodSelect, setShowMethodSelect] = useState(false);

  const payment =
    payments.find((p) => p.id === selectedPaymentId) || payments[0];

  const handlePay = () => {
    markPaymentAsPaid(payment.id, paymentMethod);
    setShowMethodSelect(false);
  };
  const handleCancelPayment = () => {
    const confirmed = window.confirm(
      `Deseja estornar o pagamento de ${payment.workerName}?`
    );

    if (confirmed) {
      cancelPayment(payment.id);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-stone-100 text-stone-900 pb-6">
      <MobileHeader title="Detalhes do Pagamento" showBack showBell />

      <div className="p-4 space-y-4 flex-1">
        {/* Worker Header Card */}
        <div className="flex items-center space-x-3.5 bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-[#155e2d] text-white font-black text-sm flex items-center justify-center shadow-xs">
            {payment.workerName
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')}
          </div>
          <div>
            <h2 className="text-base font-extrabold text-stone-900">
              {payment.workerName}
            </h2>
            <div className="flex items-center space-x-1 text-stone-500 text-xs mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span>Período: {payment.period}</span>
            </div>
          </div>
        </div>

        {/* Resumo Card */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wide">
            Resumo
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-stone-600">
              <span>Diárias</span>
              <span className="font-semibold text-stone-900">
                R$ {payment.totalDiarias.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <div className="flex items-center justify-between text-stone-600">
              <span>Produção ({payment.boxesCount} caixas)</span>
              <span className="font-semibold text-stone-900">
                R$ {payment.totalProducao.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <div className="flex items-center justify-between text-stone-600 pt-1 border-t border-stone-100">
              <span>Total bruto</span>
              <span className="font-semibold text-stone-900">
                R$ {payment.grossTotal.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <div className="flex items-center justify-between text-stone-600">
              <span>Descontos</span>
              <span className="font-semibold text-stone-900">
                R$ {payment.discounts.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-200">
              <span className="font-bold text-stone-900">Total a receber</span>
              <span className="text-base font-extrabold text-[#15803d]">
                R$ {payment.netTotal.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>
        </div>

        {/* Mark as paid button */}
        {payment.status === 'a_pagar' ? (
          <div className="space-y-2">
            {showMethodSelect ? (
              <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs space-y-2.5">
                <label className="text-xs font-bold text-stone-700 block">
                  Escolha o meio de pagamento:
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {(['PIX', 'Dinheiro', 'Transferência'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`py-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${paymentMethod === m
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <div className="flex space-x-2 pt-1">
                  <button
                    onClick={handlePay}
                    className="flex-1 py-2.5 bg-[#14532d] hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Confirmar Pagamento ({paymentMethod})
                  </button>
                  <button
                    onClick={() => setShowMethodSelect(false)}
                    className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-600 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowMethodSelect(true)}
                className="w-full py-3 px-4 bg-[#14532d] hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm cursor-pointer"
              >
                Marcar como Pago
              </button>
            )}
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center space-x-3 text-emerald-900">
            <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold">Pagamento Efetuado</h4>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                {payment.paidAt} via {payment.paymentMethod || 'PIX'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCancelPayment}
              className="w-full py-3 px-4 bg-white border border-red-200 text-red-700 hover:bg-red-50 font-bold rounded-xl text-sm"
            >
              Estornar pagamento
            </button>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-xs font-bold text-stone-800">
            Histórico de pagamentos
          </h3>

          {payment.status === 'a_pagar' ? (
            <div className="bg-blue-50/80 border border-blue-200/90 rounded-xl p-3.5 flex items-center space-x-2.5 text-blue-900 text-xs">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-medium text-[11px]">
                Nenhum pagamento registrado.
              </span>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-stone-200 p-3.5 text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Receipt className="w-4 h-4 text-stone-400" />
                <div>
                  <div className="font-bold text-stone-900">Recibo #{payment.id.slice(-6)}</div>
                  <div className="text-[11px] text-stone-500">{payment.paidAt}</div>
                </div>
              </div>
              <span className="font-bold text-emerald-700">
                R$ {payment.netTotal.toFixed(2).replace('.', ',')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
