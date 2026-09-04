import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeId = 'midnight' | 'oled' | 'cyber' | 'academic' | 'sepia';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  tagline: string;
  isDark: boolean;
  bgHex: string;
  cardHex: string;
  accentHex: string;
  borderHex: string;
  textHex: string;
}

export const THEMES: Record<ThemeId, ThemeDefinition> = {
  midnight: {
    id: 'midnight',
    name: 'Midnight Slate',
    tagline: 'Android Material Deep & Purple-Blue Gradient',
    isDark: true,
    bgHex: '#0a0f1d',
    cardHex: '#0f172a',
    accentHex: '#7c3aed',
    borderHex: '#1e293b',
    textHex: '#e2e8f0',
  },
  oled: {
    id: 'oled',
    name: 'OLED Pure Black',
    tagline: 'High-contrast true black for AMOLED battery efficiency',
    isDark: true,
    bgHex: '#000000',
    cardHex: '#09090b',
    accentHex: '#a855f7',
    borderHex: '#27272a',
    textHex: '#f4f4f5',
  },
  cyber: {
    id: 'cyber',
    name: 'Cyber Cobalt',
    tagline: 'Deep navy with electric cyan & royal blue highlights',
    isDark: true,
    bgHex: '#060d1f',
    cardHex: '#0b1736',
    accentHex: '#38bdf8',
    borderHex: '#1d4ed8',
    textHex: '#e0f2fe',
  },
  academic: {
    id: 'academic',
    name: 'Material Light',
    tagline: 'Clean daylight paper tone with high-contrast typography',
    isDark: false,
    bgHex: '#f8fafc',
    cardHex: '#ffffff',
    accentHex: '#6366f1',
    borderHex: '#e2e8f0',
    textHex: '#0f172a',
  },
  sepia: {
    id: 'sepia',
    name: 'Sepia Scholar',
    tagline: 'Warm amber & vintage parchment for nocturnal study',
    isDark: true,
    bgHex: '#151210',
    cardHex: '#221c18',
    accentHex: '#f59e0b',
    borderHex: '#3d332d',
    textHex: '#fef3c7',
  },
};

const THEME_STORAGE_KEY = 'vivaguru_active_theme_v1';

interface ThemeContextType {
  theme: ThemeId;
  themeDef: ThemeDefinition;
  setTheme: (theme: ThemeId) => void;
  availableThemes: ThemeDefinition[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId;
      if (saved && THEMES[saved]) return saved;
    }
    return 'midnight';
  });

  const setTheme = (newTheme: ThemeId) => {
    if (!THEMES[newTheme]) return;
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const active = THEMES[theme];
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);

    if (active.isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    // Dynamically update browser theme-color meta tag for Android status bar
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute('content', active.bgHex);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeDef: THEMES[theme],
        setTheme,
        availableThemes: Object.values(THEMES),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
