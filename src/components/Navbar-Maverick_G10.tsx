import React from 'react';
import { Settings, Package } from 'lucide-react';
import { BoxInventory } from '../types';

interface NavbarProps {
  currentBox: BoxInventory;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentBox, onOpenSettings }) => {
  const isLowStock = currentBox.remainingPairs <= 2;

  return (
    <header className="bg-slate-950 border-b border-slate-800/60 text-white px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
      <h1 className="text-base font-bold tracking-tight">LensTracker</h1>

      <div className="flex items-center gap-2">
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            isLowStock ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-300 border border-slate-700'
          }`}
          title={`${currentBox.remainingPairs} pairs remaining`}
        >
          <Package className="w-3 h-3 shrink-0" />
          <span>{currentBox.remainingPairs} pairs left</span>
        </div>

        <button
          onClick={onOpenSettings}
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
          title="Settings"
          id="btn-settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
