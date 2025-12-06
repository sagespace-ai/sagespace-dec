import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useNavigation } from '../../contexts/NavigationContext'
import { Command, X, Search } from 'lucide-react'
import { Card2035, Card2035Content } from '../ui/Card2035'
import { Input2035 } from '../ui/Input2035'
import { FadeIn } from '../motion/FadeIn'
import { cn } from '../../lib/utils'

export function QuickNavMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const location = useLocation()
  const { routes, getQuickAccessRoutes } = useNavigation()
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter routes based on search
  const filteredRoutes = routes.filter(route => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      route.label.toLowerCase().includes(query) ||
      route.description?.toLowerCase().includes(query) ||
      route.keywords?.some(k => k.toLowerCase().includes(query)) ||
      route.path.toLowerCase().includes(query)
    )
  })

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Focus input when menu opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-white shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
        aria-label="Open quick navigation menu"
      >
        <Command className="h-6 w-6" />
      </button>
    )
  }

  const quickAccess = getQuickAccessRoutes()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <FadeIn>
        <Card2035 
          ref={menuRef}
          className="w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
        >
          <Card2035Content className="p-0">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 text-gray-400" />
                <Input2035
                  ref={inputRef}
                  type="text"
                  placeholder="Search pages, features, or navigate anywhere..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 focus:ring-0 text-lg"
                />
                <button
                  onClick={() => {
                    setIsOpen(false)
                    setSearchQuery('')
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-8">
                Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">Esc</kbd> to close
              </p>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 p-4 space-y-6">
              {/* Quick Access */}
              {!searchQuery && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    Quick Access
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {quickAccess.map(route => {
                      const Icon = route.icon
                      const isActive = location.pathname === route.path
                      return (
                        <Link
                          key={route.path}
                          to={route.path}
                          onClick={() => {
                            setIsOpen(false)
                            setSearchQuery('')
                          }}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all",
                            isActive
                              ? "border-primary bg-primary/5"
                              : "border-gray-200 dark:border-gray-800 hover:border-primary/50 hover:bg-primary/5"
                          )}
                        >
                          <Icon className={cn(
                            "h-5 w-5",
                            isActive ? "text-primary" : "text-gray-600 dark:text-gray-400"
                          )} />
                          <span className={cn(
                            "text-xs font-medium text-center",
                            isActive ? "text-primary" : "text-gray-700 dark:text-gray-300"
                          )}>
                            {route.label}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Search Results */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  {searchQuery ? `Search Results (${filteredRoutes.length})` : 'All Pages'}
                </h3>
                <div className="space-y-1">
                  {filteredRoutes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <p>No pages found matching "{searchQuery}"</p>
                    </div>
                  ) : (
                    filteredRoutes.map(route => {
                      const Icon = route.icon
                      const isActive = location.pathname === route.path
                      return (
                        <Link
                          key={route.path}
                          to={route.path}
                          onClick={() => {
                            setIsOpen(false)
                            setSearchQuery('')
                          }}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg transition-all group",
                            isActive
                              ? "bg-primary/10 border border-primary/20"
                              : "hover:bg-gray-100 dark:hover:bg-gray-800"
                          )}
                        >
                          <Icon className={cn(
                            "h-5 w-5 flex-shrink-0",
                            isActive ? "text-primary" : "text-gray-600 dark:text-gray-400 group-hover:text-primary"
                          )} />
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm font-medium",
                              isActive ? "text-primary" : "text-gray-900 dark:text-white group-hover:text-primary"
                            )}>
                              {route.label}
                            </p>
                            {route.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {route.description}
                              </p>
                            )}
                          </div>
                          {isActive && (
                            <span className="text-xs text-primary font-medium">Current</span>
                          )}
                        </Link>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </Card2035Content>
        </Card2035>
      </FadeIn>
    </div>
  )
}
