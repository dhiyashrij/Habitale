import type { Routine, Todo, DailyReflection } from '../types';

export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateStr(str: string): Date {
  const [year, month, day] = str.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

/**
 * Check if a date string is strictly in the future compared to today in user's local timezone
 */
export function isFutureDate(dateStr: string, todayStr: string = getTodayString()): boolean {
  return dateStr > todayStr;
}

/**
 * Calculate accurate current streak for a routine based on actual stored completedDates and scheduled days
 */
export function calculateRoutineCurrentStreak(routine: Routine, todayStr: string = getTodayString()): number {
  if (!routine.daysOfWeek || routine.daysOfWeek.length === 0) return 0;
  const createdDateStr = routine.createdAt ? routine.createdAt.slice(0, 10) : '2000-01-01';

  let streak = 0;
  const curr = parseDateStr(todayStr);

  // Check today
  const todayDayOfWeek = curr.getDay();
  const isTodayScheduled = routine.daysOfWeek.includes(todayDayOfWeek);
  const isTodayCompleted = routine.completedDates.includes(todayStr);

  if (isTodayScheduled && isTodayCompleted) {
    streak += 1;
  }

  // Walk backward from yesterday
  curr.setDate(curr.getDate() - 1);

  while (true) {
    const dateStr = formatDateStr(curr);
    if (dateStr < createdDateStr) {
      break; // Reached creation date, streak unbroken
    }

    const dayOfWeek = curr.getDay();
    const isScheduled = routine.daysOfWeek.includes(dayOfWeek);

    if (isScheduled) {
      if (routine.completedDates.includes(dateStr)) {
        streak += 1;
      } else {
        // Scheduled day was missed; streak breaks
        break;
      }
    }
    // If not scheduled, it's an intentional rest day; streak is preserved

    curr.setDate(curr.getDate() - 1);
    // Cap backward search to 365 days for performance
    if (streak > 365) break;
  }

  return streak;
}

/**
 * Calculate accurate best/longest streak in the routine's recorded history
 */
export function calculateRoutineLongestStreak(routine: Routine): number {
  if (!routine.completedDates || routine.completedDates.length === 0) return 0;
  if (!routine.daysOfWeek || routine.daysOfWeek.length === 0) return 0;

  const sortedDates = [...routine.completedDates].sort();
  if (sortedDates.length === 0) return 0;

  const firstDate = parseDateStr(sortedDates[0]);
  const lastDate = parseDateStr(sortedDates[sortedDates.length - 1]);

  let maxStreak = 0;
  let currentRun = 0;

  const curr = new Date(firstDate.getTime());
  while (curr <= lastDate) {
    const dateStr = formatDateStr(curr);
    const dayOfWeek = curr.getDay();
    const isScheduled = routine.daysOfWeek.includes(dayOfWeek);

    if (isScheduled) {
      if (routine.completedDates.includes(dateStr)) {
        currentRun += 1;
        if (currentRun > maxStreak) {
          maxStreak = currentRun;
        }
      } else {
        currentRun = 0;
      }
    }

    curr.setDate(curr.getDate() + 1);
  }

  return Math.max(maxStreak, routine.bestStreak || 0);
}

/**
 * Calculate overall completion rate across scheduled tasks on a specific date
 */
export function getDailyCompletionRate(
  routines: Routine[],
  dateStr: string,
  todayStr: string = getTodayString()
): { rate: number; completed: number; total: number; isScheduled: boolean } {
  if (isFutureDate(dateStr, todayStr)) {
    return { rate: 0, completed: 0, total: 0, isScheduled: false };
  }

  const d = parseDateStr(dateStr);
  const dayOfWeek = d.getDay();

  // Find routines scheduled on that day and already created by that date
  const scheduled = routines.filter(r => {
    const createdStr = r.createdAt ? r.createdAt.slice(0, 10) : '2000-01-01';
    return r.daysOfWeek.includes(dayOfWeek) && createdStr <= dateStr;
  });

  if (scheduled.length === 0) {
    return { rate: 0, completed: 0, total: 0, isScheduled: false };
  }

  let totalTasks = 0;
  let completedTasks = 0;

  scheduled.forEach(r => {
    if (r.tasks && r.tasks.length > 0) {
      totalTasks += r.tasks.length;
      completedTasks += r.tasks.filter(t => (t.completedDates || []).includes(dateStr)).length;
    } else {
      totalTasks += 1;
      if (r.completedDates.includes(dateStr)) {
        completedTasks += 1;
      }
    }
  });

  const rate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  return { rate, completed: completedTasks, total: totalTasks, isScheduled: true };
}

/**
 * Generate 7-Day Activity Chart Data up to today
 */
export interface SevenDayDataPoint {
  dateStr: string;
  dayLabel: string;
  formattedDate: string;
  rate: number;
  completedTasks: number;
  scheduledTasks: number;
  isToday: boolean;
}

export function getSevenDayActivityChart(routines: Routine[], todayStr: string = getTodayString()): SevenDayDataPoint[] {
  const result: SevenDayDataPoint[] = [];
  const base = parseDateStr(todayStr);

  for (let i = 6; i >= 0; i--) {
    const d = new Date(base.getTime());
    d.setDate(d.getDate() - i);
    const dateStr = formatDateStr(d);
    const metrics = getDailyCompletionRate(routines, dateStr, todayStr);

    result.push({
      dateStr,
      dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }),
      formattedDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      rate: metrics.rate,
      completedTasks: metrics.completed,
      scheduledTasks: metrics.total,
      isToday: dateStr === todayStr,
    });
  }

  return result;
}

/**
 * Generate Month Calendar View Data for analytics
 */
export interface CalendarDayInfo {
  dateStr: string;
  dayNum: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
  rate: number;
  completedTasks: number;
  scheduledTasks: number;
  completedRoutinesCount: number;
  scheduledRoutinesCount: number;
  status: 'complete' | 'partial' | 'missed' | 'rest' | 'future';
}

export function getMonthCalendarData(
  year: number,
  month: number, // 0-indexed (0 = Jan, 11 = Dec)
  routines: Routine[],
  todayStr: string = getTodayString()
): CalendarDayInfo[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startDayOfWeek = firstDay.getDay(); // 0 = Sun
  const totalDays = lastDay.getDate();

  const days: CalendarDayInfo[] = [];

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i);
    const dateStr = formatDateStr(d);
    const metrics = getDailyCompletionRate(routines, dateStr, todayStr);
    const isFuture = isFutureDate(dateStr, todayStr);

    days.push({
      dateStr,
      dayNum: d.getDate(),
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isFuture,
      rate: metrics.rate,
      completedTasks: metrics.completed,
      scheduledTasks: metrics.total,
      completedRoutinesCount: 0,
      scheduledRoutinesCount: 0,
      status: isFuture ? 'future' : metrics.total === 0 ? 'rest' : metrics.rate === 100 ? 'complete' : metrics.rate > 0 ? 'partial' : 'missed',
    });
  }

  // Current month days
  for (let day = 1; day <= totalDays; day++) {
    const d = new Date(year, month, day);
    const dateStr = formatDateStr(d);
    const isFuture = isFutureDate(dateStr, todayStr);
    const metrics = getDailyCompletionRate(routines, dateStr, todayStr);

    const dayOfWeek = d.getDay();
    const scheduledRoutines = routines.filter(r => {
      const createdStr = r.createdAt ? r.createdAt.slice(0, 10) : '2000-01-01';
      return r.daysOfWeek.includes(dayOfWeek) && createdStr <= dateStr;
    });
    const completedRoutines = scheduledRoutines.filter(r => r.completedDates.includes(dateStr));

    let status: CalendarDayInfo['status'] = 'rest';
    if (isFuture) {
      status = 'future';
    } else if (metrics.total === 0) {
      status = 'rest';
    } else if (metrics.rate === 100) {
      status = 'complete';
    } else if (metrics.rate > 0) {
      status = 'partial';
    } else {
      status = 'missed';
    }

    days.push({
      dateStr,
      dayNum: day,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isFuture,
      rate: metrics.rate,
      completedTasks: metrics.completed,
      scheduledTasks: metrics.total,
      completedRoutinesCount: completedRoutines.length,
      scheduledRoutinesCount: scheduledRoutines.length,
      status,
    });
  }

  // Next month leading days to complete 35 or 42 grid cells
  const remainingCells = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    const d = new Date(year, month + 1, i);
    const dateStr = formatDateStr(d);
    const isFuture = isFutureDate(dateStr, todayStr);
    const metrics = getDailyCompletionRate(routines, dateStr, todayStr);

    days.push({
      dateStr,
      dayNum: i,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isFuture,
      rate: metrics.rate,
      completedTasks: metrics.completed,
      scheduledTasks: metrics.total,
      completedRoutinesCount: 0,
      scheduledRoutinesCount: 0,
      status: isFuture ? 'future' : metrics.total === 0 ? 'rest' : metrics.rate === 100 ? 'complete' : metrics.rate > 0 ? 'partial' : 'missed',
    });
  }

  return days;
}

/**
 * Calculate weekly and monthly routine rates up to today
 */
export function getPeriodicRates(routines: Routine[], todayStr: string = getTodayString()): {
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  totalCompletionsAllTime: number;
  activeStreaksCount: number;
  highestStreak: number;
} {
  const dailyMetrics = getDailyCompletionRate(routines, todayStr, todayStr);

  // 7-day rate
  const sevenDays = getSevenDayActivityChart(routines, todayStr);
  const total7Completed = sevenDays.reduce((acc, d) => acc + d.completedTasks, 0);
  const total7Scheduled = sevenDays.reduce((acc, d) => acc + d.scheduledTasks, 0);
  const weeklyRate = total7Scheduled > 0 ? Math.round((total7Completed / total7Scheduled) * 100) : 0;

  // 30-day rate
  const base = parseDateStr(todayStr);
  let total30Completed = 0;
  let total30Scheduled = 0;

  for (let i = 0; i < 30; i++) {
    const d = new Date(base.getTime());
    d.setDate(d.getDate() - i);
    const dateStr = formatDateStr(d);
    const m = getDailyCompletionRate(routines, dateStr, todayStr);
    total30Completed += m.completed;
    total30Scheduled += m.total;
  }
  const monthlyRate = total30Scheduled > 0 ? Math.round((total30Completed / total30Scheduled) * 100) : 0;

  const totalCompletionsAllTime = routines.reduce(
    (acc, r) => acc + (r.completedDates ? r.completedDates.length : 0),
    0
  );

  let activeStreaksCount = 0;
  let highestStreak = 0;

  routines.forEach(r => {
    const streak = calculateRoutineCurrentStreak(r, todayStr);
    const best = calculateRoutineLongestStreak(r);
    if (streak > 0) activeStreaksCount += 1;
    if (best > highestStreak) highestStreak = best;
    if (streak > highestStreak) highestStreak = streak;
  });

  return {
    dailyRate: dailyMetrics.rate,
    weeklyRate,
    monthlyRate,
    totalCompletionsAllTime,
    activeStreaksCount,
    highestStreak,
  };
}

/**
 * Calculate To-do Completion Summary
 */
export interface TodoAnalyticsSummary {
  total: number;
  active: number;
  completed: number;
  overdue: number;
  completionRate: number;
  categoryBreakdown: Record<string, { total: number; completed: number; rate: number }>;
  priorityBreakdown: {
    high: { total: number; completed: number };
    medium: { total: number; completed: number };
    low: { total: number; completed: number };
  };
}

export function getTodoAnalytics(todos: Todo[], todayStr: string = getTodayString()): TodoAnalyticsSummary {
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const active = total - completed;
  const overdue = todos.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const categoryBreakdown: Record<string, { total: number; completed: number; rate: number }> = {};
  todos.forEach(t => {
    const cat = t.category || 'Personal';
    if (!categoryBreakdown[cat]) {
      categoryBreakdown[cat] = { total: 0, completed: 0, rate: 0 };
    }
    categoryBreakdown[cat].total += 1;
    if (t.completed) categoryBreakdown[cat].completed += 1;
  });

  Object.keys(categoryBreakdown).forEach(cat => {
    const c = categoryBreakdown[cat];
    c.rate = c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0;
  });

  const priorityBreakdown = {
    high: { total: 0, completed: 0 },
    medium: { total: 0, completed: 0 },
    low: { total: 0, completed: 0 },
  };

  todos.forEach(t => {
    const p = t.priority || 'medium';
    if (priorityBreakdown[p]) {
      priorityBreakdown[p].total += 1;
      if (t.completed) priorityBreakdown[p].completed += 1;
    }
  });

  return {
    total,
    active,
    completed,
    overdue,
    completionRate,
    categoryBreakdown,
    priorityBreakdown,
  };
}

/**
 * Get detailed day record for date navigation inspector
 */
export interface DayInspectorData {
  dateStr: string;
  formattedDate: string;
  isToday: boolean;
  isFuture: boolean;
  scheduledRoutines: {
    routine: Routine;
    isFullyCompleted: boolean;
    completedTasksCount: number;
    totalTasksCount: number;
  }[];
  dueTodos: Todo[];
  completedTodos: Todo[];
  reflection?: DailyReflection;
  completionRate: number;
}

export function getDayInspectorData(
  dateStr: string,
  routines: Routine[],
  todos: Todo[],
  reflections: Record<string, DailyReflection>,
  todayStr: string = getTodayString()
): DayInspectorData {
  const d = parseDateStr(dateStr);
  const dayOfWeek = d.getDay();
  const isToday = dateStr === todayStr;
  const isFuture = isFutureDate(dateStr, todayStr);

  const scheduled = routines.filter(r => {
    const createdStr = r.createdAt ? r.createdAt.slice(0, 10) : '2000-01-01';
    return r.daysOfWeek.includes(dayOfWeek) && createdStr <= dateStr;
  });

  let totalTasks = 0;
  let completedTasks = 0;

  const scheduledRoutines = scheduled.map(r => {
    const isFullyCompleted = r.completedDates.includes(dateStr);
    const tasks = r.tasks || [];
    const completedTasksCount = tasks.filter(t => (t.completedDates || []).includes(dateStr)).length;
    const totalTasksCount = tasks.length > 0 ? tasks.length : 1;

    totalTasks += totalTasksCount;
    completedTasks += tasks.length > 0 ? completedTasksCount : isFullyCompleted ? 1 : 0;

    return {
      routine: r,
      isFullyCompleted,
      completedTasksCount,
      totalTasksCount,
    };
  });

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const dueTodos = todos.filter(t => t.dueDate === dateStr);
  const completedTodos = todos.filter(
    t => t.completed && (t.completedAt ? t.completedAt.slice(0, 10) === dateStr : t.dueDate === dateStr)
  );

  const reflection = reflections[dateStr];

  return {
    dateStr,
    formattedDate: d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    isToday,
    isFuture,
    scheduledRoutines,
    dueTodos,
    completedTodos,
    reflection,
    completionRate,
  };
}
