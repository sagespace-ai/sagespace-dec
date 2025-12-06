import { createContext, useContext, ReactNode, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Home,
  Search,
  Folder,
  Sparkles,
  Store,
  Workflow,
  Map,
  RefreshCw,
  Bell,
  BarChart3,
  Settings,
  User,
  ShoppingBag,
  TrendingUp,
  Building2,
  FileText,
  Zap,
  Compass,
  type LucideIcon
} from 'lucide-react'

export interface NavigationRoute {
  path: string
  label: string
  icon: LucideIcon
  category: 'primary' | 'content' | 'discovery' | 'social' | 'tools' | 'settings'
  description?: string
  keywords?: string[]
  requiresAuth?: boolean
  relatedRoutes?: string[]
  quickAccess?: boolean
}

export interface NavigationContextType {
  routes: NavigationRoute[]
  getRoute: (path: string) => NavigationRoute | undefined
  getRelatedRoutes: (path: string) => NavigationRoute[]
  getRoutesByCategory: (category: NavigationRoute['category']) => NavigationRoute[]
  getQuickAccessRoutes: () => NavigationRoute[]
  getSuggestedRoutes: (currentPath: string) => NavigationRoute[]
  getRouteHierarchy: (path: string) => NavigationRoute[]
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

// Comprehensive route mapping with UX-focused organization
const allRoutes: NavigationRoute[] = [
  // Primary Navigation
  {
    path: '/home',
    label: 'Home Feed',
    icon: Home,
    category: 'primary',
    description: 'Your personalized content feed',
    keywords: ['feed', 'home', 'main', 'dashboard', 'timeline'],
    quickAccess: true,
    relatedRoutes: ['/search', '/notifications', '/collections']
  },
  {
    path: '/create',
    label: 'Create',
    icon: Sparkles,
    category: 'primary',
    description: 'Create new content and posts',
    keywords: ['create', 'new', 'post', 'content', 'write'],
    quickAccess: true,
    relatedRoutes: ['/remix', '/sages', '/collections']
  },
  {
    path: '/search',
    label: 'Search',
    icon: Search,
    category: 'primary',
    description: 'Search across all content',
    keywords: ['search', 'find', 'discover', 'explore'],
    quickAccess: true,
    relatedRoutes: ['/home', '/collections', '/analytics']
  },

  // Content & Discovery
  {
    path: '/collections',
    label: 'Collections',
    icon: Folder,
    category: 'content',
    description: 'Organize and save your favorite content',
    keywords: ['collections', 'saved', 'bookmarks', 'organize'],
    relatedRoutes: ['/home', '/search', '/profile']
  },
  {
    path: '/marketplace',
    label: 'Marketplace',
    icon: Store,
    category: 'discovery',
    description: 'Discover and purchase premium content',
    keywords: ['marketplace', 'shop', 'buy', 'purchase', 'store'],
    relatedRoutes: ['/purchases', '/profile', '/analytics']
  },
  {
    path: '/universe',
    label: 'Universe',
    icon: Map,
    category: 'discovery',
    description: 'Explore the spatial content universe',
    keywords: ['universe', 'explore', 'map', 'spatial', 'galaxy'],
    relatedRoutes: ['/sages', '/remix', '/reflection']
  },
  {
    path: '/sages',
    label: 'Sages',
    icon: Workflow,
    category: 'discovery',
    description: 'Interact with AI companions',
    keywords: ['sages', 'ai', 'assistant', 'chat', 'companion'],
    relatedRoutes: ['/create', '/remix', '/universe']
  },

  // Tools & Features
  {
    path: '/remix',
    label: 'Remix',
    icon: RefreshCw,
    category: 'tools',
    description: 'Remix and transform content',
    keywords: ['remix', 'transform', 'edit', 'modify'],
    relatedRoutes: ['/create', '/sages', '/remix-evolution']
  },
  {
    path: '/remix-evolution',
    label: 'Remix Evolution',
    icon: Zap,
    category: 'tools',
    description: 'Advanced remix and evolution tools',
    keywords: ['evolution', 'advanced', 'remix', 'transform'],
    relatedRoutes: ['/remix', '/create', '/sages']
  },
  {
    path: '/reflection',
    label: 'Reflection',
    icon: Compass,
    category: 'tools',
    description: 'Reflect on your journey and insights',
    keywords: ['reflection', 'insights', 'journal', 'thoughts'],
    relatedRoutes: ['/analytics', '/profile', '/home']
  },
  {
    path: '/analytics',
    label: 'Analytics',
    icon: BarChart3,
    category: 'tools',
    description: 'View your content analytics and insights',
    keywords: ['analytics', 'stats', 'insights', 'metrics', 'data'],
    relatedRoutes: ['/profile', '/collections', '/home']
  },

  // Social & Community
  {
    path: '/notifications',
    label: 'Notifications',
    icon: Bell,
    category: 'social',
    description: 'View your notifications',
    keywords: ['notifications', 'alerts', 'updates', 'activity'],
    quickAccess: true,
    relatedRoutes: ['/home', '/profile', '/search']
  },
  {
    path: '/profile',
    label: 'Profile',
    icon: User,
    category: 'social',
    description: 'View and edit your profile',
    keywords: ['profile', 'account', 'user', 'me'],
    relatedRoutes: ['/settings', '/analytics', '/collections']
  },
  {
    path: '/organizations',
    label: 'Organizations',
    icon: Building2,
    category: 'social',
    description: 'Manage organizations and teams',
    keywords: ['organizations', 'teams', 'groups', 'collaborate'],
    relatedRoutes: ['/profile', '/settings', '/enterprise']
  },
  {
    path: '/enterprise',
    label: 'Enterprise',
    icon: Building2,
    category: 'social',
    description: 'Enterprise integration and features',
    keywords: ['enterprise', 'business', 'integration', 'team'],
    relatedRoutes: ['/organizations', '/settings', '/admin']
  },

  // Settings & Admin
  {
    path: '/settings',
    label: 'Settings',
    icon: Settings,
    category: 'settings',
    description: 'Manage your account settings',
    keywords: ['settings', 'preferences', 'config', 'options'],
    relatedRoutes: ['/profile', '/admin']
  },
  {
    path: '/purchases',
    label: 'Purchase History',
    icon: ShoppingBag,
    category: 'settings',
    description: 'View your purchase history',
    keywords: ['purchases', 'history', 'orders', 'transactions'],
    relatedRoutes: ['/marketplace', '/profile', '/settings']
  },
  {
    path: '/admin',
    label: 'Admin Dashboard',
    icon: TrendingUp,
    category: 'settings',
    description: 'Administrative dashboard',
    keywords: ['admin', 'dashboard', 'management', 'control'],
    requiresAuth: true,
    relatedRoutes: ['/settings', '/organizations']
  },
  {
    path: '/onboarding',
    label: 'Onboarding',
    icon: FileText,
    category: 'primary',
    description: 'Get started with SageSpace',
    keywords: ['onboarding', 'tutorial', 'getting started', 'welcome'],
    relatedRoutes: ['/home', '/create', '/sages']
  }
]

export function NavigationProvider({ children }: { children: ReactNode }) {
  const location = useLocation()

  const value = useMemo<NavigationContextType>(() => {
    const getRoute = (path: string): NavigationRoute | undefined => {
      return allRoutes.find(route => route.path === path)
    }

    const getRelatedRoutes = (path: string): NavigationRoute[] => {
      const route = getRoute(path)
      if (!route?.relatedRoutes) return []
      
      return route.relatedRoutes
        .map(relatedPath => getRoute(relatedPath))
        .filter((r): r is NavigationRoute => r !== undefined)
        .slice(0, 6) // Limit to 6 related routes
    }

    const getRoutesByCategory = (category: NavigationRoute['category']): NavigationRoute[] => {
      return allRoutes.filter(route => route.category === category)
    }

    const getQuickAccessRoutes = (): NavigationRoute[] => {
      return allRoutes.filter(route => route.quickAccess === true)
    }

    const getSuggestedRoutes = (currentPath: string): NavigationRoute[] => {
      const currentRoute = getRoute(currentPath)
      if (!currentRoute) return getQuickAccessRoutes()

      // Get related routes first
      const related = getRelatedRoutes(currentPath)
      
      // Add routes from same category
      const sameCategory = getRoutesByCategory(currentRoute.category)
        .filter(route => route.path !== currentPath)
        .slice(0, 3)

      // Combine and deduplicate
      const suggestions = [...related, ...sameCategory]
      const unique = suggestions.filter((route, index, self) =>
        index === self.findIndex(r => r.path === route.path)
      )

      return unique.slice(0, 6)
    }

    const getRouteHierarchy = (path: string): NavigationRoute[] => {
      const hierarchy: NavigationRoute[] = []
      const parts = path.split('/').filter(Boolean)
      
      let currentPath = ''
      parts.forEach(part => {
        currentPath += `/${part}`
        const route = getRoute(currentPath)
        if (route) {
          hierarchy.push(route)
        }
      })

      return hierarchy
    }

    return {
      routes: allRoutes,
      getRoute,
      getRelatedRoutes,
      getRoutesByCategory,
      getQuickAccessRoutes,
      getSuggestedRoutes,
      getRouteHierarchy
    }
  }, [location.pathname])

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider')
  }
  return context
}
