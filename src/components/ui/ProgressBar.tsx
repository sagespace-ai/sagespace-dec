import { motion } from 'framer-motion'

interface ProgressBarProps {
  current: number
  total: number
  label?: string
  showNumbers?: boolean
  className?: string
}

export function ProgressBar({
  current,
  total,
  label,
  showNumbers = true,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100))

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white">{label}</span>
          {showNumbers && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {current} / {total}
            </span>
          )}
        </div>
      )}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-fuchsia-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {!label && showNumbers && (
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {current} of {total} complete
          </span>
          <span className="text-xs font-medium text-primary">{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  )
}
