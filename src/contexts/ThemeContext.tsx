import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getTheme, applyTheme } from '../lib/themes/themes';
import { Theme, ThemeId } from '../lib/themes/types';

interface ThemeContextValue {
  theme: Theme;
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>('dark');
  const theme = getTheme(themeId);

  useEffect(() => {
    // Load saved theme preference
    try {
      const saved = localStorage.getItem('sagespace-theme') as ThemeId;
      if (saved && ['light', 'dark', 'cosmic', 'custom'].includes(saved)) {
        setThemeId(saved);
      }
    } catch (error) {
      console.warn('Error loading theme preference:', error);
      // Continue with default theme
    }
  }, []);

  useEffect(() => {
    try {
      applyTheme(theme);
      localStorage.setItem('sagespace-theme', themeId);
    } catch (error) {
      console.warn('Error applying theme:', error);
      // Continue without saving - theme will still apply
    }
  }, [theme, themeId]);

  const setTheme = (id: ThemeId) => {
    setThemeId(id);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeId, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: getTheme('dark'),
      themeId: 'dark' as ThemeId,
      setTheme: () => {},
    };
  }
  return context;
}
