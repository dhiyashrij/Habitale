import React from 'react';
import { Clock, Trash2, Sparkles } from 'lucide-react';
import type { CosmicSession } from '../../types';
import { formatDurationHuman } from '../../services/cosmicFocus';

interface CosmicHistoryListProps {
  sessions: CosmicSession[];
  onClearHistory: () => void;
}

export const CosmicHistoryList: React.FC<CosmicHistoryListProps> = ({
  sessions,
  onClearHistory,
}) => {
  if (sessions.length === 0) {
    return (
      <div
        className="card"
        style={{
          padding: '32px 24px',
          textAlign: 'center',
          backgroundColor: 'var(--card-bg)',
          borderRadius: 'var(--card-radius)',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-canvas-subtle)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto',
          }}
        >
          <Sparkles size={20} />
        </div>
        <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '4px' }}>
          No Cosmic Sessions Yet
        </h4>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '280px', margin: '0 auto' }}>
          Start a countdown, Pomodoro, or stopwatch session above to nurture your celestial garden and track your deep focus time.
        </p>
      </div>
    );
  }

  const getModeBadge = (mode: CosmicSession['mode']) => {
    switch (mode) {
      case 'pomodoro':
        return { label: 'Pomodoro', color: '#D99BAA', bg: 'var(--primary-light)' };
      case 'countdown':
        return { label: 'Timer', color: '#88B795', bg: 'var(--secondary-light)' };
      case 'stopwatch':
        return { label: 'Stopwatch', color: '#9D8BC9', bg: 'var(--accent-light)' };
    }
  };

  return (
    <div
      className="card"
      style={{
        padding: '24px',
        backgroundColor: 'var(--card-bg)',
        borderRadius: 'var(--card-radius)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={16} color="var(--primary)" />
          <h4 style={{ fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: 600 }}>
            Recent Cosmic Sessions ({sessions.length})
          </h4>
        </div>

        <button
          onClick={() => {
            if (confirm('Clear your local focus session history? Your accumulated cosmic garden level will stay safe.')) {
              onClearHistory();
            }
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.76rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
          }}
          title="Clear recent list"
        >
          <Trash2 size={13} />
          <span>Clear List</span>
        </button>
      </div>

      {/* Session Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '360px', overflowY: 'auto' }}>
        {sessions.map(session => {
          const badge = getModeBadge(session.mode);
          const dateFormatted = new Date(session.completedAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={session.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 14px',
                backgroundColor: 'var(--bg-canvas-subtle)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--card-border)',
                transition: 'transform var(--transition-fast)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '65%' }}>
                <span
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={session.taskTitle}
                >
                  {session.taskTitle}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  <span>{dateFormatted}</span>
                  <span
                    style={{
                      padding: '1px 7px',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: badge.bg,
                      color: badge.color,
                      fontSize: '0.68rem',
                      fontWeight: 600,
                    }}
                  >
                    {badge.label}
                  </span>
                </div>
              </div>

              <div
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  fontFamily: 'var(--font-heading)',
                  letterSpacing: '0.02em',
                }}
              >
                {formatDurationHuman(session.durationSeconds)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
