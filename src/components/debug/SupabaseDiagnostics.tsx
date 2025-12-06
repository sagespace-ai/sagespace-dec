/**
 * Supabase Diagnostics Component
 * 
 * Helps debug Supabase connection issues
 * Only shows in development mode
 */

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Card2035, Card2035Header, Card2035Title, Card2035Content } from '../ui/Card2035'

export function SupabaseDiagnostics() {
  const [status, setStatus] = useState<{
    configured: boolean
    connected: boolean
    error?: string
    url?: string
  }>({
    configured: false,
    connected: false,
  })

  useEffect(() => {
    if (import.meta.env.PROD) return // Only show in development

    const checkConnection = async () => {
      const url = import.meta.env.VITE_SUPABASE_URL
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY

      setStatus({
        configured: !!(url && key),
        connected: false,
        url,
      })

      if (!supabase) {
        setStatus(prev => ({
          ...prev,
          error: 'Supabase client is null. Check environment variables.',
        }))
        return
      }

      try {
        // Try to get session to test connection
        const { error } = await supabase.auth.getSession()
        if (error) {
          setStatus(prev => ({
            ...prev,
            connected: false,
            error: error.message,
          }))
        } else {
          setStatus(prev => ({
            ...prev,
            connected: true,
          }))
        }
      } catch (error: any) {
        setStatus(prev => ({
          ...prev,
          connected: false,
          error: error.message || 'Connection test failed',
        }))
      }
    }

    checkConnection()
  }, [])

  // Only show in development
  if (import.meta.env.PROD) return null

  return (
    <Card2035 className="mb-4 border-yellow-500/50 bg-yellow-500/5">
      <Card2035Header>
        <Card2035Title className="text-yellow-600 dark:text-yellow-400">
          🔧 Supabase Diagnostics (Dev Only)
        </Card2035Title>
      </Card2035Header>
      <Card2035Content>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">Configured:</span>
            <span className={status.configured ? 'text-green-600' : 'text-red-600'}>
              {status.configured ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Connected:</span>
            <span className={status.connected ? 'text-green-600' : 'text-red-600'}>
              {status.connected ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          {status.url && (
            <div className="flex items-center gap-2">
              <span className="font-medium">URL:</span>
              <span className="text-gray-600 dark:text-gray-400 text-xs">
                {status.url}
              </span>
            </div>
          )}
          {status.error && (
            <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-600 dark:text-red-400 text-xs">
              Error: {status.error}
            </div>
          )}
          {!status.configured && (
            <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-600 dark:text-yellow-400 text-xs">
              Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local
            </div>
          )}
        </div>
      </Card2035Content>
    </Card2035>
  )
}
