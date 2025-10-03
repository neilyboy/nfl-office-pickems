'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Theme, getTheme, applyTheme, BASE_THEMES } from '@/lib/themes';

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  themeId: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState('dark');
  const [currentTheme, setCurrentTheme] = useState<Theme>(BASE_THEMES.dark);

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem('app-theme') || 'dark';
    const theme = getTheme(savedTheme);
    setThemeId(savedTheme);
    setCurrentTheme(theme);
    applyTheme(theme);
  }, []);

  const setTheme = (newThemeId: string) => {
    const theme = getTheme(newThemeId);
    setThemeId(newThemeId);
    setCurrentTheme(theme);
    applyTheme(theme);
    localStorage.setItem('app-theme', newThemeId);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themeId }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
