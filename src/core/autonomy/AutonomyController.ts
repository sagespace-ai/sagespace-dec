/**
 * Autonomy Controller
 * Negotiates when SAGN should act, always respecting user bounds
 */

import { AutonomyLevel, AutonomySettings } from './types';

export class AutonomyController {
  private settings: AutonomySettings;

  constructor(settings: AutonomySettings) {
    this.settings = settings;
  }

  /**
   * Check if an action is allowed based on autonomy level
   */
  canAct(action: 'suggest' | 'auto-heal' | 'generate' | 'modify-ui'): boolean {
    if (this.settings.level === 'off') {
      return false;
    }

    if (action === 'modify-ui' && this.settings.canMakeChanges === 'never') {
      return false;
    }

    if (action === 'modify-ui' && this.settings.canMakeChanges === 'ask-first') {
      return false; // Always ask first
    }

    // Check if action is in avoid list
    const actionString = this.actionToString(action);
    if (this.settings.avoidActions.some((avoid) => actionString.includes(avoid.toLowerCase()))) {
      return false;
    }

    // Check feature flags
    switch (action) {
      case 'suggest':
        return this.settings.enabledFeatures.suggestions;
      case 'auto-heal':
        return this.settings.enabledFeatures.autoHealing;
      case 'generate':
        return this.settings.enabledFeatures.mediaGeneration;
      case 'modify-ui':
        return this.settings.enabledFeatures.predictiveUI;
      default:
        return false;
    }
  }

  /**
   * Get autonomy level description
   */
  getLevelDescription(level: AutonomyLevel): string {
    switch (level) {
      case 'off':
        return 'SAGN will never act without your explicit request.';
      case 'gentle':
        return 'SAGN will make gentle suggestions, but never act without your approval.';
      case 'helpful':
        return 'SAGN can help with small things, but will ask before making changes.';
      case 'active':
        return 'SAGN can be proactive, but always respects your boundaries.';
      default:
        return '';
    }
  }

  private actionToString(action: string): string {
    return action.replace('-', ' ');
  }

  updateSettings(settings: Partial<AutonomySettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  getSettings(): AutonomySettings {
    return { ...this.settings };
  }
}

// Default settings
export const defaultAutonomySettings: AutonomySettings = {
  level: 'helpful',
  canMakeChanges: 'ask-first',
  avoidActions: [],
  enabledFeatures: {
    suggestions: true,
    autoHealing: true,
    mediaGeneration: false,
    predictiveUI: false,
  },
};

// Singleton instance
let autonomyControllerInstance: AutonomyController | null = null;

export function getAutonomyController(settings?: AutonomySettings): AutonomyController {
  if (!autonomyControllerInstance) {
    autonomyControllerInstance = new AutonomyController(
      settings || defaultAutonomySettings
    );
  }
  return autonomyControllerInstance;
}
