import React, { useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { MobileHeader } from '../layout/MobileHeader';
import { useApp } from '../../context/AppContext';
import { Worker } from '../../types';

export const WorkersScreen: React.FC = () => {
  const { workers, navigateTo, setSelectedWorkerId } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'inativo'>('todos');

  const filteredWorkers = workers.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.cpf.includes(searchTerm) ||
      w.phone.includes(searchTerm);
    const matchesStatus =
      statusFilter === 'todos' ? true : w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleWorkerClick = (worker: Worker) => {
    setSelectedWorkerId(worker.id);
    navigateTo('worker_history');
  };

  const activeCount = workers.filter((w) => w.status === 'ativo').length;
  const inactiveCount = workers.filter((w) => w.status === 'inativo').length;

  return (
    <div className="flex flex-col min-h-full bg-stone-100 text-stone-900 pb-4">
      <MobileHeader
        title="Trabalhadores"
        showMenu
        showPlus
        onPlusClick={() => navigateTo('worker_form')}
      />

      <div className="p-4 space-y-3">
        {/* Search input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar trabalhador"
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent shadow-2xs"
          />
        </div>

        {/* Filter chips: Todos, Ativos, Inativos */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setStatusFilter('todos')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'todos'
                ? 'bg-stone-800 text-white shadow-2xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            Todos ({workers.length})
          </button>
          <button
            onClick={() => setStatusFilter('ativo')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'ativo'
                ? 'bg-[#14532d] text-white shadow-2xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            Ativos ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('inativo')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'inativo'
                ? 'bg-stone-600 text-white shadow-2xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            Inativos ({inactiveCount})
          </button>
        </div>

        {/* Workers List */}
        <div className="bg-white rounded-2xl border border-stone-200/90 divide-y divide-stone-100 shadow-2xs overflow-hidden">
          {filteredWorkers.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-400">
              Nenhum trabalhador encontrado.
            </div>
          ) : (
            filteredWorkers.map((worker) => (
              <div
                key={worker.id}
                onClick={() => handleWorkerClick(worker)}
                className="p-3.5 flex items-center justify-between hover:bg-stone-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  {worker.photoUrl ? (
                    <img
                      src={worker.photoUrl}
                      alt={worker.name}
                      className="w-10 h-10 rounded-full object-cover border border-stone-200"
                    />
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-full ${
                        worker.status === 'inativo'
                          ? 'bg-amber-600'
                          : worker.avatarColor || 'bg-[#155e2d]'
                      } text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs`}
                    >
                      {worker.avatarInitials}
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-bold text-stone-900 group-hover:text-emerald-800 transition-colors">
                      {worker.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span
                        className={`text-[11px] font-medium ${
                          worker.status === 'ativo'
                            ? 'text-emerald-700'
                            : 'text-stone-400'
                        }`}
                      >
                        {worker.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </span>
                      {worker.phone && (
                        <span className="text-[10px] text-stone-400">
                          • {worker.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-stone-400 group-hover:text-stone-700 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
