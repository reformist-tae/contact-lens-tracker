import React, { useState } from 'react';
import { CheckCircle2, MinusCircle, ChevronDown, Pencil, RefreshCw } from 'lucide-react';
import { AppState } from '../types';
import { getLocalDateString, getPairWearDaysCount } from '../utils/storage';

interface TodayCheckinPanelProps {
  state: AppState;
  onCheckinToday: () => void;
  onReplacePair: () => void;
}

export const TodayCheckinPanel: React.FC<TodayCheckinPanelProps> = ({
  state,
  onCheckinToday,
  onReplacePair,
}) => {
  const todayStr = getLocalDateString();
  const todayLog = state.logs[todayStr];
  const isTodayLogged = !!todayLog;

  const activePair = state.sessions.find(s => s.id === state.activePairId);
  const wearCount = activePair ? getPairWearDaysCount(activePair.id, state.logs) : 0;

  // Expanded by default when today hasn't been logged (prompts user to log)
  const [collapsed, setCollapsed] = useState(true);

  const { recommendedDays, extendedWearStart, extendedWearEnd } = state.settings;
  const isReplaceUrgent = wearCount >= extendedWearStart;

  // Status display
  let statusIcon = <MinusCircle className="w-5 h-5 text-slate-400 shrink-0" />;
  let statusText = 'Not logged yet';
  let statusSub = 'Tap to log today\'s wear';

  if (todayLog) {
    if (todayLog.worn) {
      statusIcon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      statusText = 'Worn today';
      statusSub = `Day ${wearCount} logged · Pair #${activePair?.pairNumberInBox ?? '?'}`;
    } else {
      statusIcon = <MinusCircle className="w-5 h-5 text-sky-400 shrink-0" />;
      statusText = 'Rest day today';
      statusSub = 'Glasses / lenses not worn';
    }
  }

  const legendItems = [
    { dot: 'bg-emerald-500', label: 'Safe', range: `Days 1–${recommendedDays}` },
    { dot: 'bg-amber-500', label: 'Extended', range: `Days ${extendedWearStart}–${extendedWearEnd}` },
    { dot: 'bg-rose-500', label: 'Overdue', range: `Days ${extendedWearEnd + 1}+` },
    { dot: 'bg-sky-400', label: 'Rest (glasses)', range: 'Any day' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl mx-4 mt-3">
      {/* Header row — tap to collapse/expand */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center justify-between px-4 pt-4 pb-3"
      >
        <span className="text-sm font-bold text-white">Today's check-in</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}
        />
      </button>

      {/* Status row — always visible */}
      <div className="px-4 pb-4 flex items-start gap-3">
        {statusIcon}
        <div>
          <p className="text-sm font-semibold text-white leading-tight">{statusText}</p>
          <p className="text-xs text-slate-400 mt-0.5">{statusSub}</p>
        </div>
      </div>

      {/* Expandable detail */}
      {!collapsed && (
        <div className="px-4 pb-4 border-t border-slate-800/60 pt-4 space-y-4">
          {/* Wear status legend */}
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Wear status window
            </p>
            <div className="space-y-1.5">
              {legendItems.map(({ dot, label, range }) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
                    <span className="text-slate-300">{label}</span>
                  </div>
                  <span className="text-slate-500">{range}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={onCheckinToday}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-medium text-slate-200 transition-colors"
              id="btn-change-log"
            >
              <Pencil className="w-3.5 h-3.5" />
              {isTodayLogged ? "Change today's log" : "Log today's wear"}
            </button>
            <button
              onClick={onReplacePair}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${
                isReplaceUrgent
                  ? 'bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300'
                  : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200'
              }`}
              id="btn-replace-pair"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Replace this pair
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
