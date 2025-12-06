import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getPatternMemory } from '../core/memory/PatternMemory';

/**
 * Hook to automatically track user patterns
 * Records navigation patterns and behavior
 */
export function usePatternTracking() {
  const location = useLocation();
  const patternMemory = getPatternMemory();

  useEffect(() => {
    // Track navigation pattern
    patternMemory.record('behavior', {
      action: 'navigate',
      path: location.pathname,
      timestamp: new Date().toISOString(),
    });
  }, [location.pathname, patternMemory]);

  return patternMemory;
}
