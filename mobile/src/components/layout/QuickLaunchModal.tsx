import React from 'react';
import { Package, CalendarCheck, AlertTriangle, UserPlus, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface QuickLaunchModalProps {
  contained?: boolean;
}

export const QuickLaunchModal: React.FC<QuickLaunchModalProps> = ({ contained = false }) => {
  const { isQuickLaunchOpen, setIsQuickLaunchOpen, navigateTo } = useApp();

  if (!isQuickLaunchOpen) return null;

  const handleSelect = (action: 'production' | 'daily' | 'absence' | 'worker') => {
    setIsQuickLaunchOpen(false);
    switch (action) {
      case 'production':
        navigateTo('launch_production');
        break;
      case 'daily':
        navigateTo('launch_daily');
        break;
      case 'absence':
        navigateTo('launch_absence');
        break;
      case 'worker':
        navigateTo('worker_form');
        break;
    }
  };

  return (
    <div
      onClick={() => setIsQuickLaunchOpen(false)}
      className={`${
        contained ? 'absolute items-end' : 'fixed items-end sm:items-center'
      } inset-0 z-50 flex justify-center bg-black/50 backdrop-blur-xs animate-in fade-in duration-200`}
    >
      <div
        className={`w-full max-w-sm bg-white ${
          contained ? 'rounded-t-2xl' : 'rounded-t-2xl sm:rounded-2xl'
        } shadow-2xl p-5 border border-stone-200`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-base font-bold text-stone-900">Novo Lançamento</h3>
            <p className="text-xs text-stone-500">Selecione o tipo de registro rural</p>
          </div>
          <button
            onClick={() => setIsQuickLaunchOpen(false)}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2.5 py-4">
          <button
            onClick={() => handleSelect('production')}
            className="flex items-center p-3 rounded-xl border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mr-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-stone-900">Lançar Produção</div>
              <div className="text-xs text-stone-500">Apontar caixas colhidas por unidade/peso</div>
            </div>
          </button>

          <button
            onClick={() => handleSelect('daily')}
            className="flex items-center p-3 rounded-xl border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mr-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-stone-900">Lançar Diária</div>
              <div className="text-xs text-stone-500">Registrar dia trabalhado fixo</div>
            </div>
          </button>

          <button
            onClick={() => handleSelect('absence')}
            className="flex items-center p-3 rounded-xl border border-stone-200 hover:border-red-500 hover:bg-red-50/50 transition-all text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-red-100 text-red-700 flex items-center justify-center mr-3 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-stone-900">Registrar Falta</div>
              <div className="text-xs text-stone-500">Contabilizar ausência e motivo</div>
            </div>
          </button>

          <button
            onClick={() => handleSelect('worker')}
            className="flex items-center p-3 rounded-xl border border-stone-200 hover:border-amber-500 hover:bg-amber-50/50 transition-all text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mr-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-stone-900">Cadastrar Trabalhador</div>
              <div className="text-xs text-stone-500">Adicionar novo membro à turma rural</div>
            </div>
          </button>
        </div>

        <button
          onClick={() => setIsQuickLaunchOpen(false)}
          className="w-full py-2.5 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};