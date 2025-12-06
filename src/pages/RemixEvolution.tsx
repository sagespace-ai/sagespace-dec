import { useState } from 'react'
import Layout from '../components/Layout'
import { Sparkles, RefreshCw, TrendingUp, Copy, Share2, Download, MoreVertical } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { Card2035, Card2035Header, Card2035Title, Card2035Content } from '../components/ui/Card2035'
import { Button2035 } from '../components/ui/Button2035'
import { FadeIn } from '../components/motion/FadeIn'

interface Creation {
  id: string
  title: string
  type: 'image' | 'video' | 'audio' | 'text' | 'simulation'
  thumbnail: string
  remixes: number
  views: number
  createdAt: string
}

const creations: Creation[] = [
  {
    id: '1',
    title: 'Quantum Computing Visualization',
    type: 'image',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKsdQYf7gPdNv2zSlMlE2eddgfHOWhqP_Ls1PS-2izkPP3frRziwGI5vl1kgmtHMyh8hTL8E0WTftBMqctNxM64b95KLcxWk5r9-hxwk39SZGHAximdbYriFS2ct3I_b7iXjk1cCeYemISgCTB3ryjLFXfRbyh2RR2MW8NwGXQXjGXaxtgLrXcjxg4s43LO8x9ZM4oMqHY_kRnly6o5_bStJNTkWGJs5KCHtVvFPstKsBNizqPw8aZJyLPoFvAVal2Pk2pyaLq_hDK',
    remixes: 12,
    views: 1240,
    createdAt: '2 days ago',
  },
  {
    id: '2',
    title: 'Neural Network Audio',
    type: 'audio',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmr01oVazBUyLF6rNxZn8NuaVtVSvJPUkjr4604yl0_rLQUy4eqUeLqAAQat3TB-Ma11qdvrNtwfIGlUs_w7eukRDGIKYpld_6BmYyO9YN3cn7FOYjzZktIJHMSOIgqc1ZbLeBiWA033RKQPSNDTUbDSzq1ElPZEoBrTGDWMdSkCDTBkb195_yfhDGN2fDK1MwUTOHePxODjuEPFfuRYUjd3ByJDu2Mb349h85upsIC9zbCVk7J9so_y9dP99dMCsp0slg8pxnUkrV',
    remixes: 8,
    views: 890,
    createdAt: '5 days ago',
  },
  {
    id: '3',
    title: 'AI Story Generator',
    type: 'text',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1v6BlLfNwnFLLcN7lfF6UTFTOz04Vs5rXKG0dz1k5_Q_5poxO6KZb-PZeoD1VP_-0tTZqJab-6SzzbCx_gY15VjPwAcsJB39Wtrn9nAEjli-y-1W117CUA9D9an_BCutC1TJv85WAKh3IhURrkEi5EKnHZiFLcRAqVPd55aX9anDQeRLh4z8EJhg0W4FI5Yj0JEt81G7w_gATG981vseZ8yrgjkCihHpw3cZyfM8xWcNtkAwM2S4JLDtlj-g53UIOyHxUyodN2pcJ',
    remixes: 24,
    views: 2100,
    createdAt: '1 week ago',
  },
]

export default function RemixEvolution() {
  const { showToast } = useToast()
  const [selectedCreation, setSelectedCreation] = useState<Creation | null>(null)
  const [remixPrompt, setRemixPrompt] = useState('')
  const [isRemixing, setIsRemixing] = useState(false)

  const handleRemix = async () => {
    if (!selectedCreation) {
      showToast('Please select a creation to remix', 'warning')
      return
    }
    if (!remixPrompt.trim()) {
      showToast('Please enter remix instructions', 'warning')
      return
    }

    setIsRemixing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsRemixing(false)

    showToast(`Remix of "${selectedCreation.title}" created!`, 'success')
    setRemixPrompt('')
  }

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black leading-tight tracking-tight text-gray-900 dark:text-white mb-2">
              Remix & Evolution
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Transform and evolve your creations with AI-powered remixing
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Creations Grid */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Your Creations
                </h2>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-white/20">
                    All
                  </button>
                  <button className="px-3 py-1.5 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-white/20">
                    Popular
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {creations.map((creation, index) => (
                  <FadeIn key={creation.id} delay={index * 0.1}>
                    <Card2035
                      interactive
                      onClick={() => setSelectedCreation(creation)}
                      className={`overflow-hidden ${
                        selectedCreation?.id === creation.id
                          ? 'ring-2 ring-primary'
                          : ''
                      }`}
                    >
                      <div
                        className="w-full h-48 bg-cover bg-center"
                        style={{ backgroundImage: `url(${creation.thumbnail})` }}
                      ></div>
                      <Card2035Content>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                              {creation.title}
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                              {creation.type} • {creation.createdAt}
                            </p>
                          </div>
                          <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                            <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </button>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <RefreshCw className="h-4 w-4" />
                            <span>{creation.remixes} remixes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>{creation.views} views</span>
                          </div>
                        </div>
                      </Card2035Content>
                  </Card2035>
                </FadeIn>
              ))}
            </div>
          </div>

            {/* Remix Panel */}
            <div className="lg:col-span-1">
              <Card2035 className="sticky top-4">
                <Card2035Header>
                  <Card2035Title>Remix Studio</Card2035Title>
                </Card2035Header>
                <Card2035Content>

                {selectedCreation ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Remixing:
                      </p>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedCreation.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {selectedCreation.type} • {selectedCreation.remixes} remixes
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Remix Instructions
                      </label>
                      <textarea
                        value={remixPrompt}
                        onChange={e => setRemixPrompt(e.target.value)}
                        placeholder="Describe how you want to remix this creation..."
                        rows={4}
                        className="w-full bg-white/5 dark:bg-white/5 border border-white/10 rounded-[12px] px-4 py-2 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-white/20 focus:border-white/20 resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Button2035
                        variant="primary"
                        size="md"
                        onClick={handleRemix}
                        disabled={isRemixing}
                        className="w-full"
                      >
                        {isRemixing ? (
                          <>
                            <LoadingSpinner size="sm" />
                            Creating Remix...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-5 w-5 mr-2" />
                            Create Remix
                          </>
                        )}
                      </Button2035>
                      <div className="grid grid-cols-3 gap-2">
                        <button className="p-2 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-white/20 transition-colors flex items-center justify-center">
                          <Copy className="h-4 w-4" />
                        </button>
                        <button className="p-2 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-white/20 transition-colors flex items-center justify-center">
                          <Share2 className="h-4 w-4" />
                        </button>
                        <button className="p-2 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-white/20 transition-colors flex items-center justify-center">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Evolution Suggestions
                      </h3>
                      <div className="space-y-2">
                        {['Add motion effects', 'Change color palette', 'Increase complexity'].map(
                          (suggestion, idx) => (
                            <button
                              key={idx}
                              onClick={() => setRemixPrompt(suggestion)}
                              className="w-full text-left px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                              {suggestion}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Sparkles className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Select a creation to start remixing
                    </p>
                  </div>
                )}
                </Card2035Content>
              </Card2035>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
