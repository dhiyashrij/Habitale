import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Timer,
  Clock,
  Sparkles,
  Coffee,
  SkipForward,
  Maximize2,
  Minimize2,
  ChevronDown,
  X,
  Plus,
} from 'lucide-react';
import type { CosmicTimerMode } from '../../types';
import { useTodos } from '../../context/TodosContext';

interface CosmicTimerControlsProps {
  mode: CosmicTimerMode;
  onSelectMode: (mode: CosmicTimerMode) => void;
  isRunning: boolean;
  timeRemainingSeconds: number; // for countdown & pomodoro
  stopwatchElapsedSeconds: number; // for stopwatch
  targetDurationSeconds: number; // for progress calculation
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onFinishEarly: () => void;
  // Countdown settings
  countdownPresets: number[]; // in seconds
  onSelectCountdownPreset: (seconds: number) => void;
  onSetCustomCountdown: (seconds: number) => void;
  // Pomodoro settings
  pomodoroState: 'focus' | 'break';
  pomodoroCount: number;
  pomodoroFocusMinutes: number;
  pomodoroBreakMinutes: number;
  onUpdatePomodoroConfig: (focusMins: number, breakMins: number) => void;
  onSkipPomodoroBreak: () => void;
  // Task selection
  activeTaskTitle: string;
  activeTodoId?: string;
  onSelectTask: (taskTitle: string, todoId?: string) => void;
  onClearTask: () => void;
  // Immersion & appearance
  isImmersionMode: boolean;
  onToggleImmersionMode: () => void;
}

export const CosmicTimerControls: React.FC<CosmicTimerControlsProps> = ({
  mode,
  onSelectMode,
  isRunning,
  timeRemainingSeconds,
  stopwatchElapsedSeconds,
  targetDurationSeconds,
  onStart,
  onPause,
  onReset,
  onFinishEarly,
  countdownPresets,
  onSelectCountdownPreset,
  onSetCustomCountdown,
  pomodoroState,
  pomodoroCount,
  pomodoroFocusMinutes,
  pomodoroBreakMinutes,
  onUpdatePomodoroConfig,
  onSkipPomodoroBreak,
  activeTaskTitle,
  activeTodoId,
  onSelectTask,
  onClearTask,
  isImmersionMode,
  onToggleImmersionMode,
}) => {
  const { todos } = useTodos();
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);
  const [customTaskInput, setCustomTaskInput] = useState('');
  const [showCustomDurationInput, setShowCustomDurationInput] = useState(false);
  const [customMinutesInput, setCustomMinutesInput] = useState('25');

  const activeTodos = todos.filter(t => !t.completed);

  // Time format calculations
  const displaySeconds =
    mode === 'stopwatch' ? stopwatchElapsedSeconds : timeRemainingSeconds;

  const hours = Math.floor(displaySeconds / 3600);
  const minutes = Math.floor((displaySeconds % 3600) / 60);
  const seconds = Math.floor(displaySeconds % 60);

  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');

  // SVG Progress calculation
  let progressRatio = 0;
  if (mode === 'countdown' || mode === 'pomodoro') {
    if (targetDurationSeconds > 0) {
      progressRatio = Math.max(0, Math.min(1, 1 - timeRemainingSeconds / targetDurationSeconds));
    }
  } else {
    // Stopwatch pulses in 60s loops
    progressRatio = (stopwatchElapsedSeconds % 60) / 60;
  }

  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const handleApplyCustomCountdown = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(customMinutesInput, 10);
    if (!isNaN(mins) && mins > 0) {
      onSetCustomCountdown(mins * 60);
      setShowCustomDurationInput(false);
    }
  };

  const handleSaveCustomTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTaskInput.trim()) {
      onSelectTask(customTaskInput.trim(), undefined);
      setCustomTaskInput('');
      setShowTaskDropdown(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}
    >
      {/* Mode Selector & Immersion Toggle */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: '520px',
          marginBottom: '20px',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        {/* Mode Tabs */}
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: 'var(--bg-canvas-subtle)',
            padding: '4px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--card-border)',
            gap: '2px',
          }}
        >
          <button
            type="button"
            onClick={() => onSelectMode('countdown')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: mode === 'countdown' ? 'var(--card-bg)' : 'transparent',
              color: mode === 'countdown' ? 'var(--text-main)' : 'var(--text-muted)',
              boxShadow: mode === 'countdown' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Timer size={14} />
            <span>Countdown</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectMode('pomodoro')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: mode === 'pomodoro' ? 'var(--card-bg)' : 'transparent',
              color: mode === 'pomodoro' ? 'var(--text-main)' : 'var(--text-muted)',
              boxShadow: mode === 'pomodoro' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Sparkles size={14} />
            <span>Pomodoro</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectMode('stopwatch')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: mode === 'stopwatch' ? 'var(--card-bg)' : 'transparent',
              color: mode === 'stopwatch' ? 'var(--text-main)' : 'var(--text-muted)',
              boxShadow: mode === 'stopwatch' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Clock size={14} />
            <span>Stopwatch</span>
          </button>
        </div>

        {/* Immersion Mode Button */}
        <button
          type="button"
          onClick={onToggleImmersionMode}
          className="btn btn-outline btn-sm"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.78rem',
            padding: '6px 12px',
          }}
          title={isImmersionMode ? 'Standard View' : 'Galaxy Immersion Mode'}
        >
          {isImmersionMode ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          <span>{isImmersionMode ? 'Normal View' : 'Immersion View'}</span>
        </button>
      </div>

      {/* Active Task / Intention Pill */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '420px', marginBottom: '22px' }}>
        <div
          onClick={() => setShowTaskDropdown(!showTaskDropdown)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 14px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'var(--bg-canvas-subtle)',
            border: '1px solid var(--card-border)',
            cursor: 'pointer',
            transition: 'border-color var(--transition-fast)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isRunning ? 'var(--primary)' : 'var(--secondary)',
                animation: isRunning ? 'pulse 2s infinite' : 'none',
              }}
            />
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeTaskTitle || 'Select or enter a focus intention...'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {activeTaskTitle && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  onClearTask();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '2px',
                  borderRadius: '50%',
                }}
                title="Clear task"
              >
                <X size={14} />
              </button>
            )}
            <ChevronDown size={14} color="var(--text-muted)" />
          </div>
        </div>

        {/* Task Selection Dropdown Menu */}
        {showTaskDropdown && (
          <div
            className="animate-fade-in card"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '6px',
              padding: '12px',
              zIndex: 50,
              backgroundColor: 'var(--card-bg)',
              boxShadow: 'var(--card-shadow-hover)',
              border: '1px solid var(--card-border)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            {/* Custom Task Entry Form */}
            <form onSubmit={handleSaveCustomTask} style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="Type a custom intention..."
                value={customTaskInput}
                onChange={e => setCustomTaskInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  fontSize: '0.82rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--card-border)',
                  backgroundColor: 'var(--bg-canvas)',
                  color: 'var(--text-main)',
                }}
              />
              <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '6px 10px' }}>
                <Plus size={14} />
              </button>
            </form>

            <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
              Active Habitale To-Dos
            </div>

            {activeTodos.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '6px 0' }}>
                No active to-dos found. Type a custom task above!
              </div>
            ) : (
              <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {activeTodos.map(todo => (
                  <button
                    key={todo.id}
                    type="button"
                    onClick={() => {
                      onSelectTask(todo.title, todo.id);
                      setShowTaskDropdown(false);
                    }}
                    style={{
                      textAlign: 'left',
                      padding: '7px 10px',
                      fontSize: '0.82rem',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      background: activeTodoId === todo.id ? 'var(--primary-light)' : 'transparent',
                      color: activeTodoId === todo.id ? 'var(--primary)' : 'var(--text-main)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {todo.title}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                      {todo.category}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pomodoro Focus vs Break State Banner */}
      {mode === 'pomodoro' && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 14px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: pomodoroState === 'focus' ? 'var(--primary-light)' : 'var(--secondary-light)',
            color: pomodoroState === 'focus' ? 'var(--primary)' : '#3C5C38',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: '16px',
            border: `1px solid ${pomodoroState === 'focus' ? 'rgba(217, 155, 170, 0.4)' : 'rgba(168, 184, 159, 0.4)'}`,
          }}
        >
          {pomodoroState === 'focus' ? <Sparkles size={14} /> : <Coffee size={14} />}
          <span>
            {pomodoroState === 'focus'
              ? `Focus Session #${pomodoroCount}`
              : `Resting Break (${pomodoroBreakMinutes}m)`}
          </span>
          {pomodoroState === 'break' && (
            <button
              type="button"
              onClick={onSkipPomodoroBreak}
              style={{
                background: 'none',
                border: 'none',
                color: '#3C5C38',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.74rem',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                marginLeft: '4px',
                textDecoration: 'underline',
              }}
            >
              <span>Skip</span>
              <SkipForward size={12} />
            </button>
          )}
        </div>
      )}

      {/* Circular Celestial Timer Display */}
      <div
        style={{
          position: 'relative',
          width: '260px',
          height: '260px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '26px',
        }}
      >
        <svg width="260" height="260" style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }}>
          {/* Background Track */}
          <circle
            cx="130"
            cy="130"
            r={radius}
            fill="transparent"
            stroke="var(--bg-canvas-subtle)"
            strokeWidth="10"
          />

          {/* Active Glowing Orbital Progress Track */}
          <circle
            cx="130"
            cy="130"
            r={radius}
            fill="transparent"
            stroke={pomodoroState === 'break' ? 'var(--secondary)' : 'var(--primary)'}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: isRunning ? 'stroke-dashoffset 0.8s linear' : 'none',
              filter: `drop-shadow(0 0 8px ${pomodoroState === 'break' ? 'rgba(168,184,159,0.5)' : 'rgba(217,155,170,0.5)'})`,
            }}
          />
        </svg>

        {/* Center Clock Digits */}
        <div style={{ textAlign: 'center', zIndex: 2 }}>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: hours > 0 ? '2.8rem' : '3.6rem',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              lineHeight: 1,
              color: 'var(--text-main)',
            }}
          >
            {hours > 0 ? `${formattedHours}:${formattedMinutes}:${formattedSeconds}` : `${formattedMinutes}:${formattedSeconds}`}
          </div>

          <div
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              marginTop: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 600,
            }}
          >
            {isRunning ? 'Focused Flow' : 'Ready'}
          </div>
        </div>
      </div>

      {/* Main Play / Pause & Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
        {/* Reset Button */}
        <button
          type="button"
          onClick={onReset}
          className="btn btn-outline"
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Reset Timer"
          aria-label="Reset Timer"
        >
          <RotateCcw size={18} />
        </button>

        {/* Primary Play/Pause Button */}
        <button
          type="button"
          onClick={isRunning ? onPause : onStart}
          className="btn btn-primary"
          style={{
            padding: '14px 34px',
            borderRadius: 'var(--radius-pill)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '1.05rem',
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(217, 155, 170, 0.45)',
          }}
        >
          {isRunning ? (
            <>
              <Pause size={20} />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play size={20} style={{ marginLeft: '2px' }} />
              <span>{displaySeconds > 0 && (mode === 'countdown' || mode === 'pomodoro') && displaySeconds < targetDurationSeconds ? 'Resume' : 'Start Focus'}</span>
            </>
          )}
        </button>

        {/* Complete Session Early Button */}
        {(isRunning || (mode === 'stopwatch' && stopwatchElapsedSeconds > 10)) && (
          <button
            type="button"
            onClick={onFinishEarly}
            className="btn btn-secondary"
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Complete & Record Session"
            aria-label="Complete Session"
          >
            <CheckCircle size={20} />
          </button>
        )}
      </div>

      {/* Mode-Specific Quick Presets & Settings */}
      {mode === 'countdown' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {countdownPresets.map(sec => {
              const mins = Math.floor(sec / 60);
              const isSelected = targetDurationSeconds === sec && !isRunning;
              return (
                <button
                  key={sec}
                  type="button"
                  onClick={() => onSelectCountdownPreset(sec)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid var(--card-border)',
                    backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-canvas-subtle)',
                    color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {mins}m
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setShowCustomDurationInput(!showCustomDurationInput)}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-pill)',
                border: '1px dashed var(--card-border)',
                backgroundColor: 'transparent',
                color: 'var(--text-muted)',
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              Custom...
            </button>
          </div>

          {showCustomDurationInput && (
            <form onSubmit={handleApplyCustomCountdown} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="number"
                min="1"
                max="360"
                value={customMinutesInput}
                onChange={e => setCustomMinutesInput(e.target.value)}
                style={{
                  width: '80px',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--card-border)',
                  fontSize: '0.84rem',
                  textAlign: 'center',
                }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>minutes</span>
              <button type="submit" className="btn btn-outline btn-sm">Set</button>
            </form>
          )}
        </div>
      )}

      {mode === 'pomodoro' && (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span>Focus: <strong>{pomodoroFocusMinutes}m</strong></span>
          <span>&bull;</span>
          <span>Break: <strong>{pomodoroBreakMinutes}m</strong></span>
          <button
            type="button"
            onClick={() => {
              const newFocus = prompt('Set focus duration in minutes (e.g. 25):', pomodoroFocusMinutes.toString());
              if (newFocus && !isNaN(parseInt(newFocus, 10))) {
                const newBreak = prompt('Set break duration in minutes (e.g. 5):', pomodoroBreakMinutes.toString());
                if (newBreak && !isNaN(parseInt(newBreak, 10))) {
                  onUpdatePomodoroConfig(parseInt(newFocus, 10), parseInt(newBreak, 10));
                }
              }
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '0.78rem',
              fontWeight: 600,
            }}
          >
            Customize
          </button>
        </div>
      )}

      {mode === 'stopwatch' && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Track open-ended deep flow time with no countdown pressure.
        </div>
      )}
    </div>
  );
};
