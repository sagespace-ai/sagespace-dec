import { useAnimation } from 'framer-motion';
import { useEffect } from 'react';

export function useBreathing(
  speed: 'slow' | 'normal' | 'fast' = 'normal',
  enabled: boolean = true
) {
  const controls = useAnimation();

  const durations = {
    slow: 4,
    normal: 3,
    fast: 2,
  };

  useEffect(() => {
    if (!enabled) return;

    controls.start({
      scale: [1, 1.02, 1],
      opacity: [0.95, 1, 0.95],
      transition: {
        duration: durations[speed],
        repeat: Infinity,
        ease: [0.4, 0, 0.2, 1],
      },
    });
  }, [controls, speed, enabled]);

  return controls;
}
