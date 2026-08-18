import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { AppState, DailyLog } from '../types';
import { getWearDayColor } from '../utils/storage';

interface CalendarViewProps {
  state: AppState;
  onSelectDate: (dateStr: string) => void;
}

function offsetDate(year: number, month: number, day: number): string {
  const d = new Date(year, month, day);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const BAR_BG: Record<string, string> = {
  green:  'rgba(16, 185, 129, 0.22)',
  orange: 'rgba(245, 158, 11, 0.22)',
  red:    'rgba(244, 63, 94, 0.22)',
  rest:   'rgba(14, 165, 233, 0.18)',
};

const TEXT_COLOR: Record<string, string> = {
  green:  '#6ee7b7',
  orange: '#fcd34d',
  red:    '#fca5a5',
  rest:   '#93c5fd',
};

export const CalendarView: React.FC<CalendarViewProps> = ({ state, onSelectDate }) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysInMonth    = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const dayHighlights: Record<string, {
    wearIndex: number;
    color: 'green' | 'orange' | 'red' | 'rest';
    pairId: string;
    isActive: boolean;
  }> = {};

  state.sessions.forEach(session => {
    const isActive = session.id === state.activePairId;

    const wornLogs = (Object.values(state.logs) as DailyLog[])
      .filter(l => l.pairId === session.id && l.worn)
      .sort((a, b) => a.date.localeCompare(b.date));

    wornLogs.forEach((log, idx) => {
      const wearIndex = idx + 1;
      const color = getWearDayColor(
        wearIndex,
        state.settings.recommendedDays,
        state.settings.extendedWearStart,
        state.settings.extendedWearEnd,
      );
      if (color !== 'none') {
        dayHighlights[log.date] = { wearIndex, color: color as 'green' | 'orange' | 'red', pairId: session.id, isActive };
      }
    });

    (Object.values(state.logs) as DailyLog[])
      .filter(l => l.pairId === session.id && !l.worn)
      .forEach(log => {
        dayHighlights[log.date] = { wearIndex: 0, color: 'rest', pairId: session.id, isActive };
      });
  });

  const todayStr = new Date().toLocaleDateString('en-CA');
  const mStr = String(month + 1).padStart(2, '0');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mx-4 mt-3" id="calendar-view">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-bold">{monthNames[month]} {year}</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg font-medium transition-colors mr-1"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
            id="btn-prev-month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
            id="btn-next-month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
        {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => (
          <span key={d} className="py-1">{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-10" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum  = i + 1;
          const dStr    = String(dayNum).padStart(2, '0');
          const dateStr = `${year}-${mStr}-${dStr}`;
          const highlight  = dayHighlights[dateStr];
          const isToday    = dateStr === todayStr;
          const dayOfWeek  = (firstDayOfWeek + i) % 7;
          const dimmed     = highlight && !highlight.isActive;

          let connectsLeft  = false;
          let connectsRight = false;

          if (highlight && highlight.color !== 'rest') {
            const prevH = dayHighlights[offsetDate(year, month, dayNum - 1)];
            const nextH = dayHighlights[offsetDate(year, month, dayNum + 1)];
            connectsLeft  = dayOfWeek !== 0 && !!prevH && prevH.pairId === highlight.pairId && prevH.color !== 'rest';
            connectsRight = dayOfWeek !== 6 && !!nextH && nextH.pairId === highlight.pairId && nextH.color !== 'rest';
          }

          const barStyle: React.CSSProperties | undefined = highlight ? {
            position: 'absolute',
            top: '12%',
            bottom: '12%',
            left:  connectsLeft  ? -3 : (connectsRight ? '42%' : '14%'),
            right: connectsRight ? -3 : (connectsLeft  ? '42%' : '14%'),
            borderRadius:
              connectsLeft && connectsRight ? '0' :
              connectsLeft  ? '0 8px 8px 0' :
              connectsRight ? '8px 0 0 8px' :
              '8px',
            backgroundColor: BAR_BG[highlight.color],
            zIndex: 0,
          } : undefined;

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`h-10 flex items-center justify-center text-xs font-medium relative transition-colors hover:brightness-110 active:scale-95 ${dimmed ? 'opacity-35' : ''}`}
              title={`${dateStr}${highlight ? ` — ${highlight.color === 'rest' ? 'Rest day' : `Wear day ${highlight.wearIndex}`}` : ''}`}
              id={`cal-day-${dateStr}`}
              style={{ overflow: 'visible' }}
            >
              {barStyle && <div className="pointer-events-none" style={barStyle} />}

              {isToday && (
                <div
                  className="absolute pointer-events-none z-10"
                  style={{
                    width: 28, height: 28,
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.7)',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              )}

              <span
                className="relative z-20 select-none"
                style={{
                  color: isToday ? '#ffffff' :
                    highlight ? TEXT_COLOR[highlight.color] :
                    'rgb(100,116,139)',
                  fontWeight: isToday ? 700 : highlight ? 500 : 400,
                }}
              >
                {dayNum}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-3.5 border-t border-slate-800 flex items-center justify-around flex-wrap gap-2">
        {[
          { color: 'bg-emerald-500', label: 'Safe' },
          { color: 'bg-amber-500',   label: 'Extended' },
          { color: 'bg-rose-500',    label: 'Overdue' },
          { color: 'bg-sky-400',     label: 'Rest / Glasses' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-slate-400">
            <span className={`w-2 h-2 rounded-full shrink-0 ${color}`} />
            <span className="text-[11px]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
