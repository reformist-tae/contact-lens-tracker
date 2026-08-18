/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppState, AppSettings, DailyLog, PairSession } from './types';
import { loadAppState, saveAppState, getLocalDateString } from './utils/storage';
import { triggerCelebration } from './utils/confetti';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { Navbar } from './components/Navbar';
import { PushNotificationBanner } from './components/PushNotificationBanner';
import { ActivePairCard } from './components/ActivePairCard';
import { CalendarView } from './components/CalendarView';
import { BoxInventoryCard } from './components/BoxInventoryCard';
import { DailyCheckinModal } from './components/DailyCheckinModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadAppState());
  
  // Modals and simulated notification state
  const [showPushBanner, setShowPushBanner] = useState(false);
  const [checkinModalDate, setCheckinModalDate] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Auto-save state changes
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  // Check on startup if today's check-in has been logged
  useEffect(() => {
    const today = getLocalDateString();
    if (!state.logs[today] && state.settings.pushNotificationsEnabled) {
      // Small delay to simulate push notification arriving in morning
      const timer = setTimeout(() => {
        setShowPushBanner(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const activePair = state.sessions.find(s => s.id === state.activePairId);

  // Save or update a daily log
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

      // If user indicated starting a fresh pair from box
      if (worn && isNewPair) {
        // Complete current active pair if exists
        updatedSessions = updatedSessions.map(s => {
          if (s.status === 'active') {
            return { ...s, status: 'completed' as const, endDate: dateStr };
          }
          return s;
        });

        // Decrement box remaining count
        const nextPairNumInBox = Math.min(6, (prev.currentBox.totalPairs - prev.currentBox.remainingPairs) + 1);
        updatedBox.remainingPairs = Math.max(0, updatedBox.remainingPairs - 1);

        // Create new active session
        const newSessionId = `pair_${Date.now()}`;
        const newSession: PairSession = {
          id: newSessionId,
          name: `Pair #${prev.sessions.length + 1}`,
          pairNumberInBox: nextPairNumInBox,
          boxId: updatedBox.id,
          startDate: dateStr,
          endDate: null,
          status: 'active'
        };

        updatedSessions.push(newSession);
        finalPairId = newSessionId;
      }

      const newLog: DailyLog = {
        date: dateStr,
        worn,
        pairId: worn ? finalPairId : (activePair ? activePair.id : null),
        notes
      };

      return {
        ...prev,
        currentBox: updatedBox,
        activePairId: worn && isNewPair && finalPairId ? finalPairId : prev.activePairId,
        sessions: updatedSessions,
        logs: {
          ...prev.logs,
          [dateStr]: newLog
        },
        lastCheckinDate: getLocalDateString()
      };
    });
  };

  // Quick answers from Push Banner
  const handleBannerYesExisting = () => {
    const today = getLocalDateString();
    handleSaveLog(today, true, state.activePairId, false);
    setShowPushBanner(false);
  };

  const handleBannerYesNew = () => {
    const today = getLocalDateString();
    handleSaveLog(today, true, null, true);
    setShowPushBanner(false);
    triggerCelebration();
  };

  const handleBannerNo = () => {
    const today = getLocalDateString();
    handleSaveLog(today, false, state.activePairId, false, 'Resting eyes / glasses');
    setShowPushBanner(false);
  };

  // Start new box of contacts (6 pairs)
  const handleStartNewBox = () => {
    const today = getLocalDateString();
    setState(prev => ({
      ...prev,
      currentBox: {
        id: `box_${Date.now()}`,
        name: `${prev.settings.lensBrand} (6-Pack)`,
        totalPairs: 6,
        remainingPairs: 6,
        openedDate: today
      },
      dismissedLowStockAlert: false
    }));
    triggerCelebration();
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setState(prev => ({
      ...prev,
      settings: newSettings,
      currentBox: {
        ...prev.currentBox,
        name: prev.currentBox.name.replace(/^.*(?=\s\(6-Pack\))/, newSettings.lensBrand)
      }
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center items-start py-0 sm:py-6 px-0 sm:px-4 font-sans antialiased text-slate-100 select-none">
      {/* Phone Bezel Frame on Desktop / Full Screen on Mobile */}
      <div className="w-full max-w-md bg-slate-950 sm:rounded-[42px] sm:border-8 sm:border-slate-800 sm:shadow-[0_0_50px_rgba(0,0,0,0.8)] sm:ring-1 sm:ring-slate-700/50 overflow-hidden flex flex-col min-h-screen sm:min-h-[880px] relative">
        
        {/* Android Top System Bar */}
        <AndroidStatusBar />

        {/* Application Navigation Header */}
        <Navbar
          currentBox={state.currentBox}
          onTriggerNotification={() => setShowPushBanner(true)}
          onOpenSettings={() => setShowSettings(true)}
        />

        {/* Scrollable Main Content Container */}
        <main className="flex-1 overflow-y-auto pb-6 relative">
          {/* Simulated Android Push Banner Prompt */}
          <PushNotificationBanner
            show={showPushBanner}
            onDismiss={() => setShowPushBanner(false)}
            onAnswerYesExisting={handleBannerYesExisting}
            onAnswerYesNew={handleBannerYesNew}
            onAnswerNo={handleBannerNo}
            activePairName={activePair ? activePair.name : null}
          />

          {/* Active Contact Lens Tracking Session Card */}
          <ActivePairCard
            state={state}
            onCheckinToday={() => setCheckinModalDate(getLocalDateString())}
            onReplacePair={() => {
              setCheckinModalDate(getLocalDateString());
            }}
          />

          {/* Color Highlighted Calendar View (14 Days Green, 15-21 Orange, 22+ Red) */}
          <CalendarView
            state={state}
            onSelectDate={(date) => setCheckinModalDate(date)}
          />

          {/* Box Inventory Tracker & Low Stock Alert Indicator */}
          <BoxInventoryCard
            box={state.currentBox}
            onStartNewBox={handleStartNewBox}
            reorderUrl={state.settings.reorderUrl}
          />
        </main>

        {/* Android Bottom Gesture Bar */}
        <div className="bg-slate-950 py-2.5 flex items-center justify-center border-t border-slate-900/80">
          <div className="w-32 h-1 bg-slate-700/80 rounded-full" />
        </div>
      </div>

      {/* Interactive Daily Check-in Modal */}
      <DailyCheckinModal
        show={!!checkinModalDate}
        onClose={() => setCheckinModalDate(null)}
        targetDate={checkinModalDate}
        state={state}
        onSaveLog={handleSaveLog}
      />

      {/* Preferences & Schedule Settings Modal */}
      <SettingsModal
        show={showSettings}
        onClose={() => setShowSettings(false)}
        settings={state.settings}
        onSaveSettings={handleSaveSettings}
      />
    </div>
  );
}
