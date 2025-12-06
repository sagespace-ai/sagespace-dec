import { useMood } from '../hooks/useMood';
import { motion } from 'framer-motion';
import { Brain, Zap, Palette, Moon, Search, AlertCircle } from 'lucide-react';
import { zenMotion } from '../lib/motion';

interface MoodIndicatorProps {
  className?: string;
  showLabel?: boolean;
}

const moodIcons = {
  calm: Brain,
  focused: Zap,
  creative: Palette,
  tired: Moon,
  curious: Search,
  overwhelmed: AlertCircle,
};

const moodColors = {
  calm: 'text-blue-400',
  focused: 'text-green-400',
  creative: 'text-purple-400',
  tired: 'text-gray-400',
  curious: 'text-yellow-400',
  overwhelmed: 'text-red-400',
};

export function MoodIndicator({ className, showLabel = false }: MoodIndicatorProps) {
  const { mood, effects } = useMood();
  const Icon = moodIcons[mood];

  return (
    <motion.div
      {...zenMotion.fadeIn}
      className={`flex items-center gap-2 ${className || ''}`}
      title={`Mood: ${mood} (${effects.animationSpeed} animations, ${effects.cardDensity} density)`}
    >
      <Icon className={`h-4 w-4 ${moodColors[mood]}`} />
      {showLabel && (
        <span className="text-xs text-neutral-400 capitalize">{mood}</span>
      )}
    </motion.div>
  );
}
