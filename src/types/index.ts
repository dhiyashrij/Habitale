export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime';

export type RoutineCategory =
  | 'wellness'
  | 'mindfulness'
  | 'productivity'
  | 'fitness'
  | 'creativity'
  | 'selfcare'
  | 'other';

export interface RoutineTask {
  id: string;
  title: string;
  time?: string; // Optional time of day, e.g. "07:30"
  durationMinutes?: number;
  completedDates: string[]; // List of 'YYYY-MM-DD' dates completed
  order: number;
}

export interface Routine {
  id: string;
  title: string;
  description?: string;
  category: RoutineCategory;
  timeOfDay: TimeOfDay;
  daysOfWeek: number[]; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  reminderTime?: string; // HH:mm
  icon: string;
  tasks: RoutineTask[]; // Sub-tasks inside the routine
  streak: number;
  bestStreak: number;
  completedDates: string[]; // Dates where all tasks in routine were done
  createdAt: string;
  updatedAt?: string;
  order: number;
}

export interface RoutineTemplate {
  id: string;
  title: string;
  description: string;
  category: RoutineCategory;
  timeOfDay: TimeOfDay;
  icon: string;
  daysOfWeek: number[];
  reminderTime?: string;
  tasks: { title: string; time?: string; durationMinutes?: number }[];
}

export type TodoPriority = 'low' | 'medium' | 'high';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  category: string; // Custom list name, e.g. 'Personal', 'Work', 'Wellness', or custom user list
  priority: TodoPriority;
  dueDate?: string; // 'YYYY-MM-DD'
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export type MoodType =
  | 'serene'
  | 'energized'
  | 'grateful'
  | 'reflective'
  | 'tired'
  | 'creative'
  | 'cozy';

export interface DailyReflection {
  date: string; // 'YYYY-MM-DD'
  mood?: MoodType;
  prompt: string;
  response: string;
  gratitudeNote: string;
  proudMoment?: string;
  updatedAt: string;
}

export type AppearanceMode = 'light' | 'dark' | 'system';
export type CardStyle = 'subtle-shadow' | 'flat' | 'glassmorphic' | 'bordered';
export type SidebarStyle = 'solid' | 'glass' | 'accented';
export type BackgroundPattern = 'none' | 'paper' | 'dots' | 'grid' | 'floral' | 'wavy';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  persona?: string;
  dailyIntention?: string;
  starterTheme?: string;
  colorMode?: 'light' | 'dark';
  customLists?: string[];
  themeConfig?: ThemeConfig;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ThemeColors {
  bgCanvas: string;
  primary: string;
  primaryHover: string;
  secondary: string;
  secondaryHover?: string;
  accent: string;
  accentHover?: string;
  textMain: string;
  textMuted: string;
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  sidebarBg: string;
}

export type HeadingFont =
  | 'Fraunces'
  | 'Cormorant Garamond'
  | 'Playfair Display'
  | 'Plus Jakarta Sans'
  | 'Outfit';

export type BodyFont = 'Plus Jakarta Sans' | 'Inter' | 'Outfit';

export interface ThemeConfig {
  presetId: string;
  appearanceMode: AppearanceMode;
  colorMode: 'light' | 'dark';
  colors: ThemeColors;
  headingFont: HeadingFont;
  bodyFont: BodyFont;
  cardRadius: string;
  cardStyle: CardStyle;
  sidebarStyle: SidebarStyle;
  backgroundPattern: BackgroundPattern;
  paperTexture: boolean;
  soundEnabled: boolean;
  confettiEnabled: boolean;
}

export interface FirebaseConfigState {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  isConfigured: boolean;
}

export type CosmicTimerMode = 'countdown' | 'pomodoro' | 'stopwatch';

export interface CosmicSession {
  id: string;
  taskTitle: string;
  todoId?: string;
  durationSeconds: number;
  mode: CosmicTimerMode;
  completedAt: string; // ISO date-time string
}

export interface CosmicGrowthStats {
  totalFocusSeconds: number;
  totalSessionsCount: number;
  currentStreakDays: number;
  lastFocusDate?: string; // YYYY-MM-DD
}

export interface CosmicStageInfo {
  stage: number;
  name: string;
  title: string;
  description: string;
  requiredSeconds: number;
  nextRequiredSeconds: number;
  auraColor: string;
}

