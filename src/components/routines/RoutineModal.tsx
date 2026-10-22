import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import type { Routine, RoutineCategory, TimeOfDay, RoutineTask } from '../../types';
import { STARTER_ROUTINE_TEMPLATES } from '../../services/templates';
import {
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
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Clock,
  Layers,
} from 'lucide-react';

interface RoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (routineData: Omit<Routine, 'id' | 'createdAt' | 'streak' | 'bestStreak' | 'completedDates' | 'order'>) => void;
  initialData?: Routine | null;
}

const AVAILABLE_ICONS = [
  { name: 'Sun', component: Sun },
  { name: 'Moon', component: Moon },
  { name: 'Sparkles', component: Sparkles },
  { name: 'BookOpen', component: BookOpen },
  { name: 'Coffee', component: Coffee },
  { name: 'Heart', component: Heart },
  { name: 'Activity', component: Activity },
  { name: 'Droplets', component: Droplets },
  { name: 'Smile', component: Smile },
  { name: 'Feather', component: Feather },
  { name: 'Flame', component: Flame },
  { name: 'Music', component: Music },
];

const CATEGORIES: { id: RoutineCategory; label: string }[] = [
  { id: 'wellness', label: 'Wellness' },
  { id: 'mindfulness', label: 'Mindfulness' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'creativity', label: 'Creativity' },
  { id: 'selfcare', label: 'Self-Care' },
  { id: 'other', label: 'Other' },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const RoutineModal: React.FC<RoutineModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<RoutineCategory>('wellness');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [reminderTime, setReminderTime] = useState<string>('08:00');
  const [icon, setIcon] = useState<string>('Sparkles');

  // Sub-tasks state
  const [tasks, setTasks] = useState<RoutineTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setCategory(initialData.category);
      setTimeOfDay(initialData.timeOfDay);
      setDaysOfWeek(initialData.daysOfWeek);
      setReminderTime(initialData.reminderTime || '08:00');
      setIcon(initialData.icon || 'Sparkles');
      setTasks(initialData.tasks ? [...initialData.tasks] : []);
    } else {
      setTitle('');
      setDescription('');
      setCategory('wellness');
      setTimeOfDay('morning');
      setDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
      setReminderTime('08:00');
      setIcon('Sparkles');
      setTasks([]);
    }
    setNewTaskTitle('');
    setNewTaskTime('');
  }, [initialData, isOpen]);

  // Load a starter template into the builder form
  const handleLoadTemplate = (templateId: string) => {
    const template = STARTER_ROUTINE_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    setTitle(template.title);
    setDescription(template.description);
    setCategory(template.category);
    setTimeOfDay(template.timeOfDay);
    setIcon(template.icon);
    setDaysOfWeek([...template.daysOfWeek]);
    if (template.reminderTime) setReminderTime(template.reminderTime);

    // Convert template tasks into RoutineTasks while keeping existing completed history if any
    const populatedTasks: RoutineTask[] = template.tasks.map((t, idx) => ({
      id: 'task-' + Date.now() + '-' + idx,
      title: t.title,
      time: t.time,
      durationMinutes: t.durationMinutes,
      completedDates: [],
      order: idx,
    }));
    setTasks(populatedTasks);
  };

  const toggleDay = (dayIndex: number) => {
    setDaysOfWeek(prev =>
      prev.includes(dayIndex)
        ? prev.length > 1
          ? prev.filter(d => d !== dayIndex)
          : prev
        : [...prev, dayIndex].sort()
    );
  };

  // Sub-task actions
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: RoutineTask = {
      id: 'task-' + Date.now(),
      title: newTaskTitle.trim(),
      time: newTaskTime || undefined,
      completedDates: [],
      order: tasks.length,
    };

    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle('');
    setNewTaskTime('');
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId).map((t, idx) => ({ ...t, order: idx })));
  };

  const handleMoveTask = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === tasks.length - 1)) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...tasks];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    setTasks(reordered.map((t, idx) => ({ ...t, order: idx })));
  };

  const handleUpdateTaskTitle = (taskId: string, newTitle: string) => {
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, title: newTitle } : t)));
  };

  const handleUpdateTaskTime = (taskId: string, newTime: string) => {
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, time: newTime || undefined } : t)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // If no tasks were explicitly added, create one default task from the routine title
    const finalTasks: RoutineTask[] =
      tasks.length > 0
        ? tasks
        : [
            {
              id: 'task-' + Date.now(),
              title: title.trim(),
              time: reminderTime || undefined,
              completedDates: initialData?.completedDates || [],
              order: 0,
            },
          ];

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      timeOfDay,
      daysOfWeek,
      reminderTime: reminderTime || undefined,
      icon,
      tasks: finalTasks,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Routine & Tasks' : 'Custom Routine Builder'}
      subtitle="Craft a routine and organize its individual tasks with times and frequencies."
      maxWidth="620px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Template Quick Loader (for new routines or inspiration) */}
        {!initialData && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-canvas-subtle)',
              border: '1px dashed var(--card-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={16} color="var(--primary)" />
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Start with an editable template:
              </span>
            </div>
            <select
              defaultValue=""
              onChange={e => {
                if (e.target.value) handleLoadTemplate(e.target.value);
              }}
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--card-border)',
                backgroundColor: 'var(--card-bg)',
                fontSize: '0.82rem',
                color: 'var(--text-main)',
                cursor: 'pointer',
              }}
            >
              <option value="" disabled>
                Choose template...
              </option>
              {STARTER_ROUTINE_TEMPLATES.map(tmpl => (
                <option key={tmpl.id} value={tmpl.id}>
                  {tmpl.title} ({tmpl.tasks.length} tasks)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Title */}
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
            Routine Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Morning Awakening Ritual"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--card-border)',
              backgroundColor: 'var(--bg-canvas)',
              fontSize: '0.94rem',
              color: 'var(--text-main)',
            }}
          />
        </div>

        {/* Description */}
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
            Gentle Description / Intention
          </label>
          <input
            type="text"
            placeholder="e.g. Savoring stillness before the world awakens"
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--card-border)',
              backgroundColor: 'var(--bg-canvas)',
              fontSize: '0.88rem',
              color: 'var(--text-main)',
            }}
          />
        </div>

        {/* Routine Tasks Builder Section */}
        <div
          style={{
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-canvas-subtle)',
            border: '1px solid var(--card-border)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Routine Tasks ({tasks.length})
            </label>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Assign optional times & reorder
            </span>
          </div>

          {/* List of Tasks */}
          {tasks.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
              {tasks.map((task, idx) => (
                <div
                  key={task.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                  }}
                >
                  {/* Order number */}
                  <span
                    style={{
                      width: '20px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: 'var(--primary)',
                      textAlign: 'center',
                    }}
                  >
                    {idx + 1}.
                  </span>

                  {/* Title input */}
                  <input
                    type="text"
                    value={task.title}
                    onChange={e => handleUpdateTaskTitle(task.id, e.target.value)}
                    style={{
                      flex: 1,
                      border: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '0.88rem',
                      color: 'var(--text-main)',
                    }}
                  />

                  {/* Time input */}
                  <input
                    type="time"
                    value={task.time || ''}
                    onChange={e => handleUpdateTaskTime(task.id, e.target.value)}
                    style={{
                      padding: '3px 6px',
                      borderRadius: '4px',
                      border: '1px solid var(--card-border)',
                      backgroundColor: 'var(--bg-canvas)',
                      fontSize: '0.76rem',
                      color: 'var(--text-main)',
                    }}
                    title="Optional scheduled time"
                  />

                  {/* Reorder Up / Down */}
                  <button
                    type="button"
                    onClick={() => handleMoveTask(idx, 'up')}
                    disabled={idx === 0}
                    style={{
                      padding: '4px',
                      borderRadius: '4px',
                      color: idx === 0 ? 'var(--text-light)' : 'var(--text-muted)',
                      cursor: idx === 0 ? 'not-allowed' : 'pointer',
                    }}
                    title="Move task up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveTask(idx, 'down')}
                    disabled={idx === tasks.length - 1}
                    style={{
                      padding: '4px',
                      borderRadius: '4px',
                      color: idx === tasks.length - 1 ? 'var(--text-light)' : 'var(--text-muted)',
                      cursor: idx === tasks.length - 1 ? 'not-allowed' : 'pointer',
                    }}
                    title="Move task down"
                  >
                    <ArrowDown size={14} />
                  </button>

                  {/* Delete Task */}
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id)}
                    style={{ padding: '4px', color: 'var(--danger)', borderRadius: '4px', cursor: 'pointer' }}
                    title="Delete task"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              No individual tasks added yet. Add tasks below, or save now to use the routine title as a single task.
            </p>
          )}

          {/* Add Sub-task bar */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Add step/task (e.g. Drink lemon water)"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTask(e);
                }
              }}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--card-border)',
                backgroundColor: 'var(--card-bg)',
                fontSize: '0.86rem',
                color: 'var(--text-main)',
              }}
            />
            <input
              type="time"
              value={newTaskTime}
              onChange={e => setNewTaskTime(e.target.value)}
              style={{
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--card-border)',
                backgroundColor: 'var(--card-bg)',
                fontSize: '0.84rem',
                color: 'var(--text-main)',
              }}
              title="Optional time"
            />
            <button
              type="button"
              onClick={handleAddTask}
              className="btn btn-secondary btn-sm"
              disabled={!newTaskTitle.trim()}
            >
              <Plus size={14} />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Time of Day & Category */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              Time of Day
            </label>
            <select
              value={timeOfDay}
              onChange={e => setTimeOfDay(e.target.value as TimeOfDay)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--card-border)',
                backgroundColor: 'var(--bg-canvas)',
                fontSize: '0.88rem',
                color: 'var(--text-main)',
              }}
            >
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
              <option value="anytime">Anytime</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as RoutineCategory)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--card-border)',
                backgroundColor: 'var(--bg-canvas)',
                fontSize: '0.88rem',
                color: 'var(--text-main)',
              }}
            >
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Icon Selection */}
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
            Choose an Aesthetic Icon
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {AVAILABLE_ICONS.map(item => {
              const IconComp = item.component;
              const isSelected = icon === item.name;
              return (
                <button
                  type="button"
                  key={item.name}
                  onClick={() => setIcon(item.name)}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-sm)',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--card-border)',
                    backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-canvas)',
                    color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <IconComp size={18} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Days of Week */}
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
            Recurring Weekdays
          </label>
          <div style={{ display: 'flex', gap: '6px' }}>
            {DAYS.map((dayName, idx) => {
              const isSelected = daysOfWeek.includes(idx);
              return (
                <button
                  type="button"
                  key={dayName}
                  onClick={() => toggleDay(idx)}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: 'var(--radius-sm)',
                    border: isSelected ? '1px solid var(--primary)' : '1px solid var(--card-border)',
                    backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-canvas)',
                    color: isSelected ? '#FFFFFF' : 'var(--text-muted)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {dayName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Reminder Time */}
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
            Gentle Routine Reminder Time
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="var(--text-muted)" />
            <input
              type="time"
              value={reminderTime}
              onChange={e => setReminderTime(e.target.value)}
              style={{
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--card-border)',
                backgroundColor: 'var(--bg-canvas)',
                fontSize: '0.9rem',
                color: 'var(--text-main)',
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
          <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm">
            {initialData ? 'Save Changes' : 'Create Routine'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
