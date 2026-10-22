import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  ThemeConfig,
  ThemeColors,
  HeadingFont,
  BodyFont,
  AppearanceMode,
  CardStyle,
  SidebarStyle,
  BackgroundPattern,
} from '../types';
import { loadLocalTheme, saveLocalTheme, defaultThemeConfig } from '../services/storage';
import { fetchUserTheme, saveUserTheme } from '../services/firestore';
import { useAuth } from './AuthContext';
import { hexToRgba, isDarkColor, isValidHex } from '../utils/colorUtils';

export interface ThemePreset {
  id: string;
  name: string;
  tagline: string;
  description: string;
  mode: 'light' | 'dark';
  cardStyle: CardStyle;
  sidebarStyle: SidebarStyle;
  backgroundPattern: BackgroundPattern;
  cardRadius: string;
  headingFont: HeadingFont;
  bodyFont: BodyFont;
  colors: ThemeColors;
}

export const THEME_PRESETS: Record<string, ThemePreset> = {
  blush: {
    id: 'blush',
    name: 'Blush Diary',
    tagline: 'Warm ivory & dusty rose',
    description: 'A gentle feminine sanctuary inspired by pressed flower journals and delicate afternoon light.',
    mode: 'light',
    cardStyle: 'subtle-shadow',
    sidebarStyle: 'solid',
    backgroundPattern: 'paper',
    cardRadius: '18px',
    headingFont: 'Fraunces',
    bodyFont: 'Plus Jakarta Sans',
    colors: {
      bgCanvas: '#FFF8F5',
      primary: '#D99BAA',
      primaryHover: '#C68796',
      secondary: '#A8B89F',
      accent: '#C9BDE7',
      textMain: '#353238',
      textMuted: '#7E7983',
      cardBg: '#FFFFFF',
      cardBorder: 'rgba(217, 155, 170, 0.25)',
      cardShadow: '0 4px 20px -2px rgba(53, 50, 56, 0.04)',
      sidebarBg: '#FCF6F3',
    },
  },
  sage: {
    id: 'sage',
    name: 'Sage Garden',
    tagline: 'Botanical stillness & earth',
    description: 'Soft eucalyptus, matcha green, and warm clay for a grounded, tranquil workspace.',
    mode: 'light',
    cardStyle: 'subtle-shadow',
    sidebarStyle: 'solid',
    backgroundPattern: 'dots',
    cardRadius: '18px',
    headingFont: 'Cormorant Garamond',
    bodyFont: 'Plus Jakarta Sans',
    colors: {
      bgCanvas: '#F5F8F4',
      primary: '#7B9E77',
      primaryHover: '#688A64',
      secondary: '#D4A373',
      accent: '#9BB6C4',
      textMain: '#273325',
      textMuted: '#657363',
      cardBg: '#FFFFFF',
      cardBorder: 'rgba(123, 158, 119, 0.25)',
      cardShadow: '0 4px 20px -2px rgba(39, 51, 37, 0.04)',
      sidebarBg: '#EDF3EC',
    },
  },
  lavender: {
    id: 'lavender',
    name: 'Lavender Dreams',
    tagline: 'Lilac mist & periwinkle',
    description: 'Dreamy French lavender, misty morning porcelain, and ethereal twilight calm.',
    mode: 'light',
    cardStyle: 'glassmorphic',
    sidebarStyle: 'glass',
    backgroundPattern: 'floral',
    cardRadius: '26px',
    headingFont: 'Playfair Display',
    bodyFont: 'Outfit',
    colors: {
      bgCanvas: '#F8F6FD',
      primary: '#9E8EC8',
      primaryHover: '#8977B5',
      secondary: '#A2B997',
      accent: '#F3B4A2',
      textMain: '#2A2438',
      textMuted: '#756D85',
      cardBg: '#FFFFFF',
      cardBorder: 'rgba(158, 142, 200, 0.25)',
      cardShadow: '0 4px 20px -2px rgba(42, 36, 56, 0.04)',
      sidebarBg: '#F2EFF9',
    },
  },
  vanilla: {
    id: 'vanilla',
    name: 'Vanilla Cream',
    tagline: 'Warm oat latte & alabaster',
    description: 'Cozy cashmere, warm honey vanilla, and Scandinavian minimalism.',
    mode: 'light',
    cardStyle: 'subtle-shadow',
    sidebarStyle: 'solid',
    backgroundPattern: 'paper',
    cardRadius: '14px',
    headingFont: 'Fraunces',
    bodyFont: 'Inter',
    colors: {
      bgCanvas: '#FCF9F2',
      primary: '#C49A6C',
      primaryHover: '#B08455',
      secondary: '#8F9E8B',
      accent: '#D98A72',
      textMain: '#332A20',
      textMuted: '#7C7162',
      cardBg: '#FFFFFF',
      cardBorder: 'rgba(196, 154, 108, 0.25)',
      cardShadow: '0 4px 20px -2px rgba(51, 42, 32, 0.04)',
      sidebarBg: '#F7F2E7',
    },
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Bloom',
    tagline: 'Velvet plum & luminous peony',
    description: 'Rich dark ambiance with glowing peony rose and celestial accents for nighttime focus.',
    mode: 'dark',
    cardStyle: 'subtle-shadow',
    sidebarStyle: 'solid',
    backgroundPattern: 'dots',
    cardRadius: '18px',
    headingFont: 'Playfair Display',
    bodyFont: 'Plus Jakarta Sans',
    colors: {
      bgCanvas: '#17141E',
      primary: '#E89BB0',
      primaryHover: '#D9859C',
      secondary: '#8EA89D',
      accent: '#C4B5FD',
      textMain: '#F6EFF2',
      textMuted: '#ABA2B5',
      cardBg: '#231E2C',
      cardBorder: 'rgba(232, 155, 176, 0.25)',
      cardShadow: '0 4px 24px -2px rgba(0, 0, 0, 0.45)',
      sidebarBg: '#1D1826',
    },
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Mist',
    tagline: 'Coastal seafoam & coral twilight',
    description: 'Crisp coastal sea glass, fresh morning breeze, and soft ocean tranquility.',
    mode: 'light',
    cardStyle: 'bordered',
    sidebarStyle: 'solid',
    backgroundPattern: 'wavy',
    cardRadius: '18px',
    headingFont: 'Outfit',
    bodyFont: 'Outfit',
    colors: {
      bgCanvas: '#F2F8F9',
      primary: '#5C9BA6',
      primaryHover: '#4A8691',
      secondary: '#D99480',
      accent: '#85B5A5',
      textMain: '#223338',
      textMuted: '#63777C',
      cardBg: '#FFFFFF',
      cardBorder: 'rgba(92, 155, 166, 0.25)',
      cardShadow: '0 4px 20px -2px rgba(34, 51, 56, 0.04)',
      sidebarBg: '#E8F2F4',
    },
  },
};

interface ThemeContextType {
  theme: ThemeConfig;
  draftTheme: ThemeConfig;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  saveSuccess: boolean;
  setPreset: (presetId: string) => void;
  setAppearanceMode: (mode: AppearanceMode) => void;
  setColorMode: (mode: 'light' | 'dark') => void;
  toggleColorMode: () => void;
  updateColors: (colors: Partial<ThemeColors>) => void;
  setHeadingFont: (font: HeadingFont) => void;
  setBodyFont: (font: BodyFont) => void;
  setCardRadius: (radius: string) => void;
  setCardStyle: (style: CardStyle) => void;
  setSidebarStyle: (style: SidebarStyle) => void;
  setBackgroundPattern: (pattern: BackgroundPattern) => void;
  togglePaperTexture: () => void;
  toggleSound: () => void;
  toggleConfetti: () => void;
  applyAndSaveTheme: () => Promise<void>;
  undoChanges: () => void;
  resetTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // Active saved theme
  const [savedTheme, setSavedTheme] = useState<ThemeConfig>(() => {
    const loaded = loadLocalTheme();
    return {
      ...defaultThemeConfig,
      ...loaded,
      appearanceMode: loaded.appearanceMode || (loaded.colorMode as AppearanceMode) || 'light',
      colorMode: loaded.colorMode || 'light',
      cardStyle: loaded.cardStyle || 'subtle-shadow',
      sidebarStyle: loaded.sidebarStyle || 'solid',
      backgroundPattern: loaded.backgroundPattern || (loaded.paperTexture ? 'paper' : 'none'),
    };
  });

  // Working draft state for live editing in Theme Studio
  const [draftTheme, setDraftTheme] = useState<ThemeConfig>(savedTheme);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Detect system color preference
  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Compute active color mode ('light' | 'dark') based on appearanceMode & system
  const effectiveColorMode = draftTheme.appearanceMode === 'system'
    ? (systemIsDark ? 'dark' : 'light')
    : draftTheme.appearanceMode;

  // Check if draft has unsaved changes compared to savedTheme
  const hasUnsavedChanges = JSON.stringify(draftTheme) !== JSON.stringify(savedTheme);

  // Apply theme to DOM (live styling)
  const applyThemeToDOM = useCallback((cfg: ThemeConfig, activeMode: 'light' | 'dark') => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const { colors, headingFont, bodyFont, cardRadius, cardStyle, sidebarStyle, backgroundPattern, paperTexture } = cfg;

    // Apply primary colors
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--primary-hover', colors.primaryHover || colors.primary);
    root.style.setProperty('--primary-light', hexToRgba(colors.primary, 0.16));

    // Secondary colors
    root.style.setProperty('--secondary', colors.secondary);
    root.style.setProperty('--secondary-hover', colors.secondaryHover || colors.secondary);
    root.style.setProperty('--secondary-light', hexToRgba(colors.secondary, 0.16));

    // Accent colors (buttons, checkboxes, progress bars)
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--accent-hover', colors.accentHover || colors.accent);
    root.style.setProperty('--accent-light', hexToRgba(colors.accent, 0.16));

    // Canvas background
    root.style.setProperty('--bg-canvas', colors.bgCanvas);
    root.style.setProperty('--bg-canvas-subtle', hexToRgba(colors.bgCanvas, 0.95));

    // Card colors and properties
    root.style.setProperty('--card-bg', colors.cardBg);
    root.style.setProperty('--card-border', colors.cardBorder);
    root.style.setProperty('--card-shadow', colors.cardShadow);
    root.style.setProperty('--card-radius', cardRadius);
    root.style.setProperty('--card-bg-glass', hexToRgba(colors.cardBg, 0.72));

    // Sidebar
    root.style.setProperty('--sidebar-bg', colors.sidebarBg);
    root.style.setProperty('--sidebar-border', colors.cardBorder);
    root.style.setProperty('--sidebar-bg-glass', hexToRgba(colors.sidebarBg, 0.78));

    // Typography
    root.style.setProperty('--text-main', colors.textMain);
    root.style.setProperty('--text-muted', colors.textMuted);
    root.style.setProperty('--text-light', hexToRgba(colors.textMuted, 0.75));
    root.style.setProperty('--font-heading', `'${headingFont}', Georgia, serif`);
    root.style.setProperty('--font-body', `'${bodyFont}', sans-serif`);

    // Data attributes for card & sidebar visual styles
    root.setAttribute('data-card-style', cardStyle || 'subtle-shadow');
    root.setAttribute('data-sidebar-style', sidebarStyle || 'solid');
    root.setAttribute('data-color-mode', activeMode);

    // Background pattern classes on body
    const patternClasses = [
      'pattern-none',
      'pattern-paper',
      'pattern-dots',
      'pattern-grid',
      'pattern-floral',
      'pattern-wavy',
      'paper-texture',
    ];
    patternClasses.forEach(cls => document.body.classList.remove(cls));

    if (backgroundPattern && backgroundPattern !== 'none') {
      document.body.classList.add(`pattern-${backgroundPattern}`);
    }
    if (paperTexture) {
      document.body.classList.add('paper-texture');
    }
  }, []);

  // Update DOM whenever draftTheme or effectiveColorMode changes
  useEffect(() => {
    applyThemeToDOM(draftTheme, effectiveColorMode);
  }, [draftTheme, effectiveColorMode, applyThemeToDOM]);

  // Load from Cloud Firestore when user signs in
  useEffect(() => {
    if (!user) return;

    const syncThemeFromCloud = async () => {
      try {
        const cloudTheme = await fetchUserTheme(user.id);
        if (cloudTheme) {
          const merged: ThemeConfig = {
            ...defaultThemeConfig,
            ...cloudTheme,
          };
          setSavedTheme(merged);
          setDraftTheme(merged);
          saveLocalTheme(merged);
        }
      } catch (err) {
        console.error('Error fetching theme from Cloud Firestore:', err);
      }
    };

    syncThemeFromCloud();
  }, [user?.id]);

  // Actions
  const setPreset = (presetId: string) => {
    const preset = THEME_PRESETS[presetId];
    if (preset) {
      setDraftTheme(prev => ({
        ...prev,
        presetId,
        appearanceMode: preset.mode as AppearanceMode,
        colorMode: preset.mode,
        cardStyle: preset.cardStyle,
        sidebarStyle: preset.sidebarStyle,
        backgroundPattern: preset.backgroundPattern,
        cardRadius: preset.cardRadius,
        headingFont: preset.headingFont,
        bodyFont: preset.bodyFont,
        colors: { ...preset.colors },
      }));
    }
  };

  const setAppearanceMode = (mode: AppearanceMode) => {
    setDraftTheme(prev => {
      const isDark = mode === 'dark' || (mode === 'system' && systemIsDark);
      return {
        ...prev,
        appearanceMode: mode,
        colorMode: isDark ? 'dark' : 'light',
      };
    });
  };

  const setColorMode = (mode: 'light' | 'dark') => {
    setAppearanceMode(mode);
  };

  const toggleColorMode = () => {
    const nextMode = effectiveColorMode === 'light' ? 'dark' : 'light';
    setAppearanceMode(nextMode);
  };

  const updateColors = (newColors: Partial<ThemeColors>) => {
    setDraftTheme(prev => {
      const mergedColors = { ...prev.colors, ...newColors };

      // If user changed canvas background, auto-detect if canvas is dark/light
      let updatedMode = prev.colorMode;
      if (newColors.bgCanvas && isValidHex(newColors.bgCanvas)) {
        updatedMode = isDarkColor(newColors.bgCanvas) ? 'dark' : 'light';
      }

      return {
        ...prev,
        presetId: 'custom',
        colorMode: updatedMode,
        colors: mergedColors,
      };
    });
  };

  const setHeadingFont = (headingFont: HeadingFont) => {
    setDraftTheme(prev => ({ ...prev, headingFont }));
  };

  const setBodyFont = (bodyFont: BodyFont) => {
    setDraftTheme(prev => ({ ...prev, bodyFont }));
  };

  const setCardRadius = (cardRadius: string) => {
    setDraftTheme(prev => ({ ...prev, cardRadius }));
  };

  const setCardStyle = (cardStyle: CardStyle) => {
    setDraftTheme(prev => ({ ...prev, cardStyle }));
  };

  const setSidebarStyle = (sidebarStyle: SidebarStyle) => {
    setDraftTheme(prev => ({ ...prev, sidebarStyle }));
  };

  const setBackgroundPattern = (backgroundPattern: BackgroundPattern) => {
    setDraftTheme(prev => ({ ...prev, backgroundPattern }));
  };

  const togglePaperTexture = () => {
    setDraftTheme(prev => ({ ...prev, paperTexture: !prev.paperTexture }));
  };

  const toggleSound = () => {
    setDraftTheme(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  const toggleConfetti = () => {
    setDraftTheme(prev => ({ ...prev, confettiEnabled: !prev.confettiEnabled }));
  };

  // Commit & persist theme to localStorage & Cloud Firestore
  const applyAndSaveTheme = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const themeToSave: ThemeConfig = {
        ...draftTheme,
        colorMode: effectiveColorMode,
      };

      setSavedTheme(themeToSave);
      saveLocalTheme(themeToSave);

      if (user) {
        await saveUserTheme(user.id, themeToSave);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save theme configuration:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Discard draft changes and restore to savedTheme
  const undoChanges = () => {
    setDraftTheme(savedTheme);
  };

  // Reset to Habitale default "Blush Diary"
  const resetTheme = async () => {
    const defaultTheme = { ...defaultThemeConfig };
    setDraftTheme(defaultTheme);
    setSavedTheme(defaultTheme);
    saveLocalTheme(defaultTheme);

    if (user) {
      try {
        await saveUserTheme(user.id, defaultTheme);
      } catch (err) {
        console.error('Failed to reset theme in Firestore:', err);
      }
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: savedTheme,
        draftTheme,
        hasUnsavedChanges,
        isSaving,
        saveSuccess,
        setPreset,
        setAppearanceMode,
        setColorMode,
        toggleColorMode,
        updateColors,
        setHeadingFont,
        setBodyFont,
        setCardRadius,
        setCardStyle,
        setSidebarStyle,
        setBackgroundPattern,
        togglePaperTexture,
        toggleSound,
        toggleConfetti,
        applyAndSaveTheme,
        undoChanges,
        resetTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
