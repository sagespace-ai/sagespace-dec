import { CheckCircle } from 'lucide-react'
import { Card2035, Card2035Content } from '../ui/Card2035'
import { Button2035 } from '../ui/Button2035'
import { FadeIn } from '../motion/FadeIn'

interface StepCompletionModalProps {
  step: number
  stepName: string
  description: string
  nextStep?: string
  onClose: () => void
  onNext?: () => void
}

export function StepCompletionModal({
  step,
  stepName,
  description,
  nextStep,
  onClose,
  onNext,
}: StepCompletionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <FadeIn>
        <Card2035 className="max-w-md w-[90%] md:w-full" onClick={(e) => e.stopPropagation()}>
          <Card2035Content className="text-center py-6">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Step {step} Complete! 🎉
              </h3>
              <p className="text-lg font-medium text-primary mb-2">{stepName}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
            </div>
            {nextStep && (
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Next: {nextStep}
                </p>
                {onNext && (
                  <Button2035 variant="primary" size="md" onClick={onNext} className="w-full mb-2">
                    Continue to Next Step
                  </Button2035>
                )}
              </div>
            )}
            <Button2035
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="w-full"
            >
              Got it
            </Button2035>
          </Card2035Content>
        </Card2035>
      </FadeIn>
    </div>
  )
}
