import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import Landing from './pages/Landing'
import GenesisChamber from './pages/GenesisChamber'
import HomeFeed from './pages/HomeFeed'
import SagePanel from './pages/SagePanel'
import CreateStudio from './pages/CreateStudio'
import Marketplace from './pages/Marketplace'
import Settings from './pages/Settings'
import Notifications from './pages/Notifications'
import UniverseMap from './pages/UniverseMap'
import RemixEvolution from './pages/RemixEvolution'
import Remix from './pages/Remix'
import Reflection from './pages/Reflection'
import EnterpriseIntegration from './pages/EnterpriseIntegration'
import Profile from './pages/Profile'
import PurchaseHistory from './pages/PurchaseHistory'
import Search from './pages/Search'
import Collections from './pages/Collections'
import Analytics from './pages/Analytics'
import Organizations from './pages/Organizations'
import AdminDashboard from './pages/AdminDashboard'
import SignIn from './pages/Auth/SignIn'
import SignUp from './pages/Auth/SignUp'
import ForgotPassword from './pages/Auth/ForgotPassword'
import ResetPassword from './pages/Auth/ResetPassword'
import OAuthCallback from './pages/Auth/OAuthCallback'
import NotFound from './pages/NotFound'
import { OnboardingProvider } from './contexts/OnboardingContext'
import { ToastProvider } from './contexts/ToastContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { UserProvider } from './contexts/UserContext'
import { AuthProvider } from './contexts/AuthContext'
import { NavigationProvider } from './contexts/NavigationContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import SagePresence from './components/SagePresence'
import { PatternTracker } from './components/PatternTracker'
import { PageTransition } from './components/motion/PageTransition'
import { AuthGuard } from './components/auth/AuthGuard'
import { OfflineBanner } from './components/ui/OfflineBanner'
import SkipToContent from './components/accessibility/SkipToContent'
import KeyboardShortcuts from './components/accessibility/KeyboardShortcuts'
import { AriaLiveRegion } from './components/ui/AriaLiveRegion'
import { QuickNavMenu } from './components/navigation/QuickNavMenu'
import { GlobalSearch } from './components/navigation/GlobalSearch'
import './styles/accessibility.css'

// PHASE 4: Wrapper component for page transitions
function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/auth/signin" element={<SignIn />} />
        <Route path="/auth/signup" element={<SignUp />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="/onboarding" element={
          <AuthGuard>
            <GenesisChamber />
          </AuthGuard>
        } />
        <Route path="/home" element={
          <AuthGuard>
            <PageTransition>
              <HomeFeed />
            </PageTransition>
          </AuthGuard>
        } />
        <Route path="/sages" element={
          <AuthGuard>
            <PageTransition>
              <SagePanel />
            </PageTransition>
          </AuthGuard>
        } />
        <Route path="/create" element={
          <AuthGuard>
            <PageTransition>
              <CreateStudio />
            </PageTransition>
          </AuthGuard>
        } />
        <Route path="/marketplace" element={
          <AuthGuard>
            <PageTransition>
              <Marketplace />
            </PageTransition>
          </AuthGuard>
        } />
        <Route path="/settings" element={
          <AuthGuard>
            <PageTransition>
              <Settings />
            </PageTransition>
          </AuthGuard>
        } />
        <Route path="/profile" element={
          <AuthGuard>
            <PageTransition>
              <Profile />
            </PageTransition>
          </AuthGuard>
        } />
        <Route path="/profile/:id" element={
          <AuthGuard>
            <PageTransition>
              <Profile />
            </PageTransition>
          </AuthGuard>
        } />
        <Route path="/notifications" element={
          <AuthGuard>
            <PageTransition>
              <Notifications />
            </PageTransition>
          </AuthGuard>
        } />
        <Route path="/purchases" element={
          <AuthGuard>
            <PageTransition>
              <PurchaseHistory />
            </PageTransition>
          </AuthGuard>
        } />
        <Route path="/search" element={
          <AuthGuard>
            <PageTransition>
              <Search />
            </PageTransition>
          </AuthGuard>
        } />
        <Route path="/analytics" element={
          <AuthGuard>
            <PageTransition>
              <Analytics />
            </PageTransition>
          </AuthGuard>
        } />
        <Route path="/collections" element={
          <AuthGuard>
            <PageTransition>
              <Collections />
            </PageTransition>
          </AuthGuard>
        } />
        <Route path="/collections/:id" element={
          <AuthGuard>
            <PageTransition>
              <Collections />
            </PageTransition>
          </AuthGuard>
        } />
        <Route path="/universe" element={
          <AuthGuard>
            <PageTransition>
              <UniverseMap />
            </PageTransition>
          </AuthGuard>
        } />
        <Route path="/remix" element={
          <AuthGuard>
            <PageTransition>
              <Remix />
            </PageTransition>
          </AuthGuard>
        } />
        <Route path="/remix-evolution" element={
          <AuthGuard>
            <PageTransition>
              <RemixEvolution />
            </PageTransition>
          </AuthGuard>
        } />
        <Route path="/reflection" element={
          <AuthGuard>
            <PageTransition>
              <Reflection />
            </PageTransition>
          </AuthGuard>
        } />
        <Route path="/enterprise" element={
          <AuthGuard>
            <PageTransition>
              <EnterpriseIntegration />
            </PageTransition>
          </AuthGuard>
        } />
        <Route path="/organizations" element={
          <AuthGuard>
            <PageTransition>
              <Organizations />
            </PageTransition>
          </AuthGuard>
        } />
        <Route path="/organizations/:id" element={
          <AuthGuard>
            <PageTransition>
              <Organizations />
            </PageTransition>
          </AuthGuard>
        } />
        <Route path="/admin" element={
          <AuthGuard>
            <PageTransition>
              <AdminDashboard />
            </PageTransition>
          </AuthGuard>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  const [darkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('darkMode')
      return saved ? JSON.parse(saved) : false
    } catch (error) {
      console.warn('Error loading dark mode preference:', error)
      return false
    }
  })

  useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      localStorage.setItem('darkMode', JSON.stringify(darkMode))
    } catch (error) {
      console.warn('Error saving dark mode preference:', error)
      // Continue - theme will still apply
    }
  }, [darkMode])

  // Keyboard shortcuts
  const shortcuts = [
    { key: 'k', description: 'Search', action: () => window.location.href = '/search' },
    { key: 'n', description: 'New Post', action: () => window.location.href = '/create' },
    { key: 'h', description: 'Home', action: () => window.location.href = '/home' },
  ];

  // Wrap providers in try-catch to prevent crashes
  try {
    return (
      <ErrorBoundary>
        <ThemeProvider>
          <ErrorBoundary fallback={
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Unable to load SageSpace</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Please refresh the page or contact support if the problem persists.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          }>
            <ToastProvider>
              <AuthProvider>
                <UserProvider>
                  <OnboardingProvider>
                    <Router>
                      <NavigationProvider>
                        <SkipToContent />
                        <KeyboardShortcuts shortcuts={shortcuts} />
                        <OfflineBanner />
                        {/* Global Search Bar - Always Visible at Top */}
                        <div className="fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
                          <div className="max-w-7xl mx-auto px-4 py-3">
                            <GlobalSearch />
                          </div>
                        </div>
                        {/* Add padding to content to account for fixed search bar */}
                        <div className="pt-20">
                          <PatternTracker />
                          <AnimatedRoutes />
                        </div>
                        <QuickNavMenu />
                        <SagePresence hasMessage={false} position="bottom-right" />
                        <AriaLiveRegion>{null}</AriaLiveRegion>
                      </NavigationProvider>
                    </Router>
                  </OnboardingProvider>
                </UserProvider>
              </AuthProvider>
            </ToastProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </ErrorBoundary>
    )
  } catch (error) {
    // If App component itself fails, render minimal error UI
    console.error('App component error:', error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Unable to load SageSpace</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please refresh the page or contact support if the problem persists.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }
}

export default App
