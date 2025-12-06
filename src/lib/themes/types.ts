/**
 * Theme System Types
 * Advanced theme management
 */

export type ThemeId = 'light' | 'dark' | 'cosmic' | 'custom';

export interface Theme {
  id: ThemeId;
  name: string;
  colors: {
    background: string;
    foreground: string;
    card: string;
    'card-foreground': string;
    border: string;
    primary: string;
    'primary-foreground': string;
    secondary: string;
    muted: string;
    'muted-foreground': string;
    accent: string;
  };
  spacing: {
    unit: number; // Base unit (16px)
    rhythm: number; // 16px rhythm
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
}
