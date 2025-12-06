import { Link, useLocation } from 'react-router-dom'
import { Home, ArrowLeft, Compass } from 'lucide-react'
import { Card2035, Card2035Header, Card2035Title, Card2035Content, Card2035Description } from '../components/ui/Card2035'
import { Button2035 } from '../components/ui/Button2035'
import { FadeIn } from '../components/motion/FadeIn'
import { SmartNavigation } from '../components/navigation/SmartNavigation'
import { useNavigation } from '../contexts/NavigationContext'

export default function NotFound() {
  const location = useLocation()
  const { getRoute } = useNavigation()
  
  // Try to suggest similar routes based on the attempted path
  const attemptedPath = location.pathname
  const pathParts = attemptedPath.split('/').filter(Boolean)
  const lastPart = pathParts[pathParts.length - 1] || ''
  
  // Find routes that might match what the user was looking for
  const possibleMatches = getRoute(`/${lastPart}`) || getRoute(`/${pathParts[0]}`)

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
      <div className="max-w-4xl w-full space-y-6">
        <FadeIn>
          <Card2035 className="text-center">
            <Card2035Content>
              <div className="mb-6">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center mb-6">
                  <Compass className="h-12 w-12 text-primary/60" />
                </div>
                <Card2035Header>
                  <Card2035Title className="text-2xl">Page Not Found</Card2035Title>
                  <Card2035Description className="mt-2">
                    {possibleMatches 
                      ? `Were you looking for "${possibleMatches.label}"?`
                      : "The page you're looking for doesn't exist or has been moved."
                    }
                  </Card2035Description>
                </Card2035Header>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Link
                  to="/home"
                  className="flex-1 inline-flex items-center justify-center h-11 px-6 text-base rounded-[14px] font-medium transition-all bg-white text-black hover:bg-gray-50 dark:bg-white dark:text-black dark:hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Link>
                <Button2035
                  variant="secondary"
                  size="md"
                  onClick={() => window.history.back()}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button2035>
                {possibleMatches && (
                  <Link
                    to={possibleMatches.path}
                    className="flex-1 inline-flex items-center justify-center h-11 px-6 text-base rounded-[14px] font-medium transition-all bg-white text-black hover:bg-gray-50 dark:bg-white dark:text-black dark:hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                  >
                    <Compass className="h-4 w-4 mr-2" />
                    Go to {possibleMatches.label}
                  </Link>
                )}
              </div>
            </Card2035Content>
          </Card2035>
        </FadeIn>

        {/* Smart Navigation Suggestions */}
        <FadeIn delay={0.1}>
          <Card2035>
            <Card2035Content className="pt-6">
              <SmartNavigation 
                title="Explore these pages instead"
                showTitle={true}
                maxSuggestions={8}
              />
            </Card2035Content>
          </Card2035>
        </FadeIn>
      </div>
    </div>
  )
}
