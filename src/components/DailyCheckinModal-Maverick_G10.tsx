import React, { useState, useEffect } from 'react';
import { X, Check, Eye, Glasses, Sparkles, Calendar, FileText, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppState, DailyLog } from '../types';

interface DailyCheckinModalProps {
  show: boolean;
  onClose: () => void;
  targetDate: string | null;
  state: AppState;
  onSaveLog: (date: string, worn: boolean, pairId: string | null, isNewPair: boolean, notes?: string) => void;
}

export const DailyCheckinModal: React.FC<DailyCheckinModalProps> = ({
  show,
  onClose,
  targetDate,
  state,
  onSaveLog,
}) => {
  const [worn, setWorn] = useState(true);
  const [isNewPair, setIsNewPair] = useState(false);
  const [notes, setNotes] = useState('');

  const dateStr = targetDate || new Date().toLocaleDateString('en-CA');

  const existingLog = state.logs[dateStr];
  const activePair = state.sessions.find(s => s.id === state.activePairId);

  useEffect(() => {
    if (show) {
      if (existingLog) {
        setWorn(existingLog.worn);
        setIsNewPair(false);
        setNotes(existingLog.notes || '');
      } else {
        setWorn(true);
        setIsNewPair(!activePair);
        setNotes('');
      }
    }
  }, [show, targetDate, state]);

  if (!show) return null;

  const formattedDate = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPairId = isNewPair ? null : (activePair ? activePair.id : null);
    onSaveLog(dateStr, worn, targetPairId, isNewPair, notes.trim() || undefined);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 text-white w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          id="daily-checkin-modal"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Daily Wear Log</span>
              <h3 className="text-lg font-bold flex items-center gap-2 mt-0.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{formattedDate}</span>
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white transition-colors"
              id="btn-close-checkin"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-5 overflow-y-auto pr-1">
            {/* Worn Switch Toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2.5">
                Did you wear contact lenses on this day?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setWorn(true)}
                  className={`p-3.5 rounded-2xl border font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                    worn
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-900/40 ring-2 ring-emerald-400/50'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                  id="toggle-worn-yes"
                >
                  <Eye className="w-4 h-4" />
                  <span>Yes, Wore Contacts</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWorn(false)}
                  className={`p-3.5 rounded-2xl border font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                    !worn
                      ? 'bg-sky-600 border-sky-400 text-white shadow-lg shadow-sky-900/40 ring-2 ring-sky-400/50'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                  id="toggle-worn-no"
                >
                  <Glasses className="w-4 h-4" />
                  <span>No (Glasses / Rest)</span>
                </button>
              </div>
            </div>

            {/* Pair selection if worn */}
            {worn && (
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3 animate-fadeIn">
                <label className="block text-xs font-bold text-slate-300">
                  Which pair of lenses?
                </label>

                {activePair && (
                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    !isNewPair ? 'bg-emerald-900/50 border-emerald-500 text-white font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}>
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="radio"
                        checked={!isNewPair}
                        onChange={() => setIsNewPair(false)}
                        className="text-emerald-500 focus:ring-emerald-400"
                      />
                      <div>
                        <span className="block text-xs">Pair #{activePair.pairNumberInBox} (current session)</span>
                        <span className="block text-[10px] text-slate-400 font-normal mt-0.5">Continuing active wear window</span>
                      </div>
                    </div>
                  </label>
                )}

                <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  isNewPair ? 'bg-amber-900/50 border-amber-500 text-white font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}>
                  <div className="flex items-center space-x-2.5">
                    <input
                      type="radio"
                      checked={isNewPair}
                      onChange={() => setIsNewPair(true)}
                      className="text-amber-500 focus:ring-amber-400"
                    />
                    <div>
                      <span className="block text-xs flex items-center gap-1.5 text-amber-300">
                        <Sparkles className="w-3.5 h-3.5" /> Start Fresh Pair from Box
                      </span>
                      <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                        Opens next blister pack (Remaining: {state.currentBox.remainingPairs} left)
                      </span>
                    </div>
                  </div>
                </label>

                {isNewPair && state.currentBox.remainingPairs <= 2 && (
                  <div className="text-[11px] bg-amber-500/10 text-amber-300 border border-amber-500/30 p-2 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Opening this pair leaves {state.currentBox.remainingPairs - 1} left in your box.</span>
                  </div>
                )}
              </div>
            )}

            {/* Optional Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Daily Notes (Optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Wore 12 hours, mild dryness late evening..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
              />
            </div>

            {/* Save Action */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs shadow-lg shadow-emerald-900/50 flex items-center justify-center space-x-2 transition-all active:scale-[0.99]"
                id="btn-save-checkin"
              >
                <Check className="w-4 h-4" />
                <span>Save Log Entry</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
