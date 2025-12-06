import { usePatternTracking } from '../hooks/usePatternTracking';

/**
 * Pattern Tracker Component
 * Automatically tracks user navigation patterns
 * Should be placed at the root level
 */
export function PatternTracker() {
  usePatternTracking();
  return null;
}
