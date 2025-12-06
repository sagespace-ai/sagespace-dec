/**
 * SIVA Engine
 * Policy enforcement and governance system
 */

import { GovernanceState, PolicyProfile, GovernanceRule, PolicyEvaluation, RuleCondition } from './types';
import { getRulesForProfile } from './PolicyProfiles';

export class SivaEngine {
  private state: GovernanceState;

  constructor(initialProfile: PolicyProfile = 'personal_standard') {
    this.state = {
      activeProfile: initialProfile,
      rules: getRulesForProfile(initialProfile),
      evaluations: [],
      lastEvaluation: null,
    };
  }

  /**
   * Evaluate a request against governance rules
   */
  evaluate(context: Record<string, any>): PolicyEvaluation[] {
    const evaluations: PolicyEvaluation[] = [];

    this.state.rules.forEach((rule) => {
      if (!rule.enabled) {
        return;
      }

      const passed = this.evaluateRule(rule, context);
      const evaluation: PolicyEvaluation = {
        ruleId: rule.id,
        passed,
        reason: passed ? undefined : `Violates rule: ${rule.name}`,
        action: passed ? 'allow' : rule.action,
      };

      evaluations.push(evaluation);
    });

    this.state.evaluations = evaluations;
    this.state.lastEvaluation = new Date().toISOString();

    return evaluations;
  }

  /**
   * Check if a request is allowed
   */
  isAllowed(context: Record<string, any>): { allowed: boolean; reason?: string } {
    const evaluations = this.evaluate(context);
    const blocked = evaluations.find((e) => e.action === 'block' && !e.passed);

    if (blocked) {
      return {
        allowed: false,
        reason: blocked.reason || 'Request blocked by governance rules',
      };
    }

    return { allowed: true };
  }

  /**
   * Evaluate a single rule
   */
  private evaluateRule(rule: GovernanceRule, context: Record<string, any>): boolean {
    // Check if all conditions are met
    return rule.conditions.every((condition) => {
      const fieldValue = this.getFieldValue(context, condition.field);
      return this.evaluateCondition(condition, fieldValue);
    });
  }

  /**
   * Get field value from context (supports nested paths)
   */
  private getFieldValue(context: Record<string, any>, field: string): any {
    const parts = field.split('.');
    let value = context;
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }
    return value;
  }

  /**
   * Evaluate a condition
   */
  private evaluateCondition(condition: RuleCondition, fieldValue: any): boolean {
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not-equals':
        return fieldValue !== condition.value;
      case 'greater-than':
        return fieldValue > condition.value;
      case 'less-than':
        return fieldValue < condition.value;
      case 'contains':
        return String(fieldValue).includes(String(condition.value));
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      default:
        return false;
    }
  }

  /**
   * Update profile
   */
  setProfile(profile: PolicyProfile): void {
    this.state.activeProfile = profile;
    this.state.rules = getRulesForProfile(profile);
  }

  /**
   * Get current state
   */
  getState(): GovernanceState {
    return { ...this.state };
  }
}

// Singleton instance
let sivaEngineInstance: SivaEngine | null = null;

export function getSivaEngine(profile?: PolicyProfile): SivaEngine {
  if (!sivaEngineInstance) {
    sivaEngineInstance = new SivaEngine(profile);
  }
  return sivaEngineInstance;
}
