import type { Routine, Todo, DailyReflection, UserProfile, ThemeConfig } from '../types';
import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const KEYS = {
  USER: 'habitale_user_profile',
  ROUTINES: 'habitale_routines',
  TODOS: 'habitale_todos',
  REFLECTIONS: 'habitale_reflections',
  THEME: 'habitale_theme_config',
};

// Default theme configuration
export const defaultThemeConfig: ThemeConfig = {
  presetId: 'blush',
  appearanceMode: 'light',
  colorMode: 'light',
  colors: {
    bgCanvas: '#FFF8F5',
    primary: '#D99BAA',
    primaryHover: '#C68796',
    secondary: '#A8B89F',
    accent: '#C9BDE7',
    textMain: '#353238',
    textMuted: '#7E7983',
    cardBg: '#FFFFFF',
    cardBorder: 'rgba(217, 155, 170, 0.22)',
    cardShadow: '0 4px 20px -2px rgba(53, 50, 56, 0.04)',
    sidebarBg: '#FCF6F3',
  },
  headingFont: 'Fraunces',
  bodyFont: 'Plus Jakarta Sans',
  cardRadius: '18px',
  cardStyle: 'subtle-shadow',
  sidebarStyle: 'solid',
  backgroundPattern: 'paper',
  paperTexture: true,
  soundEnabled: true,
  confettiEnabled: true,
};

// Curated starter routine packs
export const starterRoutines: Routine[] = [
  {
    id: 'starter-1',
    title: 'Hydrate & Morning Sunlight',
    description: 'Drink a glass of warm lemon water and catch 5 mins of morning light.',
    category: 'wellness',
    timeOfDay: 'morning',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    reminderTime: '07:30',
    icon: 'Sun',
    tasks: [
      { id: 'st-1-1', title: 'Drink warm lemon water', time: '07:30', durationMinutes: 5, completedDates: [], order: 0 },
      { id: 'st-1-2', title: 'Sit in morning natural sunlight', time: '07:35', durationMinutes: 5, completedDates: [], order: 1 },
    ],
    streak: 3,
    bestStreak: 7,
    completedDates: [],
    createdAt: new Date().toISOString(),
    order: 0,
  },
  {
    id: 'starter-2',
    title: 'Gentle Mat Stretch or Yoga',
    description: 'Slow, mindful breathing and stretching to awaken the spine.',
    category: 'fitness',
    timeOfDay: 'morning',
    daysOfWeek: [1, 2, 3, 4, 5],
    reminderTime: '08:00',
    icon: 'Sparkles',
    tasks: [
      { id: 'st-2-1', title: 'Gentle cat-cow & spinal breath', time: '08:00', durationMinutes: 5, completedDates: [], order: 0 },
      { id: 'st-2-2', title: 'Full body restorative flow', time: '08:05', durationMinutes: 10, completedDates: [], order: 1 },
    ],
    streak: 2,
    bestStreak: 5,
    completedDates: [],
    createdAt: new Date().toISOString(),
    order: 1,
  },
  {
    id: 'starter-3',
    title: 'Nourishing Midday Walk',
    description: 'Step outside to refresh the mind and unplug from screens.',
    category: 'wellness',
    timeOfDay: 'afternoon',
    daysOfWeek: [1, 2, 3, 4, 5],
    reminderTime: '13:00',
    icon: 'Activity',
    tasks: [
      { id: 'st-3-1', title: 'Step outside & breathe fresh air', time: '13:00', durationMinutes: 15, completedDates: [], order: 0 },
      { id: 'st-3-2', title: 'Hydrate with cool water', time: '13:15', durationMinutes: 5, completedDates: [], order: 1 },
    ],
    streak: 1,
    bestStreak: 4,
    completedDates: [],
    createdAt: new Date().toISOString(),
    order: 2,
  },
  {
    id: 'starter-4',
    title: 'Evening Candlelit Reading',
    description: 'Read 15 pages of a comforting book before sleep.',
    category: 'mindfulness',
    timeOfDay: 'evening',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    reminderTime: '21:30',
    icon: 'BookOpen',
    tasks: [
      { id: 'st-4-1', title: 'Light a calming cedar candle', time: '21:30', durationMinutes: 2, completedDates: [], order: 0 },
      { id: 'st-4-2', title: 'Read 15 comforting pages', time: '21:32', durationMinutes: 20, completedDates: [], order: 1 },
    ],
    streak: 4,
    bestStreak: 12,
    completedDates: [],
    createdAt: new Date().toISOString(),
    order: 3,
  },
  {
    id: 'starter-5',
    title: 'Five-Minute Gratitude Reflection',
    description: 'Write down 3 gentle moments that brought warmth today.',
    category: 'selfcare',
    timeOfDay: 'evening',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    reminderTime: '22:00',
    icon: 'Heart',
    tasks: [
      { id: 'st-5-1', title: 'Write down 3 gentle moments', time: '22:00', durationMinutes: 5, completedDates: [], order: 0 },
    ],
    streak: 5,
    bestStreak: 14,
    completedDates: [],
    createdAt: new Date().toISOString(),
    order: 4,
  },
];

export const starterTodos: Todo[] = [
  {
    id: 'starter-todo-1',
    title: 'Pick fresh eucalyptus or flowers for desk',
    category: 'Wellness',
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0],
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'starter-todo-2',
    title: 'Organize week planner & prioritize top 3 goals',
    category: 'Work',
    priority: 'high',
    dueDate: new Date().toISOString().split('T')[0],
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'starter-todo-3',
    title: 'Brew matcha latte and practice mindfulness',
    category: 'Personal',
    priority: 'low',
    completed: true,
    completedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
];

// LocalStorage helpers
export function loadLocalUser(): UserProfile | null {
  const data = localStorage.getItem(KEYS.USER);
  return data ? JSON.parse(data) : null;
}

export function saveLocalUser(user: UserProfile | null) {
  if (!user) {
    localStorage.removeItem(KEYS.USER);
  } else {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
  }
}

export function loadLocalRoutines(): Routine[] {
  const data = localStorage.getItem(KEYS.ROUTINES);
  return data ? JSON.parse(data) : [];
}

export function saveLocalRoutines(routines: Routine[]) {
  localStorage.setItem(KEYS.ROUTINES, JSON.stringify(routines));
}

export function loadLocalTodos(): Todo[] {
  const data = localStorage.getItem(KEYS.TODOS);
  return data ? JSON.parse(data) : [];
}

export function saveLocalTodos(todos: Todo[]) {
  localStorage.setItem(KEYS.TODOS, JSON.stringify(todos));
}

export function loadLocalReflections(): Record<string, DailyReflection> {
  const data = localStorage.getItem(KEYS.REFLECTIONS);
  return data ? JSON.parse(data) : {};
}

export function saveLocalReflections(reflections: Record<string, DailyReflection>) {
  localStorage.setItem(KEYS.REFLECTIONS, JSON.stringify(reflections));
}

export function loadLocalTheme(): ThemeConfig {
  const data = localStorage.getItem(KEYS.THEME);
  return data ? { ...defaultThemeConfig, ...JSON.parse(data) } : defaultThemeConfig;
}

export function saveLocalTheme(theme: ThemeConfig) {
  localStorage.setItem(KEYS.THEME, JSON.stringify(theme));
}

// Firestore cloud sync helpers (when user is connected with real Firebase)
export async function syncUserDataToFirestore(userId: string, data: { routines?: Routine[]; todos?: Todo[]; reflections?: Record<string, DailyReflection>; theme?: ThemeConfig }) {
  if (!db) return;
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { updatedAt: new Date().toISOString(), ...data }, { merge: true });
  } catch (err) {
    console.warn('Could not sync to Firestore (check credentials/permissions):', err);
  }
}

export async function fetchUserDataFromFirestore(userId: string) {
  if (!db) return null;
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err) {
    console.warn('Could not fetch from Firestore:', err);
  }
  return null;
}
