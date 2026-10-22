import React, { useState } from 'react';
import { GreetingCard } from '../components/dashboard/GreetingCard';
import { RoutineChecklist } from '../components/dashboard/RoutineChecklist';
import { QuickTodoList } from '../components/dashboard/QuickTodoList';
import { WeeklyProgressCard } from '../components/dashboard/WeeklyProgressCard';
import { DailyReflectionCard } from '../components/dashboard/DailyReflectionCard';
import { RoutineModal } from '../components/routines/RoutineModal';
import { TodoModal } from '../components/todos/TodoModal';
import { useRoutines } from '../context/RoutinesContext';
import { useTodos } from '../context/TodosContext';

interface DashboardPageProps {
  onNavigateToTodos: () => void;
  onNavigateToFocus?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateToTodos, onNavigateToFocus }) => {
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);

  const { addRoutine } = useRoutines();
  const { addTodo } = useTodos();

  return (
    <div className="animate-fade-in" style={{ width: '100%', maxWidth: '1180px', margin: '0 auto' }}>
      {/* Personalized Greeting & Metrics Hub */}
      <GreetingCard
        onOpenRoutineModal={() => setIsRoutineModalOpen(true)}
        onOpenTodoModal={() => setIsTodoModalOpen(true)}
      />

      {/* Main Grid: Routines on Left, Quick To-Dos & Weekly Overview on Right */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)',
          gap: '24px',
          alignItems: 'start',
        }}
        className="dashboard-columns"
      >
        {/* Left Column: Today's Routine Checklist & Daily Reflection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <RoutineChecklist onOpenAddModal={() => setIsRoutineModalOpen(true)} />
          <DailyReflectionCard />
        </div>

        {/* Right Column: Quick To-Dos, Cosmic Focus & Weekly Rhythm */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <QuickTodoList onNavigateToTodos={onNavigateToTodos} />

          {/* Cosmic Focus Sanctuary Quick Launch */}
          {onNavigateToFocus && (
            <div
              className="card"
              style={{
                background: 'linear-gradient(135deg, var(--card-bg) 0%, rgba(201, 189, 231, 0.15) 100%)',
                border: '1px solid rgba(201, 189, 231, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                cursor: 'pointer',
                transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
              }}
              onClick={onNavigateToFocus}
              title="Launch Cosmic Focus Timer"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-light)',
                    color: 'var(--accent-hover)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>✨</span>
                </div>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Cosmic Focus Sanctuary
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Enter deep focus flow & nurture your celestial garden.
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                onClick={e => {
                  e.stopPropagation();
                  onNavigateToFocus();
                }}
              >
                Start Timer &rarr;
              </button>
            </div>
          )}

          <WeeklyProgressCard />
        </div>
      </div>

      {/* Routine Creation Modal */}
      <RoutineModal
        isOpen={isRoutineModalOpen}
        onClose={() => setIsRoutineModalOpen(false)}
        onSave={addRoutine}
      />

      {/* Todo Creation Modal */}
      <TodoModal
        isOpen={isTodoModalOpen}
        onClose={() => setIsTodoModalOpen(false)}
        onSave={addTodo}
      />
    </div>
  );
};
