import React, { useState, useEffect } from 'react';
import { X, Save, Settings, Bell, Shield, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  show: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  show,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);

  useEffect(() => {
    if (show) {
      setFormData(settings);
    }
  }, [show, settings]);

  if (!show) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col"
          id="settings-modal"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold">Preferences & Schedule</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-5 overflow-y-auto pr-1 text-xs">
            {/* Wear Windows Configuration */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Shield className="w-4 h-4" />
                <span>Replacement Time Windows</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Optimal Wear Window (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={formData.recommendedDays}
                  onChange={e => setFormData({ ...formData, recommendedDays: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">Highlighted in GREEN on your calendar (e.g., standard 14 days for bi-weekly lenses).</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-900">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Extended Wear Start
                  </label>
                  <input
                    type="number"
                    min={formData.recommendedDays + 1}
                    max={90}
                    value={formData.extendedWearStart}
                    onChange={e => setFormData({ ...formData, extendedWearStart: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Extended Wear End
                  </label>
                  <input
                    type="number"
                    min={formData.extendedWearStart}
                    max={100}
                    value={formData.extendedWearEnd}
                    onChange={e => setFormData({ ...formData, extendedWearEnd: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-500">Days {formData.extendedWearStart} to {formData.extendedWearEnd} show ORANGE. Subsequent days show RED.</p>
            </div>

            {/* Daily Notification Schedule */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Bell className="w-4 h-4" />
                  <span>Daily Push Notification Prompt</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.pushNotificationsEnabled}
                  onChange={e => setFormData({ ...formData, pushNotificationsEnabled: e.target.checked })}
                  className="w-4 h-4 text-emerald-500 rounded bg-slate-900 border-slate-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Daily Check-in Prompt Time
                </label>
                <input
                  type="time"
                  disabled={!formData.pushNotificationsEnabled}
                  value={formData.reminderTime}
                  onChange={e => setFormData({ ...formData, reminderTime: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                />
                <p className="text-[10px] text-slate-500 mt-1">Simulates an Android system push alert reminding you to answer if wearing contacts that day.</p>
              </div>
            </div>

            {/* Inventory & Brand */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-sky-400 font-bold">
                <ShoppingBag className="w-4 h-4" />
                <span>Lens Box Details</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Contact Lens Brand & Model
                </label>
                <input
                  type="text"
                  value={formData.lensBrand}
                  onChange={e => setFormData({ ...formData, lensBrand: e.target.value })}
                  placeholder="e.g. Acuvue Oasys Bi-Weekly"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Reorder Store URL
                </label>
                <input
                  type="url"
                  value={formData.reorderUrl}
                  onChange={e => setFormData({ ...formData, reorderUrl: e.target.value })}
                  placeholder="https://www.1800contacts.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all"
                id="btn-save-settings"
              >
                <Save className="w-4 h-4" />
                <span>Save Preferences</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
