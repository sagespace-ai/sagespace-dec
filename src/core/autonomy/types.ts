/**
 * Autonomy Controller Types
 * AI autonomy management and control
 */

export type AutonomyLevel = 'off' | 'gentle' | 'helpful' | 'active';

export type CanMakeChanges = 'never' | 'ask-first' | 'always';

export interface AutonomySettings {
  level: AutonomyLevel;
  canMakeChanges: CanMakeChanges;
  avoidActions: string[];
  enabledFeatures: {
    suggestions: boolean;
    autoHealing: boolean;
    mediaGeneration: boolean;
    predictiveUI: boolean;
  };
}
