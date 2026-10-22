import React, { useState } from 'react';
import { useTodos } from '../../context/TodosContext';
import { getTodayString } from '../../context/RoutinesContext';
import { Check, Plus, ArrowRight, AlertCircle, ArrowUpRight } from 'lucide-react';

interface QuickTodoListProps {
  onNavigateToTodos: () => void;
}

export const QuickTodoList: React.FC<QuickTodoListProps> = ({ onNavigateToTodos }) => {
  const { todos, addTodo, toggleTodo, carryForwardAllOverdue, overdueCount } = useTodos();
  const [quickTitle, setQuickTitle] = useState('');
  const todayStr = getTodayString();

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    await addTodo({ title: quickTitle.trim(), category: 'Personal', priority: 'medium', dueDate: todayStr });
    setQuickTitle('');
  };

  // Filter for today's active tasks or overdue tasks
  const todayTasks = todos.filter(t => !t.completed && (t.dueDate === todayStr || !t.dueDate)).slice(0, 5);
  const recentCompleted = todos.filter(t => t.completed && t.completedAt?.startsWith(todayStr)).slice(0, 2);

  const getPriorityColor = (p: string) => {
    if (p === 'high') return 'var(--danger)';
    if (p === 'medium') return 'var(--primary)';
    return 'var(--secondary)';
  };

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '2px' }}>
            To-Do Lists
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Gentle focus tasks for today.
          </p>
        </div>
        <button
          onClick={onNavigateToTodos}
          className="btn btn-ghost btn-sm"
          style={{ color: 'var(--primary)', padding: '4px 8px' }}
        >
          <span>View All</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Overdue alert banner if unfinished tasks exist from previous days */}
      {overdueCount > 0 && (
        <div
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(232, 165, 152, 0.15)',
            border: '1px solid rgba(232, 165, 152, 0.4)',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={15} color="#D97A68" />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-main)', fontWeight: 500 }}>
              {overdueCount} unfinished task{overdueCount > 1 ? 's' : ''} from earlier
            </span>
          </div>
          <button
            type="button"
            onClick={carryForwardAllOverdue}
            className="btn btn-ghost btn-sm"
            style={{
              padding: '2px 8px',
              fontSize: '0.74rem',
              color: 'var(--primary)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            <span>Carry to Today</span>
            <ArrowUpRight size={12} />
          </button>
        </div>
      )}

      {/* Quick Add Inline Bar */}
      <form onSubmit={handleQuickAdd} style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
        <input
          type="text"
          placeholder="Capture a task for today..."
          value={quickTitle}
          onChange={e => setQuickTitle(e.target.value)}
          style={{
            flex: 1,
            padding: '9px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--card-border)',
            backgroundColor: 'var(--bg-canvas)',
            fontSize: '0.88rem',
            color: 'var(--text-main)',
          }}
        />
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          style={{ padding: '8px 12px' }}
          disabled={!quickTitle.trim()}
        >
          <Plus size={16} />
        </button>
      </form>

      {/* Tasks List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {todayTasks.length === 0 && recentCompleted.length === 0 ? (
          <div
            style={{
              padding: '28px 12px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.88rem',
              backgroundColor: 'var(--bg-canvas-subtle)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            All clear for today! Enjoy your peaceful moment.
          </div>
        ) : (
          <>
            {todayTasks.map(todo => (
              <div
                key={todo.id}
                onClick={() => toggleTodo(todo.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--card-border)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '5px',
                      border: '1.5px solid var(--card-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: getPriorityColor(todo.priority),
                      flexShrink: 0,
                    }}
                    title={`Priority: ${todo.priority}`}
                  />
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>
                    {todo.title}
                  </span>
                </div>

                <span
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    backgroundColor: 'var(--bg-canvas-subtle)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {todo.category}
                </span>
              </div>
            ))}

            {/* Recently Completed */}
            {recentCompleted.map(todo => (
              <div
                key={todo.id}
                onClick={() => toggleTodo(todo.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(217, 155, 170, 0.05)',
                  border: '1px solid rgba(217, 155, 170, 0.15)',
                  cursor: 'pointer',
                  opacity: 0.75,
                }}
              >
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '5px',
                    backgroundColor: 'var(--primary)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Check size={12} strokeWidth={3} />
                </div>
                <span
                  style={{
                    fontSize: '0.86rem',
                    color: 'var(--text-muted)',
                    textDecoration: 'line-through',
                  }}
                >
                  {todo.title}
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
