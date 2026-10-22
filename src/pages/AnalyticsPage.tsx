import React, { useState } from 'react';
import { useRoutines } from '../context/RoutinesContext';
import { useTodos } from '../context/TodosContext';
import { useReflection, MOOD_OPTIONS } from '../context/ReflectionContext';
import {
  getPeriodicRates,
  getSevenDayActivityChart,
  getMonthCalendarData,
  getTodoAnalytics,
  getDayInspectorData,
  calculateRoutineCurrentStreak,
  calculateRoutineLongestStreak,
  formatDateStr,
  parseDateStr,
} from '../utils/analyticsUtils';
import type { Routine } from '../types';
import {
  Flame,
  CheckCircle2,
  Calendar as CalendarIcon,
  BookHeart,
  TrendingUp,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Clock,
  BarChart3,
  ListTodo,
  Check,
  Search,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { routines, todayStr } = useRoutines();
  const { todos } = useTodos();
  const { reflections } = useReflection();

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'routines' | 'todos' | 'journal'>('overview');

  // Month Calendar View State
  const todayDate = parseDateStr(todayStr);
  const [viewYear, setViewYear] = useState<number>(todayDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(todayDate.getMonth()); // 0-indexed

  // Selected Date Inspector state
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Selected Routine for drill-down
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>(
    routines.length > 0 ? routines[0].id : ''
  );

  // Search filter for Journal reflections
  const [journalSearch, setJournalSearch] = useState('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string>('all');

  // Compute metrics
  const periodicRates = getPeriodicRates(routines, todayStr);
  const sevenDayChart = getSevenDayActivityChart(routines, todayStr);
  const calendarDays = getMonthCalendarData(viewYear, viewMonth, routines, todayStr);
  const todoAnalytics = getTodoAnalytics(todos, todayStr);
  const dayInspector = getDayInspectorData(selectedDate, routines, todos, reflections, todayStr);

  const selectedRoutine: Routine | undefined = routines.find(r => r.id === selectedRoutineId) || routines[0];

  // Month navigation
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const handleJumpToCurrentMonth = () => {
    setViewYear(todayDate.getFullYear());
    setViewMonth(todayDate.getMonth());
    setSelectedDate(todayStr);
  };

  // Day step navigation
  const handleStepDay = (step: number) => {
    const d = parseDateStr(selectedDate);
    d.setDate(d.getDate() + step);
    const nextDateStr = formatDateStr(d);
    setSelectedDate(nextDateStr);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const monthName = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Filter journal reflections
  const reflectionEntries = Object.values(reflections)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .filter(entry => {
      const matchesMood = selectedMoodFilter === 'all' || entry.mood === selectedMoodFilter;
      const matchesSearch =
        !journalSearch.trim() ||
        (entry.response && entry.response.toLowerCase().includes(journalSearch.toLowerCase())) ||
        (entry.gratitudeNote && entry.gratitudeNote.toLowerCase().includes(journalSearch.toLowerCase())) ||
        entry.date.includes(journalSearch);
      return matchesMood && matchesSearch;
    });

  return (
    <div className="animate-fade-in" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--text-main)', marginBottom: '4px' }}>
            Progress & Analytics Sanctuary
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
            Real metrics derived from your actual daily steps, streaks, and reflections.
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: 'var(--radius-pill)',
            padding: '4px',
            gap: '3px',
            flexWrap: 'wrap',
          }}
        >
          {(
            [
              { id: 'overview', label: 'Overview & Calendar', icon: BarChart3 },
              { id: 'routines', label: 'Routine History', icon: Sparkles },
              { id: 'todos', label: 'To-Do Insights', icon: ListTodo },
              { id: 'journal', label: `Journal (${reflectionEntries.length})`, icon: BookHeart },
            ] as const
          ).map(tab => {
            const isActive = activeTab === tab.id;
            const IconComp = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 600 : 400,
                  backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <IconComp size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. OVERVIEW & CALENDAR TAB */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Top 4 Performance Cards (Daily, Weekly, Monthly, Streak) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
            {/* Daily Completion Rate */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Today's Rate
                  </span>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>
                    Scheduled rituals today
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                {periodicRates.dailyRate}%
              </div>
            </div>

            {/* Weekly Completion Rate */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--secondary-light)',
                    color: 'var(--secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TrendingUp size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                    7-Day Rate
                  </span>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>
                    Last 7 days completed
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                {periodicRates.weeklyRate}%
              </div>
            </div>

            {/* Monthly Completion Rate */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-light)',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CalendarIcon size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                    30-Day Rate
                  </span>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>
                    Past month fulfillment
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                {periodicRates.monthlyRate}%
              </div>
            </div>

            {/* Streaks & Lifetime Completions */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Flame size={18} fill="currentColor" />
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Longest Streak
                  </span>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>
                    {periodicRates.totalCompletionsAllTime} lifetime completions
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                {periodicRates.highestStreak} <span style={{ fontSize: '1rem', fontWeight: 500 }}>days</span>
              </div>
            </div>
          </div>

          {/* 7-Day Activity Chart */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '2px' }}>
                  7-Day Ritual Activity Chart
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  Task completion volume across the past seven days.
                </p>
              </div>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-canvas-subtle)', padding: '4px 10px', borderRadius: 'var(--radius-pill)' }}>
                Hover or click any bar to inspect
              </span>
            </div>

            {/* Visual Bar Chart */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '12px',
                alignItems: 'flex-end',
                height: '180px',
                paddingTop: '20px',
                borderBottom: '1px solid var(--card-border)',
                paddingBottom: '12px',
              }}
            >
              {sevenDayChart.map(point => {
                const heightPct = Math.max(8, point.rate);
                const isSelected = selectedDate === point.dateStr;

                return (
                  <div
                    key={point.dateStr}
                    onClick={() => setSelectedDate(point.dateStr)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: '100%',
                      justifyContent: 'flex-end',
                      cursor: 'pointer',
                    }}
                    title={`${point.dayLabel} (${point.dateStr}): ${point.rate}% completed (${point.completedTasks}/${point.scheduledTasks} tasks)`}
                  >
                    <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                      {point.rate}%
                    </span>

                    {/* Bar track */}
                    <div
                      style={{
                        width: '100%',
                        maxWidth: '44px',
                        height: `${heightPct}%`,
                        backgroundColor: isSelected
                          ? 'var(--primary)'
                          : point.rate >= 80
                          ? 'var(--primary)'
                          : point.rate > 0
                          ? 'var(--primary-light)'
                          : 'var(--bg-canvas-subtle)',
                        borderRadius: '6px 6px 2px 2px',
                        border: isSelected ? '2px solid var(--text-main)' : '1px solid var(--card-border)',
                        transition: 'all 0.25s ease',
                      }}
                    />

                    {/* Label */}
                    <div style={{ marginTop: '8px', textAlign: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: point.isToday ? 700 : 500,
                          color: point.isToday ? 'var(--primary)' : 'var(--text-main)',
                          display: 'block',
                        }}
                      >
                        {point.dayLabel}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-light)' }}>
                        {point.formattedDate}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Month Calendar Grid with Date Inspector */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
              gap: '20px',
              alignItems: 'start',
            }}
            className="theme-studio-columns"
          >
            {/* Calendar Card */}
            <div className="card">
              {/* Calendar Controls */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>{monthName}</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Click any day to inspect historical habits
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={handleJumpToCurrentMonth}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.76rem', padding: '4px 10px' }}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="btn btn-icon btn-outline"
                    style={{ width: '30px', height: '30px' }}
                    aria-label="Previous Month"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="btn btn-icon btn-outline"
                    style={{ width: '30px', height: '30px' }}
                    aria-label="Next Month"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Day of Week Headers */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  marginBottom: '8px',
                }}
              >
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} style={{ padding: '4px 0' }}>{d}</div>
                ))}
              </div>

              {/* 35/42 Cell Calendar Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '6px',
                }}
              >
                {calendarDays.map((cell, idx) => {
                  const isSelected = selectedDate === cell.dateStr;

                  const getCellBg = () => {
                    if (cell.isFuture) return 'transparent';
                    if (cell.status === 'complete') return 'var(--primary)';
                    if (cell.status === 'partial') return 'var(--primary-light)';
                    if (cell.status === 'rest') return 'transparent';
                    return 'rgba(0,0,0,0.03)';
                  };

                  const getCellTextColor = () => {
                    if (cell.status === 'complete') return '#FFFFFF';
                    if (!cell.isCurrentMonth) return 'var(--text-light)';
                    return 'var(--text-main)';
                  };

                  return (
                    <button
                      key={`${cell.dateStr}-${idx}`}
                      type="button"
                      onClick={() => setSelectedDate(cell.dateStr)}
                      style={{
                        aspectRatio: '1',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: getCellBg(),
                        border: isSelected
                          ? '2px solid var(--text-main)'
                          : cell.isToday
                          ? '1.8px solid var(--primary)'
                          : '1px solid var(--card-border)',
                        color: getCellTextColor(),
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: '4px',
                        opacity: cell.isCurrentMonth ? 1 : 0.45,
                        transition: 'transform 0.15s ease',
                        position: 'relative',
                      }}
                      title={`${cell.dateStr}: ${cell.status} (${cell.rate}%)`}
                    >
                      <span style={{ fontSize: '0.82rem', fontWeight: cell.isToday ? 700 : 500 }}>
                        {cell.dayNum}
                      </span>
                      {cell.rate > 0 && !cell.isFuture && (
                        <span
                          style={{
                            fontSize: '0.62rem',
                            fontWeight: 600,
                            lineHeight: 1,
                            marginTop: '2px',
                          }}
                        >
                          {cell.rate}%
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Calendar Legend */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '14px',
                  marginTop: '16px',
                  fontSize: '0.74rem',
                  color: 'var(--text-muted)',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--primary)' }} />
                  <span>100% Completed</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--primary-light)', border: '1px solid var(--card-border)' }} />
                  <span>Partial (&gt;0%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'transparent', border: '1.8px solid var(--primary)' }} />
                  <span>Today</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'transparent', border: '1px solid var(--card-border)' }} />
                  <span>Rest / Unscheduled</span>
                </div>
              </div>
            </div>

            {/* Date Inspector Panel */}
            <div className="card" style={{ border: '2px solid var(--primary)' }}>
              {/* Day Selector Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: 'var(--primary)',
                  }}
                >
                  Date Record Inspector
                </span>

                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => handleStepDay(-1)}
                    className="btn btn-icon btn-ghost btn-sm"
                    style={{ width: '26px', height: '26px' }}
                    title="Previous Day"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStepDay(1)}
                    className="btn btn-icon btn-ghost btn-sm"
                    style={{ width: '26px', height: '26px' }}
                    title="Next Day"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Selected Date Title */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '2px' }}>
                  {dayInspector.formattedDate}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '0.74rem',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: dayInspector.isToday
                        ? 'var(--primary-light)'
                        : dayInspector.isFuture
                        ? 'var(--bg-canvas-subtle)'
                        : 'var(--secondary-light)',
                      color: dayInspector.isToday ? 'var(--primary)' : 'var(--text-main)',
                      fontWeight: 600,
                    }}
                  >
                    {dayInspector.isToday ? 'Today' : dayInspector.isFuture ? 'Future Date' : 'Historical Record'}
                  </span>
                  {!dayInspector.isFuture && (
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>
                      {dayInspector.completionRate}% Fulfilled
                    </span>
                  )}
                </div>
              </div>

              {/* Scheduled Routines on this date */}
              <div style={{ marginBottom: '18px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                  Scheduled Routines ({dayInspector.scheduledRoutines.length})
                </span>

                {dayInspector.scheduledRoutines.length === 0 ? (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', margin: 0 }}>
                    No routines were scheduled for this day of the week.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {dayInspector.scheduledRoutines.map(({ routine, isFullyCompleted, completedTasksCount, totalTasksCount }) => (
                      <div
                        key={routine.id}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isFullyCompleted ? 'rgba(217, 155, 170, 0.08)' : 'var(--bg-canvas)',
                          border: '1px solid var(--card-border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              backgroundColor: isFullyCompleted ? 'var(--primary)' : 'transparent',
                              border: isFullyCompleted ? 'none' : '1.5px solid var(--primary)',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {isFullyCompleted && <Check size={11} strokeWidth={3} />}
                          </div>
                          <span style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 500 }}>
                            {routine.title}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {completedTasksCount}/{totalTasksCount} tasks
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* To-dos due / completed on this date */}
              <div style={{ marginBottom: '18px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                  To-Dos & Tasks ({dayInspector.dueTodos.length})
                </span>
                {dayInspector.dueTodos.length === 0 ? (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', margin: 0 }}>
                    No to-do tasks scheduled on this date.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {dayInspector.dueTodos.map(todo => (
                      <div
                        key={todo.id}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-canvas)',
                          border: '1px solid var(--card-border)',
                          fontSize: '0.82rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span
                          style={{
                            color: todo.completed ? 'var(--text-muted)' : 'var(--text-main)',
                            textDecoration: todo.completed ? 'line-through' : 'none',
                          }}
                        >
                          {todo.title}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {todo.completed ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Daily Reflection on this date */}
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                  Reflection Entry
                </span>
                {dayInspector.reflection ? (
                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-canvas-subtle)',
                      borderLeft: '3px solid var(--primary)',
                    }}
                  >
                    {dayInspector.reflection.response && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', margin: '0 0 6px', fontStyle: 'italic' }}>
                        "{dayInspector.reflection.response}"
                      </p>
                    )}
                    {dayInspector.reflection.gratitudeNote && (
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'block' }}>
                        <strong>Grateful for:</strong> {dayInspector.reflection.gratitudeNote}
                      </span>
                    )}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', margin: 0 }}>
                    No journal reflection recorded for this day.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ROUTINE HISTORY DRILL-DOWN TAB */}
      {/* ========================================================================= */}
      {activeTab === 'routines' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {routines.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px 16px' }}>
              <Sparkles size={36} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>No Routines Created</h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                Create your first routine in My Routines to start tracking historical streaks and task stats.
              </p>
            </div>
          ) : (
            <>
              {/* Routine Selector Dropdown / Pills */}
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  overflowX: 'auto',
                  paddingBottom: '8px',
                }}
              >
                {routines.map(r => {
                  const isSelected = selectedRoutineId === r.id;
                  const currentStreak = calculateRoutineCurrentStreak(r, todayStr);

                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRoutineId(r.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: '0.86rem',
                        fontWeight: isSelected ? 600 : 400,
                        backgroundColor: isSelected ? 'var(--primary)' : 'var(--card-bg)',
                        color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                        border: '1px solid var(--card-border)',
                        boxShadow: isSelected ? '0 4px 12px rgba(217, 155, 170, 0.35)' : 'none',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span>{r.title}</span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '1px 6px',
                          borderRadius: '999px',
                          backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--bg-canvas-subtle)',
                        }}
                      >
                        {currentStreak}d streak
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Routine Deep Dive Card */}
              {selectedRoutine && (
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 600 }}>
                          {selectedRoutine.category}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>•</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Created {selectedRoutine.createdAt ? selectedRoutine.createdAt.slice(0, 10) : 'Earlier'}
                        </span>
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--text-main)' }}>
                        {selectedRoutine.title}
                      </h3>
                      {selectedRoutine.description && (
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {selectedRoutine.description}
                        </p>
                      )}
                    </div>

                    {/* Routine Streaks */}
                    <div style={{ display: 'flex', gap: '14px' }}>
                      <div style={{ textAlign: 'center', padding: '10px 16px', backgroundColor: 'var(--bg-canvas-subtle)', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>CURRENT STREAK</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                          {calculateRoutineCurrentStreak(selectedRoutine, todayStr)}d
                        </div>
                      </div>
                      <div style={{ textAlign: 'center', padding: '10px 16px', backgroundColor: 'var(--bg-canvas-subtle)', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>BEST STREAK</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                          {calculateRoutineLongestStreak(selectedRoutine)}d
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subtask Breakdown */}
                  <div>
                    <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '12px' }}>
                      Task Sequence & Completion Statistics
                    </h4>
                    {(!selectedRoutine.tasks || selectedRoutine.tasks.length === 0) ? (
                      <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                        No sub-tasks configured for this routine.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {selectedRoutine.tasks.map((task, idx) => {
                          const completedDatesCount = task.completedDates ? task.completedDates.length : 0;
                          return (
                            <div
                              key={task.id || idx}
                              style={{
                                padding: '12px 16px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: 'var(--bg-canvas)',
                                border: '1px solid var(--card-border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                  #{idx + 1}
                                </span>
                                <div>
                                  <div style={{ fontSize: '0.92rem', fontWeight: 500, color: 'var(--text-main)' }}>
                                    {task.title}
                                  </div>
                                  {task.time && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <Clock size={11} />
                                      <span>{task.time}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                                {completedDatesCount} total completions
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TO-DO INSIGHTS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'todos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Top 4 To-Do Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}
          >
            <div className="card">
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Total Tasks
              </span>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px', fontFamily: 'var(--font-heading)' }}>
                {todoAnalytics.total}
              </div>
            </div>

            <div className="card">
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Completed Tasks
              </span>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)', marginTop: '4px', fontFamily: 'var(--font-heading)' }}>
                {todoAnalytics.completed}
              </div>
            </div>

            <div className="card">
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Overall Completion
              </span>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px', fontFamily: 'var(--font-heading)' }}>
                {todoAnalytics.completionRate}%
              </div>
            </div>

            <div className="card">
              <span style={{ fontSize: '0.78rem', color: 'var(--danger)', fontWeight: 600, textTransform: 'uppercase' }}>
                Overdue Tasks
              </span>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--danger)', marginTop: '4px', fontFamily: 'var(--font-heading)' }}>
                {todoAnalytics.overdue}
              </div>
            </div>
          </div>

          {/* Breakdown by Category and Priority */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="theme-studio-columns">
            {/* Category Breakdown */}
            <div className="card">
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '16px' }}>
                Completion by Category & List
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {Object.entries(todoAnalytics.categoryBreakdown).map(([cat, data]) => (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {cat}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {data.completed}/{data.total} ({data.rate}%)
                      </span>
                    </div>
                    <div
                      style={{
                        height: '7px',
                        backgroundColor: 'var(--bg-canvas-subtle)',
                        borderRadius: '999px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${data.rate}%`,
                          backgroundColor: 'var(--primary)',
                          borderRadius: '999px',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Priority Breakdown */}
            <div className="card">
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '16px' }}>
                Completion by Priority
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {(
                  [
                    { id: 'high', label: 'High Priority', color: 'var(--danger)', data: todoAnalytics.priorityBreakdown.high },
                    { id: 'medium', label: 'Medium Priority', color: 'var(--primary)', data: todoAnalytics.priorityBreakdown.medium },
                    { id: 'low', label: 'Low (Gentle)', color: 'var(--secondary)', data: todoAnalytics.priorityBreakdown.low },
                  ] as const
                ).map(p => {
                  const rate = p.data.total > 0 ? Math.round((p.data.completed / p.data.total) * 100) : 0;
                  return (
                    <div key={p.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.86rem', fontWeight: 600, color: p.color }}>
                          {p.label}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {p.data.completed}/{p.data.total} ({rate}%)
                        </span>
                      </div>
                      <div
                        style={{
                          height: '7px',
                          backgroundColor: 'var(--bg-canvas-subtle)',
                          borderRadius: '999px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${rate}%`,
                            backgroundColor: p.color,
                            borderRadius: '999px',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. REFLECTION JOURNAL TAB */}
      {/* ========================================================================= */}
      {activeTab === 'journal' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Filter Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            {/* Mood selector */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setSelectedMoodFilter('all')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.8rem',
                  fontWeight: selectedMoodFilter === 'all' ? 600 : 400,
                  backgroundColor: selectedMoodFilter === 'all' ? 'var(--primary)' : 'var(--card-bg)',
                  color: selectedMoodFilter === 'all' ? '#FFFFFF' : 'var(--text-main)',
                  border: '1px solid var(--card-border)',
                  cursor: 'pointer',
                }}
              >
                All Moods
              </button>
              {MOOD_OPTIONS.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMoodFilter(m.id)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.8rem',
                    fontWeight: selectedMoodFilter === 'm.id' ? 600 : 400,
                    backgroundColor: selectedMoodFilter === m.id ? 'var(--primary)' : 'var(--card-bg)',
                    color: selectedMoodFilter === m.id ? '#FFFFFF' : 'var(--text-main)',
                    border: '1px solid var(--card-border)',
                    cursor: 'pointer',
                  }}
                >
                  <span>{m.emoji}</span> {m.label}
                </button>
              ))}
            </div>

            {/* Keyword Search */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                borderRadius: 'var(--radius-pill)',
                padding: '6px 14px',
                width: '100%',
                maxWidth: '260px',
              }}
            >
              <Search size={15} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search reflections..."
                value={journalSearch}
                onChange={e => setJournalSearch(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: '0.84rem',
                  color: 'var(--text-main)',
                  width: '100%',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Entries List */}
          {reflectionEntries.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px 16px' }}>
              <BookHeart size={36} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                No Journal Entries Match
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                Fill out daily reflections on your Dashboard to preserve your thoughts and gratitude.
              </p>
            </div>
          ) : (
            reflectionEntries.map(entry => {
              const moodObj = MOOD_OPTIONS.find(m => m.id === entry.mood);
              return (
                <div key={entry.date} className="card card-hover">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CalendarIcon size={15} color="var(--primary)" />
                      <span style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {entry.date}
                      </span>
                    </div>

                    {moodObj && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-pill)',
                          backgroundColor: 'var(--primary-light)',
                          color: 'var(--primary)',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                        }}
                      >
                        <span>{moodObj.emoji}</span>
                        <span>{moodObj.label}</span>
                      </span>
                    )}
                  </div>

                  {entry.prompt && (
                    <div
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontStyle: 'italic',
                        fontSize: '0.96rem',
                        color: 'var(--text-main)',
                        marginBottom: '8px',
                      }}
                    >
                      "{entry.prompt}"
                    </div>
                  )}

                  {entry.response && (
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '12px' }}>
                      {entry.response}
                    </p>
                  )}

                  {entry.gratitudeNote && (
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-canvas-subtle)',
                        borderLeft: '3px solid var(--primary)',
                        fontSize: '0.84rem',
                        color: 'var(--text-main)',
                      }}
                    >
                      <strong>Grateful for: </strong> {entry.gratitudeNote}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
