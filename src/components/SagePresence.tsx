/**
 * Sage Presence Component
 * 
 * AI companion presence indicator with subtle animations
 * Adapted from SAGN_Unified
 */

import { useState, useEffect } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface SagePresenceProps {
  hasMessage?: boolean
  position?: 'bottom-right' | 'bottom-left' | 'top-right'
  onClick?: () => void
}

export default function SagePresence({
  hasMessage = false,
  position = 'bottom-right',
  onClick
}: SagePresenceProps) {
  const [isHovered, setIsHovered] = useState(false)
  const breathingControls = useAnimation()

  useEffect(() => {
    if (!hasMessage) {
      breathingControls.start({
        scale: [1, 1.02, 1],
        opacity: [0.95, 1, 0.95],
        transition: {
          duration: 3,
          repeat: Infinity,
          ease: [0.4, 0, 0.2, 1],
        },
      })
    }
  }, [hasMessage, breathingControls])

  const positionClasses = {
    'bottom-right': 'bottom-8 right-8',
    'bottom-left': 'bottom-8 left-8',
    'top-right': 'top-20 right-8',
  }

  return (
    <motion.div
      className={`fixed ${positionClasses[position]} z-40`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
    >
      <motion.div
        className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-purple-500/30 flex items-center justify-center cursor-pointer backdrop-blur-sm"
        animate={hasMessage ? {
          scale: [1, 1.05, 1],
          boxShadow: [
            '0 0 0 0 rgba(168, 85, 247, 0.4)',
            '0 0 0 8px rgba(168, 85, 247, 0)',
            '0 0 0 0 rgba(168, 85, 247, 0)',
          ],
        } : breathingControls}
        transition={{
          duration: 2,
          repeat: hasMessage ? Infinity : 0,
          ease: [0.4, 0, 0.2, 1],
        }}
        onClick={onClick}
      >
        <Sparkles className="w-5 h-5 text-purple-300" />
      </motion.div>

      {isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="absolute bottom-full right-0 mb-2 w-48 p-3 rounded-[12px] bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-white/20 text-xs text-neutral-200 dark:text-neutral-300"
        >
          <p>I'm here if you need help.</p>
        </motion.div>
      )}
    </motion.div>
  )
}
