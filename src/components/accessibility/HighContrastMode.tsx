import { useState, useEffect } from 'react';
import { Contrast } from 'lucide-react';

export default function HighContrastMode() {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('highContrast') === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (enabled) {
      document.documentElement.classList.add('high-contrast');
      localStorage.setItem('highContrast', 'true');
    } else {
      document.documentElement.classList.remove('high-contrast');
      localStorage.setItem('highContrast', 'false');
    }
  }, [enabled]);

  return (
    <button
      onClick={() => setEnabled(!enabled)}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label={enabled ? 'Disable high contrast mode' : 'Enable high contrast mode'}
      aria-pressed={enabled}
    >
      <Contrast size={18} />
      <span className="text-sm">High Contrast</span>
    </button>
  );
}
