/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { Home, Clock, BarChart2 } from 'lucide-react';
import { AppState, AppSettings, DailyLog, PairSession } from './types';
import { loadAppState, saveAppState, getLocalDateString } from './utils/storage';
import { triggerCelebration } from './utils/confetti';
import { initNotificationChannel, requestNotificationPermission, scheduleNotification, cancelNotification } from './utils/notifications';
import { Navbar } from './components/Navbar';
import { ActivePairCard } from './components/ActivePairCard';
import { TodayCheckinPanel } from './components/TodayCheckinPanel';
import { CalendarView } from './components/CalendarView';
import { BoxInventoryCard } from './components/BoxInventoryCard';
import { HistoryView } from './components/HistoryView';
import { InsightsView } from './components/InsightsView';
import { DailyCheckinModal } from './components/DailyCheckinModal';
import { SettingsModal } from './components/SettingsModal';

const NAV_TABS = [
  { icon: Home,      label: 'Home'     },
  { icon: Clock,     label: 'History'  },
  { icon: BarChart2, label: 'Insights' },
] as const;

type TabLabel = typeof NAV_TABS[number]['label'];

export default function App() {
  const [state, setState] = useState<AppState>(() => loadAppState());
  const [activeTab, setActiveTab] = useState<TabLabel>('Home');
  const [checkinModalDate, setCheckinModalDate] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const notificationsInitialized = useRef(false);
  const settingsEffectFirstRun = useRef(true);

  useEffect(() => {
    saveAppState(state);
  }, [state]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    if (notificationsInitialized.current) return;
    notificationsInitialized.current = true;

    const init = async () => {
      await initNotificationChannel();
      const granted = await requestNotificationPermission();
      if (granted && state.settings.pushNotificationsEnabled) {
        const [hour, minute] = state.settings.reminderTime.split(':').map(Number);
        await scheduleNotification(hour, minute);
      }
    };
    init();

    const tapListener = LocalNotifications.addListener('localNotificationActionPerformed', () => {
      const today = getLocalDateString();
      if (!state.logs[today]) setCheckinModalDate(today);
    });
    const fgListener = LocalNotifications.addListener('localNotificationReceived', () => {
      const today = getLocalDateString();
      if (!state.logs[today]) setCheckinModalDate(today);
    });

    return () => {
      tapListener.then(h => h.remove());
      fgListener.then(h => h.remove());
    };
  }, []);

  useEffect(() => {
    if (settingsEffectFirstRun.current) {
      settingsEffectFirstRun.current = false;
      return;
    }
    if (!Capacitor.isNativePlatform()) return;
    if (state.settings.pushNotificationsEnabled) {
      const [hour, minute] = state.settings.reminderTime.split(':').map(Number);
      scheduleNotification(hour, minute);
    } else {
      cancelNotification();
    }
  }, [state.settings.pushNotificationsEnabled, state.settings.reminderTime]);

  const activePair = state.sessions.find(s => s.id === state.activePairId);

  const handleSaveLog = (
    dateStr: string,
    worn: boolean,
    pairId: string | null,
    isNewPair: boolean,
    notes?: string
  ) => {
    setState(prev => {
      let updatedSessions = [...prev.sessions];
      let updatedBox = { ...prev.currentBox };
      let finalPairId = pairId;

      if (worn && isNewPair) {
        updatedSessions = updatedSessions.map(s =>
          s.status === 'active' ? { ...s, status: 'completed' as const, endDate: dateStr } : s
        );
        const nextPairNumInBox = Math.min(6, (prev.currentBox.totalPairs - prev.currentBox.remainingPairs) + 1);
        updatedBox.remainingPairs = Math.max(0, updatedBox.remainingPairs - 1);

        const newSessionId = `pair_${Date.now()}`;
        const newSession: PairSession = {
          id: newSessionId,
          pairNumberInBox: nextPairNumInBox,
          boxId: updatedBox.id,
          startDate: dateStr,
          endDate: null,
          status: 'active',
        };
        updatedSessions.push(newSession);
        finalPairId = newSessionId;
      }

      const newLog: DailyLog = {
        date: dateStr,
        worn,
        pairId: worn ? finalPairId : (activePair ? activePair.id : null),
        notes,
      };

      return {
        ...prev,
        currentBox: updatedBox,
        activePairId: worn && isNewPair && finalPairId ? finalPairId : prev.activePairId,
        sessions: updatedSessions,
        logs: { ...prev.logs, [dateStr]: newLog },
        lastCheckinDate: getLocalDateString(),
      };
    });
  };

  const handleStartNewBox = () => {
    const today = getLocalDateString();
    setState(prev => ({
      ...prev,
      currentBox: {
        id: `box_${Date.now()}`,
        name: `${prev.settings.lensBrand} (6-Pack)`,
        totalPairs: 6,
        remainingPairs: 6,
        openedDate: today,
      },
      dismissedLowStockAlert: false,
    }));
    triggerCelebration();
  };

  // Long-press on any slot sets that pair number as the current one.
  // remainingPairs = totalPairs - pairNum makes usedPairs === pairNum → isCurrent === true.
  const handleSetCurrentPair = (pairNum: number) => {
    setState(prev => ({
      ...prev,
      currentBox: {
        ...prev.currentBox,
        remainingPairs: prev.currentBox.totalPairs - pairNum,
      },
    }));
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setState(prev => ({
      ...prev,
      settings: newSettings,
      currentBox: {
        ...prev.currentBox,
        name: prev.currentBox.name.replace(/^.*(?=\s\(6-Pack\))/, newSettings.lensBrand),
      },
    }));
  };

  const openCheckin = () => setCheckinModalDate(getLocalDateString());

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center items-start py-0 sm:py-6 px-0 sm:px-4 font-sans antialiased text-slate-100 select-none">
      <div className="w-full max-w-md bg-slate-950 sm:rounded-[42px] sm:border-8 sm:border-slate-800 sm:shadow-[0_0_50px_rgba(0,0,0,0.8)] sm:ring-1 sm:ring-slate-700/50 overflow-hidden flex flex-col min-h-screen sm:min-h-[880px] relative">

        <Navbar
          currentBox={state.currentBox}
          onOpenSettings={() => setShowSettings(true)}
        />

        <main className="flex-1 overflow-y-auto pb-2">
          {activeTab === 'Home' && (
            <>
              <ActivePairCard
                state={state}
                onReplacePair={openCheckin}
              />
              {activePair && (
                <TodayCheckinPanel
                  state={state}
                  onCheckinToday={openCheckin}
                  onReplacePair={openCheckin}
                />
              )}
              <CalendarView
                state={state}
                onSelectDate={date => setCheckinModalDate(date)}
              />
              <BoxInventoryCard
                box={state.currentBox}
                lensBrand={state.settings.lensBrand}
                onStartNewBox={handleStartNewBox}
                onRestartPair={handleSetCurrentPair}
                reorderUrl={state.settings.reorderUrl}
              />
            </>
          )}
          {activeTab === 'History' && <HistoryView state={state} />}
          {activeTab === 'Insights' && <InsightsView state={state} />}
        </main>

        <nav className="bg-slate-900 border-t border-slate-800 flex items-center justify-around px-2 py-2 shrink-0">
          {NAV_TABS.map(({ icon: Icon, label }) => (
            <button
              key={label}
              onClick={() => setActiveTab(label)}
              className={`flex flex-col items-center gap-1 px-6 py-1.5 rounded-xl transition-colors ${
                activeTab === label ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </nav>
      </div>

      <DailyCheckinModal
        show={!!checkinModalDate}
        onClose={() => setCheckinModalDate(null)}
        targetDate={checkinModalDate}
        state={state}
        onSaveLog={handleSaveLog}
      />

      <SettingsModal
        show={showSettings}
        onClose={() => setShowSettings(false)}
        settings={state.settings}
        onSaveSettings={handleSaveSettings}
      />
    </div>
  );
}
