import React, { createContext, useContext, useState, useEffect } from 'react';
import type { DailyReflection, MoodType } from '../types';
import { loadLocalReflections, saveLocalReflections } from '../services/storage';
import { fetchUserReflections, saveUserReflection } from '../services/firestore';
import { getTodayString } from './RoutinesContext';
import { useAuth } from './AuthContext';

const DAILY_PROMPTS = [
  'What was the sweetest, most peaceful moment of your day?',
  'Name one small win or quiet effort you are proud of today.',
  'How did you show gentleness or kindness to yourself today?',
  'What sensory detail brought you delight (a scent, warm drink, or light)?',
  'What is something you would like to softly let go of before sleeping?',
  'Who or what made you feel supported and grounded today?',
  'What routine felt the most nourishing to your spirit today?',
];

export const MOOD_OPTIONS: { id: MoodType; label: string; emoji: string; color: string }[] = [
  { id: 'serene', label: 'Serene', emoji: '🌿', color: '#A8B89F' },
  { id: 'grateful', label: 'Grateful', emoji: '🌸', color: '#D99BAA' },
  { id: 'energized', label: 'Energized', emoji: '☀️', color: '#E5A93B' },
  { id: 'creative', label: 'Creative', emoji: '✨', color: '#C9BDE7' },
  { id: 'reflective', label: 'Reflective', emoji: '🕯️', color: '#BCA89F' },
  { id: 'cozy', label: 'Cozy', emoji: '☕', color: '#A88E79' },
  { id: 'tired', label: 'Rest-ready', emoji: '🌙', color: '#8F9AA6' },
];

interface ReflectionContextType {
  todayReflection: DailyReflection;
  reflections: Record<string, DailyReflection>;
  updateTodayReflection: (updates: Partial<DailyReflection>) => Promise<void>;
  getDailyPrompt: () => string;
}

const ReflectionContext = createContext<ReflectionContextType | undefined>(undefined);

export const ReflectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [reflections, setReflections] = useState<Record<string, DailyReflection>>(loadLocalReflections);
  const todayStr = getTodayString();

  const getDailyPrompt = (): string => {
    const day = new Date().getDate();
    return DAILY_PROMPTS[day % DAILY_PROMPTS.length];
  };

  const defaultToday: DailyReflection = {
    date: todayStr,
    mood: undefined,
    prompt: getDailyPrompt(),
    response: '',
    gratitudeNote: '',
    updatedAt: new Date().toISOString(),
  };

  const todayReflection = reflections[todayStr] || defaultToday;

  // Load from Firestore on user login
  useEffect(() => {
    if (!user) {
      setReflections(loadLocalReflections());
      return;
    }

    const loadCloudReflections = async () => {
      try {
        const cloudRefs = await fetchUserReflections(user.id);
        if (Object.keys(cloudRefs).length > 0) {
          setReflections(cloudRefs);
          saveLocalReflections(cloudRefs);
        } else {
          const local = loadLocalReflections();
          if (Object.keys(local).length > 0) {
            setReflections(local);
            for (const item of Object.values(local)) {
              await saveUserReflection(user.id, item);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching reflections from Firestore:', err);
      }
    };

    loadCloudReflections();
  }, [user?.id]);

  useEffect(() => {
    saveLocalReflections(reflections);
  }, [reflections]);

  const updateTodayReflection = async (updates: Partial<DailyReflection>) => {
    const existing = reflections[todayStr] || defaultToday;
    const updated: DailyReflection = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    setReflections(prev => ({
      ...prev,
      [todayStr]: updated,
    }));

    if (user) {
      try {
        await saveUserReflection(user.id, updated);
      } catch (err) {
        console.error('Failed to sync reflection to Firestore:', err);
      }
    }
  };

  return (
    <ReflectionContext.Provider
      value={{
        todayReflection,
        reflections,
        updateTodayReflection,
        getDailyPrompt,
      }}
    >
      {children}
    </ReflectionContext.Provider>
  );
};

export const useReflection = () => {
  const context = useContext(ReflectionContext);
  if (!context) {
    throw new Error('useReflection must be used within a ReflectionProvider');
  }
  return context;
};
