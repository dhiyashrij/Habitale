import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Flame,
  Clock,
  Bell,
} from 'lucide-react';
import type { CosmicTimerMode, CosmicSession, CosmicGrowthStats } from '../types';
import {
  loadCosmicStats,
  loadCosmicSessions,
  recordCosmicSession,
  clearCosmicHistory,
  getCosmicStageInfo,
  loadActiveTimerState,
  saveActiveTimerState,
  formatDurationHuman,
} from '../services/cosmicFocus';
import { playCosmicChime, playCosmicStageUpChime } from '../services/audio';
import { CosmicGardenVisual } from '../components/focus/CosmicGardenVisual';
import { CosmicTimerControls } from '../components/focus/CosmicTimerControls';
import { CosmicSessionModal } from '../components/focus/CosmicSessionModal';
import { CosmicHistoryList } from '../components/focus/CosmicHistoryList';
import { useTheme } from '../context/ThemeContext';

const COUNTDOWN_PRESETS = [5 * 60, 15 * 60, 25 * 60, 45 * 60, 60 * 60];

export const CosmicFocusPage: React.FC = () => {
  const { theme } = useTheme();

  // Persistent Stats & History
  const [stats, setStats] = useState<CosmicGrowthStats>(() => loadCosmicStats());
  const [sessions, setSessions] = useState<CosmicSession[]>(() => loadCosmicSessions());

  // Timer Mode & Status
  const [mode, setMode] = useState<CosmicTimerMode>('pomodoro');
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Time metrics (in seconds)
  const [targetDurationSeconds, setTargetDurationSeconds] = useState<number>(25 * 60);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(25 * 60);
  const [stopwatchElapsedSeconds, setStopwatchElapsedSeconds] = useState<number>(0);

  // Pomodoro Configuration
  const [pomodoroState, setPomodoroState] = useState<'focus' | 'break'>('focus');
  const [pomodoroCount, setPomodoroCount] = useState<number>(1);
  const [pomodoroFocusMinutes, setPomodoroFocusMinutes] = useState<number>(25);
  const [pomodoroBreakMinutes, setPomodoroBreakMinutes] = useState<number>(5);

  // Task linking
  const [activeTaskTitle, setActiveTaskTitle] = useState<string>('');
  const [activeTodoId, setActiveTodoId] = useState<string | undefined>(undefined);

  // Completion modal state
  const [completedSession, setCompletedSession] = useState<CosmicSession | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [stageChanged, setStageChanged] = useState<boolean>(false);

  // Immersion Mode
  const [isImmersionMode, setIsImmersionMode] = useState<boolean>(false);

  // Notification status
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  // Precise Timestamp references
  const startTimeRef = useRef<number>(0);
  const accumulatedElapsedRef = useRef<number>(0);
  const timerIntervalRef = useRef<number | null>(null);

  // Growth Stage info
  const stageInfo = getCosmicStageInfo(stats.totalFocusSeconds);

  // Restore persisted timer on mount
  useEffect(() => {
    const saved = loadActiveTimerState();
    if (!saved) return;

    setMode(saved.mode);
    setActiveTaskTitle(saved.taskTitle || '');
    setActiveTodoId(saved.todoId);
    setTargetDurationSeconds(saved.targetDurationSeconds);

    if (saved.pomodoroState) setPomodoroState(saved.pomodoroState);
    if (saved.pomodoroCount) setPomodoroCount(saved.pomodoroCount);

    if (saved.isRunning) {
      // Calculate elapsed time based on Date.now()
      const now = Date.now();
      const additionalElapsed = Math.floor((now - saved.lastResumeTimestamp) / 1000);
      const totalElapsed = saved.accumulatedElapsedSeconds + additionalElapsed;

      if (saved.mode === 'stopwatch') {
        accumulatedElapsedRef.current = totalElapsed;
        setStopwatchElapsedSeconds(totalElapsed);
        startTimeRef.current = Date.now();
        setIsRunning(true);
      } else {
        const remaining = Math.max(0, saved.targetDurationSeconds - totalElapsed);
        if (remaining > 0) {
          accumulatedElapsedRef.current = totalElapsed;
          setTimeRemainingSeconds(remaining);
          startTimeRef.current = Date.now();
          setIsRunning(true);
        } else {
          // Timer finished while tab was closed
          setTimeRemainingSeconds(0);
          setIsRunning(false);
          finishSession(saved.targetDurationSeconds, saved.mode, saved.taskTitle, saved.todoId);
        }
      }
    } else {
      accumulatedElapsedRef.current = saved.accumulatedElapsedSeconds;
      if (saved.mode === 'stopwatch') {
        setStopwatchElapsedSeconds(saved.accumulatedElapsedSeconds);
      } else {
        const remaining = Math.max(0, saved.targetDurationSeconds - saved.accumulatedElapsedSeconds);
        setTimeRemainingSeconds(remaining);
      }
    }
  }, []);

  // Timer Tick Engine
  useEffect(() => {
    if (!isRunning) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    timerIntervalRef.current = window.setInterval(() => {
      const now = Date.now();
      const currentSessionElapsed = (now - startTimeRef.current) / 1000;
      const totalElapsed = accumulatedElapsedRef.current + currentSessionElapsed;

      if (mode === 'stopwatch') {
        setStopwatchElapsedSeconds(Math.floor(totalElapsed));
      } else {
        const remaining = Math.max(0, targetDurationSeconds - totalElapsed);
        setTimeRemainingSeconds(Math.floor(remaining));

        if (remaining <= 0) {
          // Session Completed!
          handleSessionCompletion();
        }
      }
    }, 200);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [isRunning, mode, targetDurationSeconds, pomodoroState]);

  // Persist state when changes happen
  useEffect(() => {
    if (isRunning) {
      saveActiveTimerState({
        mode,
        taskTitle: activeTaskTitle,
        todoId: activeTodoId,
        targetDurationSeconds,
        accumulatedElapsedSeconds: accumulatedElapsedRef.current,
        lastResumeTimestamp: startTimeRef.current,
        isRunning: true,
        pomodoroState,
        pomodoroCount,
      });
    } else if (accumulatedElapsedRef.current > 0) {
      saveActiveTimerState({
        mode,
        taskTitle: activeTaskTitle,
        todoId: activeTodoId,
        targetDurationSeconds,
        accumulatedElapsedSeconds: accumulatedElapsedRef.current,
        lastResumeTimestamp: Date.now(),
        isRunning: false,
        pomodoroState,
        pomodoroCount,
      });
    } else {
      saveActiveTimerState(null);
    }
  }, [isRunning, mode, activeTaskTitle, activeTodoId, targetDurationSeconds, pomodoroState, pomodoroCount]);

  const handleStart = () => {
    startTimeRef.current = Date.now();
    setIsRunning(true);
  };

  const handlePause = () => {
    if (isRunning) {
      const now = Date.now();
      accumulatedElapsedRef.current += (now - startTimeRef.current) / 1000;
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    accumulatedElapsedRef.current = 0;
    startTimeRef.current = 0;

    if (mode === 'stopwatch') {
      setStopwatchElapsedSeconds(0);
    } else {
      setTimeRemainingSeconds(targetDurationSeconds);
    }
    saveActiveTimerState(null);
  };

  const finishSession = (
    durationSec: number,
    sessionMode: CosmicTimerMode,
    taskTitle: string,
    todoId?: string
  ) => {
    const safeDuration = Math.max(1, Math.floor(durationSec));

    // Only record focus time during actual focus sessions (not break sessions)
    const isFocusSession = sessionMode !== 'pomodoro' || pomodoroState === 'focus';

    let result = null;
    if (isFocusSession) {
      result = recordCosmicSession({
        taskTitle,
        todoId,
        durationSeconds: safeDuration,
        mode: sessionMode,
      });

      setStats(result.newStats);
      setSessions(loadCosmicSessions());
      setStageChanged(result.stageChanged);
    }

    // Audio & Stardust celebration
    if (theme.soundEnabled) {
      if (result?.stageChanged) {
        playCosmicStageUpChime(true);
      } else {
        playCosmicChime(true);
      }
    }

    if (theme.confettiEnabled) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D99BAA', '#C9BDE7', '#A8B89F', '#FFF8F5', '#7AA2E3'],
      });
    }

    // Browser Notification
    if (notificationPermission === 'granted' && typeof window !== 'undefined' && 'Notification' in window) {
      try {
        new Notification('✨ Cosmic Focus Complete', {
          body: `Well done! ${taskTitle ? `"${taskTitle}"` : 'Your focus session'} concluded. Time to rest your eyes.`,
          icon: '/favicon.ico',
        });
      } catch (err) {
        console.debug('Notification error:', err);
      }
    }

    if (result) {
      setCompletedSession(result.session);
      setIsModalOpen(true);
    }
  };

  const handleSessionCompletion = () => {
    handlePause();

    if (mode === 'pomodoro') {
      if (pomodoroState === 'focus') {
        finishSession(targetDurationSeconds, 'pomodoro', activeTaskTitle, activeTodoId);
        // Transition to Break
        setPomodoroState('break');
        setTargetDurationSeconds(pomodoroBreakMinutes * 60);
        setTimeRemainingSeconds(pomodoroBreakMinutes * 60);
        accumulatedElapsedRef.current = 0;
      } else {
        // Break finished
        playCosmicChime(theme.soundEnabled);
        setPomodoroState('focus');
        setPomodoroCount(prev => prev + 1);
        setTargetDurationSeconds(pomodoroFocusMinutes * 60);
        setTimeRemainingSeconds(pomodoroFocusMinutes * 60);
        accumulatedElapsedRef.current = 0;
      }
    } else {
      finishSession(targetDurationSeconds, 'countdown', activeTaskTitle, activeTodoId);
      handleReset();
    }
  };

  const handleFinishEarly = () => {
    const elapsed =
      mode === 'stopwatch'
        ? stopwatchElapsedSeconds
        : Math.floor(targetDurationSeconds - timeRemainingSeconds);

    if (elapsed > 10) {
      finishSession(elapsed, mode, activeTaskTitle, activeTodoId);
    }
    handleReset();
  };

  const handleSelectMode = (newMode: CosmicTimerMode) => {
    if (isRunning) {
      if (!confirm('Switch timer mode? Current session progress will be reset.')) return;
    }
    handleReset();
    setMode(newMode);

    if (newMode === 'countdown') {
      setTargetDurationSeconds(25 * 60);
      setTimeRemainingSeconds(25 * 60);
    } else if (newMode === 'pomodoro') {
      setPomodoroState('focus');
      setTargetDurationSeconds(pomodoroFocusMinutes * 60);
      setTimeRemainingSeconds(pomodoroFocusMinutes * 60);
    } else if (newMode === 'stopwatch') {
      setStopwatchElapsedSeconds(0);
    }
  };

  const handleSelectCountdownPreset = (sec: number) => {
    handleReset();
    setTargetDurationSeconds(sec);
    setTimeRemainingSeconds(sec);
  };

  const handleSetCustomCountdown = (sec: number) => {
    handleReset();
    setTargetDurationSeconds(sec);
    setTimeRemainingSeconds(sec);
  };

  const handleUpdatePomodoroConfig = (focusMins: number, breakMins: number) => {
    setPomodoroFocusMinutes(focusMins);
    setPomodoroBreakMinutes(breakMins);
    if (!isRunning) {
      const newSec = (pomodoroState === 'focus' ? focusMins : breakMins) * 60;
      setTargetDurationSeconds(newSec);
      setTimeRemainingSeconds(newSec);
    }
  };

  const handleSkipPomodoroBreak = () => {
    handleReset();
    setPomodoroState('focus');
    setPomodoroCount(prev => prev + 1);
    setTargetDurationSeconds(pomodoroFocusMinutes * 60);
    setTimeRemainingSeconds(pomodoroFocusMinutes * 60);
  };

  const handleRequestNotifications = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        width: '100%',
        maxWidth: isImmersionMode ? '1000px' : '980px',
        margin: '0 auto',
        transition: 'all var(--transition-normal)',
      }}
    >
      {/* Galaxy Immersion Backdrop Overlay when active */}
      {isImmersionMode && (
        <style>{`
          .app-container {
            background: linear-gradient(135deg, #090814 0%, #15132D 45%, #201A4C 100%) !important;
            color: #F7EAEF !important;
          }
          .main-content {
            background: transparent !important;
          }
        `}</style>
      )}

      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '26px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={17} />
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '2rem',
                color: isImmersionMode ? '#FFFFFF' : 'var(--text-main)',
                lineHeight: 1.1,
              }}
            >
              Cosmic Focus Sanctuary
            </h2>
          </div>
          <p style={{ fontSize: '0.9rem', color: isImmersionMode ? '#D1C9DE' : 'var(--text-muted)' }}>
            Nurture your daily flow. Every focused minute helps your miniature universe flourish.
          </p>
        </div>

        {/* Total Time & Notification Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Total Focus Time Pill */}
          <div
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--bg-canvas-subtle)',
              border: '1px solid var(--card-border)',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Clock size={14} color="var(--primary)" />
            <span>{formatDurationHuman(stats.totalFocusSeconds)} Total Focus</span>
          </div>

          {/* Browser Notification Button */}
          {notificationPermission !== 'granted' && (
            <button
              type="button"
              onClick={handleRequestNotifications}
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
              title="Enable tab notifications when focus sessions end"
            >
              <Bell size={13} />
              <span>Enable Chime Alerts</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Focus Deck: Grid layout with Garden on Left and Timer on Right */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)',
          gap: '24px',
          alignItems: 'stretch',
          marginBottom: '28px',
        }}
        className="cosmic-focus-grid"
      >
        {/* Left Column: Cosmic Garden Progression */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <CosmicGardenVisual
            currentStage={stageInfo.currentStage}
            nextStage={stageInfo.nextStage}
            progressPercent={stageInfo.progressPercent}
            isRunning={isRunning && (mode !== 'pomodoro' || pomodoroState === 'focus')}
            totalFocusSeconds={stats.totalFocusSeconds}
          />

          {/* Streak & Mindfulness Capsule */}
          <div
            className="card"
            style={{
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--card-bg)',
              borderRadius: 'var(--card-radius)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Flame size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Focus Rhythm
                </div>
                <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {stats.currentStreakDays} {stats.currentStreakDays === 1 ? 'Day' : 'Days'} Streak
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Sessions
              </div>
              <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--secondary)' }}>
                {stats.totalSessionsCount} Completed
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Timer Engine & Controls */}
        <div
          className="card"
          style={{
            padding: '30px 24px',
            backgroundColor: 'var(--card-bg)',
            borderRadius: 'var(--card-radius)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <CosmicTimerControls
            mode={mode}
            onSelectMode={handleSelectMode}
            isRunning={isRunning}
            timeRemainingSeconds={timeRemainingSeconds}
            stopwatchElapsedSeconds={stopwatchElapsedSeconds}
            targetDurationSeconds={targetDurationSeconds}
            onStart={handleStart}
            onPause={handlePause}
            onReset={handleReset}
            onFinishEarly={handleFinishEarly}
            countdownPresets={COUNTDOWN_PRESETS}
            onSelectCountdownPreset={handleSelectCountdownPreset}
            onSetCustomCountdown={handleSetCustomCountdown}
            pomodoroState={pomodoroState}
            pomodoroCount={pomodoroCount}
            pomodoroFocusMinutes={pomodoroFocusMinutes}
            pomodoroBreakMinutes={pomodoroBreakMinutes}
            onUpdatePomodoroConfig={handleUpdatePomodoroConfig}
            onSkipPomodoroBreak={handleSkipPomodoroBreak}
            activeTaskTitle={activeTaskTitle}
            activeTodoId={activeTodoId}
            onSelectTask={(title, todoId) => {
              setActiveTaskTitle(title);
              setActiveTodoId(todoId);
            }}
            onClearTask={() => {
              setActiveTaskTitle('');
              setActiveTodoId(undefined);
            }}
            isImmersionMode={isImmersionMode}
            onToggleImmersionMode={() => setIsImmersionMode(!isImmersionMode)}
          />
        </div>
      </div>

      {/* Recent History Section */}
      <CosmicHistoryList
        sessions={sessions}
        onClearHistory={() => {
          clearCosmicHistory();
          setSessions([]);
        }}
      />

      {/* Completion Modal */}
      <CosmicSessionModal
        isOpen={isModalOpen}
        session={completedSession}
        stageChanged={stageChanged}
        onClose={() => {
          setIsModalOpen(false);
          setCompletedSession(null);
        }}
      />
    </div>
  );
};
