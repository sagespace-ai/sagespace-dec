/**
 * Sign Up Page
 * 
 * User registration page with Supabase integration.
 */

import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, User, Sparkles, AlertCircle } from 'lucide-react'
import { Card2035, Card2035Header, Card2035Title, Card2035Content } from '../../components/ui/Card2035'
import { Button2035 } from '../../components/ui/Button2035'
import { Input2035 } from '../../components/ui/Input2035'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { FadeIn } from '../../components/motion/FadeIn'
import { SupabaseDiagnostics } from '../../components/debug/SupabaseDiagnostics'

export default function SignUp() {
  const navigate = useNavigate()
  const { signUp, signInWithGoogle, loading: authLoading, user } = useAuth()
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  // Redirect logged-in users away from sign-up page
  // Also show success message when user successfully signs up
  useEffect(() => {
    if (user && !authLoading) {
      showToast('Account created successfully!', 'success')
      navigate('/home', { replace: true })
    }
  }, [user, authLoading, navigate, showToast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsSubmitting(true)
    try {
      await signUp(email, password, name)
      // Navigation will happen automatically via useEffect when user state updates
      // If email confirmation is required, the error will be thrown and caught below
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create account. Please try again.'
      setError(errorMessage)
      showToast(errorMessage, err.message?.includes('check your email') ? 'info' : 'error')
      console.error('Sign up error:', err)
      
      // If email confirmation is required, show helpful message
      if (errorMessage.includes('check your email')) {
        // Don't clear the form, user might want to try signing in
      } else {
        // For other errors, keep the form data so user can fix and retry
      }
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
              Create Account
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Join SageSpace and start creating
            </p>
          </div>

          <Card2035>
            <Card2035Header>
              <Card2035Title>Sign Up</Card2035Title>
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
                            Google authentication is not currently enabled. Please use the email/password form above to create your account.
                          </p>
                        </div>
                      )}
                      {(error.includes('check your email') || error.includes('email confirmation')) && (
                        <div className="mt-3 space-y-2 text-xs">
                          <p className="text-red-600 dark:text-red-400 font-medium">Quick Fix Options:</p>
                          <ol className="list-decimal list-inside space-y-1 text-red-600 dark:text-red-400 ml-2">
                            <li>Check your email spam folder for the confirmation link</li>
                            <li>Manually confirm in Supabase Dashboard:
                              <ul className="list-disc list-inside ml-4 mt-1">
                                <li>Go to <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="underline">app.supabase.com</a></li>
                                <li>Authentication → Users → Find your email</li>
                                <li>Click "..." → "Confirm email"</li>
                              </ul>
                            </li>
                            <li>Disable email confirmation (for development):
                              <ul className="list-disc list-inside ml-4 mt-1">
                                <li>Supabase Dashboard → Authentication → Settings</li>
                                <li>Email Auth → Disable "Enable email confirmations"</li>
                                <li>Then try signing up again</li>
                              </ul>
                            </li>
                          </ol>
                          <p className="mt-2 text-red-600 dark:text-red-400">
                            After confirming, you can sign in with your credentials.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input2035
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="pl-10"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

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
                  <label htmlFor="password" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Password
                  </label>
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
                      minLength={6}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Must be at least 6 characters
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
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                  {loading ? 'Creating account...' : 'Sign Up'}
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
                        errorMessage = 'Google sign-in is not currently enabled. Please use email/password to create your account, or contact support if you need Google sign-in.'
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
                      Sign up with Google
                    </>
                  )}
                </Button2035>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
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
