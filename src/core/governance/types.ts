/**
 * SIVA Governance Engine Types
 * Policy enforcement and governance system
 */

export type PolicyProfile = 'personal_standard' | 'enterprise_strict' | 'open_collaborative';

export type RuleAction = 'allow' | 'warn' | 'block';

export interface GovernanceRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  action: RuleAction;
  conditions: RuleCondition[];
}

export interface RuleCondition {
  field: string;
  operator: 'equals' | 'not-equals' | 'greater-than' | 'less-than' | 'contains' | 'in';
  value: any;
}

export interface PolicyEvaluation {
  ruleId: string;
  passed: boolean;
  reason?: string;
  action: RuleAction;
}

export interface GovernanceState {
  activeProfile: PolicyProfile;
  rules: GovernanceRule[];
  evaluations: PolicyEvaluation[];
  lastEvaluation: string | null;
}
