import React from 'react';
import { Menu, ChevronLeft, Bell, Plus, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface MobileHeaderProps {
  title: string;
  showBack?: boolean;
  showMenu?: boolean;
  showBell?: boolean;
  showPlus?: boolean;
  showFilter?: boolean;
  onPlusClick?: () => void;
  onFilterClick?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  showBack = false,
  showMenu = false,
  showBell = false,
  showPlus = false,
  showFilter = false,
  onPlusClick,
  onFilterClick,
}) => {
  const { goBack, setIsNotificationOpen, setIsMenuDrawerOpen } = useApp();

  return (
    <div className="bg-[#14532d] text-white px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-2">
        {showBack ? (
          <button
            onClick={goBack}
            className="p-1 -ml-1 text-white hover:bg-emerald-800 rounded-full transition-colors cursor-pointer"
            aria-label="Voltar"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        ) : showMenu ? (
          <button
            onClick={() => setIsMenuDrawerOpen(true)}
            className="p-1.5 -ml-1 text-white hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        ) : (
          <div className="w-6" />
        )}
        <h1 className="text-lg font-bold tracking-tight text-white">{title}</h1>
      </div>

      <div className="flex items-center space-x-1">
        {showPlus && (
          <button
            onClick={onPlusClick}
            className="p-1.5 text-white hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Adicionar"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
        {showFilter && (
          <button
            onClick={onFilterClick}
            className="p-1.5 text-white hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Filtrar"
          >
            <Filter className="w-5 h-5" />
          </button>
        )}
        {showBell && (
          <button
            onClick={() => setIsNotificationOpen(true)}
            className="p-1.5 text-white hover:bg-emerald-800 rounded-lg transition-colors relative cursor-pointer"
            aria-label="Notificações"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full ring-2 ring-[#14532d]"></span>
          </button>
        )}
      </div>
    </div>
  );
};
