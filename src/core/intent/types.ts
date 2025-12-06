/**
 * Intent System Types
 * User intent detection and context signals
 */

export type UserIntent = 'exploring' | 'focused' | 'creating' | 'searching' | 'unknown';

export interface ContextSignal {
  orbit: 'work' | 'play' | 'idle' | 'governance';
  timeOnPage: number; // seconds
  recentActions: number;
  openPanels: number;
  lastInteraction: string;
}

export interface PatternMemory {
  frequentOrbits: string[];
  preferredTimes: string[];
  commonTasks: string[];
}

export interface IntentContext {
  intent: UserIntent;
  confidence: number; // 0-1
  signals: ContextSignal;
  patterns: PatternMemory;
}
