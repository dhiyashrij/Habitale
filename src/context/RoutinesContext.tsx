import React, { createContext, useContext, useState, useEffect } from 'react';
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
  addRoutine: (routine: Omit<Routine, 'id' | 'createdAt' | 'streak' | 'bestStreak' | 'completedDates' | 'order'>) => Promise<void>;
  updateRoutine: (id: string, updates: Partial<Routine>) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
  duplicateRoutine: (id: string) => Promise<void>;
  toggleRoutineCompletion: (id: string, dateStr?: string) => Promise<void>;
  toggleTaskCompletion: (routineId: string, taskId: string, dateStr?: string) => Promise<void>;
  isRoutineCompletedOnDate: (routine: Routine, dateStr?: string) => boolean;
  isTaskCompletedOnDate: (task: RoutineTask, dateStr?: string) => boolean;
  loadStarterRoutines: () => Promise<void>;
  clearRoutines: () => Promise<void>;
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

export const RoutinesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>(() => {
    return loadLocalRoutines();
  });

  const { theme } = useTheme();
  const todayStr = getTodayString();

  // Load from Cloud Firestore when authenticated user changes
  useEffect(() => {
    if (!user) {
      setRoutines(loadLocalRoutines());
      return;
    }

    const loadCloudData = async () => {
      try {
        const cloudRoutines = await fetchUserRoutines(user.id);
        if (cloudRoutines.length > 0) {
          setRoutines(cloudRoutines);
          saveLocalRoutines(cloudRoutines);
        } else {
          const local = loadLocalRoutines();
          if (local.length > 0) {
            setRoutines(local);
            for (const r of local) {
              await saveUserRoutine(user.id, r);
            }
          } else {
            setRoutines([]);
          }
        }
      } catch (err) {
        console.error('Error fetching routines from Cloud Firestore:', err);
      }
    };

    loadCloudData();
  }, [user?.id]);

  useEffect(() => {
    saveLocalRoutines(routines);
  }, [routines]);

  const addRoutine = async (data: Omit<Routine, 'id' | 'createdAt' | 'streak' | 'bestStreak' | 'completedDates' | 'order'>) => {
    const newRoutine: Routine = {
      ...data,
      id: 'routine-' + Date.now(),
      createdAt: new Date().toISOString(),
      streak: 0,
      bestStreak: 0,
      completedDates: [],
      order: routines.length,
      tasks: data.tasks || [],
    };

    setRoutines(prev => [...prev, newRoutine]);

    if (user) {
      try {
        await saveUserRoutine(user.id, newRoutine);
      } catch (err) {
        console.error('Failed to sync new routine to Firestore:', err);
      }
    }
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
        console.error('Failed to sync updated routine to Firestore:', err);
      }
    }
  };

  const deleteRoutine = async (id: string) => {
    setRoutines(prev => prev.filter(r => r.id !== id));

    if (user) {
      try {
        await deleteFirestoreRoutine(user.id, id);
      } catch (err) {
        console.error('Failed to delete routine from Firestore:', err);
      }
    }
  };

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
        console.error('Failed to duplicate routine in Firestore:', err);
      }
    }
  };

  const isRoutineCompletedOnDate = (routine: Routine, dateStr: string = todayStr): boolean => {
    return routine.completedDates.includes(dateStr);
  };

  const isTaskCompletedOnDate = (task: RoutineTask, dateStr: string = todayStr): boolean => {
    return (task.completedDates || []).includes(dateStr);
  };

  // Toggle individual task within a routine
  const toggleTaskCompletion = async (routineId: string, taskId: string, targetDate: string = todayStr) => {
    let targetRoutine: Routine | undefined;

    setRoutines(prev =>
      prev.map(routine => {
        if (routine.id !== routineId) return routine;

        let taskJustCompleted = false;

        const updatedTasks = (routine.tasks || []).map(task => {
          if (task.id !== taskId) return task;
          const isDone = (task.completedDates || []).includes(targetDate);
          if (!isDone) taskJustCompleted = true;

          const updatedDates = isDone
            ? task.completedDates.filter(d => d !== targetDate)
            : [...(task.completedDates || []), targetDate];

          return { ...task, completedDates: updatedDates };
        });

        // Check if all tasks in routine are now completed for targetDate
        const allTasksDone =
          updatedTasks.length > 0 &&
          updatedTasks.every(t => t.completedDates.includes(targetDate));

        let updatedRoutineDates = routine.completedDates;
        let newStreak = routine.streak;
        let newBestStreak = routine.bestStreak;

        if (allTasksDone && !routine.completedDates.includes(targetDate)) {
          updatedRoutineDates = [...routine.completedDates, targetDate];
          newStreak = routine.streak + 1;
          newBestStreak = Math.max(routine.bestStreak, newStreak);
        } else if (!allTasksDone && routine.completedDates.includes(targetDate)) {
          updatedRoutineDates = routine.completedDates.filter(d => d !== targetDate);
          newStreak = Math.max(0, routine.streak - 1);
        }

        if (taskJustCompleted) {
          if (theme.soundEnabled) playGentleChime(true);
          if (allTasksDone && theme.confettiEnabled) {
            confetti({
              particleCount: 30,
              spread: 60,
              origin: { y: 0.8 },
              colors: ['#D99BAA', '#A8B89F', '#C9BDE7', '#FCEEE9', '#FFFFFF'],
              disableForReducedMotion: true,
            });
          }
        }

        targetRoutine = {
          ...routine,
          tasks: updatedTasks,
          completedDates: updatedRoutineDates,
          streak: newStreak,
          bestStreak: newBestStreak,
        };

        return targetRoutine;
      })
    );

    if (user && targetRoutine) {
      try {
        await saveUserRoutine(user.id, targetRoutine);
      } catch (err) {
        console.error('Failed to sync task completion to Firestore:', err);
      }
    }
  };

  // Toggle all tasks and routine completion
  const toggleRoutineCompletion = async (id: string, targetDate: string = todayStr) => {
    let updatedRoutine: Routine | undefined;

    setRoutines(prev =>
      prev.map(routine => {
        if (routine.id !== id) return routine;

        const isCurrentlyCompleted = routine.completedDates.includes(targetDate);
        let updatedRoutineDates: string[];
        let updatedTasks: RoutineTask[];

        if (isCurrentlyCompleted) {
          // Uncomplete entire routine and all its tasks for targetDate
          updatedRoutineDates = routine.completedDates.filter(d => d !== targetDate);
          updatedTasks = (routine.tasks || []).map(t => ({
            ...t,
            completedDates: (t.completedDates || []).filter(d => d !== targetDate),
          }));
          const newStreak = Math.max(0, routine.streak - 1);

          updatedRoutine = {
            ...routine,
            tasks: updatedTasks,
            completedDates: updatedRoutineDates,
            streak: newStreak,
          };
        } else {
          // Complete entire routine and all its tasks for targetDate
          updatedRoutineDates = [...routine.completedDates, targetDate];
          updatedTasks = (routine.tasks || []).map(t => ({
            ...t,
            completedDates: (t.completedDates || []).includes(targetDate)
              ? t.completedDates
              : [...(t.completedDates || []), targetDate],
          }));

          if (theme.soundEnabled) {
            playGentleChime(true);
          }

          if (theme.confettiEnabled) {
            confetti({
              particleCount: 35,
              spread: 60,
              origin: { y: 0.8 },
              colors: ['#D99BAA', '#A8B89F', '#C9BDE7', '#FCEEE9', '#FFFFFF'],
              disableForReducedMotion: true,
            });
          }

          const newStreak = routine.streak + 1;
          const newBestStreak = Math.max(routine.bestStreak, newStreak);

          updatedRoutine = {
            ...routine,
            tasks: updatedTasks,
            completedDates: updatedRoutineDates,
            streak: newStreak,
            bestStreak: newBestStreak,
          };
        }
        return updatedRoutine;
      })
    );

    if (user && updatedRoutine) {
      try {
        await saveUserRoutine(user.id, updatedRoutine);
      } catch (err) {
        console.error('Failed to sync routine completion to Firestore:', err);
      }
    }
  };

  const loadStarterRoutines = async () => {
    const { starterRoutines } = await import('../services/storage');
    setRoutines(starterRoutines);
    if (user) {
      for (const r of starterRoutines) {
        await saveUserRoutine(user.id, r);
      }
    }
  };

  const clearRoutines = async () => {
    if (user) {
      for (const r of routines) {
        await deleteFirestoreRoutine(user.id, r.id);
      }
    }
    setRoutines([]);
  };

  // Live completion calculation across all tasks scheduled for today
  const currentDayOfWeek = new Date().getDay();
  const scheduledForToday = routines.filter(r => r.daysOfWeek.includes(currentDayOfWeek));

  let totalTasksToday = 0;
  let completedTasksToday = 0;

  scheduledForToday.forEach(r => {
    if (r.tasks && r.tasks.length > 0) {
      totalTasksToday += r.tasks.length;
      completedTasksToday += r.tasks.filter(t => (t.completedDates || []).includes(todayStr)).length;
    } else {
      totalTasksToday += 1;
      if (r.completedDates.includes(todayStr)) completedTasksToday += 1;
    }
  });

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
