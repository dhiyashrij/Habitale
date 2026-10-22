import React, { useState } from 'react';
import { useReflection, MOOD_OPTIONS } from '../../context/ReflectionContext';
import { BookHeart, Sparkles, Check } from 'lucide-react';
import type { MoodType } from '../../types';

export const DailyReflectionCard: React.FC = () => {
  const { todayReflection, updateTodayReflection } = useReflection();
  const [showSavedToast, setShowSavedToast] = useState(false);

  const handleMoodSelect = (mood: MoodType) => {
    updateTodayReflection({ mood });
    triggerSaveToast();
  };

  const handleTextChange = (field: 'response' | 'gratitudeNote', val: string) => {
    updateTodayReflection({ [field]: val });
    triggerSaveToast();
  };

  const triggerSaveToast = () => {
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  return (
    <div
      className="card"
      style={{
        background: 'linear-gradient(180deg, var(--card-bg) 0%, var(--bg-canvas-subtle) 100%)',
        marginBottom: '28px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BookHeart size={16} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '2px' }}>
              Daily Reflection
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              A quiet sanctuary for your evening thoughts and gratitude.
            </p>
          </div>
        </div>

        {showSavedToast && (
          <span
            style={{
              fontSize: '0.78rem',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <Check size={13} />
            <span>Saved to story</span>
          </span>
        )}
      </div>

      {/* Mood Selector */}
      <div style={{ marginBottom: '18px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '8px',
          }}
        >
          Today's Inner Energy
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {MOOD_OPTIONS.map(opt => {
            const isSelected = todayReflection.mood === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleMoodSelect(opt.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-pill)',
                  border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--card-border)',
                  backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--card-bg)',
                  color: isSelected ? 'var(--text-main)' : 'var(--text-muted)',
                  fontSize: '0.82rem',
                  fontWeight: isSelected ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{opt.emoji}</span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rotating Daily Prompt */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <Sparkles size={14} color="var(--primary)" />
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.95rem',
              fontWeight: 600,
              color: 'var(--text-main)',
            }}
          >
            {todayReflection.prompt}
          </span>
        </div>
        <textarea
          rows={2}
          placeholder="Jot down a few gentle sentences..."
          value={todayReflection.response || ''}
          onChange={e => handleTextChange('response', e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--card-border)',
            backgroundColor: 'var(--bg-canvas)',
            fontSize: '0.9rem',
            color: 'var(--text-main)',
            resize: 'none',
            lineHeight: 1.5,
          }}
        />
      </div>

      {/* Gratitude Note */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '6px',
          }}
        >
          One Sweet Thing I Am Grateful For
        </label>
        <input
          type="text"
          placeholder="e.g. Scent of rain, warm cedar candle, a comforting conversation"
          value={todayReflection.gratitudeNote || ''}
          onChange={e => handleTextChange('gratitudeNote', e.target.value)}
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
  );
};
