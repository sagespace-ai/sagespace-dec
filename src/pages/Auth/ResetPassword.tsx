/**
 * Reset Password Page
 * 
 * Allows users to set a new password after clicking the reset link from their email.
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Lock, Sparkles, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { Card2035, Card2035Header, Card2035Title, Card2035Content } from '../../components/ui/Card2035'
import { Button2035 } from '../../components/ui/Button2035'
import { Input2035 } from '../../components/ui/Input2035'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { FadeIn } from '../../components/motion/FadeIn'
import { supabase } from '../../lib/supabase'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { updatePassword } = useAuth()
  const { showToast } = useToast()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordReset, setPasswordReset] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isValidatingToken, setIsValidatingToken] = useState(true)
  const hasValidatedRef = useRef(false)
  const validationCompleteRef = useRef(false)

  // Validate the reset token from URL - only run once on mount
  useEffect(() => {
    // Prevent re-running if we've already validated
    if (hasValidatedRef.current) {
      console.log('[Reset Password] Already validated, skipping')
      return
    }

    let isMounted = true
    let timeoutId: NodeJS.Timeout | null = null
    
    const validateToken = async () => {
      console.log('[Reset Password] Starting token validation')
      console.log('[Reset Password] Current URL:', window.location.href)
      console.log('[Reset Password] Hash:', window.location.hash)
      console.log('[Reset Password] Search:', window.location.search)
      
      // Mark as validated to prevent re-runs
      hasValidatedRef.current = true
      
      // Set a timeout to prevent infinite loading (5 seconds - shorter timeout)
      timeoutId = setTimeout(() => {
        if (isMounted && !validationCompleteRef.current) {
          console.warn('[Reset Password] Validation timeout - forcing completion')
          validationCompleteRef.current = true
          setError('No reset token found in URL. Please click the reset link from your email or request a new one.')
          setIsValidatingToken(false)
        }
      }, 5000)

      if (!supabase) {
        if (timeoutId) clearTimeout(timeoutId)
        if (isMounted) {
          validationCompleteRef.current = true
          setError('Supabase is not configured')
          setIsValidatingToken(false)
        }
        return
      }

      try {
        // Supabase sends recovery tokens in the URL hash fragment by default, e.g.:
        // /auth/reset-password#access_token=...&refresh_token=...&type=recovery
        // We first try to read from the hash, then fall back to query params.
        const hash = window.location.hash.startsWith('#')
          ? window.location.hash.substring(1)
          : window.location.hash
        const hashParams = new URLSearchParams(hash)

        const accessToken =
          hashParams.get('access_token') || searchParams.get('access_token')
        const refreshToken =
          hashParams.get('refresh_token') || searchParams.get('refresh_token')
        const type = hashParams.get('type') || searchParams.get('type')

        console.log('[Reset Password] Token validation:', {
          hasHash: !!hash,
          hashLength: hash.length,
          hashValue: hash.substring(0, 50) + '...', // First 50 chars for debugging
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          type: type,
          searchParams: Object.fromEntries(searchParams.entries())
        })

        // If no tokens at all, show error immediately (don't wait for timeout)
        const hasHashTokens = hash && (hashParams.get('access_token') || hashParams.get('refresh_token'))
        const hasQueryTokens = searchParams.get('access_token') || searchParams.get('refresh_token')
        
        if (!hasHashTokens && !hasQueryTokens) {
          if (timeoutId) clearTimeout(timeoutId)
          console.log('[Reset Password] No tokens found - showing error')
        if (isMounted) {
          validationCompleteRef.current = true
          setError('No reset token found in URL. Please click the reset link from your email or request a new one.')
          setIsValidatingToken(false)
        }
        return
      }

      if (type !== 'recovery' || !accessToken || !refreshToken) {
        if (timeoutId) clearTimeout(timeoutId)
        console.log('[Reset Password] Invalid token format - showing error')
        if (isMounted) {
          validationCompleteRef.current = true
          setError('Invalid or missing reset token. Please request a new password reset link.')
          setIsValidatingToken(false)
        }
        return
      }

        // Clear timeout since we have valid tokens
        if (timeoutId) clearTimeout(timeoutId)

        console.log('[Reset Password] Setting session with tokens...')
        // Set the session with the tokens from the URL
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (sessionError) {
          console.error('[Reset Password] Session error:', sessionError)
        if (isMounted) {
          validationCompleteRef.current = true
          setError('This reset link has expired or is invalid. Please request a new password reset.')
          setIsValidatingToken(false)
        }
        return
        }

        // Token is valid - clear hash from URL for security
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search)
        }

        if (isMounted) {
          console.log('[Reset Password] Token validation successful')
          validationCompleteRef.current = true
          setIsValidatingToken(false)
        }
      } catch (err: any) {
        if (timeoutId) clearTimeout(timeoutId)
        console.error('[Reset Password] Token validation error:', err)
        if (isMounted) {
          validationCompleteRef.current = true
          setError('Failed to validate reset token. Please request a new password reset link.')
          setIsValidatingToken(false)
        }
      }
      
      // Safety net: ensure validation always completes after timeout
      // Only runs if validation hasn't completed yet
      setTimeout(() => {
        if (isMounted && !validationCompleteRef.current) {
          console.warn('[Reset Password] Safety net triggered - forcing completion')
          validationCompleteRef.current = true
          setIsValidatingToken(false)
          if (!error) {
            setError('Validation timed out. Please try requesting a new reset link.')
          }
        }
      }, 5500) // Slightly longer than the 5 second timeout
    }

    validateToken()

    return () => {
      isMounted = false
      if (timeoutId) clearTimeout(timeoutId)
      // Reset validation flag on unmount so it can run again if component remounts
      hasValidatedRef.current = false
    }
    // Only run once on mount - don't depend on searchParams to avoid infinite loops
    // The URL hash/params are read directly from window.location, not from searchParams dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!password.trim()) {
      setError('Please enter a new password')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsSubmitting(true)
    try {
      await updatePassword(password)
      setPasswordReset(true)
      showToast('Password reset successfully! You can now sign in.', 'success')
      
      // Redirect to sign in after a short delay
      setTimeout(() => {
        navigate('/auth/signin', { replace: true })
      }, 2000)
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to reset password. Please try again or request a new reset link.'
      setError(errorMessage)
      showToast(errorMessage, 'error')
      console.error('Password reset error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isValidatingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
        <FadeIn>
          <div className="w-full max-w-md">
            <Card2035>
              <Card2035Content>
                <div className="text-center py-6">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Validating reset link...</p>
                </div>
              </Card2035Content>
            </Card2035>
          </div>
        </FadeIn>
      </div>
    )
  }

  if (passwordReset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
        <FadeIn>
          <div className="w-full max-w-md">
            {/* Logo/Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-fuchsia-500 mb-4 shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                Password Reset!
              </h1>
            </div>

            <Card2035>
              <Card2035Content>
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Success!
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Your password has been reset successfully. Redirecting to sign in...
                  </p>
                  <Button2035
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => navigate('/auth/signin', { replace: true })}
                  >
                    Go to Sign In
                  </Button2035>
                </div>
              </Card2035Content>
            </Card2035>
          </div>
        </FadeIn>
      </div>
    )
  }

  // Show error state if validation failed and we're not in the middle of submitting
  if (error && !isSubmitting && !password && !confirmPassword) {
    // Token validation failed
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
        <FadeIn>
          <div className="w-full max-w-md">
            {/* Logo/Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-fuchsia-500 mb-4 shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                Invalid Reset Link
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

                <div className="space-y-3">
                  <Button2035
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => navigate('/auth/forgot-password')}
                  >
                    Request New Reset Link
                  </Button2035>
                  <Button2035
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    onClick={() => navigate('/auth/signin')}
                  >
                    Back to Sign In
                  </Button2035>
                </div>
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
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-fuchsia-500 mb-4 shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
              Reset Password
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your new password below
            </p>
          </div>

          <Card2035>
            <Card2035Header>
              <Card2035Title>New Password</Card2035Title>
            </Card2035Header>
            <Card2035Content>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-4 bg-red-500/10 border-2 border-red-500/30 rounded-lg flex items-start gap-3 text-sm">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-red-900 dark:text-red-200 mb-1">Error</p>
                      <p className="text-red-700 dark:text-red-300">{error}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input2035
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      required
                      disabled={isSubmitting}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Must be at least 6 characters long
                  </p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input2035
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      required
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button2035
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
                </Button2035>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Remember your password?{' '}
                  <Link
                    to="/auth/signin"
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </Card2035Content>
          </Card2035>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </FadeIn>
    </div>
  )
}
