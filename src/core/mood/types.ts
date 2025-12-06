/**
 * Mood System Types
 * User mood detection and UI effects
 */

export type Mood = 'calm' | 'focused' | 'creative' | 'tired' | 'curious' | 'overwhelmed';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface MoodContext {
  mood: Mood;
  intensity: number; // 0-1
  triggers: {
    timeOnPage: number;
    openPanels: number;
    recentActions: number;
    timeOfDay: TimeOfDay;
  };
}

export interface MoodEffects {
  animationSpeed: 'slow' | 'normal' | 'fast';
  cardDensity: 'compact' | 'normal' | 'expanded';
  accentBrightness: 'dim' | 'normal' | 'bright';
  whitespace: 'normal' | 'spacious';
  visibleChoices: 'few' | 'normal' | 'many';
}
