import type { CosmicSession, CosmicGrowthStats, CosmicStageInfo, CosmicTimerMode } from '../types';

const STORAGE_KEY_STATS = 'habitale_cosmic_stats';
const STORAGE_KEY_SESSIONS = 'habitale_cosmic_sessions';
const STORAGE_KEY_ACTIVE_TIMER = 'habitale_cosmic_active_timer';

export const COSMIC_STAGES: CosmicStageInfo[] = [
  {
    stage: 1,
    name: 'stardust-seed',
    title: 'Stardust Seed',
    description: 'A delicate crystalline stardust seed pulsating softly upon a quiet asteroid.',
    requiredSeconds: 0,
    nextRequiredSeconds: 900, // 15 mins
    auraColor: '#D99BAA', // Soft rose blush
  },
  {
    stage: 2,
    name: 'lunar-sprout',
    title: 'Lunar Sprout',
    description: 'A luminous celestial sprout unfurling bioluminescent leaves beneath a tiny orbiting moon.',
    requiredSeconds: 900,
    nextRequiredSeconds: 2700, // 45 mins
    auraColor: '#A8B89F', // Muted sage
  },
  {
    stage: 3,
    name: 'astral-bloom',
    title: 'Astral Bloom',
    description: 'A radiant planetary flora encircled by crystalline rings and gentle floating stars.',
    requiredSeconds: 2700,
    nextRequiredSeconds: 7200, // 120 mins (2 hours)
    auraColor: '#C9BDE7', // Soft lavender
  },
  {
    stage: 4,
    name: 'celestial-sanctuary',
    title: 'Celestial Sanctuary',
    description: 'A majestic galaxy tree glowing with cosmic starlight and shimmering astral constellations.',
    requiredSeconds: 7200,
    nextRequiredSeconds: 14400, // 4 hours
    auraColor: '#7AA2E3', // Cyan starlight
  },
];

/**
 * Calculates stage information and percentage progress toward next stage
 */
export function getCosmicStageInfo(totalSeconds: number): {
  currentStage: CosmicStageInfo;
  progressPercent: number;
  nextStage: CosmicStageInfo | null;
  secondsToNext: number;
} {
  const safeSeconds = Math.max(0, totalSeconds);

  let currentStage = COSMIC_STAGES[0];
  let nextStage: CosmicStageInfo | null = COSMIC_STAGES[1];

  for (let i = COSMIC_STAGES.length - 1; i >= 0; i--) {
    if (safeSeconds >= COSMIC_STAGES[i].requiredSeconds) {
      currentStage = COSMIC_STAGES[i];
      nextStage = i < COSMIC_STAGES.length - 1 ? COSMIC_STAGES[i + 1] : null;
      break;
    }
  }

  if (!nextStage) {
    // Top stage achieved
    return {
      currentStage,
      progressPercent: 100,
      nextStage: null,
      secondsToNext: 0,
    };
  }

  const stageSpan = nextStage.requiredSeconds - currentStage.requiredSeconds;
  const elapsedInStage = safeSeconds - currentStage.requiredSeconds;
  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedInStage / stageSpan) * 100)));
  const secondsToNext = Math.max(0, nextStage.requiredSeconds - safeSeconds);

  return {
    currentStage,
    progressPercent,
    nextStage,
    secondsToNext,
  };
}

/**
 * Loads persistent cosmic focus statistics
 */
export function loadCosmicStats(): CosmicGrowthStats {
  if (typeof window === 'undefined') {
    return {
      totalFocusSeconds: 0,
      totalSessionsCount: 0,
      currentStreakDays: 0,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_STATS);
    if (!raw) {
      return {
        totalFocusSeconds: 0,
        totalSessionsCount: 0,
        currentStreakDays: 0,
      };
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load cosmic stats from local storage:', err);
    return {
      totalFocusSeconds: 0,
      totalSessionsCount: 0,
      currentStreakDays: 0,
    };
  }
}

/**
 * Saves persistent cosmic focus statistics
 */
export function saveCosmicStats(stats: CosmicGrowthStats): void {
  try {
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
  } catch (err) {
    console.error('Failed to save cosmic stats:', err);
  }
}

/**
 * Loads historical focus sessions
 */
export function loadCosmicSessions(): CosmicSession[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load cosmic sessions:', err);
    return [];
  }
}

/**
 * Saves and records a newly completed focus session
 */
export function recordCosmicSession(sessionData: {
  taskTitle: string;
  todoId?: string;
  durationSeconds: number;
  mode: CosmicTimerMode;
}): { session: CosmicSession; stageChanged: boolean; newStats: CosmicGrowthStats } {
  const currentStats = loadCosmicStats();
  const prevStage = getCosmicStageInfo(currentStats.totalFocusSeconds).currentStage.stage;

  const todayStr = new Date().toISOString().split('T')[0];
  let newStreak = currentStats.currentStreakDays || 0;

  if (!currentStats.lastFocusDate) {
    newStreak = 1;
  } else if (currentStats.lastFocusDate !== todayStr) {
    const lastDate = new Date(currentStats.lastFocusDate);
    const today = new Date(todayStr);
    const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }
  }

  const updatedTotalSeconds = currentStats.totalFocusSeconds + sessionData.durationSeconds;
  const newStats: CosmicGrowthStats = {
    totalFocusSeconds: updatedTotalSeconds,
    totalSessionsCount: (currentStats.totalSessionsCount || 0) + 1,
    currentStreakDays: newStreak,
    lastFocusDate: todayStr,
  };

  saveCosmicStats(newStats);

  const newSession: CosmicSession = {
    id: `cosmic_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    taskTitle: sessionData.taskTitle.trim() || 'Free Cosmic Flow',
    todoId: sessionData.todoId,
    durationSeconds: sessionData.durationSeconds,
    mode: sessionData.mode,
    completedAt: new Date().toISOString(),
  };

  const sessions = loadCosmicSessions();
  const updatedSessions = [newSession, ...sessions].slice(0, 50); // Keep last 50
  try {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(updatedSessions));
  } catch (err) {
    console.error('Failed to store cosmic session list:', err);
  }

  const newStage = getCosmicStageInfo(updatedTotalSeconds).currentStage.stage;
  const stageChanged = newStage > prevStage;

  return { session: newSession, stageChanged, newStats };
}

/**
 * Clears focus history while keeping total growth stats intact
 */
export function clearCosmicHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_SESSIONS);
  } catch (err) {
    console.error('Failed to clear cosmic history:', err);
  }
}

/**
 * Interface for active timer restoration across browser refresh
 */
export interface PersistedActiveTimer {
  mode: CosmicTimerMode;
  taskTitle: string;
  todoId?: string;
  targetDurationSeconds: number;
  accumulatedElapsedSeconds: number;
  lastResumeTimestamp: number;
  isRunning: boolean;
  pomodoroState?: 'focus' | 'break';
  pomodoroCount?: number;
}

export function saveActiveTimerState(state: PersistedActiveTimer | null): void {
  try {
    if (!state) {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_TIMER);
    } else {
      localStorage.setItem(STORAGE_KEY_ACTIVE_TIMER, JSON.stringify(state));
    }
  } catch (err) {
    console.debug('Failed to persist active timer state:', err);
  }
}

export function loadActiveTimerState(): PersistedActiveTimer | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVE_TIMER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.debug('Failed to load active timer state:', err);
    return null;
  }
}

export function formatTimeDisplay(totalSeconds: number): {
  hoursStr: string;
  minutesStr: string;
  secondsStr: string;
  formatted: string;
} {
  const safeSec = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSec / 3600);
  const minutes = Math.floor((safeSec % 3600) / 60);
  const seconds = safeSec % 60;

  const hoursStr = hours.toString().padStart(2, '0');
  const minutesStr = minutes.toString().padStart(2, '0');
  const secondsStr = seconds.toString().padStart(2, '0');

  const formatted = hours > 0
    ? `${hoursStr}:${minutesStr}:${secondsStr}`
    : `${minutesStr}:${secondsStr}`;

  return { hoursStr, minutesStr, secondsStr, formatted };
}

export function formatDurationHuman(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const remainingSec = Math.floor(seconds % 60);
  if (mins < 60) {
    return remainingSec > 0 ? `${mins}m ${remainingSec}s` : `${mins} min`;
  }
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs} hr`;
}
