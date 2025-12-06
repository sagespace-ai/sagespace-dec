import { motion } from 'framer-motion';
import { useHarmony } from '../hooks/useHarmony';
import { zenMotion } from '../lib/motion';
import { useUIStore } from '../store/uiStore';

interface HarmonyBarProps {
  className?: string;
}

export function HarmonyBar({ className }: HarmonyBarProps) {
  const { state, message } = useHarmony();
  const personaHint = useUIStore((s) => s.personaHint);
  const setPersonaHint = useUIStore((s) => s.setPersonaHint);

  return (
    <motion.div
      {...zenMotion.fadeIn}
      className={`flex items-center gap-3 ${className || ''}`}
    >
      <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${state.score}%` }}
          transition={{
            duration: 1,
            ease: [0.4, 0, 0.2, 1],
          }}
        />
      </div>
      <span className="text-xs text-neutral-400 flex-1 min-w-0 truncate">
        {message.text}
      </span>
      <input
        type="text"
        value={personaHint}
        onChange={(e) => setPersonaHint(e.target.value)}
        className="hidden md:inline-block ml-3 max-w-xs rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-primary"
        placeholder="Who are you today? (persona hint)"
        aria-label="Persona hint for tuning your universe"
      />
    </motion.div>
  );
}
