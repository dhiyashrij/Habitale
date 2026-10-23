import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Routine, RoutineTask } from '../types';
import { loadLocalRoutines, saveLocalRoutines } from '../services/storage';
import { fetchUserRoutines, saveUserRoutine, deleteUserRoutine as deleteFirestoreRoutine } from '../services/firestore';
import { playGentleChime } from '../services/audio';
import { useTheme } from './ThemeContext';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

interface RoutinesContextType {
  routines: Routine[];
  todayStr: string;
  addRoutine: (routine: Omit<Routine, 'id' | 'createdAt' | 'streak' | 'bestStreak' | 'completedDates' | 'order'> & { id?: string }) => Promise<Routine>;
  updateRoutine: (id: string, updates: Partial<Routine>) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
  duplicateRoutine: (id: string) => Promise<void>;
  toggleRoutineCompletion: (id: string, dateStr?: string) => Promise<void>;
  toggleTaskCompletion: (routineId: string, taskId: string, dateStr?: string) => Promise<void>;
  isRoutineCompletedOnDate: (routine: Routine, dateStr?: string) => boolean;
  isTaskCompletedOnDate: (task: RoutineTask, dateStr?: string) => boolean;
  loadStarterRoutines: () => Promise<void>;
  clearRoutines: () => Promise<void>;
  cleanDuplicateRoutines: () => Promise<void>;
  todayCompletionRate: number;
  streakSummary: { totalActiveStreaks: number; highestStreak: number };
}

const RoutinesContext = createContext<RoutinesContextType | undefined>(undefined);

export const getTodayString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Safely identifies and removes accidental duplicate routines (e.g. from repeated rapid clicks).
 * Always preserves routines with user progress, completion history, or active streaks.
 */
export function deduplicateRoutines(routinesList: Routine[]): { cleaned: Routine[]; removedIds: string[] } {
  if (!Array.isArray(routinesList) || routinesList.length <= 1) {
    return { cleaned: routinesList || [], removedIds: [] };
  }

  const seenMap = new Map<string, Routine>();
  const removedIds: string[] = [];

  for (const routine of routinesList) {
    if (!routine || !routine.id) continue;

    // Normalizing signature: lowercase title + timeOfDay + category
    const key = `${routine.title.trim().toLowerCase()}|${routine.timeOfDay}|${routine.category}`;

    const existing = seenMap.get(key);
    if (!existing) {
      seenMap.set(key, routine);
    } else {
      const existingHistory = (existing.completedDates?.length || 0) + (existing.streak || 0);
      const currentHistory = (routine.completedDates?.length || 0) + (routine.streak || 0);

      if (existingHistory === 0 && currentHistory === 0) {
        // Both are unstarted identical duplicates: retain the first one, mark second as duplicate
        removedIds.push(routine.id);
      } else if (existingHistory > 0 && currentHistory === 0) {
        // Keep the one with history, discard uncompleted duplicate
        removedIds.push(routine.id);
      } else if (currentHistory > 0 && existingHistory === 0) {
        // Current has history, existing didn't: replace with current
        removedIds.push(existing.id);
        seenMap.set(key, routine);
      } else {
        // Both have user activity: keep both under unique keys to protect all user data
        seenMap.set(`${key}|${routine.id}`, routine);
      }
    }
  }

  const cleaned = routinesList.filter(r => !removedIds.includes(r.id));
  return { cleaned, removedIds };
}

export const RoutinesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>(() => {
    const raw = loadLocalRoutines();
    const { cleaned } = deduplicateRoutines(raw);
    if (cleaned.length !== raw.length) {
      saveLocalRoutines(cleaned);
    }
    return cleaned;
  });

  const { theme } = useTheme();
  const todayStr = getTodayString();

  // Load from Cloud Firestore when authenticated user changes
  useEffect(() => {
    if (!user) {
      const raw = loadLocalRoutines();
      const { cleaned } = deduplicateRoutines(raw);
      setRoutines(cleaned);
      return;
    }

    const loadCloudData = async () => {
      try {
        const cloudRoutines = await fetchUserRoutines(user.id);
        if (cloudRoutines.length > 0) {
          const { cleaned, removedIds } = deduplicateRoutines(cloudRoutines);
          setRoutines(cleaned);
          saveLocalRoutines(cleaned);

          // Clean up remote duplicates in the background if found
          if (removedIds.length > 0) {
            for (const dupId of removedIds) {
              deleteFirestoreRoutine(user.id, dupId).catch(() => {});
            }
          }
        } else {
          const local = loadLocalRoutines();
          const { cleaned } = deduplicateRoutines(local);
          if (cleaned.length > 0) {
            setRoutines(cleaned);
            for (const r of cleaned) {
              await saveUserRoutine(user.id, r);
            }
          } else {
            setRoutines([]);
          }
        }
      } catch (err) {
        console.warn('Could not fetch cloud routines; using local storage:', err);
      }
    };

    loadCloudData();
  }, [user?.id]);

  // Persist state to local storage whenever it changes
  useEffect(() => {
    saveLocalRoutines(routines);
  }, [routines]);

  /**
   * Idempotent routine addition:
   * Re-uses existing routine if already present with matching ID or identical title+category+timeOfDay
   * created within 5 minutes with zero completions, preventing duplicate entries on rapid clicks.
   */
  const addRoutine = async (
    data: Omit<Routine, 'id' | 'createdAt' | 'streak' | 'bestStreak' | 'completedDates' | 'order'> & { id?: string }
  ): Promise<Routine> => {
    const targetId = data.id || 'routine-' + Date.now();
    let resultingRoutine: Routine;

    setRoutines(prev => {
      // 1. Idempotency match check
      const existingIdx = prev.findIndex(r =>
        (data.id && r.id === data.id) ||
        (r.title.trim().toLowerCase() === data.title.trim().toLowerCase() &&
          r.timeOfDay === data.timeOfDay &&
          r.category === data.category &&
          (!r.completedDates || r.completedDates.length === 0) &&
          r.streak === 0 &&
          Math.abs(Date.now() - new Date(r.createdAt).getTime()) < 300000)
      );

      if (existingIdx !== -1) {
        // Update in-place to prevent duplication
        const updated = [...prev];
        resultingRoutine = {
          ...updated[existingIdx],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        updated[existingIdx] = resultingRoutine;
        return updated;
      }

      // New entry
      resultingRoutine = {
        ...data,
        id: targetId,
        createdAt: new Date().toISOString(),
        streak: 0,
        bestStreak: 0,
        completedDates: [],
        order: prev.length,
        tasks: data.tasks || [],
      };
      return [...prev, resultingRoutine];
    });

    // Sync to Cloud Firestore with timeout protection
    if (user && resultingRoutine!) {
      try {
        await saveUserRoutine(user.id, resultingRoutine);
      } catch (err) {
        console.warn('Routine saved locally; cloud sync deferred:', err);
      }
    }

    return resultingRoutine!;
  };

  const updateRoutine = async (id: string, updates: Partial<Routine>) => {
    let targetRoutine: Routine | undefined;
    setRoutines(prev =>
      prev.map(r => {
        if (r.id === id) {
          targetRoutine = {
            ...r,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          return targetRoutine;
        }
        return r;
      })
    );

    if (user && targetRoutine) {
      try {
        await saveUserRoutine(user.id, targetRoutine);
      } catch (err) {
        console.warn('Routine updated locally; cloud sync deferred:', err);
      }
    }
  };

  const deleteRoutine = async (id: string) => {
    setRoutines(prev => prev.filter(r => r.id !== id));

    if (user) {
      try {
        await deleteFirestoreRoutine(user.id, id);
      } catch (err) {
        console.warn('Routine deleted locally; cloud sync deferred:', err);
      }
    }
  };

  const cleanDuplicateRoutines = useCallback(async () => {
    setRoutines(prev => {
      const { cleaned, removedIds } = deduplicateRoutines(prev);
      if (removedIds.length > 0) {
        saveLocalRoutines(cleaned);
        if (user) {
          for (const id of removedIds) {
            deleteFirestoreRoutine(user.id, id).catch(() => {});
          }
        }
      }
      return cleaned;
    });
  }, [user]);

  const duplicateRoutine = async (id: string) => {
    const existing = routines.find(r => r.id === id);
    if (!existing) return;

    // Clone tasks with fresh IDs and clean completion dates
    const clonedTasks: RoutineTask[] = (existing.tasks || []).map((t, idx) => ({
      ...t,
      id: 'task-' + Date.now() + '-' + idx,
      completedDates: [],
    }));

    const clonedRoutine: Routine = {
      ...existing,
      id: 'routine-' + Date.now(),
      title: `${existing.title} (Copy)`,
      streak: 0,
      bestStreak: 0,
      completedDates: [],
      tasks: clonedTasks,
      createdAt: new Date().toISOString(),
      order: routines.length,
    };

    setRoutines(prev => [...prev, clonedRoutine]);

    if (user) {
      try {
        await saveUserRoutine(user.id, clonedRoutine);
      } catch (err) {
        console.warn('Routine duplicated locally; cloud sync deferred:', err);
      }
    }
  };

  const isRoutineCompletedOnDate = (routine: Routine, dateStr: string = todayStr): boolean => {
    return routine.completedDates.includes(dateStr);
  };

  const isTaskCompletedOnDate = (task: RoutineTask, dateStr: string = todayStr): boolean => {
    return task.completedDates.includes(dateStr);
  };

  const toggleTaskCompletion = async (routineId: string, taskId: string, dateStr: string = todayStr) => {
    let updatedTarget: Routine | undefined;

    setRoutines(prev =>
      prev.map(r => {
        if (r.id !== routineId) return r;

        const updatedTasks = r.tasks.map(t => {
          if (t.id !== taskId) return t;
          const isDone = t.completedDates.includes(dateStr);
          const newDates = isDone
            ? t.completedDates.filter(d => d !== dateStr)
            : [...t.completedDates, dateStr];

          return { ...t, completedDates: newDates };
        });

        // Check if all tasks in routine are done for dateStr
        const allDone = updatedTasks.length > 0 && updatedTasks.every(t => t.completedDates.includes(dateStr));
        const routineWasDone = r.completedDates.includes(dateStr);

        let newCompletedDates = r.completedDates;
        let newStreak = r.streak;
        let newBestStreak = r.bestStreak;

        if (allDone && !routineWasDone) {
          newCompletedDates = [...r.completedDates, dateStr];
          newStreak = r.streak + 1;
          newBestStreak = Math.max(newStreak, r.bestStreak);

          if (theme.soundEnabled) playGentleChime();
          if (theme.confettiEnabled) {
            confetti({
              particleCount: 45,
              spread: 60,
              origin: { y: 0.8 },
              colors: [theme.colors.primary, theme.colors.secondary, theme.colors.accent],
            });
          }
        } else if (!allDone && routineWasDone) {
          newCompletedDates = r.completedDates.filter(d => d !== dateStr);
          newStreak = Math.max(0, r.streak - 1);
        }

        updatedTarget = {
          ...r,
          tasks: updatedTasks,
          completedDates: newCompletedDates,
          streak: newStreak,
          bestStreak: newBestStreak,
          updatedAt: new Date().toISOString(),
        };

        return updatedTarget;
      })
    );

    if (user && updatedTarget) {
      try {
        await saveUserRoutine(user.id, updatedTarget);
      } catch (err) {
        console.warn('Task completion saved locally; cloud sync deferred:', err);
      }
    }
  };

  const toggleRoutineCompletion = async (id: string, dateStr: string = todayStr) => {
    let updatedTarget: Routine | undefined;

    setRoutines(prev =>
      prev.map(r => {
        if (r.id !== id) return r;

        const isDone = r.completedDates.includes(dateStr);
        const newCompletedDates = isDone
          ? r.completedDates.filter(d => d !== dateStr)
          : [...r.completedDates, dateStr];

        // Also toggle all sub-tasks to match
        const newTasks = r.tasks.map(t => {
          const tDone = t.completedDates.includes(dateStr);
          let dates = t.completedDates;
          if (!isDone && !tDone) {
            dates = [...t.completedDates, dateStr];
          } else if (isDone && tDone) {
            dates = t.completedDates.filter(d => d !== dateStr);
          }
          return { ...t, completedDates: dates };
        });

        const newStreak = !isDone ? r.streak + 1 : Math.max(0, r.streak - 1);
        const newBestStreak = !isDone ? Math.max(newStreak, r.bestStreak) : r.bestStreak;

        if (!isDone) {
          if (theme.soundEnabled) playGentleChime();
          if (theme.confettiEnabled) {
            confetti({
              particleCount: 50,
              spread: 70,
              origin: { y: 0.7 },
              colors: [theme.colors.primary, theme.colors.secondary, theme.colors.accent],
            });
          }
        }

        updatedTarget = {
          ...r,
          tasks: newTasks,
          completedDates: newCompletedDates,
          streak: newStreak,
          bestStreak: newBestStreak,
          updatedAt: new Date().toISOString(),
        };

        return updatedTarget;
      })
    );

    if (user && updatedTarget) {
      try {
        await saveUserRoutine(user.id, updatedTarget);
      } catch (err) {
        console.warn('Routine completion saved locally; cloud sync deferred:', err);
      }
    }
  };

  const loadStarterRoutines = async () => {
    const starterPack: Routine[] = [
      {
        id: 'routine-starter-1',
        title: 'Morning Awakening Flow',
        description: 'Awaken gently with lemon water and sunlight.',
        category: 'wellness',
        timeOfDay: 'morning',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        reminderTime: '07:30',
        icon: 'Sun',
        tasks: [
          { id: 'st-1', title: 'Warm lemon water', durationMinutes: 5, completedDates: [], order: 0 },
          { id: 'st-2', title: '5-minute balcony sunlight & deep breath', durationMinutes: 5, completedDates: [], order: 1 },
          { id: 'st-3', title: 'Gentle spinal twist & cat-cow', durationMinutes: 10, completedDates: [], order: 2 },
        ],
        streak: 0,
        bestStreak: 0,
        completedDates: [],
        createdAt: new Date().toISOString(),
        order: 0,
      },
      {
        id: 'routine-starter-2',
        title: 'Evening Digital Sunset',
        description: 'Unplug and prepare the bedroom for restorative sleep.',
        category: 'selfcare',
        timeOfDay: 'evening',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        reminderTime: '21:30',
        icon: 'Moon',
        tasks: [
          { id: 'st-4', title: 'Silence phone notifications', durationMinutes: 2, completedDates: [], order: 0 },
          { id: 'st-5', title: 'Brew lavender or chamomile tea', durationMinutes: 10, completedDates: [], order: 1 },
          { id: 'st-6', title: 'Read 15 pages in bed', durationMinutes: 20, completedDates: [], order: 2 },
        ],
        streak: 0,
        bestStreak: 0,
        completedDates: [],
        createdAt: new Date().toISOString(),
        order: 1,
      },
    ];

    setRoutines(starterPack);
    saveLocalRoutines(starterPack);

    if (user) {
      try {
        for (const r of starterPack) {
          await saveUserRoutine(user.id, r);
        }
      } catch (err) {
        console.warn('Starter routines saved locally; cloud sync deferred:', err);
      }
    }
  };

  const clearRoutines = async () => {
    const ids = routines.map(r => r.id);
    setRoutines([]);
    saveLocalRoutines([]);

    if (user) {
      try {
        for (const id of ids) {
          await deleteFirestoreRoutine(user.id, id);
        }
      } catch (err) {
        console.warn('Routines cleared locally; cloud sync deferred:', err);
      }
    }
  };

  // Metrics
  const activeRoutinesToday = routines.filter(r => r.daysOfWeek.includes(new Date().getDay()));
  const totalTasksToday = activeRoutinesToday.reduce((sum, r) => sum + r.tasks.length, 0);
  const completedTasksToday = activeRoutinesToday.reduce(
    (sum, r) => sum + r.tasks.filter(t => t.completedDates.includes(todayStr)).length,
    0
  );
  const todayCompletionRate =
    totalTasksToday > 0 ? Math.round((completedTasksToday / totalTasksToday) * 100) : 0;

  const streakSummary = {
    totalActiveStreaks: routines.filter(r => r.streak > 0).length,
    highestStreak: routines.reduce((max, r) => Math.max(max, r.streak), 0),
  };

  return (
    <RoutinesContext.Provider
      value={{
        routines,
        todayStr,
        addRoutine,
        updateRoutine,
        deleteRoutine,
        duplicateRoutine,
        toggleRoutineCompletion,
        toggleTaskCompletion,
        isRoutineCompletedOnDate,
        isTaskCompletedOnDate,
        loadStarterRoutines,
        clearRoutines,
        cleanDuplicateRoutines,
        todayCompletionRate,
        streakSummary,
      }}
    >
      {children}
    </RoutinesContext.Provider>
  );
};

export const useRoutines = () => {
  const context = useContext(RoutinesContext);
  if (!context) {
    throw new Error('useRoutines must be used within a RoutinesProvider');
  }
  return context;
};
