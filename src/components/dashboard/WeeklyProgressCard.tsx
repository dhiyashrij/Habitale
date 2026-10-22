import React from 'react';
import { useRoutines } from '../../context/RoutinesContext';
import { Calendar } from 'lucide-react';

export const WeeklyProgressCard: React.FC = () => {
  const { routines } = useRoutines();

  // Generate past 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const dayOfWeek = d.getDay();
    const dayName = d.toLocaleDateString('en-US', { weekday: 'narrow' });
    const shortDay = d.toLocaleDateString('en-US', { weekday: 'short' });
    const isToday = i === 6;

    // Routines scheduled for that day
    const scheduled = routines.filter(r => r.daysOfWeek.includes(dayOfWeek));
    const completed = scheduled.filter(r => r.completedDates.includes(dateStr)).length;
    const rate = scheduled.length > 0 ? Math.round((completed / scheduled.length) * 100) : 0;

    return {
      dateStr,
      dayName,
      shortDay,
      dayNum: d.getDate(),
      isToday,
      rate,
      completed,
      total: scheduled.length,
    };
  });

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--secondary-light)',
            color: 'var(--secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Calendar size={16} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '2px' }}>
            Weekly Rhythm
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Your 7-day consistency and momentum.
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px',
          padding: '16px 0',
          alignItems: 'flex-end',
          flex: 1,
        }}
      >
        {days.map(item => {
          const heightPx = Math.max(12, Math.round((item.rate / 100) * 85));

          return (
            <div
              key={item.dateStr}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
              title={`${item.shortDay}: ${item.rate}% (${item.completed}/${item.total} completed)`}
            >
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: item.isToday ? 'var(--primary)' : 'var(--text-muted)',
                }}
              >
                {item.rate}%
              </span>

              {/* Bar track */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '28px',
                  height: '90px',
                  backgroundColor: 'var(--bg-canvas-subtle)',
                  borderRadius: 'var(--radius-pill)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  padding: '3px',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: `${heightPx}px`,
                    backgroundColor: item.isToday ? 'var(--primary)' : 'var(--secondary)',
                    borderRadius: 'var(--radius-pill)',
                    transition: 'height 0.4s ease',
                    opacity: item.rate > 0 ? 1 : 0.25,
                  }}
                />
              </div>

              {/* Day label */}
              <div style={{ textAlign: 'center' }}>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.74rem',
                    fontWeight: item.isToday ? 700 : 500,
                    color: item.isToday ? 'var(--primary)' : 'var(--text-main)',
                  }}
                >
                  {item.dayName}
                </span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: 'var(--text-light)',
                  }}
                >
                  {item.dayNum}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
