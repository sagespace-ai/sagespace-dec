import { Link, useLocation } from 'react-router-dom'
import { useNavigation } from '../../contexts/NavigationContext'
import { FadeIn } from '../motion/FadeIn'
import { Search, ArrowRight } from 'lucide-react'
import { useState } from 'react'

interface SmartNavigationProps {
  title?: string
  showTitle?: boolean
  maxSuggestions?: number
  className?: string
}

export function SmartNavigation({ 
  title = "Where would you like to go?",
  showTitle = true,
  maxSuggestions = 6,
  className = ""
}: SmartNavigationProps) {
  const location = useLocation()
  const { getSuggestedRoutes, getQuickAccessRoutes } = useNavigation()
  const [expanded, setExpanded] = useState(false)

  const suggestions = getSuggestedRoutes(location.pathname).slice(0, maxSuggestions)
  const quickAccess = getQuickAccessRoutes().slice(0, 4)

  // Group suggestions by category for progressive disclosure
  const groupedSuggestions = suggestions.reduce((acc, route) => {
    if (!acc[route.category]) {
      acc[route.category] = []
    }
    acc[route.category].push(route)
    return acc
  }, {} as Record<string, typeof suggestions>)

  const categoryLabels: Record<string, string> = {
    primary: 'Main',
    content: 'Content',
    discovery: 'Discover',
    social: 'Social',
    tools: 'Tools',
    settings: 'Settings'
  }

  if (suggestions.length === 0) {
    return null
  }

  return (
    <FadeIn>
      <div className={`space-y-4 ${className}`}>
        {showTitle && (
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            {suggestions.length > maxSuggestions && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-sm text-primary hover:underline"
              >
                {expanded ? 'Show less' : `Show all (${suggestions.length})`}
              </button>
            )}
          </div>
        )}

        {/* Quick Access - Always visible */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {quickAccess.map(route => {
            const Icon = route.icon
            return (
              <Link
                key={route.path}
                to={route.path}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                <Icon className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors">{route.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Suggested Routes - Progressive disclosure */}
        <div className="space-y-3">
          {Object.entries(groupedSuggestions).map(([category, routes]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {categoryLabels[category] || category}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {routes.map(route => {
                  const Icon = route.icon
                  return (
                    <Link
                      key={route.path}
                      to={route.path}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                    >
                      <div className="flex-shrink-0">
                        <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                          {route.label}
                        </p>
                        {route.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {route.description}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Search shortcut */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
          <Link
            to="/search"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
          >
            <Search className="h-4 w-4 text-gray-500 group-hover:text-primary transition-colors" />
            <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-primary transition-colors">
              Search for anything...
            </span>
          </Link>
        </div>
      </div>
    </FadeIn>
  )
}
