import { useLocation, Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { useNavigation } from '../../contexts/NavigationContext'

interface BreadcrumbItem {
  label: string
  path: string
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const location = useLocation()
  const { getRouteHierarchy, getRoute } = useNavigation()

  // Auto-generate breadcrumbs from path if not provided
  const breadcrumbItems: BreadcrumbItem[] = items || (() => {
    // Use navigation context for better route information
    const hierarchy = getRouteHierarchy(location.pathname)
    
    if (hierarchy.length === 0) {
      // Fallback to path-based breadcrumbs
      const paths = location.pathname.split('/').filter(Boolean)
      const crumbs: BreadcrumbItem[] = [{ label: 'Home', path: '/home' }]

      let currentPath = ''
      paths.forEach((path) => {
        currentPath += `/${path}`
        const route = getRoute(currentPath)
        const label = route?.label || path.charAt(0).toUpperCase() + path.slice(1)
        crumbs.push({ label, path: currentPath })
      })

      return crumbs
    }

    // Use hierarchy from navigation context
    return hierarchy.map(route => ({
      label: route.label,
      path: route.path
    }))
  })()

  // Don't show breadcrumbs on landing page or if only one item
  if (location.pathname === '/' || breadcrumbItems.length <= 1) {
    return null
  }

  return (
    <nav
      className={`flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 ${className || ''}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center gap-2">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1
          return (
            <li key={item.path} className="flex items-center gap-2">
              {index === 0 ? (
                <Link
                  to={item.path}
                  className="flex items-center gap-1 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary rounded"
                  aria-label="Home"
                >
                  <Home className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden="true" />
                  {isLast ? (
                    <span className="font-medium text-gray-900 dark:text-white" aria-current="page">
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      to={item.path}
                      className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary rounded px-1"
                    >
                      {item.label}
                    </Link>
                  )}
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
