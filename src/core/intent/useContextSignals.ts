import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ContextSignal } from './types';

/**
 * Hook to track context signals
 * Monitors user activity and context
 */
export function useContextSignals(): ContextSignal {
  const location = useLocation();
  const [timeOnPage, setTimeOnPage] = useState(0);
  const [recentActions, setRecentActions] = useState(0);
  const [openPanels] = useState(0);

  // Reset time on page change
  useEffect(() => {
    setTimeOnPage(0);
    setRecentActions(0);
  }, [location.pathname]);

  // Track time on page
  // PHASE 1: Fixed memory leak - interval properly cleaned up
  useEffect(() => {
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

  return {
    orbit,
    timeOnPage,
    recentActions,
    openPanels,
    lastInteraction: new Date().toISOString(),
  };
}
