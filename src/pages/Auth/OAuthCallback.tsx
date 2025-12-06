/**
 * OAuth Callback Page
 * 
 * Handles OAuth redirects from providers (Google, etc.)
 * This page processes the OAuth callback and completes authentication.
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, CheckCircle, AlertCircle } from 'lucide-react'
import { Card2035, Card2035Content } from '../../components/ui/Card2035'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { FadeIn } from '../../components/motion/FadeIn'
import { supabase } from '../../lib/supabase'
import { syncAuthToken } from '../../lib/supabase'

export default function OAuthCallback() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const { showToast } = useToast()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleOAuthCallback = async () => {
      if (!supabase) {
        setError('Supabase is not configured')
        setStatus('error')
        return
      }

      try {
        // Get the hash from URL (Supabase OAuth uses hash fragments)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const errorParam = hashParams.get('error')
        const errorDescription = hashParams.get('error_description')

        // Check for OAuth errors
        if (errorParam) {
          throw new Error(errorDescription || errorParam || 'OAuth authentication failed')
        }

        // If we have tokens, set the session
        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (sessionError) {
            throw new Error(sessionError.message || 'Failed to create session')
          }

          // Sync auth token for API
          await syncAuthToken()

          // Refresh user profile
          await refreshUser()

          setStatus('success')
          showToast('Successfully signed in with Google!', 'success')

          // Redirect to home after a short delay
          setTimeout(() => {
            navigate('/home', { replace: true })
          }, 1500)
        } else {
          // Check if we're already authenticated (user might have refreshed)
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            await syncAuthToken()
            await refreshUser()
            setStatus('success')
            showToast('Successfully signed in!', 'success')
            setTimeout(() => {
              navigate('/home', { replace: true })
            }, 1500)
          } else {
            throw new Error('No authentication tokens received')
          }
        }
      } catch (err: any) {
        console.error('OAuth callback error:', err)
        setError(err.message || 'Failed to complete authentication')
        setStatus('error')
        showToast(err.message || 'Authentication failed', 'error')
      }
    }

    handleOAuthCallback()
  }, [navigate, refreshUser, showToast])

  if (status === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
        <FadeIn>
          <div className="w-full max-w-md">
            <Card2035>
              <Card2035Content>
                <div className="text-center py-6">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Completing sign in...</p>
                </div>
              </Card2035Content>
            </Card2035>
          </div>
        </FadeIn>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
        <FadeIn>
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-fuchsia-500 mb-4 shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                Authentication Error
              </h1>
            </div>

            <Card2035>
              <Card2035Content>
                <div className="p-4 bg-red-500/10 border-2 border-red-500/30 rounded-lg mb-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-red-900 dark:text-red-200 mb-1">Error</p>
                      <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/auth/signin', { replace: true })}
                  className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                >
                  Back to Sign In
                </button>
              </Card2035Content>
            </Card2035>
          </div>
        </FadeIn>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
      <FadeIn>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-fuchsia-500 mb-4 shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
              Success!
            </h1>
          </div>

          <Card2035>
            <Card2035Content>
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Signed In Successfully!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Redirecting to your dashboard...
                </p>
              </div>
            </Card2035Content>
          </Card2035>
        </div>
      </FadeIn>
    </div>
  )
}
