import { AppState, DailyLog, PairSession, WearColor } from '../types';

const STORAGE_KEY = 'android_lens_tracker_state_v1';

// Helper to get YYYY-MM-DD local date
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return getLocalDateString(date);
}

// Generate realistic initial demo data
function createInitialState(): AppState {
  const today = getLocalDateString();
  const boxId = 'box_1';
  
  // Create 3 completed past pairs and 1 active pair (#4)
  // Box has 6 total pairs. If 4 are opened, remaining = 2!
  const sessions: PairSession[] = [
    {
      id: 'pair_1',
      name: 'Pair #1',
      pairNumberInBox: 1,
      boxId,
      startDate: addDays(today, -48),
      endDate: addDays(today, -33),
      status: 'completed'
    },
    {
      id: 'pair_2',
      name: 'Pair #2',
      pairNumberInBox: 2,
      boxId,
      startDate: addDays(today, -32),
      endDate: addDays(today, -18),
      status: 'completed'
    },
    {
      id: 'pair_3',
      name: 'Pair #3',
      pairNumberInBox: 3,
      boxId,
      startDate: addDays(today, -17),
      endDate: addDays(today, -11),
      status: 'completed'
    },
    {
      id: 'pair_4',
      name: 'Pair #4 (Active)',
      pairNumberInBox: 4,
      boxId,
      startDate: addDays(today, -10),
      endDate: null,
      status: 'active'
    }
  ];

  const logs: Record<string, DailyLog> = {};

  // Populate logs for pair 4 (Active for last 10 days, wore 9 days, 1 rest day)
  for (let i = 10; i >= 1; i--) {
    const dStr = addDays(today, -i);
    // Let's say 4 days ago was a rest day (glasses)
    if (i === 4) {
      logs[dStr] = { date: dStr, worn: false, pairId: 'pair_4', notes: 'Wore glasses to rest eyes' };
    } else {
      logs[dStr] = { date: dStr, worn: true, pairId: 'pair_4' };
    }
  }

  // Populate some logs for pair 3
  for (let i = 17; i >= 11; i--) {
    const dStr = addDays(today, -i);
    logs[dStr] = { date: dStr, worn: true, pairId: 'pair_3' };
  }

  return {
    currentBox: {
      id: boxId,
      name: 'Acuvue Oasys Hydraclear (6-Pack)',
      totalPairs: 6,
      remainingPairs: 2, // Down to 2 pairs remaining -> triggers reorder reminder!
      openedDate: addDays(today, -48)
    },
    activePairId: 'pair_4',
    sessions,
    logs,
    settings: {
      recommendedDays: 14,
      extendedWearStart: 15,
      extendedWearEnd: 21,
      reminderTime: '08:30',
      pushNotificationsEnabled: true,
      lensBrand: 'Acuvue Oasys Bi-Weekly',
      reorderUrl: 'https://www.1800contacts.com'
    },
    dismissedLowStockAlert: false,
    lastCheckinDate: addDays(today, -1) // yesterday was last check-in, so today prompts check-in!
  };
}

export function loadAppState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validate structure basics
      if (parsed.currentBox && parsed.sessions && parsed.logs) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load state from localStorage', e);
  }
  const init = createInitialState();
  saveAppState(init);
  return init;
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage', e);
  }
}

// Calculate how many days a specific pair was worn up to a certain date
export function getPairWearDaysCount(pairId: string, logs: Record<string, DailyLog>, upToDate?: string): number {
  return (Object.values(logs) as DailyLog[]).filter(log => {
    if (log.pairId !== pairId || !log.worn) return false;
    if (upToDate && log.date > upToDate) return false;
    return true;
  }).length;
}

// Get wear color based on wear day index
export function getWearDayColor(wearDayIndex: number, recommended: number, extStart: number, extEnd: number): WearColor {
  if (wearDayIndex <= 0) return 'none';
  if (wearDayIndex <= recommended) return 'green';
  if (wearDayIndex <= extEnd) return 'orange';
  return 'red';
}
