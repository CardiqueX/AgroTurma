import React, { useState } from 'react';
import { MobileHeader } from '../layout/MobileHeader';
import { useApp } from '../../context/AppContext';

export const WorkerFormScreen: React.FC = () => {
  const { addWorker } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'ativo' | 'inativo'>('ativo');

  // Format phone mask
  const handlePhoneChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 11);
    let formatted = clean;
    if (clean.length > 2) {
      formatted = `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
    }
    if (clean.length > 7) {
      formatted = `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
    }
    setPhone(formatted);
  };

  // Format CPF mask
  const handleCpfChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 11);
    let formatted = clean;
    if (clean.length > 3) {
      formatted = `${clean.slice(0, 3)}.${clean.slice(3)}`;
    }
    if (clean.length > 6) {
      formatted = `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`;
    }
    if (clean.length > 9) {
      formatted = `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`;
    }
    setCpf(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addWorker({
      name: name.trim(),
      phone: phone || '(00) 00000-0000',
      cpf: cpf || '000.000.000-00',
      notes: notes.trim(),
      status,
    });
  };

  return (
    <div className="flex flex-col min-h-full bg-stone-100 text-stone-900 pb-6">
      <MobileHeader title="Cadastrar Trabalhador" showBack showPlus />

      <form onSubmit={handleSubmit} className="p-4 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-3.5 bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
          {/* Nome completo */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Nome completo *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome completo"
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
            />
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Telefone
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="(00) 00000-0000"
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
            />
          </div>

          {/* CPF (opcional) */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              CPF (opcional)
            </label>
            <input
              type="text"
              value={cpf}
              onChange={(e) => handleCpfChange(e.target.value)}
              placeholder="000.000.000-00"
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
            />
          </div>

          {/* Observação (opcional) */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Observação (opcional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Digite uma observação"
              className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent resize-none transition-all"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">
              Status
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2.5 text-xs text-stone-800 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="ativo"
                  checked={status === 'ativo'}
                  onChange={() => setStatus('ativo')}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-medium">Ativo</span>
              </label>
              <label className="flex items-center space-x-2.5 text-xs text-stone-800 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="inativo"
                  checked={status === 'inativo'}
                  onChange={() => setStatus('inativo')}
                  className="w-4 h-4 text-stone-600 focus:ring-stone-500"
                />
                <span className="font-medium">Inativo</span>
              </label>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-3 px-4 bg-[#14532d] hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm cursor-pointer"
          >
            Salvar Trabalhador
          </button>
        </div>
      </form>
    </div>
  );
};
