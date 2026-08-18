import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Calendar, Clock, Eye, Sparkles } from 'lucide-react';
import { AppState } from '../types';
import { getPairWearDaysCount, getWearDayColor } from '../utils/storage';

interface ActivePairCardProps {
  state: AppState;
  onReplacePair: () => void;
}

const RING_R = 34;
const RING_CIRC = 2 * Math.PI * RING_R;

export const ActivePairCard: React.FC<ActivePairCardProps> = ({ state, onReplacePair }) => {
  const activePair = state.sessions.find(s => s.id === state.activePairId);

  if (!activePair) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-white mx-4 mt-4">
        <div className="w-12 h-12 bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <Eye className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold">No active lenses</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          Start tracking a new pair from your lens supply below.
        </p>
        <button
          onClick={onReplacePair}
          className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-semibold text-xs inline-flex items-center gap-1.5 transition-colors"
          id="btn-start-first-pair"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          Start new pair from box
        </button>
      </div>
    );
  }

  const { recommendedDays, extendedWearStart, extendedWearEnd } = state.settings;
  const wearCount = getPairWearDaysCount(activePair.id, state.logs);
  const currentColor = getWearDayColor(wearCount, recommendedDays, extendedWearStart, extendedWearEnd);

  const progress = Math.min(1, wearCount / recommendedDays);
  const arcOffset = RING_CIRC * (1 - progress);
  const arcColor =
    currentColor === 'green' ? '#10b981' :
    currentColor === 'orange' ? '#f59e0b' :
    '#f43f5e';

  const startDate = new Date(activePair.startDate + 'T00:00:00');
  const startStr = startDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

  const replaceByDate = new Date(startDate);
  replaceByDate.setDate(startDate.getDate() + recommendedDays - 1);
  const replaceByStr = replaceByDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

  const statusConfig =
    currentColor === 'green'
      ? { icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, text: 'Safe to wear today', color: 'text-emerald-400' }
      : currentColor === 'orange'
      ? { icon: <AlertTriangle className="w-4 h-4 text-amber-400" />, text: 'Extended wear — plan to replace soon', color: 'text-amber-400' }
      : { icon: <XCircle className="w-4 h-4 text-rose-400" />, text: 'Overdue — replace today', color: 'text-rose-400' };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mx-4 mt-4" id="active-pair-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-400 mb-1">Current lenses</p>
          <h2 className="text-3xl font-bold text-white leading-tight">
            Day {wearCount}
            <span className="text-xl font-semibold text-slate-400"> of {recommendedDays}</span>
          </h2>

          <div className={`flex items-center gap-1.5 mt-2 text-sm font-medium ${statusConfig.color}`}>
            {statusConfig.icon}
            <span>{statusConfig.text}</span>
          </div>

          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Started {startStr}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Replace by {replaceByStr}</span>
            </div>
          </div>
        </div>

        <svg width="88" height="88" viewBox="0 0 88 88" className="shrink-0">
          <circle cx="44" cy="44" r={RING_R} fill="none" stroke="#1e293b" strokeWidth="5" />
          <circle
            cx="44" cy="44" r={RING_R}
            fill="none"
            stroke={arcColor}
            strokeWidth="5"
            strokeDasharray={RING_CIRC}
            strokeDashoffset={arcOffset}
            strokeLinecap="round"
            transform="rotate(-90 44 44)"
          />
          <text x="44" y="41" textAnchor="middle" fill="white" fontSize="20" fontWeight="700" fontFamily="system-ui, sans-serif">
            {wearCount}
          </text>
          <text x="44" y="57" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="system-ui, sans-serif">
            of {recommendedDays}
          </text>
        </svg>
      </div>
    </div>
  );
};
