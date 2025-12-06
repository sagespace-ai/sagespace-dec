import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { UserIntent, IntentContext, ContextSignal, PatternMemory } from '../core/intent/types';

/**
 * Hook for detecting user intent
 * Tracks patterns and determines user intent
 */
export function useIntent(): IntentContext {
  const location = useLocation();
  const [timeOnPage, setTimeOnPage] = useState(0);
  const [recentActions, setRecentActions] = useState(0);

  useEffect(() => {
    // PHASE 1: Fixed memory leak - interval properly cleaned up
    const interval = setInterval(() => {
      setTimeOnPage((prev) => prev + 1);
    }, 1000);

    // PHASE 1: Ensure cleanup function properly clears interval
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  // Reset on navigation
  useEffect(() => {
    setTimeOnPage(0);
    setRecentActions(0);
  }, [location.pathname]);

  // Determine orbit from pathname
  const orbit = location.pathname.startsWith('/create') || 
                location.pathname.startsWith('/marketplace') || 
                location.pathname.startsWith('/enterprise')
    ? 'work'
    : location.pathname.startsWith('/remix') || 
      location.pathname.startsWith('/reflection')
    ? 'play'
    : location.pathname.startsWith('/settings')
    ? 'governance'
    : 'idle';

  // Build context signal
  const contextSignals: ContextSignal = {
    orbit,
    timeOnPage,
    recentActions,
    openPanels: 1, // Stub - could track modals/panels
    lastInteraction: new Date().toISOString(),
  };

  // Simple intent detection
  const intent: UserIntent = (() => {
    if (timeOnPage > 60 && recentActions === 0) return 'exploring';
    if (recentActions > 3) return 'focused';
    if (orbit === 'play') return 'creating';
    if (location.pathname.includes('search') || location.pathname.includes('marketplace')) return 'searching';
    return 'unknown';
  })();

  // Pattern memory (stub - could be enhanced with PatternMemory)
  const patterns: PatternMemory = {
    frequentOrbits: [orbit],
    preferredTimes: ['morning'], // Stub
    commonTasks: [], // Stub
  };

  return {
    intent,
    confidence: 0.6, // Stub confidence
    signals: contextSignals,
    patterns,
  };
}
