import React from 'react';
import { Calendar, Lock, Unlock, CheckCircle } from 'lucide-react';
import { MobileHeader } from '../layout/MobileHeader';
import { useApp } from '../../context/AppContext';

export const WeekClosureScreen: React.FC = () => {
  const { weekClosure, toggleWeekClosure } = useApp();

  return (
    <div className="flex flex-col min-h-full bg-stone-100 text-stone-900 pb-6">
      <MobileHeader title="Fechamento da Semana" showBack />

      <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Semana */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Semana
            </label>
            <div className="bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 flex items-center justify-between shadow-2xs">
              <span className="text-xs font-bold text-stone-800">
                {weekClosure.period}
              </span>
              <Calendar className="w-4 h-4 text-emerald-800" />
            </div>
          </div>

          {/* Resumo da semana */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-stone-800">
                Resumo da semana
              </h3>
              {weekClosure.isClosed && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 mr-0.5" />
                  Fechada
                </span>
              )}
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-stone-600">
                <span>Trabalhadores ativos</span>
                <span className="font-semibold text-stone-900">
                  {weekClosure.activeWorkers}
                </span>
              </div>

              <div className="flex items-center justify-between text-stone-600">
                <span>Dias trabalhados</span>
                <span className="font-semibold text-stone-900">
                  {weekClosure.workedDays}
                </span>
              </div>

              <div className="flex items-center justify-between text-stone-600">
                <span>Produção total</span>
                <span className="font-semibold text-stone-900">
                  {weekClosure.totalBoxes.toLocaleString('pt-BR')} caixas
                </span>
              </div>

              <div className="flex items-center justify-between text-stone-600">
                <span>Faltas na semana</span>
                <span className="font-semibold text-stone-900">
                  {weekClosure.absencesCount}
                </span>
              </div>

              <div className="flex items-center justify-between text-stone-600 pt-1 border-t border-stone-100">
                <span>Valor total produção</span>
                <span className="font-semibold text-stone-900">
                  R$ {weekClosure.totalProductionValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between text-stone-600">
                <span>Valor total diárias</span>
                <span className="font-semibold text-stone-900">
                  R$ {weekClosure.totalDailyValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                <span className="font-bold text-stone-900">Total a pagar</span>
                <span className="text-base font-extrabold text-[#15803d]">
                  R$ {weekClosure.totalPayable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom action and lock message */}
        <div className="space-y-3 pt-4">
          <button
            onClick={toggleWeekClosure}
            className={`w-full py-3 px-4 font-bold rounded-xl shadow-md transition-all text-sm cursor-pointer flex items-center justify-center space-x-2 ${
              weekClosure.isClosed
                ? 'bg-stone-700 hover:bg-stone-800 text-white'
                : 'bg-[#14532d] hover:bg-emerald-800 text-white'
            }`}
          >
            {weekClosure.isClosed ? (
              <>
                <Unlock className="w-4 h-4" />
                <span>Reabrir Semana para Edição</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Fechar Semana</span>
              </>
            )}
          </button>

          {/* Lock notice card */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center space-x-2.5 text-emerald-900 text-xs">
            <Lock className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="text-[11px] leading-tight font-medium">
              {weekClosure.isClosed
                ? `Semana fechada em ${weekClosure.closedAt}. Lançamentos protegidos.`
                : 'Após fechar, os dados da semana serão bloqueados para edição.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
