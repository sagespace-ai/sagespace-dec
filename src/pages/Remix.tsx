/**
 * Remix Page
 * 
 * Main page for the Remix feature - combines two inputs into a single output.
 * Based on SS_Stitch functionality, integrated into SageSpace design system.
 */

import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Layout from '../components/Layout'
import { Sparkles, Loader2 } from 'lucide-react'
import { Card2035, Card2035Content } from '../components/ui/Card2035'
import { Button2035 } from '../components/ui/Button2035'
import { FadeIn } from '../components/motion/FadeIn'
import { EmptyState } from '../components/ui/EmptyState'
import { RemixInputCard } from '../components/remix/RemixInputCard'
import { RemixResultView } from '../components/remix/RemixResultView'
import { useRemixStitch } from '../hooks/useRemixStitch'
import { useToast } from '../contexts/ToastContext'
import { BackButton } from '../components/navigation/BackButton'
import { apiService } from '../services/api'
import type { RemixInput, RemixMode } from '../types/remix'

export default function Remix() {
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()
  const { remix, isLoading, error, data } = useRemixStitch()

  // Check if we have pre-populated inputs from navigation state
  const locationState = location.state as { inputA?: RemixInput; inputB?: RemixInput } | null

  const [inputA, setInputA] = useState<RemixInput>(
    locationState?.inputA || { text: '', imageUrl: undefined }
  )
  const [inputB, setInputB] = useState<RemixInput>(
    locationState?.inputB || { text: '', imageUrl: undefined }
  )
  const [mode, setMode] = useState<RemixMode>('concept_blend')
  const [result, setResult] = useState(data)

  // Update result when data changes
  useEffect(() => {
    if (data) {
      setResult(data)
    }
  }, [data])

  const canRemix = (inputA.text || inputA.imageUrl) && (inputB.text || inputB.imageUrl)

  const handleRemix = async () => {
    if (!canRemix) {
      showToast('Please fill in both inputs', 'warning')
      return
    }

    try {
      const remixResult = await remix({
        inputA,
        inputB,
        mode,
      })

      if (remixResult) {
        setResult(remixResult)
        showToast('Remix created successfully!', 'success')
      } else {
        showToast(error || 'Failed to create remix', 'error')
      }
    } catch (err) {
      showToast('Failed to create remix. Please try again.', 'error')
    }
  }

  const handleReset = () => {
    setInputA({ text: '', imageUrl: undefined })
    setInputB({ text: '', imageUrl: undefined })
    setResult(null)
  }

  const handleRemixAgain = () => {
    // Keep inputs, just regenerate
    handleRemix()
  }

  const handleSaveToFeed = async () => {
    if (!result) {
      showToast('No result to save', 'warning')
      return
    }

    try {
      const { error } = await apiService.createCreation({
        prompt: result.synthesis || result.resultText || result.title || 'Remix Creation',
        type: result.resultImageUrl ? 'image' : 'text',
        title: result.title || 'Remix Creation',
      })

      if (error) {
        showToast('Failed to save to feed', 'error')
      } else {
        showToast('Remix saved to feed!', 'success')
        navigate('/home')
      }
    } catch (err) {
      showToast('Failed to save to feed', 'error')
    }
  }

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <BackButton />

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black leading-tight tracking-tight text-gray-900 dark:text-white mb-2">
              Remix
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Weave new realities by combining concepts, blending images, and generating novel ideas from 2 distinct inputs.
            </p>
          </div>

          {result ? (
            // Show result
            <RemixResultView
              result={result}
              onReset={handleReset}
              onRemixAgain={handleRemixAgain}
              onSaveToFeed={handleSaveToFeed}
            />
          ) : (
            // Show input interface
            <FadeIn>
              <div className="space-y-6">
                {/* Mode Selector */}
                <Card2035>
                  <Card2035Content>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Remix Mode
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {(['concept_blend', 'image_blend', 'idea_generation'] as RemixMode[]).map((m) => (
                        <button
                          key={m}
                          onClick={() => setMode(m)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            mode === m
                              ? 'bg-primary text-white'
                              : 'bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-white/10'
                          }`}
                        >
                          {m.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </button>
                      ))}
                    </div>
                  </Card2035Content>
                </Card2035>

                {/* Input Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  <RemixInputCard
                    label="Input A"
                    value={inputA}
                    onChange={setInputA}
                    disabled={isLoading}
                  />
                  <RemixInputCard
                    label="Input B"
                    value={inputB}
                    onChange={setInputB}
                    disabled={isLoading}
                  />
                </div>

                {/* Action Button */}
                <div className="flex justify-center">
                  <Button2035
                    variant="primary"
                    size="lg"
                    onClick={handleRemix}
                    disabled={!canRemix || isLoading}
                    className="min-w-[200px]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Remixing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        Remix
                      </>
                    )}
                  </Button2035>
                </div>

                {/* Error Display */}
                {error && (
                  <Card2035 className="border-red-500/30 bg-red-500/10">
                    <Card2035Content>
                      <p className="text-red-200 text-sm">{error}</p>
                    </Card2035Content>
                  </Card2035>
                )}

                {/* Empty State */}
                {!canRemix && !isLoading && (
                  <EmptyState
                    icon={<Sparkles className="h-8 w-8 text-gray-400" />}
                    title="Ready to Remix"
                    description="Fill in both inputs above to combine them into something new."
                  />
                )}
              </div>
            </FadeIn>
          )}
        </div>
      </div>
    </Layout>
  )
}
