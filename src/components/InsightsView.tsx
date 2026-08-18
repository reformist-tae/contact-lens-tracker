import React from 'react';
import { TrendingUp, Clock, Eye, BarChart2, Package2, Moon } from 'lucide-react';
import { AppState } from '../types';
import { getPairWearDaysCount, getLocalDateString } from '../utils/storage';

export const InsightsView: React.FC<{ state: AppState }> = ({ state }) => {
  const completed = state.sessions.filter(s => s.status === 'completed');
  const activePair = state.sessions.find(s => s.id === state.activePairId);

  const completedDays = completed.map(s => getPairWearDaysCount(s.id, state.logs));
  const avgDays = completedDays.length > 0
    ? Math.round(completedDays.reduce((a, b) => a + b, 0) / completedDays.length)
    : null;
  const longestDays = completedDays.length > 0 ? Math.max(...completedDays) : null;
  const currentDays = activePair ? getPairWearDaysCount(activePair.id, state.logs) : 0;
  const totalPairs = state.sessions.filter(s => s.status !== 'discarded').length;

  const allLogs = Object.values(state.logs);
  const restDays = allLogs.filter(l => !l.worn).length;
  const restPct = allLogs.length > 0 ? Math.round((restDays / allLogs.length) * 100) : 0;

  const today = getLocalDateString();
  const boxOpenMs = new Date(state.currentBox.openedDate + 'T00:00:00').getTime();
  const boxDays = Math.floor((new Date(today + 'T00:00:00').getTime() - boxOpenMs) / 86400000);
  const pairsUsed = state.currentBox.totalPairs - state.currentBox.remainingPairs;

  const stats = [
    {
      Icon: Clock, iconColor: 'text-emerald-400', bgColor: 'bg-emerald-500/10',
      label: 'Average wear', value: avgDays != null ? `${avgDays} days` : '—',
      sub: completed.length > 0 ? `${completed.length} pairs tracked` : 'Complete a pair to track',
    },
    {
      Icon: TrendingUp, iconColor: 'text-amber-400', bgColor: 'bg-amber-500/10',
      label: 'Longest pair', value: longestDays != null ? `${longestDays} days` : '—',
      sub: 'Most days from one pair',
    },
    {
      Icon: Eye, iconColor: 'text-sky-400', bgColor: 'bg-sky-500/10',
      label: 'Current pair', value: `Day ${currentDays}`,
      sub: activePair ? `Pair #${activePair.pairNumberInBox}` : 'No active pair',
    },
    {
      Icon: BarChart2, iconColor: 'text-violet-400', bgColor: 'bg-violet-500/10',
      label: 'Total pairs worn', value: `${totalPairs}`,
      sub: 'All sessions combined',
    },
    {
      Icon: Moon, iconColor: 'text-blue-400', bgColor: 'bg-blue-500/10',
      label: 'Rest day ratio', value: `${restPct}%`,
      sub: `${restDays} of ${allLogs.length} days glasses`,
    },
    {
      Icon: Package2, iconColor: 'text-rose-400', bgColor: 'bg-rose-500/10',
      label: 'Current box', value: `${boxDays} days`,
      sub: `${pairsUsed} used · ${state.currentBox.remainingPairs} left`,
    },
  ];

  return (
    <div className="px-4 pt-4 pb-8">
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Your lens stats</p>
      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ Icon, iconColor, bgColor, label, value, sub }) => (
          <div key={label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className={`w-9 h-9 ${bgColor} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <p className="text-xl font-bold text-white leading-none">{value}</p>
            <p className="text-xs font-semibold text-slate-300 mt-1">{label}</p>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
