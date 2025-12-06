import { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Sparkles, Store, Workflow, Moon, Sun, Bell, Settings, Map, RefreshCw, Search, Folder, BarChart3 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { HarmonyBar } from './HarmonyBar'
import { MoodIndicator } from './MoodIndicator'
import { Breadcrumbs } from './navigation/Breadcrumbs'
import { UserMenu } from './navigation/UserMenu'
import { useUIStore, type FeedView } from '../store/uiStore'

interface LayoutProps {
  children: ReactNode
  showSidebar?: boolean
}

export default function Layout({ children, showSidebar = true }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const feedView = useUIStore((state) => state.feedView)
  const setFeedView = useUIStore((state) => state.setFeedView)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  if (!showSidebar) {
    return <>{children}</>
  }

  const navItems: {
    path: string
    icon: React.ComponentType<{ className?: string }>
    label: string
    feedView?: FeedView
  }[] = [
    { path: '/home', icon: Home, label: 'Feed', feedView: 'default' },
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/collections', icon: Folder, label: 'Collections' },
    { path: '/create', icon: Sparkles, label: 'Create' },
    // PHASE 2: Marketplace & Universe now treated as feed modes, not separate universes
    { path: '/marketplace', icon: Store, label: 'Marketplace', feedView: 'marketplace' },
    { path: '/sages', icon: Workflow, label: 'Sages' },
    { path: '/universe', icon: Map, label: 'Universe', feedView: 'universe' },
    { path: '/remix', icon: RefreshCw, label: 'Remix' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ]

  // Add Following feed option (can be toggled in feed view selector)

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark">
      {/* Sidebar */}
      <aside className="w-16 md:w-64 bg-white dark:bg-gray-900 flex flex-col transition-all duration-300 border-r border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-center md:justify-start h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            aria-label="Navigate to home feed"
          >
            <div className="h-8 w-8 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="SageSpace Logo"
                className="h-8 w-8 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center hidden">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>
            <span className="font-bold text-lg hidden md:block text-gray-900 dark:text-white">
              SageSpace
            </span>
          </button>
        </div>
        <nav className="flex-1 space-y-2 p-2">
          {navItems.map(item => {
            const Icon = item.icon
            const isHomeRoute = location.pathname === '/home'
            const isDirectMatch = location.pathname === item.path

            // PHASE 2: Treat Marketplace/Universe nav as feed modes
            const isFeedMode =
              item.feedView &&
              isHomeRoute &&
              feedView === item.feedView

            const isActive = isDirectMatch || isFeedMode

            const handleClick = () => {
              if (item.feedView) {
                setFeedView(item.feedView)
                navigate('/home')
              } else {
                navigate(item.path)
              }
            }

            return (
              <button
                key={item.path}
                onClick={handleClick}
                className={`flex items-center p-2 space-x-3 rounded-md w-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary ${
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
                aria-label={`Navigate to ${item.label}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-5 w-5" />
                <span className="hidden md:block">{item.label}</span>
              </button>
            )
          })}
        </nav>
        <div className="p-2 border-t border-gray-200 dark:border-gray-800 space-y-2">
          <button 
            onClick={() => navigate('/settings')}
            className={`flex items-center p-2 space-x-3 rounded-md w-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary ${
              location.pathname === '/settings'
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
            }`}
            aria-label="Navigate to settings"
            aria-current={location.pathname === '/settings' ? 'page' : undefined}
          >
            <Settings className="h-5 w-5" />
            <span className="hidden md:block">Settings</span>
          </button>
          <button
            onClick={toggleDarkMode}
            className="flex items-center p-2 space-x-3 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="hidden md:block">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          {/* User Menu - replaces Profile button */}
          <div className="hidden md:block">
            <UserMenu />
          </div>
          {/* Harmony Balance Indicator */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-800 hidden md:block space-y-2">
            <HarmonyBar />
            <MoodIndicator showLabel={true} />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-auto" role="main">
        {/* Breadcrumbs - shown on desktop */}
        <div className="hidden md:block px-4 md:px-6 pt-4 border-b border-gray-200 dark:border-gray-800 bg-background-light dark:bg-gray-900/50">
          <Breadcrumbs />
        </div>
        {children}
      </main>
    </div>
  )
}
