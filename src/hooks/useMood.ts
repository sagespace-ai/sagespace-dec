import { Mood, MoodContext, MoodEffects, TimeOfDay } from '../core/mood/types';
import { useContextSignals } from '../core/intent/useContextSignals';

/**
 * Hook for mood detection
 * Determines user mood based on context signals
 */
export function useMood(): { mood: Mood; context: MoodContext; effects: MoodEffects } {
  const signals = useContextSignals();

  // Simple mood detection based on signals
  const detectMood = (): Mood => {
    // Overwhelmed: too many panels or too many actions quickly
    if (signals.openPanels > 3 || signals.recentActions > 5) {
      return 'overwhelmed';
    }

    // Tired: long time on page with few actions
    if (signals.timeOnPage > 300 && signals.recentActions < 2) {
      return 'tired';
    }

    // Curious: exploring different areas
    if (signals.recentActions > 3 && signals.timeOnPage < 60) {
      return 'curious';
    }

    // Focused: moderate actions, consistent orbit
    if (signals.recentActions > 2 && signals.recentActions < 5) {
      return 'focused';
    }

    // Creative: in Play orbit with some activity
    if (signals.orbit === 'play' && signals.recentActions > 1) {
      return 'creative';
    }

    // Default: calm
    return 'calm';
  };

  const mood = detectMood();

  const context: MoodContext = {
    mood,
    intensity: 0.5, // Stub
    triggers: {
      timeOnPage: signals.timeOnPage,
      openPanels: signals.openPanels,
      recentActions: signals.recentActions,
      timeOfDay: getTimeOfDay(),
    },
  };

  // Map mood to UI effects
  const effects: MoodEffects = getMoodEffects(mood);

  return { mood, context, effects };
}

/**
 * Get time of day
 */
function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

/**
 * Map mood to UI effects
 */
function getMoodEffects(mood: Mood): MoodEffects {
  switch (mood) {
    case 'calm':
      return {
        animationSpeed: 'slow',
        cardDensity: 'normal',
        accentBrightness: 'normal',
        whitespace: 'spacious',
        visibleChoices: 'normal',
      };
    case 'focused':
      return {
        animationSpeed: 'normal',
        cardDensity: 'compact',
        accentBrightness: 'normal',
        whitespace: 'normal',
        visibleChoices: 'few',
      };
    case 'creative':
      return {
        animationSpeed: 'normal',
        cardDensity: 'normal',
        accentBrightness: 'bright',
        whitespace: 'normal',
        visibleChoices: 'many',
      };
    case 'tired':
      return {
        animationSpeed: 'slow',
        cardDensity: 'expanded',
        accentBrightness: 'dim',
        whitespace: 'spacious',
        visibleChoices: 'few',
      };
    case 'curious':
      return {
        animationSpeed: 'normal',
        cardDensity: 'normal',
        accentBrightness: 'bright',
        whitespace: 'normal',
        visibleChoices: 'many',
      };
    case 'overwhelmed':
      return {
        animationSpeed: 'slow',
        cardDensity: 'expanded',
        accentBrightness: 'dim',
        whitespace: 'spacious',
        visibleChoices: 'few',
      };
    default:
      return {
        animationSpeed: 'normal',
        cardDensity: 'normal',
        accentBrightness: 'normal',
        whitespace: 'normal',
        visibleChoices: 'normal',
      };
  }
}

/**
 * Helper functions for mood checks
 */
export function isOverwhelmed(mood: Mood): boolean {
  return mood === 'overwhelmed';
}

export function isCalm(mood: Mood): boolean {
  return mood === 'calm';
}

export function isTired(mood: Mood): boolean {
  return mood === 'tired';
}

export function isCreative(mood: Mood): boolean {
  return mood === 'creative';
}
