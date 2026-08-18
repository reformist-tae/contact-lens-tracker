export interface DailyLog {
  date: string; // YYYY-MM-DD
  worn: boolean;
  pairId: string | null;
  notes?: string;
}

export interface PairSession {
  id: string;
  pairNumberInBox: number; // 1 to 6
  boxId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string | null; // null if active
  status: 'active' | 'completed' | 'discarded';
}

export interface BoxInventory {
  id: string;
  name: string; // e.g. "Box #1 (Acuvue Oasys)"
  totalPairs: number; // default 6
  remainingPairs: number; // 0 to 6
  openedDate: string; // YYYY-MM-DD
}

export interface AppSettings {
  recommendedDays: number; // default 14
  extendedWearStart: number; // default 15
  extendedWearEnd: number; // default 21
  reminderTime: string; // e.g. "08:30"
  pushNotificationsEnabled: boolean;
  lensBrand: string;
  reorderUrl: string;
}

export interface AppState {
  currentBox: BoxInventory;
  activePairId: string | null;
  sessions: PairSession[];
  logs: Record<string, DailyLog>; // map of YYYY-MM-DD -> log
  settings: AppSettings;
  dismissedLowStockAlert: boolean;
  lastCheckinDate: string | null;
}

export type WearColor = 'green' | 'orange' | 'red' | 'none' | 'rest';
