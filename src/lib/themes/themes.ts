/**
 * SAGN 2035 Theme System
 * Light, Dark, Cosmic, and Custom themes
 */

import { Theme, ThemeId } from './types';

export type { Theme, ThemeId };

export const themes: Record<ThemeId, Theme> = {
  light: {
    id: 'light',
    name: 'Light',
    colors: {
      background: '#ffffff',
      foreground: '#0a0a0a',
      card: '#fafafa',
      'card-foreground': '#0a0a0a',
      border: '#e5e5e5',
      primary: '#0a0a0a',
      'primary-foreground': '#ffffff',
      secondary: '#f5f5f5',
      muted: '#f5f5f5',
      'muted-foreground': '#737373',
      accent: '#3b82f6',
    },
    spacing: {
      unit: 16,
      rhythm: 16,
    },
    radius: {
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '20px',
    },
    shadows: {
      sm: '0 1px 2px rgba(0,0,0,0.05)',
      md: '0 2px 8px rgba(0,0,0,0.1)',
      lg: '0 4px 16px rgba(0,0,0,0.15)',
    },
    transitions: {
      fast: '150ms ease-out',
      normal: '200ms ease-out',
      slow: '250ms ease-out',
    },
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    colors: {
      background: '#05060a',
      foreground: '#ffffff',
      card: '#0a0b10',
      'card-foreground': '#ffffff',
      border: 'rgba(255,255,255,0.1)',
      primary: '#ffffff',
      'primary-foreground': '#0a0a0a',
      secondary: 'rgba(255,255,255,0.05)',
      muted: 'rgba(255,255,255,0.1)',
      'muted-foreground': 'rgba(255,255,255,0.5)',
      accent: '#8b5cf6',
    },
    spacing: {
      unit: 16,
      rhythm: 16,
    },
    radius: {
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '20px',
    },
    shadows: {
      sm: '0 1px 2px rgba(0,0,0,0.3)',
      md: '0 2px 8px rgba(0,0,0,0.4)',
      lg: '0 4px 16px rgba(0,0,0,0.5)',
    },
    transitions: {
      fast: '150ms ease-out',
      normal: '200ms ease-out',
      slow: '250ms ease-out',
    },
  },
  cosmic: {
    id: 'cosmic',
    name: 'Cosmic',
    colors: {
      background: '#05060a',
      foreground: '#ffffff',
      card: 'rgba(139, 92, 246, 0.05)',
      'card-foreground': '#ffffff',
      border: 'rgba(139, 92, 246, 0.2)',
      primary: '#a78bfa',
      'primary-foreground': '#05060a',
      secondary: 'rgba(139, 92, 246, 0.1)',
      muted: 'rgba(139, 92, 246, 0.15)',
      'muted-foreground': 'rgba(255,255,255,0.6)',
      accent: '#8b5cf6',
    },
    spacing: {
      unit: 16,
      rhythm: 16,
    },
    radius: {
      sm: '10px',
      md: '14px',
      lg: '18px',
      xl: '24px',
    },
    shadows: {
      sm: '0 1px 3px rgba(139, 92, 246, 0.2)',
      md: '0 2px 8px rgba(139, 92, 246, 0.3)',
      lg: '0 4px 16px rgba(139, 92, 246, 0.4)',
    },
    transitions: {
      fast: '150ms ease-out',
      normal: '200ms ease-out',
      slow: '300ms ease-out',
    },
  },
  custom: {
    id: 'custom',
    name: 'Custom',
    colors: {
      background: '#05060a',
      foreground: '#ffffff',
      card: '#0a0b10',
      'card-foreground': '#ffffff',
      border: 'rgba(255,255,255,0.1)',
      primary: '#ffffff',
      'primary-foreground': '#0a0a0a',
      secondary: 'rgba(255,255,255,0.05)',
      muted: 'rgba(255,255,255,0.1)',
      'muted-foreground': 'rgba(255,255,255,0.5)',
      accent: '#3b82f6',
    },
    spacing: {
      unit: 16,
      rhythm: 16,
    },
    radius: {
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '20px',
    },
    shadows: {
      sm: '0 1px 2px rgba(0,0,0,0.3)',
      md: '0 2px 8px rgba(0,0,0,0.4)',
      lg: '0 4px 16px rgba(0,0,0,0.5)',
    },
    transitions: {
      fast: '150ms ease-out',
      normal: '200ms ease-out',
      slow: '250ms ease-out',
    },
  },
};

export function getTheme(id: ThemeId): Theme {
  return themes[id] || themes.dark;
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
  
  Object.entries(theme.radius).forEach(([key, value]) => {
    root.style.setProperty(`--radius-${key}`, value);
  });
  
  root.style.setProperty('--spacing-unit', `${theme.spacing.unit}px`);
  root.style.setProperty('--spacing-rhythm', `${theme.spacing.rhythm}px`);
  
  // Apply dark class for Tailwind dark mode
  if (theme.id === 'dark' || theme.id === 'cosmic' || theme.id === 'custom') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}
