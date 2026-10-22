import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme, THEME_PRESETS } from '../context/ThemeContext';
import { useRoutines } from '../context/RoutinesContext';
import type { ThemeConfig, RoutineCategory, TimeOfDay } from '../types';
import {
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  Compass,
  Check,
  CheckCircle2,
} from 'lucide-react';

interface OnboardingPageProps {
  onComplete: () => void;
}

const CATEGORIES: { id: RoutineCategory; label: string }[] = [
  { id: 'wellness', label: 'Wellness' },
  { id: 'mindfulness', label: 'Mindfulness' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'creativity', label: 'Creativity' },
  { id: 'selfcare', label: 'Self-Care' },
];

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete }) => {
  const { user, completeOnboarding } = useAuth();
  const { theme, setPreset, setColorMode } = useTheme();
  const { addRoutine } = useRoutines();

  const [step, setStep] = useState(1);

  // Extract first name from authenticated user profile
  const rawName = user?.displayName ? user.displayName.trim() : '';
  const firstName = rawName.split(' ')[0] || 'Friend';

  // State across onboarding steps
  const [selectedTheme, setSelectedTheme] = useState<ThemeConfig['presetId']>(theme.presetId || 'blush');
  const [selectedMode, setSelectedMode] = useState<'light' | 'dark'>(theme.colorMode || 'light');
  const [routineTitle, setRoutineTitle] = useState('');
  const [routineCategory, setRoutineCategory] = useState<RoutineCategory>('wellness');
  const [routineTime, setRoutineTime] = useState<TimeOfDay>('morning');
  const [routineDuration, setRoutineDuration] = useState<number>(10);
  const [routineCreated, setRoutineCreated] = useState<boolean>(false);
  const [isFinishing, setIsFinishing] = useState<boolean>(false);

  // Step 2 handler
  const handleSelectTheme = (presetId: ThemeConfig['presetId']) => {
    setSelectedTheme(presetId);
    setPreset(presetId);
  };

  // Step 3 handler
  const handleSelectMode = (mode: 'light' | 'dark') => {
    setSelectedMode(mode);
    setColorMode(mode);
  };

  // Step 4: Create Routine
  const handleCreateRoutine = async () => {
    if (!routineTitle.trim()) return;

    await addRoutine({
      title: routineTitle.trim(),
      category: routineCategory,
      timeOfDay: routineTime,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      icon: 'Sparkles',
      tasks: [
        {
          id: 'task-1',
          title: routineTitle.trim(),
          durationMinutes: routineDuration,
          order: 0,
          completedDates: [],
        },
      ],
    });

    setRoutineCreated(true);
    setStep(5);
  };

  // Step 4: Skip Routine
  const handleSkipRoutine = () => {
    setRoutineCreated(false);
    setStep(5);
  };

  // Step 5: Complete & Launch Dashboard
  const handleLaunchDashboard = async () => {
    setIsFinishing(true);
    try {
      await completeOnboarding({
        displayName: user?.displayName,
        starterTheme: selectedTheme,
        colorMode: selectedMode,
        initialRoutineTitle: routineCreated ? routineTitle.trim() : undefined,
      });
      onComplete();
    } catch (err) {
      console.error('Error saving onboarding:', err);
      onComplete();
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-canvas)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '680px',
          padding: '40px',
          boxShadow: '0 16px 40px -10px rgba(53, 50, 56, 0.1)',
          borderRadius: 'var(--card-radius)',
          border: '1px solid var(--card-border)',
        }}
      >
        {/* Step Indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '28px' }}>
          {[1, 2, 3, 4, 5].map(s => (
            <div
              key={s}
              style={{
                width: s === step ? '28px' : '10px',
                height: '8px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: s <= step ? 'var(--primary)' : 'rgba(217, 155, 170, 0.25)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* STEP 1: Welcome Screen displaying First Name */}
        {step === 1 && (
          <div className="animate-fade-in" style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
                boxShadow: '0 4px 16px rgba(217, 155, 170, 0.25)',
                overflow: 'hidden',
              }}
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={firstName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Sparkles size={28} />
              )}
            </div>

            <span
              style={{
                fontSize: '0.8rem',
                color: 'var(--primary)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Step 1 of 5 • Welcome
            </span>

            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '2.2rem',
                color: 'var(--text-main)',
                marginTop: '6px',
                marginBottom: '12px',
              }}
            >
              Welcome, {firstName} ✨
            </h2>

            <p
              style={{
                fontSize: '0.98rem',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                maxWidth: '520px',
                margin: '0 auto 28px',
              }}
            >
              We are delighted to welcome you to Habitale. In the next few moments, we will tailor your personal productivity sanctuary to match your aesthetic and rhythm.
            </p>

            <div
              style={{
                padding: '14px 20px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-canvas-subtle)',
                border: '1px solid var(--card-border)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.86rem',
                color: 'var(--text-main)',
                marginBottom: '32px',
              }}
            >
              <span>Signed in as:</span>
              <strong>{user?.email}</strong>
            </div>

            <div>
              <button onClick={() => setStep(2)} className="btn btn-primary btn-lg">
                <span>Begin Customization</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Choosing a Starter Theme */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <span
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--primary)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Step 2 of 5 • Theme Studio
              </span>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '2rem',
                  color: 'var(--text-main)',
                  marginTop: '4px',
                }}
              >
                Choose your starter palette
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Select an aesthetic palette that brings calm and inspiration to your days.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '12px',
                marginBottom: '28px',
              }}
            >
              {Object.entries(THEME_PRESETS)
                .filter(([_, preset]) => preset.mode !== 'dark')
                .map(([key, preset]) => {
                  const isSelected = selectedTheme === key;
                  return (
                    <div
                      key={key}
                      onClick={() => handleSelectTheme(key as ThemeConfig['presetId'])}
                      style={{
                        padding: '16px',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--card-border)',
                        backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--card-bg)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: preset.colors.bgCanvas,
                            border: '1px solid #ccc',
                          }}
                        />
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: preset.colors.primary,
                          }}
                        />
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: preset.colors.secondary,
                          }}
                        />
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: preset.colors.accent,
                          }}
                        />
                      </div>
                      <div style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {preset.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {preset.description}
                      </div>
                    </div>
                  );
                })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(1)} className="btn btn-outline">
                Back
              </button>
              <button onClick={() => setStep(3)} className="btn btn-primary">
                <span>Continue to Light / Dark Mode</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Selecting Light or Dark Mode */}
        {step === 3 && (
          <div className="animate-fade-in">
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <span
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--primary)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Step 3 of 5 • Ambient Lighting
              </span>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '2rem',
                  color: 'var(--text-main)',
                  marginTop: '4px',
                }}
              >
                Select Light or Dark Mode
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Choose the ambient atmosphere that feels best for your eyes.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
              {/* Light Mode Card */}
              <div
                onClick={() => handleSelectMode('light')}
                style={{
                  padding: '24px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: selectedMode === 'light' ? '2.5px solid var(--primary)' : '1px solid var(--card-border)',
                  backgroundColor: '#FFF8F5',
                  color: '#353238',
                  cursor: 'pointer',
                  textAlign: 'center',
                  boxShadow: selectedMode === 'light' ? '0 8px 24px rgba(217, 155, 170, 0.25)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: '#F7EAEF',
                    color: '#D99BAA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                  }}
                >
                  <Sun size={22} />
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '4px' }}>
                  Warm Ivory (Light)
                </div>
                <div style={{ fontSize: '0.82rem', color: '#7E7983' }}>
                  Serene daylight, digital stationery aesthetic, warm linen.
                </div>
                {selectedMode === 'light' && (
                  <div
                    style={{
                      marginTop: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.78rem',
                      color: 'var(--primary)',
                      fontWeight: 700,
                    }}
                  >
                    <Check size={14} /> Active
                  </div>
                )}
              </div>

              {/* Dark Mode Card */}
              <div
                onClick={() => handleSelectMode('dark')}
                style={{
                  padding: '24px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: selectedMode === 'dark' ? '2.5px solid var(--primary)' : '1px solid var(--card-border)',
                  backgroundColor: '#1E1925',
                  color: '#F5EEF0',
                  cursor: 'pointer',
                  textAlign: 'center',
                  boxShadow: selectedMode === 'dark' ? '0 8px 24px rgba(0, 0, 0, 0.4)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(232, 165, 152, 0.18)',
                    color: '#E8A598',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                  }}
                >
                  <Moon size={22} />
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '4px' }}>
                  Midnight Candlelight (Dark)
                </div>
                <div style={{ fontSize: '0.82rem', color: '#AFA6B3' }}>
                  Gentle nightfall, glowing rose gold, relaxing low-light mode.
                </div>
                {selectedMode === 'dark' && (
                  <div
                    style={{
                      marginTop: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.78rem',
                      color: 'var(--primary)',
                      fontWeight: 700,
                    }}
                  >
                    <Check size={14} /> Active
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(2)} className="btn btn-outline">
                Back
              </button>
              <button onClick={() => setStep(4)} className="btn btn-primary">
                <span>Continue to First Routine</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Creating First Routine or Skipping */}
        {step === 4 && (
          <div className="animate-fade-in">
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <span
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--primary)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Step 4 of 5 • Daily Rituals
              </span>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '2rem',
                  color: 'var(--text-main)',
                  marginTop: '4px',
                }}
              >
                Create your first routine
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Plant a small seed for your daily rhythm. You can also skip this and add routines later.
              </p>
            </div>

            {/* Quick Inspiration Pills */}
            <div style={{ marginBottom: '18px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '8px',
                }}
              >
                Inspiration ideas:
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  'Morning Lemon Water & Sunlight',
                  '15-Minute Quiet Reading',
                  'Gentle Morning Mat Stretch',
                  'Evening Gratitude & Journal',
                  'Fresh Air Afternoon Walk',
                ].map(idea => (
                  <button
                    key={idea}
                    type="button"
                    onClick={() => setRoutineTitle(idea)}
                    style={{
                      fontSize: '0.78rem',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: 'var(--card-bg)',
                      border: '1px solid var(--card-border)',
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                    }}
                  >
                    + {idea}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Routine Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Morning Matcha & 5 Minutes Stillness"
                  value={routineTitle}
                  onChange={e => setRoutineTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--card-border)',
                    backgroundColor: 'var(--bg-canvas)',
                    fontSize: '0.94rem',
                    color: 'var(--text-main)',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                    Time of Day
                  </label>
                  <select
                    value={routineTime}
                    onChange={e => setRoutineTime(e.target.value as TimeOfDay)}
                    style={{
                      width: '100%',
                      padding: '10px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--card-border)',
                      backgroundColor: 'var(--bg-canvas)',
                      fontSize: '0.86rem',
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
                    value={routineCategory}
                    onChange={e => setRoutineCategory(e.target.value as RoutineCategory)}
                    style={{
                      width: '100%',
                      padding: '10px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--card-border)',
                      backgroundColor: 'var(--bg-canvas)',
                      fontSize: '0.86rem',
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

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                    Duration (mins)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={routineDuration}
                    onChange={e => setRoutineDuration(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '10px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--card-border)',
                      backgroundColor: 'var(--bg-canvas)',
                      fontSize: '0.86rem',
                      color: 'var(--text-main)',
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => setStep(3)} className="btn btn-outline">
                Back
              </button>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleSkipRoutine}
                  className="btn btn-ghost"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Skip this step
                </button>
                <button
                  type="button"
                  onClick={handleCreateRoutine}
                  disabled={!routineTitle.trim()}
                  className="btn btn-primary"
                >
                  <span>Save & Continue</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Sanctuary Ready & Open Personalized Dashboard */}
        {step === 5 && (
          <div className="animate-fade-in" style={{ textAlign: 'center' }}>
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
                margin: '0 auto 16px',
              }}
            >
              <CheckCircle2 size={32} />
            </div>

            <span
              style={{
                fontSize: '0.8rem',
                color: 'var(--primary)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Step 5 of 5 • Finalizing
            </span>

            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '2.2rem',
                color: 'var(--text-main)',
                marginTop: '4px',
                marginBottom: '10px',
              }}
            >
              Your sanctuary is ready, {firstName} 🌸
            </h2>

            <p
              style={{
                fontSize: '0.94rem',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                maxWidth: '480px',
                margin: '0 auto 24px',
              }}
            >
              Your preferences have been saved securely in Cloud Firestore. Welcome to your mindful routine tracker.
            </p>

            {/* Summary Capsule */}
            <div
              style={{
                backgroundColor: 'var(--bg-canvas-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
                maxWidth: '420px',
                margin: '0 auto 32px',
                textAlign: 'left',
                border: '1px solid var(--card-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '0.86rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Theme Palette:</span>
                <strong style={{ textTransform: 'capitalize' }}>{selectedTheme}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Ambient Mode:</span>
                <strong style={{ textTransform: 'capitalize' }}>{selectedMode} Mode</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>First Routine:</span>
                <strong>{routineCreated ? routineTitle : 'Customized Later'}</strong>
              </div>
            </div>

            <button
              onClick={handleLaunchDashboard}
              disabled={isFinishing}
              className="btn btn-primary btn-lg"
              style={{
                boxShadow: '0 8px 24px rgba(217, 155, 170, 0.45)',
              }}
            >
              <Compass size={18} />
              <span>{isFinishing ? 'Saving Sanctuary...' : 'Open Personalized Dashboard'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
