import React, { useState } from 'react';
import { Sparkles, Check, X, ArrowRight } from 'lucide-react';
import type { CosmicSession } from '../../types';
import { formatDurationHuman } from '../../services/cosmicFocus';
import { useTodos } from '../../context/TodosContext';

interface CosmicSessionModalProps {
  isOpen: boolean;
  session: CosmicSession | null;
  stageChanged: boolean;
  onClose: () => void;
}

export const CosmicSessionModal: React.FC<CosmicSessionModalProps> = ({
  isOpen,
  session,
  stageChanged,
  onClose,
}) => {
  const { toggleTodo, todos } = useTodos();
  const [taskMarkedComplete, setTaskMarkedComplete] = useState(false);

  if (!isOpen || !session) return null;

  const linkedTodo = session.todoId ? todos.find(t => t.id === session.todoId) : null;
  const isAlreadyCompleted = linkedTodo?.completed || false;

  const handleMarkTodoComplete = async () => {
    if (session.todoId && !taskMarkedComplete && !isAlreadyCompleted) {
      await toggleTodo(session.todoId);
      setTaskMarkedComplete(true);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(23, 21, 59, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.25s ease',
      }}
      onClick={onClose}
    >
      <div
        className="card animate-scale-up"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '32px 28px',
          textAlign: 'center',
          position: 'relative',
          backgroundColor: 'var(--card-bg)',
          borderRadius: 'var(--card-radius)',
          boxShadow: '0 20px 48px rgba(46, 35, 108, 0.22)',
          border: '1px solid rgba(217, 155, 170, 0.35)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '50%',
          }}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Celebration Aura Badge */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            boxShadow: '0 8px 24px rgba(217, 155, 170, 0.45)',
          }}
        >
          <Sparkles size={32} />
        </div>

        {/* Title */}
        <h3
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.6rem',
            color: 'var(--text-main)',
            marginBottom: '6px',
          }}
        >
          {stageChanged ? 'Cosmic Garden Leveled Up! 🌟' : 'Focus Session Complete ✨'}
        </h3>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          {stageChanged
            ? 'Your dedicated focus has unlocked a new celestial growth stage in your cosmic sanctuary!'
            : 'Well done on nurturing your deep work. Your universe has absorbed new starlight energy.'}
        </p>

        {/* Session Stats Pill Box */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            padding: '14px 16px',
            backgroundColor: 'var(--bg-canvas-subtle)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            border: '1px solid var(--card-border)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
              Time Focused
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
              {formatDurationHuman(session.durationSeconds)}
            </div>
          </div>

          <div style={{ borderLeft: '1px solid var(--card-border)', paddingLeft: '16px' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
              Session Task
            </div>
            <div
              style={{
                fontSize: '0.94rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                maxWidth: '180px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={session.taskTitle}
            >
              {session.taskTitle}
            </div>
          </div>
        </div>

        {/* Linked To-Do Completion Prompt */}
        {session.todoId && linkedTodo && (
          <div
            style={{
              padding: '14px',
              backgroundColor: 'var(--secondary-light)',
              border: '1px solid rgba(168, 184, 159, 0.4)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '22px',
              textAlign: 'left',
            }}
          >
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
              Connected To-Do Item
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <span
                style={{
                  fontSize: '0.86rem',
                  color: isAlreadyCompleted || taskMarkedComplete ? 'var(--text-muted)' : 'var(--text-main)',
                  textDecoration: isAlreadyCompleted || taskMarkedComplete ? 'line-through' : 'none',
                }}
              >
                {linkedTodo.title}
              </span>

              {isAlreadyCompleted || taskMarkedComplete ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.78rem',
                    color: '#2B5A37',
                    fontWeight: 600,
                  }}
                >
                  <Check size={14} />
                  Completed
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleMarkTodoComplete}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                >
                  Mark as Complete
                </button>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onClose}
          className="btn btn-primary btn-md"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <span>Continue Journey</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
