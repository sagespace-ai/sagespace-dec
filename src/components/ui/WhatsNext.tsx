import { ArrowRight, Sparkles, Workflow, Store, Map, RefreshCw } from 'lucide-react'
import { Card2035, Card2035Content } from './Card2035'
import { FadeIn } from '../motion/FadeIn'

interface NextAction {
  label: string
  description: string
  icon: React.ReactNode
  onClick: () => void
}

interface WhatsNextProps {
  title?: string
  actions: NextAction[]
  className?: string
}

export function WhatsNext({ title = "What's Next?", actions, className = '' }: WhatsNextProps) {
  if (actions.length === 0) return null

  return (
    <FadeIn>
      <Card2035 className={className}>
        <Card2035Content>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {title}
          </h3>
          <div className="space-y-3">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="w-full p-4 text-left bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                      {action.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                        {action.label}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {action.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </Card2035Content>
      </Card2035>
    </FadeIn>
  )
}

// Helper function to get contextual next actions based on current page
export function getContextualNextActions(currentPath: string, navigate: (path: string) => void): NextAction[] {
  const actions: NextAction[] = []

  switch (currentPath) {
    case '/create':
      actions.push(
        {
          label: 'Remix This',
          description: 'Combine this with another idea to create something new',
          icon: <RefreshCw className="h-5 w-5" />,
          onClick: () => navigate('/remix'),
        },
        {
          label: 'View in Feed',
          description: 'See your creation in your unified feed',
          icon: <Sparkles className="h-5 w-5" />,
          onClick: () => navigate('/home'),
        },
        {
          label: 'Chat with Sages',
          description: 'Get feedback on your creation',
          icon: <Workflow className="h-5 w-5" />,
          onClick: () => navigate('/sages'),
        }
      )
      break

    case '/sages':
      actions.push(
        {
          label: 'Create Content',
          description: 'Use your Sage insights to create something new',
          icon: <Sparkles className="h-5 w-5" />,
          onClick: () => navigate('/create'),
        },
        {
          label: 'Explore Feed',
          description: 'See what your universe is up to',
          icon: <Map className="h-5 w-5" />,
          onClick: () => navigate('/home'),
        }
      )
      break

    case '/marketplace':
      actions.push(
        {
          label: 'View Purchases',
          description: 'See your purchased items in your feed',
          icon: <Sparkles className="h-5 w-5" />,
          onClick: () => navigate('/home'),
        },
        {
          label: 'Create Something',
          description: 'Use your new assets to create',
          icon: <Workflow className="h-5 w-5" />,
          onClick: () => navigate('/create'),
        }
      )
      break

    default:
      actions.push(
        {
          label: 'Create Content',
          description: 'Generate something new in Create Studio',
          icon: <Sparkles className="h-5 w-5" />,
          onClick: () => navigate('/create'),
        },
        {
          label: 'Chat with Sages',
          description: 'Get help from your AI companions',
          icon: <Workflow className="h-5 w-5" />,
          onClick: () => navigate('/sages'),
        },
        {
          label: 'Explore Marketplace',
          description: 'Discover community creations',
          icon: <Store className="h-5 w-5" />,
          onClick: () => navigate('/marketplace'),
        }
      )
  }

  return actions
}
