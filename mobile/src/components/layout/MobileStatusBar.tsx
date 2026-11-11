import React from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface MobileStatusBarProps {
  light?: boolean;
}

export const MobileStatusBar: React.FC<MobileStatusBarProps> = ({ light = true }) => {
  return (
    <div
      className={`w-full px-6 pt-2 pb-1 flex items-center justify-between text-xs font-semibold tracking-tight select-none ${
        light ? 'text-white' : 'text-stone-800'
      }`}
    >
      <span>9:41</span>
      <div className="flex items-center space-x-1.5">
        <Signal className="w-3.5 h-3.5 fill-current" />
        <Wifi className="w-3.5 h-3.5" />
        <div className="flex items-center space-x-0.5">
          <Battery className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
