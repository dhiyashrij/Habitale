import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRoutines } from '../../context/RoutinesContext';
import { Sparkles, Plus, Flame, CheckCircle2 } from 'lucide-react';

interface GreetingCardProps {
  onOpenRoutineModal: () => void;
  onOpenTodoModal: () => void;
}

export const GreetingCard: React.FC<GreetingCardProps> = ({
  onOpenRoutineModal,
  onOpenTodoModal,
}) => {
  const { user } = useAuth();
  const { todayCompletionRate, streakSummary } = useRoutines();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const displayName = user?.displayName ? user.displayName.split(' ')[0] : 'Gentle Soul';

  return (
    <div
      className="card"
      style={{
        background: 'linear-gradient(135deg, var(--card-bg) 0%, var(--bg-canvas-subtle) 100%)',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid var(--card-border)',
        marginBottom: '28px',
      }}
    >
      {/* Decorative subtle background glow */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(217,155,170,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '20px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '0.84rem',
                color: 'var(--primary)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {formattedDate}
            </span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '2.1rem',
              color: 'var(--text-main)',
              lineHeight: 1.2,
              marginBottom: '8px',
            }}
          >
            {getGreeting()}, {displayName} ✨
          </h2>

          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.94rem',
              maxWidth: '520px',
              fontStyle: 'italic',
            }}
          >
            "{user?.dailyIntention || 'Move gently through this day; every small ritual shapes your sanctuary.'}"
          </p>
        </div>

        {/* Quick action buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={onOpenRoutineModal} className="btn btn-primary btn-sm">
            <Plus size={15} />
            <span>New Routine</span>
          </button>
          <button onClick={onOpenTodoModal} className="btn btn-outline btn-sm">
            <Plus size={15} />
            <span>Quick Task</span>
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div
        style={{
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(217, 155, 170, 0.15)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Today's completion */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CheckCircle2 size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                TODAY'S RITUALS
              </span>
              <span style={{ fontSize: '0.84rem', color: 'var(--primary)', fontWeight: 700 }}>
                {todayCompletionRate}%
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '6px',
                backgroundColor: 'rgba(217, 155, 170, 0.18)',
                borderRadius: '999px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${todayCompletionRate}%`,
                  backgroundColor: 'var(--primary)',
                  borderRadius: '999px',
                  transition: 'width 0.4s ease-out',
                }}
              />
            </div>
          </div>
        </div>

        {/* Active Streaks */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'var(--secondary-light)',
              color: 'var(--secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Flame size={22} fill="currentColor" />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              ACTIVE STREAK
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {streakSummary.highestStreak} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>days</span>
            </div>
          </div>
        </div>

        {/* Mindful Habit Count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              HABIT FLOW
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {streakSummary.totalActiveStreaks} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>habits alive</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
