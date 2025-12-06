import { CheckCircle, Sparkles } from 'lucide-react'
import { Card2035, Card2035Content } from '../ui/Card2035'
import { Button2035 } from '../ui/Button2035'
import { FadeIn } from '../motion/FadeIn'

interface PurchaseModalProps {
  item: {
    id: string
    title: string
    creator: string
    price: number
    image?: string
  }
  onClose: () => void
  onViewInFeed: () => void
}

export function PurchaseModal({ item, onClose, onViewInFeed }: PurchaseModalProps) {
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
                Purchase Complete! 🎉
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                You've successfully purchased
              </p>
              {item.image && (
                <div className="w-full h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg mb-4 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                <p className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">by {item.creator}</p>
                <p className="text-lg font-bold text-primary mt-2">${item.price.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button2035
                variant="primary"
                size="md"
                onClick={onViewInFeed}
                className="flex-1"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                View in Feed
              </Button2035>
              <Button2035
                variant="secondary"
                size="md"
                onClick={onClose}
                className="flex-1"
              >
                Continue Shopping
              </Button2035>
            </div>
          </Card2035Content>
        </Card2035>
      </FadeIn>
    </div>
  )
}
