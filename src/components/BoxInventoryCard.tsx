import React, { useRef, useState } from 'react';
import { ShoppingCart, Package2, Box, Check } from 'lucide-react';
import { BoxInventory } from '../types';

interface BoxInventoryCardProps {
  box: BoxInventory;
  lensBrand: string;
  onStartNewBox: () => void;
  onRestartPair: (pairNum: number) => void;
  reorderUrl: string;
}

export const BoxInventoryCard: React.FC<BoxInventoryCardProps> = ({
  box, lensBrand, onStartNewBox, onRestartPair, reorderUrl,
}) => {
  const usedPairs = box.totalPairs - box.remainingPairs;
  const isVeryLow = box.remainingPairs <= 1;
  const isLowStock = box.remainingPairs <= 2;
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pressedSlot, setPressedSlot] = useState<number | null>(null);

  const openedStr = new Date(box.openedDate + 'T00:00:00').toLocaleDateString(undefined, {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const startPress = (pairNum: number) => {
    setPressedSlot(pairNum);
    pressTimer.current = setTimeout(() => {
      onRestartPair(pairNum);
      setPressedSlot(null);
    }, 600);
  };

  const cancelPress = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    setPressedSlot(null);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mx-4 mt-3 mb-4" id="box-inventory-card">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Lens supply</p>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
          <Package2 className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{lensBrand}</p>
          <p className="text-xs text-slate-400 mt-0.5">Opened {openedStr}</p>
        </div>
        <span className={`text-sm font-bold shrink-0 ${isLowStock ? 'text-amber-400' : 'text-emerald-400'}`}>
          {box.remainingPairs} left
        </span>
      </div>

      {/* Blister pack slots — long-press any slot to set it as current */}
      <div className="grid grid-cols-6 gap-2 mb-1">
        {Array.from({ length: box.totalPairs }).map((_, idx) => {
          const pairNum = idx + 1;
          const isUsed = pairNum <= usedPairs;
          const isCurrent = pairNum === usedPairs;
          const isNextAvailable = pairNum === usedPairs + 1;
          const isPressed = pressedSlot === pairNum;

          return (
            <button
              key={pairNum}
              className={`flex flex-col items-center gap-1 transition-transform select-none ${isPressed ? 'scale-90' : ''}`}
              onPointerDown={() => startPress(pairNum)}
              onPointerUp={cancelPress}
              onPointerLeave={cancelPress}
              onPointerCancel={cancelPress}
              title="Hold to set as current pair"
            >
              <div className={`w-full aspect-square rounded-xl border flex items-center justify-center transition-all ${
                isPressed
                  ? 'ring-2 ring-white/60'
                  : isCurrent
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-400 ring-1 ring-emerald-400'
                  : isUsed
                  ? 'bg-slate-800/40 border-slate-700/50 text-slate-600'
                  : isNextAvailable
                  ? 'bg-slate-800 border-slate-600 text-slate-300'
                  : 'bg-slate-800/20 border-slate-800 text-slate-700'
              }`}>
                {isUsed ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <div className={`w-3 h-3 rounded-full border-2 ${
                    isNextAvailable ? 'border-slate-400' : 'border-slate-700'
                  }`} />
                )}
              </div>
              <span className={`text-[10px] font-medium ${
                isCurrent ? 'text-emerald-400' : 'text-slate-600'
              }`}>
                {isCurrent ? 'Current' : isUsed ? 'Used' : 'Sealed'}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-6 gap-2 mb-4">
        {Array.from({ length: box.totalPairs }).map((_, idx) => (
          <span key={idx} className="text-center text-[9px] text-slate-700 font-mono">#{idx + 1}</span>
        ))}
      </div>

      <div className="space-y-2">
        <a
          href={reorderUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${
            isVeryLow
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : isLowStock
              ? 'bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300'
              : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300'
          }`}
          id="btn-reorder-contacts"
        >
          <ShoppingCart className="w-4 h-4 shrink-0" />
          Order more
        </a>

        <button
          onClick={onStartNewBox}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
          id="btn-start-new-box"
        >
          <Box className="w-4 h-4 shrink-0 text-emerald-400" />
          Start new box
        </button>
      </div>
    </div>
  );
};
