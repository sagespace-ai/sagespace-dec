/**
 * RemixResultView Component
 * 
 * Displays the result of a Remix operation.
 * Shows title, synthesis text, and generated image if available.
 */

import { Sparkles, Share2, Copy, RefreshCw, Save } from 'lucide-react'
import { Card2035, Card2035Header, Card2035Title, Card2035Content } from '../ui/Card2035'
import { Button2035 } from '../ui/Button2035'
import { FadeIn } from '../motion/FadeIn'
import type { RemixResponse } from '../../types/remix'
import { useToast } from '../../contexts/ToastContext'

interface RemixResultViewProps {
  result: RemixResponse
  onReset: () => void
  onRemixAgain?: () => void
  onSaveToFeed?: () => void
}

export function RemixResultView({ result, onReset, onRemixAgain, onSaveToFeed }: RemixResultViewProps) {
  const { showToast } = useToast()

  const handleCopy = () => {
    const textToCopy = `${result.title}\n\n${result.synthesis || result.resultText}`
    navigator.clipboard.writeText(textToCopy)
    showToast('Copied to clipboard', 'success')
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: result.title || 'Remix Result',
          text: result.synthesis || result.resultText || '',
        })
      } catch (error) {
        // User cancelled or error
      }
    } else {
      handleCopy()
    }
  }

  return (
    <FadeIn>
      <div className="w-full max-w-5xl mx-auto space-y-6">
        <Card2035>
          <Card2035Header>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="text-primary w-5 h-5" />
              <span className="text-primary font-mono text-xs tracking-wider uppercase">
                Remix Complete
              </span>
            </div>
            <Card2035Title className="text-2xl">{result.title || 'Untitled Remix'}</Card2035Title>
          </Card2035Header>

          <Card2035Content>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Visual Side */}
              {result.resultImageUrl && (
                <div className="relative bg-black/20 rounded-lg overflow-hidden min-h-[300px] flex items-center justify-center">
                  <img
                    src={result.resultImageUrl}
                    alt={result.title || 'Remix result'}
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
              )}

              {/* Text Side */}
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">
                    Synthesis
                  </h3>
                  <p className="text-gray-900 dark:text-white leading-relaxed">
                    {result.synthesis || result.resultText || 'No synthesis available.'}
                  </p>
                </div>

                {result.visualPrompt && (
                  <div className="pt-4 border-t border-white/10">
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">
                      Visual Prompt
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-500 font-mono leading-relaxed bg-white/5 p-3 rounded-lg border border-white/10">
                      {result.visualPrompt}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-white/10">
              <Button2035
                variant="primary"
                size="md"
                onClick={onReset}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                New Remix
              </Button2035>
              {onRemixAgain && (
                <Button2035
                  variant="secondary"
                  size="md"
                  onClick={onRemixAgain}
                >
                  Remix Again
                </Button2035>
              )}
              <Button2035
                variant="ghost"
                size="md"
                onClick={handleCopy}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button2035>
              <Button2035
                variant="ghost"
                size="md"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button2035>
              {onSaveToFeed && (
                <Button2035
                  variant="primary"
                  size="md"
                  onClick={onSaveToFeed}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save to Feed
                </Button2035>
              )}
            </div>
          </Card2035Content>
        </Card2035>
      </div>
    </FadeIn>
  )
}
