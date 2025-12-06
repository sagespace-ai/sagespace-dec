/**
 * useNetworkStatus Hook
 * 
 * Detects online/offline status and provides network state
 */

import { useState, useEffect } from 'react'

interface NetworkStatus {
  isOnline: boolean
  wasOffline: boolean
  isSlowConnection: boolean
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [wasOffline, setWasOffline] = useState(false)
  const [isSlowConnection, setIsSlowConnection] = useState(false)

  useEffect(() => {
    // Check connection speed if available
    const checkConnectionSpeed = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        if (connection) {
          // Consider slow if effectiveType is '2g' or 'slow-2g'
          const slowTypes = ['2g', 'slow-2g']
          setIsSlowConnection(slowTypes.includes(connection.effectiveType))
        }
      }
    }

    checkConnectionSpeed()

    const handleOnline = () => {
      setIsOnline(true)
      setWasOffline(true)
      // Clear wasOffline after a delay
      setTimeout(() => setWasOffline(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    // Connection change handler (for speed changes)
    const handleConnectionChange = () => {
      checkConnectionSpeed()
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection) {
        connection.addEventListener('change', handleConnectionChange)
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        if (connection) {
          connection.removeEventListener('change', handleConnectionChange)
        }
      }
    }
  }, [])

  return { isOnline, wasOffline, isSlowConnection }
}
