import React from 'react';
import { Bell, CheckCircle2, XCircle, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PushNotificationBannerProps {
  show: boolean;
  onDismiss: () => void;
  onAnswerYesExisting: () => void;
  onAnswerYesNew: () => void;
  onAnswerNo: () => void;
  activePairName: string | null;
}

export const PushNotificationBanner: React.FC<PushNotificationBannerProps> = ({
  show,
  onDismiss,
  onAnswerYesExisting,
  onAnswerYesNew,
  onAnswerNo,
  activePairName,
}) => {
  const [step, setStep] = React.useState<'initial' | 'pair_select'>('initial');

  React.useEffect(() => {
    if (show) {
      setStep('initial');
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="mx-3 mt-3 z-40"
          id="push-notification-banner"
        >
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-4 shadow-2xl text-white relative overflow-hidden backdrop-blur-md bg-opacity-95">
            {/* Android System Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/60 text-[11px] text-slate-400 font-medium">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <Bell className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-semibold">LensTracker • now</span>
              </div>
              <button 
                onClick={onDismiss}
                className="text-slate-400 hover:text-white px-1.5 py-0.5 rounded transition-colors text-xs"
              >
                Dismiss
              </button>
            </div>

            {step === 'initial' ? (
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center">
                  Daily Wearing Check-in
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Good morning! Are you wearing contact lenses today?
                </p>

                <div className="grid grid-cols-2 gap-2.5 mt-3 pt-1">
                  <button
                    onClick={() => setStep('pair_select')}
                    className="flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold py-2.5 px-3 rounded-xl text-xs shadow-md transition-all active:scale-[0.98]"
                    id="btn-notify-yes"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Yes, Wearing</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-0.5 opacity-70" />
                  </button>

                  <button
                    onClick={onAnswerNo}
                    className="flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-300 hover:text-white font-semibold py-2.5 px-3 rounded-xl text-xs border border-slate-700 transition-all active:scale-[0.98]"
                    id="btn-notify-no"
                  >
                    <XCircle className="w-4 h-4 text-slate-400" />
                    <span>No (Glasses)</span>
                  </button>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h3 className="font-bold text-sm text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Which lenses are you wearing?
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Log this wear day to your active tracking session:
                </p>

                <div className="flex flex-col gap-2 mt-3">
                  {activePairName && (
                    <button
                      onClick={onAnswerYesExisting}
                      className="flex items-center justify-between bg-emerald-700/80 hover:bg-emerald-600 active:bg-emerald-800 text-white p-3 rounded-xl text-xs font-semibold text-left border border-emerald-500/50 shadow transition-all"
                      id="btn-notify-existing"
                    >
                      <div>
                        <span className="block text-[10px] uppercase text-emerald-200 tracking-wider font-bold">Continue Current Session</span>
                        <span className="text-sm">{activePairName}</span>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                    </button>
                  )}

                  <button
                    onClick={onAnswerYesNew}
                    className="flex items-center justify-between bg-amber-600/90 hover:bg-amber-500 active:bg-amber-700 text-white p-3 rounded-xl text-xs font-semibold text-left shadow transition-all"
                    id="btn-notify-new"
                  >
                    <div>
                      <span className="block text-[10px] uppercase text-amber-200 tracking-wider font-bold">Open Fresh Blister Pack</span>
                      <span className="text-sm">Start New Pair from Box</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-amber-200" />
                  </button>

                  <button
                    onClick={() => setStep('initial')}
                    className="text-center text-xs text-slate-400 hover:text-slate-200 py-1 font-medium"
                  >
                    ← Back
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
