import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  Package,
  AlertTriangle,
  Wallet,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { MobileHeader } from '../layout/MobileHeader';
import { useApp } from '../../context/AppContext';

interface ChartItem {
  date: string;
  day: string;
  boxes: number;
}

export const DashboardScreen: React.FC = () => {
  const {
    periodString,
    setPeriodString,
    navigateTo,
  } = useApp();

  const [activeBar, setActiveBar] = useState<number | null>(0);
  const [isEditingPeriod, setIsEditingPeriod] = useState(false);

  const [activeWorkersCount, setActiveWorkersCount] = useState<number>(0);
  const [totalBoxes, setTotalBoxes] = useState<number>(0);
  const [absencesCount, setAbsencesCount] = useState<number>(0);
  const [totalPayable, setTotalPayable] = useState<number>(0);
  const [chartData, setChartData] = useState<ChartItem[]>([]);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setActiveWorkersCount(data.activeWorkersCount ?? 0);
          setTotalBoxes(data.totalBoxes ?? 0);
          setAbsencesCount(data.absencesCount ?? 0);
          setTotalPayable(data.totalPayable ?? 0);
          if (Array.isArray(data.chartData) && data.chartData.length > 0) {
            setChartData(data.chartData);
            setActiveBar(data.chartData.length - 1);
          }
        }
      })
      .catch((err) => console.error('Erro ao carregar dashboard:', err));
  }, []);

  const maxVal = Math.max(...chartData.map((d) => d.boxes), 100);

  return (
    <div className="flex flex-col min-h-full bg-stone-100 text-stone-900 pb-4">
      <MobileHeader title="Dashboard" showMenu showBell />

      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-800 tracking-tight">
              Resumo da turma
            </h2>
            <span className="text-[11px] text-stone-500 font-medium">Fazenda Bela Aliança</span>
          </div>

          <div className="bg-white border border-stone-200/90 rounded-xl px-3.5 py-2.5 flex items-center justify-between shadow-2xs">
            {isEditingPeriod ? (
              <input
                type="text"
                value={periodString}
                onChange={(e) => setPeriodString(e.target.value)}
                onBlur={() => setIsEditingPeriod(false)}
                autoFocus
                className="text-xs font-semibold text-stone-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 w-full focus:outline-none"
              />
            ) : (
              <span
                onClick={() => setIsEditingPeriod(true)}
                className="text-xs font-semibold text-stone-700 cursor-pointer hover:text-emerald-700"
              >
                {periodString}
              </span>
            )}
            <button
              onClick={() => setIsEditingPeriod(!isEditingPeriod)}
              className="text-stone-400 hover:text-emerald-700 transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => navigateTo('workers')}
            className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs hover:border-emerald-400 transition-all cursor-pointer group"
          >
            <div className="text-[11px] font-medium text-stone-500">
              Trabalhadores ativos
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">
              {activeWorkersCount}
            </div>
            <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-100 text-[10px] text-stone-400 group-hover:text-emerald-700">
              <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Users className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold flex items-center">
                Ver lista <ArrowRight className="w-3 h-3 ml-0.5" />
              </span>
            </div>
          </div>

          <div
            onClick={() => navigateTo('launch_production')}
            className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs hover:border-blue-400 transition-all cursor-pointer group"
          >
            <div className="text-[11px] font-medium text-stone-500">
              Produção total
            </div>
            <div className="text-2xl font-extrabold text-blue-600 mt-1 flex items-baseline space-x-1">
              <span>{totalBoxes}</span>
              <span className="text-xs font-semibold text-blue-400">caixas</span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-100 text-[10px] text-stone-400 group-hover:text-blue-700">
              <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center">
                <Package className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold flex items-center">
                + Apontar <ArrowRight className="w-3 h-3 ml-0.5" />
              </span>
            </div>
          </div>

          <div
            onClick={() => navigateTo('launch_absence')}
            className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs hover:border-red-400 transition-all cursor-pointer group"
          >
            <div className="text-[11px] font-medium text-stone-500">
              Faltas no período
            </div>
            <div className="text-2xl font-extrabold text-red-500 mt-1">
              {absencesCount}
            </div>
            <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-100 text-[10px] text-stone-400 group-hover:text-red-700">
              <div className="w-6 h-6 rounded-md bg-red-50 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold flex items-center">
                Registrar <ArrowRight className="w-3 h-3 ml-0.5" />
              </span>
            </div>
          </div>

          <div
            onClick={() => navigateTo('payments')}
            className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs hover:border-amber-400 transition-all cursor-pointer group"
          >
            <div className="text-[11px] font-medium text-stone-500">
              A pagar
            </div>
            <div className="text-lg font-extrabold text-amber-600 mt-1 leading-tight">
              R$ {totalPayable.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-100 text-[10px] text-stone-400 group-hover:text-amber-700">
              <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
                <Wallet className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold flex items-center">
                Folha <ArrowRight className="w-3 h-3 ml-0.5" />
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-stone-800">
              Produção por dia (caixas)
            </h3>
            <div className="flex items-center space-x-1 text-[11px] text-emerald-700 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Dados em tempo real</span>
            </div>
          </div>

          <div className="h-44 w-full flex flex-col justify-end pt-2">
            {activeBar !== null && chartData[activeBar] && (
              <div className="text-center text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 py-1 px-2 rounded-lg mb-2 mx-auto w-fit transition-all">
                {chartData[activeBar].date} ({chartData[activeBar].day}):{' '}
                <span className="text-emerald-700 font-extrabold">
                  {chartData[activeBar].boxes} caixas
                </span>
              </div>
            )}

            <div className="relative h-32 flex items-end justify-between px-2 border-b border-stone-200">
              {chartData.map((item, index) => {
                const heightPercent = Math.max(Math.round((item.boxes / maxVal) * 100), 8);
                const isSelected = activeBar === index;
                return (
                  <div
                    key={item.date}
                    onClick={() => setActiveBar(index)}
                    className="relative z-10 flex flex-col items-center flex-1 mx-1 cursor-pointer group h-full justify-end"
                  >
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[28px] rounded-t-sm transition-all duration-300 ${
                        isSelected
                          ? 'bg-[#155e2d]'
                          : 'bg-[#1d4ed8] group-hover:bg-[#1e40af]'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between px-2 pt-2 text-[10px] text-stone-500 font-medium">
              {chartData.map((item, index) => (
                <div
                  key={item.date}
                  onClick={() => setActiveBar(index)}
                  className={`text-center flex-1 cursor-pointer ${
                    activeBar === index ? 'font-bold text-stone-900' : ''
                  }`}
                >
                  {item.date}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs space-y-2">
          <div className="text-xs font-bold text-stone-800">
            Ações Rápidas de Campo
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <button
              onClick={() => navigateTo('launch_production')}
              className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-semibold flex flex-col items-center justify-center transition-colors cursor-pointer"
            >
              <Package className="w-4 h-4 mb-1 text-emerald-700" />
              <span>+ Produção</span>
            </button>
            <button
              onClick={() => navigateTo('launch_daily')}
              className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg font-semibold flex flex-col items-center justify-center transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4 mb-1 text-blue-700" />
              <span>+ Diária</span>
            </button>
            <button
              onClick={() => navigateTo('launch_absence')}
              className="p-2.5 bg-red-50 hover:bg-red-100 text-red-800 rounded-lg font-semibold flex flex-col items-center justify-center transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 mb-1 text-red-600" />
              <span>+ Falta</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};