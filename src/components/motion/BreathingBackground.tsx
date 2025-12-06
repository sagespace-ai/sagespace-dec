/**
 * Breathing Background Component
 * 
 * Subtle animated background with breathing effect
 * Adapted from SAGN_Unified
 */

import { motion } from 'framer-motion'

interface BreathingBackgroundProps {
  className?: string
}

export function BreathingBackground({ className = '' }: BreathingBackgroundProps) {
  // PHASE 4: Disable continuous animations if user prefers reduced motion
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false

  if (prefersReducedMotion) {
    // PHASE 4: Return static background when motion is reduced
    return (
      <div 
        className={`absolute inset-0 -z-10 ${className}`}
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)',
        }}
      />
    )
  }

  return (
    <motion.div
      className={`absolute inset-0 -z-10 ${className}`}
      animate={{
        background: [
          'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
          'radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
          'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
        ],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}
