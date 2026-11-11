import React, { useState } from 'react';
import { Sprout, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LoginScreen: React.FC = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('apontador@fazendaboavista.com.br');
  const [password, setPassword] = useState('agro1234');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
  };

  return (
    <div className="min-h-full flex flex-col justify-between bg-stone-50 text-stone-900 pb-6">
      {/* Top curved green hero banner */}
      <div className="bg-[#14532d] text-white pt-10 pb-16 px-6 relative rounded-b-[40px] shadow-md flex flex-col items-center justify-center text-center">
        {/* Curved decorative background effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-800 to-[#14532d] rounded-b-[40px] opacity-90"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-3 shadow-inner">
            <Sprout className="w-10 h-10 text-emerald-300" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Agro<span className="text-emerald-300">Turma</span>
          </h1>
          <p className="text-xs tracking-wider text-emerald-100 uppercase font-medium mt-1">
            Controle de Mão de Obra Rural
          </p>
        </div>
      </div>

      {/* Main card */}
      <div className="px-6 -mt-8 relative z-20 flex-1 flex flex-col justify-center">
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-stone-200/80">
          <h2 className="text-base font-bold text-stone-800 mb-5">
            Entrar na sua conta
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu e-mail"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  required
                  className="w-full pl-9 pr-9 py-2.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 text-stone-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                />
                <span>Lembrar meu acesso</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 bg-[#14532d] hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm cursor-pointer"
            >
              Entrar
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => alert('Para redefinir a senha, entre em contato com o administrador da fazenda.')}
                className="text-xs text-emerald-800 hover:underline font-medium cursor-pointer"
              >
                Esqueceu sua senha?
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer Version */}
      <div className="text-center text-[11px] text-stone-400 pt-6">
        Versão 1.0.0
      </div>
    </div>
  );
};
