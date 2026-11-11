import React from 'react';
import { MobileHeader } from '../layout/MobileHeader';
import { useApp } from '../../context/AppContext';

export const AuditLogScreen: React.FC = () => {
  const { auditLogs } = useApp();

  return (
    <div className="flex flex-col min-h-full bg-stone-100 text-stone-900 pb-6">
      <MobileHeader title="Histórico de Alterações" showBack />

      <div className="p-4 space-y-4 flex-1">
        {/* Date Group Header */}
        <div className="text-xs font-bold text-stone-600 tracking-wide">
          15/06/2025
        </div>

        {/* List of Audit Cards */}
        <div className="space-y-3">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-2.5"
            >
              {/* Header with worker avatar & title */}
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {log.workerName
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-stone-900">
                    {log.workerName}
                  </h4>
                  <p className="text-[11px] text-stone-500 font-medium">
                    {log.changeTitle}
                  </p>
                </div>
              </div>

              {/* Value comparison table */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-100 text-[11px]">
                <div>
                  <span className="text-[10px] text-stone-400 block font-medium">
                    Valor anterior
                  </span>
                  <span className="text-stone-700 font-semibold">
                    {log.previousValue}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block font-medium">
                    Valor novo
                  </span>
                  <span className="text-emerald-700 font-bold">
                    {log.newValue}
                  </span>
                </div>
              </div>

              {/* Meta details */}
              <div className="pt-2 border-t border-stone-100 text-[10px] text-stone-500 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span>Alterado por: <strong className="text-stone-700 font-semibold">{log.alteredBy}</strong></span>
                  <span className="text-stone-400">{log.timestamp}</span>
                </div>
                <div>
                  <span>Motivo: <span className="text-stone-600">{log.reason}</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
