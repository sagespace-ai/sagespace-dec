import { Trophy, Sparkles, Workflow, Heart, ArrowRight } from 'lucide-react'
import { Card2035, Card2035Content } from '../ui/Card2035'
import { Button2035 } from '../ui/Button2035'
import { FadeIn } from '../motion/FadeIn'

interface ActivationCompleteModalProps {
  onExplore: () => void
  onClose: () => void
}

export function ActivationCompleteModal({ onExplore, onClose }: ActivationCompleteModalProps) {
  const achievements = [
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: 'First Creation',
      description: 'You created your first piece of content',
    },
    {
      icon: <Workflow className="h-5 w-5" />,
      title: 'Sage Connection',
      description: 'You connected with your first Sage',
    },
    {
      icon: <Heart className="h-5 w-5" />,
      title: 'First Interaction',
      description: 'You engaged with your universe',
    },
  ]

  const nextActions = [
    {
      label: 'Explore Your Feed',
      description: 'See all your creations and activity',
      onClick: () => onExplore(),
    },
    {
      label: 'Create More',
      description: 'Generate new content in Create Studio',
      onClick: () => {
        window.location.href = '/create'
      },
    },
    {
      label: 'Chat with Sages',
      description: 'Continue your conversations',
      onClick: () => {
        window.location.href = '/sages'
      },
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <FadeIn>
        <Card2035 className="max-w-2xl w-[90%] md:w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <Card2035Content className="text-center py-8">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-fuchsia-500/20 mb-4">
                <Trophy className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Universe Activated! 🎉
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                You've completed all 3 activation steps. Your universe is now fully operational!
              </p>
            </div>

            {/* Achievements */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Achievements Unlocked
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {achievements.map((achievement, index) => (
                  <FadeIn key={index} delay={index * 0.1}>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3 mx-auto">
                        <div className="text-primary">
                          {achievement.icon}
                        </div>
                      </div>
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {achievement.title}
                      </h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {achievement.description}
                      </p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>

            {/* Next Actions */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                What's Next?
              </h4>
              <div className="space-y-3">
                {nextActions.map((action, index) => (
                  <FadeIn key={index} delay={0.3 + index * 0.1}>
                    <button
                      onClick={action.onClick}
                      className="w-full p-4 text-left bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                            {action.label}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {action.description}
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                      </div>
                    </button>
                  </FadeIn>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button2035
                variant="primary"
                size="md"
                onClick={onExplore}
                className="flex-1"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Explore Your Universe
              </Button2035>
              <Button2035
                variant="secondary"
                size="md"
                onClick={onClose}
                className="flex-1"
              >
                Continue Exploring
              </Button2035>
            </div>
          </Card2035Content>
        </Card2035>
      </FadeIn>
    </div>
  )
}
