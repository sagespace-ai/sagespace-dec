/**
 * Policy Profiles
 * Predefined governance profiles
 */

import { GovernanceRule, PolicyProfile } from './types';

const personalStandardRules: GovernanceRule[] = [
  {
    id: 'allow-all-actions',
    name: 'Allow All Actions',
    description: 'Users can perform all actions',
    enabled: true,
    action: 'allow',
    conditions: [],
  },
  {
    id: 'prevent-data-deletion',
    name: 'Prevent Accidental Deletion',
    description: 'Require confirmation for destructive actions',
    enabled: true,
    action: 'warn',
    conditions: [
      {
        field: 'action',
        operator: 'equals',
        value: 'delete',
      },
    ],
  },
];

const enterpriseStrictRules: GovernanceRule[] = [
  {
    id: 'require-approval',
    name: 'Require Approval',
    description: 'All changes require approval',
    enabled: true,
    action: 'block',
    conditions: [
      {
        field: 'requiresApproval',
        operator: 'equals',
        value: true,
      },
    ],
  },
  {
    id: 'prevent-external-sharing',
    name: 'Prevent External Sharing',
    description: 'Block external sharing of sensitive data',
    enabled: true,
    action: 'block',
    conditions: [
      {
        field: 'action',
        operator: 'equals',
        value: 'share-external',
      },
    ],
  },
  ...personalStandardRules,
];

const openCollaborativeRules: GovernanceRule[] = [
  {
    id: 'allow-collaboration',
    name: 'Allow Collaboration',
    description: 'Enable open collaboration features',
    enabled: true,
    action: 'allow',
    conditions: [],
  },
  {
    id: 'allow-sharing',
    name: 'Allow Sharing',
    description: 'Enable sharing features',
    enabled: true,
    action: 'allow',
    conditions: [],
  },
  ...personalStandardRules,
];

export function getRulesForProfile(profile: PolicyProfile): GovernanceRule[] {
  switch (profile) {
    case 'personal_standard':
      return personalStandardRules;
    case 'enterprise_strict':
      return enterpriseStrictRules;
    case 'open_collaborative':
      return openCollaborativeRules;
    default:
      return personalStandardRules;
  }
}
