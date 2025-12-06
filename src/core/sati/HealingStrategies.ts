/**
 * Healing Strategies
 * Predefined strategies for common issues
 */

import { HealingStrategy } from './types';

export const healingStrategies: HealingStrategy[] = [
  {
    id: 'reduce-ui-complexity',
    name: 'Reduce UI Complexity',
    description: 'Simplify UI when complexity is too high',
    conditions: {
      issueTypes: ['ui-complexity'],
      severity: 'high',
    },
    actions: [
      {
        type: 'reduce-complexity',
        description: 'Hide non-essential UI elements',
        priority: 1,
      },
    ],
  },
  {
    id: 'optimize-renders',
    name: 'Optimize Renders',
    description: 'Reduce unnecessary re-renders',
    conditions: {
      issueTypes: ['slow-render'],
      severity: 'high',
    },
    actions: [
      {
        type: 'optimize-render',
        description: 'Enable React.memo and useMemo optimizations',
        priority: 1,
      },
    ],
  },
  {
    id: 'handle-api-errors',
    name: 'Handle API Errors',
    description: 'Gracefully handle API errors',
    conditions: {
      issueTypes: ['api-error'],
      severity: 'medium',
    },
    actions: [
      {
        type: 'show-suggestion',
        description: 'Show user-friendly error message',
        priority: 1,
      },
      {
        type: 'clear-cache',
        description: 'Clear stale cache data',
        priority: 2,
      },
    ],
  },
  {
    id: 'reduce-error-rate',
    name: 'Reduce Error Rate',
    description: 'Address high error rates',
    conditions: {
      issueTypes: ['error-rate-high'],
      severity: 'critical',
    },
    actions: [
      {
        type: 'auto-fix',
        description: 'Attempt automatic error recovery',
        priority: 1,
      },
      {
        type: 'show-suggestion',
        description: 'Suggest user actions',
        priority: 2,
      },
    ],
  },
];

/**
 * Find healing strategies for given issues
 */
export function findHealingStrategies(
  issueTypes: string[],
  severity?: string
): HealingStrategy[] {
  return healingStrategies.filter((strategy) => {
    const matchesType = strategy.conditions.issueTypes.some((type) =>
      issueTypes.includes(type)
    );
    const matchesSeverity =
      !severity || !strategy.conditions.severity || strategy.conditions.severity === severity;
    return matchesType && matchesSeverity;
  });
}
