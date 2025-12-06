/**
 * SATI Engine Types
 * Self-healing system types
 */

export type HealthStatus = 'healthy' | 'degraded' | 'critical' | 'healing';

export interface TelemetryEvent {
  id: string;
  type: 'error-rate-high' | 'slow-render' | 'api-error' | 'memory-leak' | 'ui-complexity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
  metadata?: Record<string, any>;
}

export interface HealingAction {
  type: 'reduce-complexity' | 'optimize-render' | 'clear-cache' | 'show-suggestion' | 'auto-fix';
  description: string;
  priority: number;
}

export interface HealingStrategy {
  id: string;
  name: string;
  description: string;
  conditions: {
    issueTypes: TelemetryEvent['type'][];
    severity?: TelemetryEvent['severity'];
  };
  actions: HealingAction[];
}

export interface SatiState {
  healthStatus: HealthStatus;
  activeIssues: TelemetryEvent[];
  healingInProgress: boolean;
  lastHealing: string | null;
  metrics: {
    errorCount: number;
    uiComplexity: number; // 0-1
    userSatisfaction: number; // 0-1
  };
}
