import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HarmonyState, HarmonyMessage } from '../core/harmony/types';

/**
 * Hook for harmony/balance tracking
 * Tracks time spent in different sections
 */
export function useHarmony(): {
  state: HarmonyState;
  message: HarmonyMessage;
} {
  const location = useLocation();
  const [state, setState] = useState<HarmonyState>({
    score: 65,
    workTime: 0,
    playTime: 0,
    idleTime: 0,
    lastUpdated: new Date().toISOString(),
  });

  useEffect(() => {
    // Track time in current section
    // PHASE 1: Fixed memory leak - interval properly cleaned up
    const interval = setInterval(() => {
      setState((prev) => {
        // Determine section from pathname
        const path = location.pathname;
        const section = path.startsWith('/create') || path.startsWith('/marketplace') || path.startsWith('/enterprise')
          ? 'work'
          : path.startsWith('/remix') || path.startsWith('/reflection')
          ? 'play'
          : 'idle';

        const newState = {
          ...prev,
          [section === 'work' ? 'workTime' : section === 'play' ? 'playTime' : 'idleTime']:
            prev[section === 'work' ? 'workTime' : section === 'play' ? 'playTime' : 'idleTime'] + 1,
          lastUpdated: new Date().toISOString(),
        };

        // Calculate harmony score (balance between work and play)
        const total = newState.workTime + newState.playTime;
        if (total === 0) {
          newState.score = 50;
        } else {
          const workRatio = newState.workTime / total;
          const playRatio = newState.playTime / total;
          // Ideal balance is 50/50, score reflects how close we are
          const balance = 1 - Math.abs(workRatio - playRatio);
          newState.score = Math.round(50 + balance * 50);
        }

        return newState;
      });
    }, 1000);

    // PHASE 1: Ensure cleanup function properly clears interval
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [location.pathname]);

  const message: HarmonyMessage = (() => {
    if (state.score >= 70) {
      return { text: "You're in balance", tone: 'calm' };
    } else if (state.score >= 50) {
      return { text: 'Maybe a short break?', tone: 'suggestive' };
    } else {
      return { text: 'Feeling productive today?', tone: 'encouraging' };
    }
  })();

  return { state, message };
}
