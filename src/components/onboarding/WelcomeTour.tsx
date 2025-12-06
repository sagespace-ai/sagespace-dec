import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Sparkles, Store, Workflow, ArrowRight } from 'lucide-react'
import { Card2035, Card2035Header, Card2035Title, Card2035Content } from '../ui/Card2035'
import { Button2035 } from '../ui/Button2035'
import { FadeIn } from '../motion/FadeIn'

interface TourStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}

interface WelcomeTourProps {
  onComplete: () => void
}

export function WelcomeTour({ onComplete }: WelcomeTourProps) {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)

  const steps: TourStep[] = [
    {
      id: 'feed',
      title: 'Your Unified Feed',
      description: 'This is your home base. All your creations, Sage activity, and discoveries appear here. Switch between All, Marketplace, and Universe views using the chips above.',
      icon: <Sparkles className="h-6 w-6" />,
      action: {
        label: 'Explore Feed',
        onClick: () => {
          navigate('/home')
          onComplete()
        },
      },
    },
    {
      id: 'create',
      title: 'Create Studio',
      description: 'Generate images, videos, audio, text, or simulations. Your creations automatically appear in your feed and become part of your universe.',
      icon: <Sparkles className="h-6 w-6" />,
      action: {
        label: 'Try Creating',
        onClick: () => {
          navigate('/create')
          onComplete()
        },
      },
    },
    {
      id: 'sages',
      title: 'Meet Your Sages',
      description: 'AI companions that help you research, build, and reflect. Each Sage has unique capabilities and can remember your conversations.',
      icon: <Workflow className="h-6 w-6" />,
      action: {
        label: 'Chat with Sages',
        onClick: () => {
          navigate('/sages')
          onComplete()
        },
      },
    },
    {
      id: 'marketplace',
      title: 'Marketplace',
      description: 'Discover and purchase prompt packs, visual assets, agent personalities, and workflows created by the community.',
      icon: <Store className="h-6 w-6" />,
      action: {
        label: 'Browse Marketplace',
        onClick: () => {
          navigate('/marketplace')
          onComplete()
        },
      },
    },
  ]

  const currentStepData = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={handleSkip}>
      <FadeIn>
        <Card2035 className="max-w-lg w-[90%] md:w-full" onClick={(e) => e.stopPropagation()}>
          <Card2035Header>
            <div className="flex items-center justify-between">
              <Card2035Title>Welcome to SageSpace! 🎉</Card2035Title>
              <button
                onClick={handleSkip}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                aria-label="Skip tour"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </Card2035Header>
          <Card2035Content>
            <div className="space-y-4">
              {/* Step Indicator */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <div className="flex gap-1">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 rounded-full transition-all ${
                        index === currentStep
                          ? 'w-8 bg-primary'
                          : index < currentStep
                          ? 'w-2 bg-primary/50'
                          : 'w-2 bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Step Content */}
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  {currentStepData.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {currentStepData.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                  {currentStepData.description}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                {currentStepData.action && (
                  <Button2035
                    variant="primary"
                    size="md"
                    onClick={currentStepData.action.onClick}
                    className="flex-1"
                  >
                    {currentStepData.action.label}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button2035>
                )}
                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <Button2035
                      variant="secondary"
                      size="md"
                      onClick={() => setCurrentStep((prev) => prev - 1)}
                    >
                      Previous
                    </Button2035>
                  )}
                  <Button2035
                    variant="secondary"
                    size="md"
                    onClick={handleNext}
                    className="flex-1"
                  >
                    {isLastStep ? 'Get Started' : 'Next'}
                  </Button2035>
                </div>
              </div>
            </div>
          </Card2035Content>
        </Card2035>
      </FadeIn>
    </div>
  )
}
