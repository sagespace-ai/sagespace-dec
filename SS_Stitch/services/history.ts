import { StitchResult } from '../types';

const HISTORY_KEY = 'sagespace_stitch_history';
const MAX_HISTORY_ITEMS = 10;

export const historyService = {
  getHistory: (): StitchResult[] => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to load history", e);
      return [];
    }
  },

  saveStitch: (stitch: StitchResult): StitchResult[] => {
    try {
      const current = historyService.getHistory();
      
      // Clean up the input files/urls as they can't/shouldn't be stored persistently
      const safeStitch: StitchResult = {
        ...stitch,
        inputs: {
          a: { ...stitch.inputs.a, image: null, imageUrl: null },
          b: { ...stitch.inputs.b, image: null, imageUrl: null }
        }
      };

      // Add new item to the beginning
      const updated = [safeStitch, ...current];
      
      // Enforce limit by count first
      const limited = updated.slice(0, MAX_HISTORY_ITEMS);
      
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(limited));
        return limited;
      } catch (e) {
        // Quota exceeded? Try removing image from the oldest or just keep fewer items
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
           console.warn("Storage quota full, attempting to save fewer items.");
           const reduced = updated.slice(0, 3); // Drastic reduction fallback
           try {
             localStorage.setItem(HISTORY_KEY, JSON.stringify(reduced));
             return reduced;
           } catch (e2) {
             console.error("Could not save history even after reduction");
             return current;
           }
        }
        throw e;
      }
    } catch (e) {
      console.error("Failed to save stitch", e);
      return [];
    }
  },

  deleteStitch: (id: string): StitchResult[] => {
    try {
      const current = historyService.getHistory();
      const updated = current.filter(item => item.id !== id);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error("Failed to delete stitch", e);
      return [];
    }
  },

  clearHistory: () => {
    localStorage.removeItem(HISTORY_KEY);
    return [];
  }
};
