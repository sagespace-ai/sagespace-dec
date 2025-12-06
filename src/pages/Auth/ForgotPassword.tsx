/**
 * Forgot Password Page
 * 
 * Allows users to request a password reset email.
 */

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Sparkles, AlertCircle, CheckCircle } from 'lucide-react'
import { Card2035, Card2035Header, Card2035Title, Card2035Content } from '../../components/ui/Card2035'
import { Button2035 } from '../../components/ui/Button2035'
import { Input2035 } from '../../components/ui/Input2035'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { FadeIn } from '../../components/motion/FadeIn'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const { resetPassword } = useAuth()
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  
  // Note: We don't redirect authenticated users from this page
  // They might want to reset their password for security reasons

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    setIsSubmitting(true)
    try {
      await resetPassword(email)
      setEmailSent(true)
      showToast('Password reset email sent! Check your inbox.', 'success')
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to send password reset email. Please try again.'
      setError(errorMessage)
      showToast(errorMessage, 'error')
      console.error('Password reset error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (emailSent) {
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
                Check Your Email
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                We've sent you a password reset link
              </p>
            </div>

            <Card2035>
              <Card2035Content>
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Email Sent!
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    We've sent a password reset link to:
                  </p>
                  <p className="text-primary font-medium mb-6">{email}</p>
                  <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                    <p>Please check your inbox and click the link to reset your password.</p>
                    <p className="text-xs">Didn't receive the email? Check your spam folder or try again.</p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button2035
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => setEmailSent(false)}
                  >
                    Send Another Email
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
              Forgot Password?
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          <Card2035>
            <Card2035Header>
              <Card2035Title>Reset Password</Card2035Title>
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
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Email Address
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
                      disabled={isSubmitting}
                      autoFocus
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    We'll send a password reset link to this email address.
                  </p>
                </div>

                <Button2035
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Reset Link'}
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
