import React, { useState } from 'react';
import { useRoutines } from '../context/RoutinesContext';
import { RoutineModal } from '../components/routines/RoutineModal';
import { RoutineHistoryModal } from '../components/routines/RoutineHistoryModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { STARTER_ROUTINE_TEMPLATES } from '../services/templates';
import type { Routine, TimeOfDay, RoutineTemplate } from '../types';
import {
  Plus,
  Sparkles,
  Flame,
  Bell,
  Edit2,
  Trash2,
  Copy,
  History,
  Check,
  Sun,
  Moon,
  BookOpen,
  Coffee,
  Heart,
  Activity,
  Droplets,
  Smile,
  Feather,
  Music,
  ChevronDown,
  ChevronUp,
  Layers,
} from 'lucide-react';

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

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const RoutinesPage: React.FC = () => {
  const {
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
  } = useRoutines();

  const [activeTab, setActiveTab] = useState<'all' | TimeOfDay>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [historyRoutine, setHistoryRoutine] = useState<Routine | null>(null);
  const [deleteTargetRoutine, setDeleteTargetRoutine] = useState<Routine | null>(null);

  // Sub-task expand toggles
  const [expandedRoutines, setExpandedRoutines] = useState<Record<string, boolean>>({});

  const toggleExpand = (routineId: string) => {
    setExpandedRoutines(prev => ({ ...prev, [routineId]: !prev[routineId] }));
  };

  const tabs: { id: 'all' | TimeOfDay; label: string }[] = [
    { id: 'all', label: 'All Routines' },
    { id: 'morning', label: 'Morning' },
    { id: 'afternoon', label: 'Afternoon' },
    { id: 'evening', label: 'Evening' },
    { id: 'anytime', label: 'Anytime' },
  ];

  const categories = ['all', 'wellness', 'mindfulness', 'productivity', 'fitness', 'creativity', 'selfcare'];

  // Filter routines
  const filteredRoutines = routines.filter(r => {
    const matchesTab = activeTab === 'all' || r.timeOfDay === activeTab;
    const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;
    return matchesTab && matchesCategory;
  });

  const handleEdit = (routine: Routine) => {
    setEditingRoutine(routine);
    setIsModalOpen(true);
  };

  const handleSave = async (routineData: Omit<Routine, 'id' | 'createdAt' | 'streak' | 'bestStreak' | 'completedDates' | 'order'>) => {
    if (editingRoutine) {
      // Non-destructive update: preserve completedDates on routine and tasks!
      await updateRoutine(editingRoutine.id, {
        ...routineData,
        tasks: routineData.tasks.map((t, idx) => {
          const existingTask = (editingRoutine.tasks || []).find(oldT => oldT.id === t.id);
          return {
            ...t,
            completedDates: existingTask ? existingTask.completedDates : t.completedDates || [],
            order: idx,
          };
        }),
      });
    } else {
      await addRoutine(routineData);
    }
  };

  const handleLoadTemplate = async (templateId: string) => {
    const tmpl = STARTER_ROUTINE_TEMPLATES.find((t: RoutineTemplate) => t.id === templateId);
    if (!tmpl) return;

    await addRoutine({
      title: tmpl.title,
      description: tmpl.description,
      category: tmpl.category,
      timeOfDay: tmpl.timeOfDay,
      icon: tmpl.icon,
      daysOfWeek: tmpl.daysOfWeek,
      reminderTime: tmpl.reminderTime,
      tasks: tmpl.tasks.map((t, idx: number) => ({
        id: 'task-' + Date.now() + '-' + idx,
        title: t.title,
        time: t.time,
        durationMinutes: t.durationMinutes,
        completedDates: [],
        order: idx,
      })),
    });
  };

  // Generate last 7 days history array for mini dots
  const getLast7Days = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    });
  };

  const last7Days = getLast7Days();

  return (
    <div className="animate-fade-in" style={{ width: '100%', maxWidth: '1180px', margin: '0 auto' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--text-main)', marginBottom: '4px' }}>
            My Daily Routines
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
            Build, duplicate, and schedule conscious multi-task rituals.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Quick Template Menu */}
          <div style={{ position: 'relative' }}>
            <select
              defaultValue=""
              onChange={e => {
                if (e.target.value) {
                  handleLoadTemplate(e.target.value);
                  e.target.value = '';
                }
              }}
              className="btn btn-outline btn-sm"
              style={{
                cursor: 'pointer',
                paddingRight: '28px',
                appearance: 'auto',
              }}
            >
              <option value="" disabled>
                + Add Starter Template...
              </option>
              {STARTER_ROUTINE_TEMPLATES.map((t: RoutineTemplate) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setEditingRoutine(null);
              setIsModalOpen(true);
            }}
            className="btn btn-primary"
          >
            <Plus size={16} />
            <span>New Custom Routine</span>
          </button>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        {/* Time of Day Tabs */}
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: 'var(--radius-pill)',
            padding: '4px',
            gap: '4px',
          }}
        >
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 600 : 400,
                  backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {categories.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.76rem',
                  fontWeight: isSelected ? 600 : 400,
                  textTransform: 'capitalize',
                  border: isSelected ? '1px solid var(--secondary)' : '1px solid var(--card-border)',
                  backgroundColor: isSelected ? 'var(--secondary-light)' : 'var(--card-bg)',
                  color: isSelected ? 'var(--text-main)' : 'var(--text-muted)',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Routines Grid */}
      {filteredRoutines.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '56px 20px',
            backgroundColor: 'var(--bg-canvas-subtle)',
          }}
        >
          <Sparkles size={36} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '6px' }}>No rituals found</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            {routines.length === 0
              ? 'You have not created any routines yet. Start with a mindful starter template or build a custom routine.'
              : 'Try selecting a different filter or tab to view other routines.'}
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={() => handleLoadTemplate('template-morning')}
              className="btn btn-secondary btn-sm"
            >
              <Layers size={14} />
              <span>Load Morning Routine</span>
            </button>
            <button
              onClick={() => {
                setEditingRoutine(null);
                setIsModalOpen(true);
              }}
              className="btn btn-primary btn-sm"
            >
              <Plus size={14} />
              <span>Build Custom Routine</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '20px',
          }}
        >
          {filteredRoutines.map(routine => {
            const IconComp = ICON_MAP[routine.icon] || Sparkles;
            const isDoneToday = isRoutineCompletedOnDate(routine, todayStr);
            const tasksList = routine.tasks || [];
            const completedTodayCount = tasksList.filter(t => isTaskCompletedOnDate(t, todayStr)).length;
            const totalTasks = tasksList.length;
            const isExpanded = expandedRoutines[routine.id] !== false;

            return (
              <div
                key={routine.id}
                className="card card-hover"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderLeft: `4px solid var(--primary)`,
                }}
              >
                <div>
                  {/* Top Header: Icon, Title, Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--primary-light)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <IconComp size={20} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '2px' }}>
                          {routine.title}
                        </h4>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            fontWeight: 600,
                            color: 'var(--primary)',
                          }}
                        >
                          {routine.timeOfDay} • {routine.category}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons: Duplicate, History, Edit, Delete */}
                    <div style={{ display: 'flex', gap: '2px' }}>
                      <button
                        onClick={() => duplicateRoutine(routine.id)}
                        style={{ padding: '6px', color: 'var(--text-muted)', borderRadius: '4px' }}
                        title="Duplicate routine"
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        onClick={() => setHistoryRoutine(routine)}
                        style={{ padding: '6px', color: 'var(--text-muted)', borderRadius: '4px' }}
                        title="View completion history"
                      >
                        <History size={14} />
                      </button>
                      <button
                        onClick={() => handleEdit(routine)}
                        style={{ padding: '6px', color: 'var(--text-muted)', borderRadius: '4px' }}
                        title="Edit routine definition"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteTargetRoutine(routine)}
                        style={{ padding: '6px', color: 'var(--danger)', borderRadius: '4px' }}
                        title="Delete routine"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  {routine.description && (
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>
                      {routine.description}
                    </p>
                  )}

                  {/* Schedule badges */}
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
                    {DAYS.map((dayLabel, dayIndex) => {
                      const isActive = routine.daysOfWeek.includes(dayIndex);
                      return (
                        <div
                          key={dayIndex}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: isActive ? 'var(--primary-light)' : 'var(--bg-canvas)',
                            color: isActive ? 'var(--primary)' : 'var(--text-light)',
                            border: isActive ? '1px solid var(--primary)' : '1px solid var(--card-border)',
                          }}
                        >
                          {dayLabel}
                        </div>
                      );
                    })}
                  </div>

                  {/* Reminder Time Tag */}
                  {routine.reminderTime && (
                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Bell size={13} />
                        <span>Reminder: {routine.reminderTime}</span>
                      </span>
                    </div>
                  )}

                  {/* Routine Sub-tasks List (Interactive Checklist for Today) */}
                  {totalTasks > 0 && (
                    <div
                      style={{
                        marginBottom: '16px',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-canvas-subtle)',
                        border: '1px solid var(--card-border)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: isExpanded ? '8px' : '0',
                          cursor: 'pointer',
                        }}
                        onClick={() => toggleExpand(routine.id)}
                      >
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          Steps for Today ({completedTodayCount}/{totalTasks})
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {Math.round((completedTodayCount / totalTasks) * 100)}%
                          </span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          {tasksList.map(task => {
                            const isTaskDone = isTaskCompletedOnDate(task, todayStr);
                            return (
                              <div
                                key={task.id}
                                onClick={() => toggleTaskCompletion(routine.id, task.id, todayStr)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '5px 8px',
                                  borderRadius: '4px',
                                  backgroundColor: isTaskDone ? 'var(--primary-light)' : 'var(--card-bg)',
                                  border: '1px solid var(--card-border)',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <div
                                    style={{
                                      width: '14px',
                                      height: '14px',
                                      borderRadius: '3px',
                                      border: isTaskDone ? 'none' : '1.5px solid var(--primary)',
                                      backgroundColor: isTaskDone ? 'var(--primary)' : 'transparent',
                                      color: '#FFFFFF',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0,
                                    }}
                                  >
                                    {isTaskDone && <Check size={10} strokeWidth={3} />}
                                  </div>
                                  <span
                                    style={{
                                      fontSize: '0.8rem',
                                      color: isTaskDone ? 'var(--text-muted)' : 'var(--text-main)',
                                      textDecoration: isTaskDone ? 'line-through' : 'none',
                                    }}
                                  >
                                    {task.title}
                                  </span>
                                </div>

                                {task.time && (
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                    {task.time}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Bar: Mini 7-day dots, Streaks, and Today Check Button */}
                <div
                  style={{
                    paddingTop: '14px',
                    borderTop: '1px solid var(--card-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  {/* 7-day dot trail */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {last7Days.map(dateStr => {
                      const done = routine.completedDates.includes(dateStr);
                      const isToday = dateStr === todayStr;
                      return (
                        <div
                          key={dateStr}
                          title={`${dateStr}: ${done ? 'Completed' : 'Missed'}`}
                          style={{
                            width: isToday ? '10px' : '7px',
                            height: isToday ? '10px' : '7px',
                            borderRadius: '50%',
                            backgroundColor: done ? 'var(--primary)' : 'rgba(217, 155, 170, 0.25)',
                            border: isToday ? '1.5px solid var(--text-main)' : 'none',
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Streak & Today toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '0.76rem',
                        fontWeight: 600,
                        color: routine.streak > 0 ? 'var(--primary)' : 'var(--text-muted)',
                      }}
                    >
                      <Flame size={13} fill={routine.streak > 0 ? 'currentColor' : 'none'} />
                      <span>{routine.streak}d streak</span>
                    </span>

                    <button
                      onClick={() => toggleRoutineCompletion(routine.id, todayStr)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-pill)',
                        border: isDoneToday ? 'none' : '1px solid var(--primary)',
                        backgroundColor: isDoneToday ? 'var(--primary)' : 'transparent',
                        color: isDoneToday ? '#FFFFFF' : 'var(--primary)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Check size={13} strokeWidth={isDoneToday ? 3 : 2} />
                      <span>{isDoneToday ? 'Done' : 'Mark Done'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Routine Modal (Create / Edit) */}
      <RoutineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingRoutine}
      />

      {/* Past Completion Records Modal */}
      <RoutineHistoryModal
        isOpen={Boolean(historyRoutine)}
        onClose={() => setHistoryRoutine(null)}
        routine={historyRoutine}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetRoutine)}
        onClose={() => setDeleteTargetRoutine(null)}
        onConfirm={() => {
          if (deleteTargetRoutine) deleteRoutine(deleteTargetRoutine.id);
        }}
        title="Delete Routine"
        message={`Are you sure you want to delete "${deleteTargetRoutine?.title}"? This will permanently remove its scheduled tasks.`}
        confirmLabel="Yes, Delete Routine"
      />
    </div>
  );
};
