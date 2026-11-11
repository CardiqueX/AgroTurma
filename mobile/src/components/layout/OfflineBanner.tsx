import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const OfflineBanner: React.FC = () => {
  const { isOnline, setIsOnline, showToast } = useApp();

  const toggleOnline = () => {
    const next = !isOnline;
    setIsOnline(next);
    showToast(next ? 'Conexão restaurada! Sincronizando dados...' : 'Modo offline ativado. Dados gravados localmente.');
  };

  return (
    <div className="bg-emerald-50 border-t border-emerald-200 px-4 py-2 text-xs text-emerald-900 flex items-center justify-between shadow-xs">
      <div className="flex items-center space-x-2 text-left flex-1 mr-2">
        {isOnline ? (
          <Wifi className="w-4 h-4 text-emerald-600 shrink-0" />
        ) : (
          <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
        )}
        <span className="leading-tight">
          <strong className="font-semibold">{isOnline ? 'App funciona offline:' : 'Operando offline:'}</strong> Os dados são salvos no aparelho e sincronizados quando houver conexão.
        </span>
      </div>

      <button
        onClick={toggleOnline}
        title="Simular Online/Offline"
        className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded text-[10px] font-semibold flex items-center space-x-1 shrink-0 transition-colors cursor-pointer"
      >
        <RefreshCw className="w-3 h-3" />
        <span>{isOnline ? 'Online' : 'Offline'}</span>
      </button>
    </div>
  );
};
