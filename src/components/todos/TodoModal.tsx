import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import type { Todo, TodoPriority } from '../../types';

interface TodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (todoData: { title: string; category?: string; priority?: TodoPriority; dueDate?: string; description?: string }) => void;
  initialData?: Todo | null;
  availableCategories?: string[];
}

const DEFAULT_CATEGORIES = ['Personal', 'Work', 'Wellness', 'Study', 'Creative'];
const PRIORITIES: { id: TodoPriority; label: string; color: string }[] = [
  { id: 'low', label: 'Gentle (Low)', color: 'var(--secondary)' },
  { id: 'medium', label: 'Important (Med)', color: 'var(--primary)' },
  { id: 'high', label: 'Priority (High)', color: 'var(--danger)' },
];

export const TodoModal: React.FC<TodoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  availableCategories,
}) => {
  const categoryList = availableCategories && availableCategories.length > 0 ? availableCategories : DEFAULT_CATEGORIES;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Personal');
  const [priority, setPriority] = useState<TodoPriority>('medium');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setCategory(initialData.category || 'Personal');
      setPriority(initialData.priority || 'medium');
      setDueDate(initialData.dueDate || '');
    } else {
      setTitle('');
      setDescription('');
      setCategory('Personal');
      setPriority('medium');
      setDueDate(new Date().toISOString().split('T')[0]);
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      priority,
      dueDate: dueDate || undefined,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Task' : 'Add to Your To-Do List'}
      subtitle="Keep your day lightweight and intentional."
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
            Task Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Replenish bath salts or mail letter"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--card-border)',
              backgroundColor: 'var(--bg-canvas)',
              fontSize: '0.92rem',
              color: 'var(--text-main)',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
            Notes or Link
          </label>
          <input
            type="text"
            placeholder="Add any helpful details"
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--card-border)',
              backgroundColor: 'var(--bg-canvas)',
              fontSize: '0.9rem',
              color: 'var(--text-main)',
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--card-border)',
                backgroundColor: 'var(--bg-canvas)',
                fontSize: '0.88rem',
                color: 'var(--text-main)',
              }}
            >
              {categoryList.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--card-border)',
                backgroundColor: 'var(--bg-canvas)',
                fontSize: '0.88rem',
                color: 'var(--text-main)',
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
            Priority
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {PRIORITIES.map(p => {
              const isSelected = priority === p.id;
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPriority(p.id)}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: isSelected ? `2px solid ${p.color}` : '1px solid var(--card-border)',
                    backgroundColor: isSelected ? 'var(--bg-canvas-subtle)' : 'var(--bg-canvas)',
                    color: 'var(--text-main)',
                    fontSize: '0.8rem',
                    fontWeight: isSelected ? 600 : 400,
                    textAlign: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
          <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm">
            {initialData ? 'Save Changes' : 'Add Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
