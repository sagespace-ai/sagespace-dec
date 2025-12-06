/**
 * Offline Banner Component
 * 
 * Displays a banner when the user is offline
 */

import { WifiOff, Wifi } from 'lucide-react'
import { FadeIn } from '../motion/FadeIn'
import { useNetworkStatus } from '../../hooks/useNetworkStatus'
import { useEffect, useState } from 'react'

export function OfflineBanner() {
  const { isOnline, wasOffline } = useNetworkStatus()
  const [showReconnected, setShowReconnected] = useState(false)

  useEffect(() => {
    if (wasOffline && isOnline) {
      setShowReconnected(true)
      const timer = setTimeout(() => setShowReconnected(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [wasOffline, isOnline])

  if (isOnline && !showReconnected) {
    return null
  }

  return (
    <FadeIn>
      <div
        className={`fixed top-0 left-0 right-0 z-50 ${
          isOnline
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
        } px-4 py-2 text-center text-sm font-medium shadow-lg`}
      >
        <div className="flex items-center justify-center gap-2">
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4" />
              <span>Connection restored. Your changes will sync automatically.</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              <span>You're offline. Some features may be unavailable.</span>
            </>
          )}
        </div>
      </div>
    </FadeIn>
  )
}
