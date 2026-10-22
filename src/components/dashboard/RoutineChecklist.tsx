import React, { useState } from 'react';
import { useRoutines } from '../../context/RoutinesContext';
import type { TimeOfDay, RoutineTask } from '../../types';
import {
  Check,
  Flame,
  Clock,
  Sun,
  Moon,
  Sparkles,
  BookOpen,
  Coffee,
  Heart,
  Activity,
  Droplets,
  Smile,
  Feather,
  Music,
  Plus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface RoutineChecklistProps {
  onOpenAddModal: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Sun,
  Moon,
  Sparkles,
  BookOpen,
  Coffee,
  Heart,
  Activity,
  Droplets,
  Smile,
  Feather,
  Flame,
  Music,
};

export const RoutineChecklist: React.FC<RoutineChecklistProps> = ({ onOpenAddModal }) => {
  const {
    routines,
    todayStr,
    toggleRoutineCompletion,
    toggleTaskCompletion,
    isRoutineCompletedOnDate,
    isTaskCompletedOnDate,
  } = useRoutines();

  // Track expanded state for routines with sub-tasks
  const [expandedRoutines, setExpandedRoutines] = useState<Record<string, boolean>>({});

  const toggleExpand = (routineId: string) => {
    setExpandedRoutines(prev => ({
      ...prev,
      [routineId]: !prev[routineId],
    }));
  };

  const todayDayOfWeek = new Date().getDay();
  const scheduledToday = routines.filter(r => r.daysOfWeek.includes(todayDayOfWeek));

  const timeGroups: { id: TimeOfDay; label: string; icon: string }[] = [
    { id: 'morning', label: 'Morning Rituals', icon: '☀️' },
    { id: 'afternoon', label: 'Afternoon Flow', icon: '🌿' },
    { id: 'evening', label: 'Evening Unwind', icon: '🌙' },
    { id: 'anytime', label: 'Anytime Habits', icon: '✨' },
  ];

  return (
    <div className="card" style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '2px' }}>
            Today's Rituals
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Check off individual steps as your day gently unfolds.
          </p>
        </div>
        <button onClick={onOpenAddModal} className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)' }}>
          <Plus size={16} />
          <span>New Routine</span>
        </button>
      </div>

      {scheduledToday.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '36px 16px',
            backgroundColor: 'var(--bg-canvas-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--card-border)',
          }}
        >
          <p style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '6px', fontFamily: 'var(--font-heading)' }}>
            No routines scheduled for today
          </p>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Begin by creating a custom routine or loading a starter template.
          </p>
          <button onClick={onOpenAddModal} className="btn btn-primary btn-sm">
            <Plus size={14} />
            <span>Create First Routine</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {timeGroups.map(group => {
            const groupRoutines = scheduledToday.filter(r => r.timeOfDay === group.id);
            if (groupRoutines.length === 0) return null;

            return (
              <div key={group.id}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '10px',
                    paddingLeft: '4px',
                  }}
                >
                  <span>{group.icon}</span>
                  <span>{group.label}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {groupRoutines.map(routine => {
                    const isDone = isRoutineCompletedOnDate(routine, todayStr);
                    const IconComponent = ICON_MAP[routine.icon] || Sparkles;
                    const tasksList = routine.tasks || [];
                    const completedTasksCount = tasksList.filter(t => isTaskCompletedOnDate(t, todayStr)).length;
                    const totalTasks = tasksList.length;
                    const isExpanded = expandedRoutines[routine.id] !== false; // expanded by default

                    return (
                      <div
                        key={routine.id}
                        style={{
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: isDone ? 'rgba(217, 155, 170, 0.08)' : 'var(--card-bg)',
                          border: isDone
                            ? '1px solid rgba(217, 155, 170, 0.35)'
                            : '1px solid var(--card-border)',
                          overflow: 'hidden',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {/* Routine Header Row */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            cursor: 'pointer',
                          }}
                          onClick={() => toggleRoutineCompletion(routine.id, todayStr)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                            {/* Circle Checkbox */}
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                toggleRoutineCompletion(routine.id, todayStr);
                              }}
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                border: isDone ? 'none' : '1.8px solid var(--primary)',
                                backgroundColor: isDone ? 'var(--primary)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#FFFFFF',
                                flexShrink: 0,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: isDone ? '0 2px 6px rgba(217, 155, 170, 0.45)' : 'none',
                              }}
                              aria-label="Toggle routine completion"
                            >
                              {isDone && <Check size={14} strokeWidth={3} />}
                            </button>

                            {/* Icon */}
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: isDone ? 'var(--card-bg)' : 'var(--bg-canvas-subtle)',
                                color: 'var(--primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <IconComponent size={16} />
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  fontSize: '0.94rem',
                                  fontWeight: 500,
                                  color: isDone ? 'var(--text-muted)' : 'var(--text-main)',
                                  textDecoration: isDone ? 'line-through' : 'none',
                                }}
                              >
                                {routine.title}
                              </div>
                              {routine.description && (
                                <div
                                  style={{
                                    fontSize: '0.78rem',
                                    color: 'var(--text-light)',
                                    marginTop: '2px',
                                  }}
                                >
                                  {routine.description}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Meta: Streak, Task count, and Expand toggle */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {totalTasks > 0 && (
                              <span
                                style={{
                                  fontSize: '0.74rem',
                                  color: isDone ? 'var(--primary)' : 'var(--text-muted)',
                                  fontWeight: 600,
                                  backgroundColor: 'var(--bg-canvas-subtle)',
                                  padding: '2px 8px',
                                  borderRadius: 'var(--radius-pill)',
                                }}
                              >
                                {completedTasksCount}/{totalTasks} steps
                              </span>
                            )}

                            <span
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px',
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-pill)',
                                backgroundColor: routine.streak > 0 ? 'var(--primary-light)' : 'var(--tag-bg)',
                                color: routine.streak > 0 ? 'var(--primary)' : 'var(--text-light)',
                                fontSize: '0.74rem',
                                fontWeight: 600,
                              }}
                            >
                              <Flame size={12} fill={routine.streak > 0 ? 'currentColor' : 'none'} />
                              <span>{routine.streak}d</span>
                            </span>

                            {totalTasks > 0 && (
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  toggleExpand(routine.id);
                                }}
                                style={{ padding: '4px', color: 'var(--text-muted)', cursor: 'pointer' }}
                                aria-label="Toggle steps"
                              >
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Individual Tasks List (Expandable) */}
                        {totalTasks > 0 && isExpanded && (
                          <div
                            style={{
                              padding: '8px 16px 14px 48px',
                              borderTop: '1px solid rgba(217, 155, 170, 0.12)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                              backgroundColor: 'rgba(255, 255, 255, 0.5)',
                            }}
                          >
                            {tasksList.map((task: RoutineTask) => {
                              const isTaskDone = isTaskCompletedOnDate(task, todayStr);
                              return (
                                <div
                                  key={task.id}
                                  onClick={e => {
                                    e.stopPropagation();
                                    toggleTaskCompletion(routine.id, task.id, todayStr);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '6px 10px',
                                    borderRadius: 'var(--radius-sm)',
                                    backgroundColor: isTaskDone ? 'var(--primary-light)' : 'var(--card-bg)',
                                    border: '1px solid var(--card-border)',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div
                                      style={{
                                        width: '16px',
                                        height: '16px',
                                        borderRadius: '4px',
                                        border: isTaskDone ? 'none' : '1.5px solid var(--primary)',
                                        backgroundColor: isTaskDone ? 'var(--primary)' : 'transparent',
                                        color: '#FFFFFF',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                      }}
                                    >
                                      {isTaskDone && <Check size={11} strokeWidth={3} />}
                                    </div>
                                    <span
                                      style={{
                                        fontSize: '0.84rem',
                                        color: isTaskDone ? 'var(--text-muted)' : 'var(--text-main)',
                                        textDecoration: isTaskDone ? 'line-through' : 'none',
                                      }}
                                    >
                                      {task.title}
                                    </span>
                                  </div>

                                  {task.time && (
                                    <span
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '3px',
                                        fontSize: '0.7rem',
                                        color: 'var(--text-muted)',
                                      }}
                                    >
                                      <Clock size={11} />
                                      <span>{task.time}</span>
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
