import React, { useState } from 'react';
import { useTodos } from '../context/TodosContext';
import { getTodayString } from '../context/RoutinesContext';
import { TodoModal } from '../components/todos/TodoModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Modal } from '../components/common/Modal';
import type { Todo, TodoPriority } from '../types';
import {
  Plus,
  Check,
  Calendar,
  Tag,
  Trash2,
  Edit2,
  Search,
  CheckSquare,
  AlertCircle,
  ArrowRight,
  FolderPlus,
  Clock,
  Sparkles,
} from 'lucide-react';

type FilterTab = 'today' | 'upcoming' | 'overdue' | 'completed' | 'all';

export const TodosPage: React.FC = () => {
  const {
    todos,
    categories,
    addCategory,
    addTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
    clearCompleted,
    carryForwardTask,
    carryForwardAllOverdue,
    overdueCount,
  } = useTodos();

  const todayStr = getTodayString();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [filterTab, setFilterTab] = useState<FilterTab>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickTitle, setQuickTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [todoToDelete, setTodoToDelete] = useState<Todo | null>(null);
  const [isNewListModalOpen, setIsNewListModalOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isCarryingForward, setIsCarryingForward] = useState(false);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    addTodo({
      title: quickTitle.trim(),
      category: activeCategory === 'All' ? 'Personal' : activeCategory,
      priority: 'medium',
      dueDate: todayStr,
    });
    setQuickTitle('');
  };

  const handleSaveModal = (data: {
    title: string;
    category?: string;
    priority?: TodoPriority;
    dueDate?: string;
    description?: string;
  }) => {
    if (editingTodo) {
      updateTodo(editingTodo.id, data);
    } else {
      addTodo(data);
    }
  };

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    addCategory(newListName.trim());
    setActiveCategory(newListName.trim());
    setNewListName('');
    setIsNewListModalOpen(false);
  };

  const handleCarryAll = async () => {
    setIsCarryingForward(true);
    try {
      await carryForwardAllOverdue();
    } finally {
      setIsCarryingForward(false);
    }
  };

  // Tab counts
  const todayCount = todos.filter(t => !t.completed && t.dueDate === todayStr).length;
  const upcomingCount = todos.filter(t => !t.completed && !!t.dueDate && t.dueDate > todayStr).length;
  const completedCount = todos.filter(t => t.completed).length;

  // Filtering
  const filteredTodos = todos.filter(t => {
    const matchesCategory = activeCategory === 'All' || t.category === activeCategory;

    let matchesTab = true;
    if (filterTab === 'today') {
      matchesTab = t.dueDate === todayStr;
    } else if (filterTab === 'upcoming') {
      matchesTab = !t.completed && !!t.dueDate && t.dueDate > todayStr;
    } else if (filterTab === 'overdue') {
      matchesTab = !t.completed && !!t.dueDate && t.dueDate < todayStr;
    } else if (filterTab === 'completed') {
      matchesTab = t.completed;
    }

    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesTab && matchesSearch;
  });

  const getPriorityStyle = (priority: TodoPriority) => {
    switch (priority) {
      case 'high':
        return { bg: 'var(--danger-light)', text: 'var(--danger)', border: 'rgba(223, 123, 123, 0.4)' };
      case 'medium':
        return { bg: 'var(--primary-light)', text: 'var(--primary)', border: 'rgba(217, 155, 170, 0.4)' };
      case 'low':
      default:
        return { bg: 'var(--secondary-light)', text: '#4A6B48', border: 'rgba(168, 184, 159, 0.4)' };
    }
  };

  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return null;
    if (dateStr === todayStr) return { text: 'Today', isOverdue: false, isToday: true };
    if (dateStr < todayStr) return { text: `Overdue (${dateStr})`, isOverdue: true, isToday: false };
    return { text: dateStr, isOverdue: false, isToday: false };
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%', maxWidth: '1080px', margin: '0 auto' }}>
      {/* Header */}
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
            To-Do Lists & Intentions
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
            Gentle focus for what truly matters, organized effortlessly.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {completedCount > 0 && (
            <button onClick={clearCompleted} className="btn btn-outline btn-sm">
              Clear Completed ({completedCount})
            </button>
          )}
          <button
            onClick={() => setIsNewListModalOpen(true)}
            className="btn btn-outline btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <FolderPlus size={15} />
            <span>New List</span>
          </button>
          <button
            onClick={() => {
              setEditingTodo(null);
              setIsModalOpen(true);
            }}
            className="btn btn-primary btn-sm"
          >
            <Plus size={16} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Overdue Banner */}
      {overdueCount > 0 && (
        <div
          style={{
            backgroundColor: 'var(--danger-light)',
            border: '1px solid rgba(223, 123, 123, 0.35)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={20} color="var(--danger)" style={{ flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--danger)' }}>
                {overdueCount} {overdueCount === 1 ? 'task is' : 'tasks are'} overdue from past days.
              </span>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                Carry them forward gently to today to keep your momentum going without losing context.
              </p>
            </div>
          </div>
          <button
            onClick={handleCarryAll}
            disabled={isCarryingForward}
            className="btn btn-sm"
            style={{
              backgroundColor: 'var(--danger)',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(223, 123, 123, 0.35)',
            }}
          >
            <ArrowRight size={14} />
            <span>{isCarryingForward ? 'Updating...' : 'Carry All to Today'}</span>
          </button>
        </div>
      )}

      {/* Category Pills Bar with New List Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '20px',
        }}
      >
        {['All', ...categories].map(cat => {
          const isSelected = activeCategory === cat;
          const count = cat === 'All' ? todos.length : todos.filter(t => t.category === cat).length;

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.84rem',
                fontWeight: isSelected ? 600 : 400,
                backgroundColor: isSelected ? 'var(--primary)' : 'var(--card-bg)',
                color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                border: '1px solid var(--card-border)',
                boxShadow: isSelected ? '0 4px 12px rgba(217, 155, 170, 0.35)' : 'none',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              <span>{cat}</span>
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 6px',
                  borderRadius: '999px',
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--bg-canvas-subtle)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-muted)',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Tabs: Today | Upcoming | Overdue | Completed | All */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: 'var(--radius-pill)',
            padding: '4px',
            gap: '2px',
          }}
        >
          {(
            [
              { id: 'today', label: 'Today', count: todayCount, alert: false },
              { id: 'upcoming', label: 'Upcoming', count: upcomingCount, alert: false },
              { id: 'overdue', label: 'Overdue', count: overdueCount, alert: overdueCount > 0 },
              { id: 'completed', label: 'Completed', count: completedCount, alert: false },
              { id: 'all', label: 'All', count: todos.length, alert: false },
            ] as const
          ).map(tab => {
            const isActive = filterTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 600 : 400,
                  backgroundColor: isActive
                    ? tab.alert
                      ? 'var(--danger-light)'
                      : 'var(--primary-light)'
                    : 'transparent',
                  color: isActive
                    ? tab.alert
                      ? 'var(--danger)'
                      : 'var(--primary)'
                    : tab.alert
                    ? 'var(--danger)'
                    : 'var(--text-muted)',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '1px 5px',
                    borderRadius: '999px',
                    backgroundColor: isActive
                      ? tab.alert
                        ? 'rgba(223, 123, 123, 0.25)'
                        : 'rgba(217, 155, 170, 0.25)'
                      : 'var(--bg-canvas-subtle)',
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
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
            maxWidth: '280px',
          }}
        >
          <Search size={15} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '0.86rem',
              color: 'var(--text-main)',
              width: '100%',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Quick Add Form */}
      <form onSubmit={handleQuickAdd} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        <input
          type="text"
          placeholder={`Add a quick task to "${activeCategory === 'All' ? 'Personal' : activeCategory}" for today...`}
          value={quickTitle}
          onChange={e => setQuickTitle(e.target.value)}
          style={{
            flex: 1,
            padding: '12px 18px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--card-border)',
            backgroundColor: 'var(--card-bg)',
            fontSize: '0.94rem',
            color: 'var(--text-main)',
            boxShadow: 'var(--card-shadow)',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          style={{ padding: '10px 22px' }}
          disabled={!quickTitle.trim()}
        >
          <Plus size={16} />
          <span>Add</span>
        </button>
      </form>

      {/* Tasks List */}
      <div className="card" style={{ padding: '14px' }}>
        {filteredTodos.length === 0 ? (
          <div
            style={{
              padding: '48px 16px',
              textAlign: 'center',
            }}
          >
            <CheckSquare size={36} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '4px' }}>
              No tasks in this view
            </h4>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              {filterTab === 'completed'
                ? 'No completed tasks yet. Keep moving forward at your own calm pace.'
                : filterTab === 'overdue'
                ? 'No overdue tasks! You are completely up to date.'
                : 'Your canvas is clear. Enjoy the unburdened moment or capture a new idea above.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredTodos.map(todo => {
              const priorityInfo = getPriorityStyle(todo.priority);
              const dueInfo = formatDueDate(todo.dueDate);
              const isOverdue = !todo.completed && !!todo.dueDate && todo.dueDate < todayStr;

              return (
                <div
                  key={todo.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: todo.completed
                      ? 'rgba(217, 155, 170, 0.05)'
                      : isOverdue
                      ? 'rgba(223, 123, 123, 0.04)'
                      : 'var(--bg-canvas)',
                    border: isOverdue
                      ? '1px solid rgba(223, 123, 123, 0.3)'
                      : '1px solid var(--card-border)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onMouseLeave={e =>
                    (e.currentTarget.style.borderColor = isOverdue
                      ? 'rgba(223, 123, 123, 0.3)'
                      : 'var(--card-border)')
                  }
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleTodo(todo.id)}
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '6px',
                        border: todo.completed ? 'none' : '1.8px solid var(--primary)',
                        backgroundColor: todo.completed ? 'var(--primary)' : 'transparent',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'all 0.15s ease',
                      }}
                      aria-label="Toggle task completion"
                    >
                      {todo.completed && <Check size={14} strokeWidth={3} />}
                    </button>

                    {/* Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.94rem',
                          fontWeight: 500,
                          color: todo.completed ? 'var(--text-muted)' : 'var(--text-main)',
                          textDecoration: todo.completed ? 'line-through' : 'none',
                          wordBreak: 'break-word',
                        }}
                      >
                        {todo.title}
                      </div>
                      {todo.description && (
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-light)',
                            marginTop: '2px',
                            textDecoration: todo.completed ? 'line-through' : 'none',
                          }}
                        >
                          {todo.description}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Meta items: priority badge, category, due date, actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '12px' }}>
                    {/* Priority Badge */}
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: priorityInfo.bg,
                        color: priorityInfo.text,
                        border: `1px solid ${priorityInfo.border}`,
                        textTransform: 'capitalize',
                      }}
                    >
                      {todo.priority}
                    </span>

                    {/* Category pill */}
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.74rem',
                        color: 'var(--text-muted)',
                        backgroundColor: 'var(--card-bg)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-pill)',
                        border: '1px solid var(--card-border)',
                      }}
                    >
                      <Tag size={11} />
                      <span>{todo.category}</span>
                    </span>

                    {/* Due Date Badge with Overdue Indicator */}
                    {dueInfo && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.74rem',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-pill)',
                          backgroundColor: dueInfo.isOverdue
                            ? 'var(--danger-light)'
                            : dueInfo.isToday
                            ? 'var(--primary-light)'
                            : 'var(--card-bg)',
                          color: dueInfo.isOverdue
                            ? 'var(--danger)'
                            : dueInfo.isToday
                            ? 'var(--primary)'
                            : 'var(--text-muted)',
                          border: dueInfo.isOverdue
                            ? '1px solid rgba(223, 123, 123, 0.4)'
                            : '1px solid var(--card-border)',
                          fontWeight: dueInfo.isOverdue || dueInfo.isToday ? 600 : 400,
                        }}
                      >
                        {dueInfo.isOverdue ? <AlertCircle size={11} /> : <Calendar size={11} />}
                        <span>{dueInfo.text}</span>
                      </span>
                    )}

                    {/* Carry to Today button for overdue tasks */}
                    {isOverdue && (
                      <button
                        onClick={() => carryForwardTask(todo.id)}
                        className="btn btn-sm"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          fontSize: '0.74rem',
                          backgroundColor: 'var(--primary-light)',
                          color: 'var(--primary)',
                          borderRadius: 'var(--radius-pill)',
                          border: '1px solid rgba(217, 155, 170, 0.4)',
                        }}
                        title="Carry forward to today"
                      >
                        <Clock size={11} />
                        <span>Carry to Today</span>
                      </button>
                    )}

                    {/* Actions: Edit & Delete */}
                    <button
                      onClick={() => {
                        setEditingTodo(todo);
                        setIsModalOpen(true);
                      }}
                      style={{
                        padding: '6px',
                        color: 'var(--text-muted)',
                        borderRadius: '4px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                      title="Edit task"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => setTodoToDelete(todo)}
                      style={{
                        padding: '6px',
                        color: 'var(--danger)',
                        borderRadius: '4px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                      title="Delete task"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit / New Task Modal */}
      <TodoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        initialData={editingTodo}
        availableCategories={categories}
      />

      {/* New Custom List Modal */}
      <Modal
        isOpen={isNewListModalOpen}
        onClose={() => setIsNewListModalOpen(false)}
        title="Create New List"
        subtitle="Organize your tasks into personal projects or life areas."
      >
        <form onSubmit={handleCreateList} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              List Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Garden & Plants, Book Club, Apartment Hunt"
              value={newListName}
              onChange={e => setNewListName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--card-border)',
                backgroundColor: 'var(--bg-canvas)',
                fontSize: '0.92rem',
                color: 'var(--text-main)',
                outline: 'none',
              }}
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={() => setIsNewListModalOpen(false)}
              className="btn btn-outline btn-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={!newListName.trim()}
            >
              <Sparkles size={14} />
              <span>Create List</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!todoToDelete}
        onClose={() => setTodoToDelete(null)}
        onConfirm={() => {
          if (todoToDelete) {
            deleteTodo(todoToDelete.id);
            setTodoToDelete(null);
          }
        }}
        title="Delete Task"
        message={`Are you sure you want to delete "${todoToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete Task"
        isDestructive={true}
      />
    </div>
  );
};
