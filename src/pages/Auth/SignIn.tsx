/**
 * Sign In Page
 * 
 * User authentication page with Supabase integration.
 */

import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { Mail, Lock, Sparkles, AlertCircle } from 'lucide-react'
import { Card2035, Card2035Header, Card2035Title, Card2035Content } from '../../components/ui/Card2035'
import { Button2035 } from '../../components/ui/Button2035'
import { Input2035 } from '../../components/ui/Input2035'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { FadeIn } from '../../components/motion/FadeIn'
import { SupabaseDiagnostics } from '../../components/debug/SupabaseDiagnostics'

export default function SignIn() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, signInWithGoogle, loading: authLoading, user } = useAuth()
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  // Redirect logged-in users away from sign-in page
  // Also show welcome message when user successfully authenticates
  // Only redirect if we're actually on the sign-in page (not on forgot-password or reset-password)
  useEffect(() => {
    // Only redirect if we're on the sign-in page specifically
    const isOnSignInPage = location.pathname === '/auth/signin'
    
    if (user && !authLoading && isOnSignInPage) {
      showToast('Welcome back!', 'success')
      navigate('/home', { replace: true })
    }
  }, [user, authLoading, navigate, showToast, location.pathname])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields')
      return
    }

    setIsSubmitting(true)
    try {
      await signIn(email, password)
      // Navigation will happen automatically via useEffect when user state updates
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sign in. Please check your credentials.'
      setError(errorMessage)
      showToast(errorMessage, 'error')
      console.error('Sign in error:', err)
      console.error('Error details:', {
        message: err.message,
        originalError: err.originalError,
        email: email,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const loading = isSubmitting

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
      <FadeIn>
        <div className="w-full max-w-md">
          {/* Supabase Diagnostics (Dev Only) */}
          <SupabaseDiagnostics />
          
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-fuchsia-500 mb-4 shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to continue to SageSpace
            </p>
          </div>

          <Card2035>
            <Card2035Header>
              <Card2035Title>Sign In</Card2035Title>
            </Card2035Header>
            <Card2035Content>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-4 bg-red-500/10 border-2 border-red-500/30 rounded-lg flex items-start gap-3 text-sm">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-red-900 dark:text-red-200 mb-1">Error</p>
                      <p className="text-red-700 dark:text-red-300">{error}</p>
                      {(error.includes('not enabled') || error.includes('Unsupported provider')) && (
                        <div className="mt-3 space-y-2 text-xs">
                          <p className="text-red-600 dark:text-red-400 font-medium">Google Sign-In Not Available</p>
                          <p className="text-red-600 dark:text-red-400">
                            Google authentication is not currently enabled. Please use the email/password form above to sign in.
                          </p>
                        </div>
                      )}
                      {error.includes('create an account') && (
                        <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                          Don't have an account? <Link to="/auth/signup" className="underline font-medium">Sign up here</Link>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input2035
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="pl-10"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-900 dark:text-white">
                      Password
                    </label>
                    <Link
                      to="/auth/forgot-password"
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input2035
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button2035
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button2035>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button2035
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="w-full mt-4"
                  onClick={async () => {
                    setIsGoogleLoading(true)
                    setError(null)
                    try {
                      await signInWithGoogle()
                      // OAuth will redirect, so we don't need to handle success here
                    } catch (err: any) {
                      let errorMessage = err.message || 'Failed to sign in with Google. Please try again.'
                      
                      // Provide helpful guidance for common errors
                      if (errorMessage.includes('not enabled') || errorMessage.includes('Unsupported provider')) {
                        errorMessage = 'Google sign-in is not currently enabled. Please use email/password to sign in, or contact support if you need Google sign-in.'
                      }
                      
                      setError(errorMessage)
                      showToast(errorMessage, 'error')
                      setIsGoogleLoading(false)
                    }
                  }}
                  disabled={isGoogleLoading || loading}
                >
                  {isGoogleLoading ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Sign in with Google
                    </>
                  )}
                </Button2035>
              </div>

              <div className="mt-6 space-y-2 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{' '}
                  <Link
                    to="/auth/signup"
                    className="text-primary hover:underline font-medium"
                  >
                    Sign up
                  </Link>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Forgot which email you used? Check your inbox for SageSpace emails or contact support.
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
