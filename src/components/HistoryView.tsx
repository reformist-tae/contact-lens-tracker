import React from 'react';
import { Eye, CheckCircle2, Sparkles, Package2, Glasses } from 'lucide-react';
import { AppState, DailyLog } from '../types';
import { getPairWearDaysCount, getLocalDateString, addDays } from '../utils/storage';

type HistoryEventType = 'worn' | 'rest' | 'pair_start' | 'pair_end' | 'box_open';

interface HistoryEvent {
  type: HistoryEventType;
  label: string;
  sub?: string;
}

export const HistoryView: React.FC<{ state: AppState }> = ({ state }) => {
  const todayStr = getLocalDateString();
  const yesterdayStr = addDays(todayStr, -1);

  const eventMap: Record<string, HistoryEvent[]> = {};

  const push = (date: string, event: HistoryEvent) => {
    if (!eventMap[date]) eventMap[date] = [];
    eventMap[date].push(event);
  };

  push(state.currentBox.openedDate, {
    type: 'box_open',
    label: 'New box opened',
    sub: state.settings.lensBrand,
  });

  state.sessions.forEach(session => {
    const pairLabel = `Pair #${session.pairNumberInBox}`;
    push(session.startDate, { type: 'pair_start', label: 'New pair started', sub: pairLabel });
    if (session.endDate && session.status === 'completed') {
      const days = getPairWearDaysCount(session.id, state.logs);
      push(session.endDate, { type: 'pair_end', label: 'Pair completed', sub: `${pairLabel} · ${days} days worn` });
    }
  });

  (Object.values(state.logs) as DailyLog[]).forEach(log => {
    if (log.worn) {
      const wearDay = getPairWearDaysCount(log.pairId ?? '', state.logs, log.date);
      const session = state.sessions.find(s => s.id === log.pairId);
      const pairLabel = session ? ` · Pair #${session.pairNumberInBox}` : '';
      push(log.date, { type: 'worn', label: 'Wore lenses', sub: `Day ${wearDay}${pairLabel}` });
    } else {
      push(log.date, { type: 'rest', label: 'Rest day', sub: 'Wore glasses' });
    }
  });

  const sortedDates = Object.keys(eventMap).sort((a, b) => b.localeCompare(a));

  const formatDate = (d: string) => {
    if (d === todayStr) return 'Today';
    if (d === yesterdayStr) return 'Yesterday';
    return new Date(d + 'T00:00:00').toLocaleDateString(undefined, {
      weekday: 'short', day: 'numeric', month: 'short',
    });
  };

  const iconFor = (type: HistoryEventType) => {
    switch (type) {
      case 'worn':       return <Eye className="w-4 h-4 text-emerald-400" />;
      case 'rest':       return <Glasses className="w-4 h-4 text-sky-400" />;
      case 'pair_start': return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'pair_end':   return <CheckCircle2 className="w-4 h-4 text-slate-500" />;
      case 'box_open':   return <Package2 className="w-4 h-4 text-violet-400" />;
    }
  };

  if (sortedDates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500">
        <p className="text-sm">No history yet. Start logging daily wear!</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-8 space-y-5">
      {sortedDates.map(date => (
        <div key={date}>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            {formatDate(date)}
          </p>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/60">
            {eventMap[date].map((event, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3">
                <div className="mt-0.5 shrink-0">{iconFor(event.type)}</div>
                <div>
                  <p className="text-sm font-medium text-white">{event.label}</p>
                  {event.sub && <p className="text-xs text-slate-400 mt-0.5">{event.sub}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
