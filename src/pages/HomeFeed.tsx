import { useRef, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import {
  Sparkles,
  Store,
  Map,
  Users,
  Image as ImageIcon,
  Film,
  Headphones,
  FileText,
  Sparkles as SparklesIcon,
  RefreshCw,
  X,
} from 'lucide-react'
import { Card2035, Card2035Header, Card2035Title, Card2035Content } from '../components/ui/Card2035'
import { Button2035 } from '../components/ui/Button2035'
import { FadeIn } from '../components/motion/FadeIn'
import { EmptyState } from '../components/ui/EmptyState'
import { FeedItemSkeleton } from '../components/ui/Skeleton'
import { useFeed } from '../hooks/useFeed'
import { useRealtimeFeed } from '../hooks/useRealtimeFeed'
import { useUIStore, FeedView } from '../store/uiStore'
import { UnifiedPostCard } from '../components/feed/UnifiedPostCard'
import { useAuth } from '../contexts/AuthContext'

export default function HomeFeed() {
  const navigate = useNavigate()
  const feedView = useUIStore((state) => state.feedView)
  const setFeedView = useUIStore((state) => state.setFeedView)
  const hasSeenHomeWalkthrough = useUIStore((state) => state.hasSeenHomeWalkthrough)
  const setHasSeenHomeWalkthrough = useUIStore((state) => state.setHasSeenHomeWalkthrough)
  const personaHint = useUIStore((state) => state.personaHint)
  const [showWalkthrough, setShowWalkthrough] = useState(!hasSeenHomeWalkthrough)
  const walkthroughRef = useRef<HTMLDivElement | null>(null)
  const { user } = useAuth()
  const { items, loading, error, hasMore, loadMore, refresh } = useFeed({
    personaHint,
    view: feedView,
  })
  
  // Enable real-time updates
  useRealtimeFeed({
    userId: user?.id,
    enabled: !!user,
  })
  
  const [activeTypes, setActiveTypes] = useState<string[]>([])
  const { selectedFeedItems, clearFeedItemSelection } = useUIStore()

  // Get selected items data
  const selectedItemsData = useMemo(() => {
    return items.filter((item) => selectedFeedItems.includes(item.id))
  }, [items, selectedFeedItems])

  const handleRemixTogether = () => {
    if (selectedItemsData.length === 2) {
      const [itemA, itemB] = selectedItemsData
      navigate('/remix', {
        state: {
          inputA: {
            text: itemA.title || itemA.description || '',
            imageUrl: itemA.thumbnail || undefined,
          },
          inputB: {
            text: itemB.title || itemB.description || '',
            imageUrl: itemB.thumbnail || undefined,
          },
        },
      })
      clearFeedItemSelection()
    }
  }

  const modeDescription =
    feedView === 'following'
      ? 'Following · See posts from people you follow.'
      : feedView === 'marketplace'
      ? 'Marketplace · Discover trending community creations and assets.'
      : feedView === 'universe'
      ? 'Universe · Explore your connected projects, sages, and creations.'
      : 'All · See your latest activity across SageSpace.'

  const toggleType = (type: string) => {
    setActiveTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const filteredItems =
    activeTypes.length === 0
      ? items
      : items.filter((item) => activeTypes.includes(item.type))

  return (
    <Layout>
      <header className="flex-shrink-0 flex items-center justify-between h-16 px-4 md:px-6 border-b border-gray-200 dark:border-gray-800 bg-background-light dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
            Home Feed
          </h1>
          {/* PHASE 2: Simple view selector for unified feed modes */}
          <div className="flex items-center gap-1 text-xs md:text-sm">
            <ViewChip
              label="All"
              view="default"
              activeView={feedView}
              onSelect={setFeedView}
              icon={<Sparkles className="h-3 w-3 md:h-4 md:w-4" />}
            />
            <ViewChip
              label="Following"
              view="following"
              activeView={feedView}
              onSelect={setFeedView}
              icon={<Users className="h-3 w-3 md:h-4 md:w-4" />}
            />
            <ViewChip
              label="Marketplace"
              view="marketplace"
              activeView={feedView}
              onSelect={setFeedView}
              icon={<Store className="h-3 w-3 md:h-4 md:w-4" />}
            />
            <ViewChip
              label="Universe"
              view="universe"
              activeView={feedView}
              onSelect={setFeedView}
              icon={<Map className="h-3 w-3 md:h-4 md:w-4" />}
            />
          </div>
          <p className="text-[11px] md:text-xs text-gray-500 dark:text-gray-400">
            {modeDescription}
          </p>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          <Button2035 
            variant="primary" 
            size="sm" 
            onClick={() => navigate('/create')}
            aria-label="Create a new post"
          >
            <span className="hidden md:inline">Create Post</span>
            <span className="md:hidden">Create</span>
          </Button2035>
        </div>
      </header>

      {/* First-run walkthrough overlay */}
      {showWalkthrough && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <Card2035
            ref={walkthroughRef}
            className="max-w-lg w-[90%] md:w-full relative"
            role="dialog"
            aria-modal="true"
            aria-labelledby="home-walkthrough-title"
          >
            <Card2035Header>
              <Card2035Title id="home-walkthrough-title">Welcome to your SageSpace feed</Card2035Title>
            </Card2035Header>
            <Card2035Content>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <p>
                  This is where your universe comes together: creations, remixes, and Sage activity.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Feed modes</strong>: Switch between <em>All</em>, <em>Marketplace</em>, and <em>Universe</em> using the chips under the title.</li>
                  <li><strong>Create</strong>: Use the Create button to publish new ideas into your universe.</li>
                  <li><strong>Sages</strong>: Chat with Sages to analyze, build, or reflect on your work.</li>
                </ul>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
                <Button2035
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setShowWalkthrough(false)
                    setHasSeenHomeWalkthrough(true)
                  }}
                >
                  Got it
                </Button2035>
              </div>
            </Card2035Content>
          </Card2035>
        </div>
      )}

      <div id="main-content" className="flex-1 p-4 md:p-6 max-w-4xl mx-auto w-full overflow-auto" role="main">
        {loading && items.length === 0 ? (
          <div className="space-y-4 md:space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <FeedItemSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={<Sparkles className="h-8 w-8 text-gray-400" />}
            title="Unable to load feed"
            description={error}
            action={{
              label: "Try again",
              onClick: () => refresh()
            }}
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="h-8 w-8 text-gray-400" />}
            title="Welcome to SageSpace"
            description="Your universe is fresh and ready. Create your first piece or meet your Sages to start shaping it."
            action={{
              label: "Create your first post",
              onClick: () => navigate('/create')
            }}
            secondaryAction={{
              label: "Meet Your Sages",
              onClick: () => navigate('/sages')
            }}
          />
        ) : (
          <div className="space-y-4 md:space-y-6">
            {/* Remix Together Banner */}
            {selectedFeedItems.length === 2 && (
              <FadeIn>
                <Card2035 className="bg-primary/10 border-primary/30">
                  <Card2035Content>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                          <RefreshCw className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedFeedItems.length} items selected
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Ready to remix together
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button2035
                          variant="primary"
                          size="sm"
                          onClick={handleRemixTogether}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Remix Together
                        </Button2035>
                        <button
                          onClick={clearFeedItemSelection}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                          aria-label="Clear selection"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </Card2035Content>
                </Card2035>
              </FadeIn>
            )}

            {/* Format filters – inspired by SS_Vite sidebar */}
            {items.length > 0 && (
              <Card2035>
                <Card2035Content>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Tuned for this session
                      </p>
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        {personaHint}
                      </p>
                    </div>
                    <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400 sm:mt-0">
                      Persona controls will live in the Harmony bar and Sage panel.
                    </p>
                  </div>
                </Card2035Content>
              </Card2035>
            )}

            {items.length > 0 && (
              <Card2035>
                <Card2035Content>
                  <div className="flex flex-col gap-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Format
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { type: 'image', icon: ImageIcon, label: 'Image' },
                        { type: 'video', icon: Film, label: 'Video' },
                        { type: 'audio', icon: Headphones, label: 'Audio' },
                        { type: 'text', icon: FileText, label: 'Text' },
                        { type: 'simulation', icon: SparklesIcon, label: 'Simulation' },
                      ].map((fmt) => {
                        const isActive = activeTypes.includes(fmt.type)
                        const Icon = fmt.icon
                        return (
                          <button
                            key={fmt.type}
                            type="button"
                            onClick={() => toggleType(fmt.type)}
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary
                              ${
                                isActive
                                  ? 'bg-gray-900 text-white border-transparent dark:bg-white dark:text-black'
                                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                              }`}
                            aria-pressed={isActive}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            <span>{fmt.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </Card2035Content>
              </Card2035>
            )}

            {/* Welcome Card - only show if feed has items */}
            {filteredItems.length > 0 && (
              <FadeIn>
                <Card2035>
                  <Card2035Header>
                    <Card2035Title>Welcome to Your Universe</Card2035Title>
                  </Card2035Header>
                  <Card2035Content>
                    <p className="text-gray-600 dark:text-gray-400">
                      This is your unified feed where all your creations, collaborations, and discoveries
                      come together.
                    </p>
                  </Card2035Content>
                </Card2035>
              </FadeIn>
            )}

            {/* Feed Items - refactored to use SS_Vite-inspired card */}
            {filteredItems.map((item, index) => (
              <FadeIn key={item.id || index} delay={index * 0.05}>
                <UnifiedPostCard item={item} />
              </FadeIn>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button2035 
                  variant="secondary" 
                  size="md" 
                  onClick={loadMore}
                  disabled={loading}
                  aria-label="Load more posts"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button2035>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}

interface ViewChipProps {
  label: string
  view: FeedView
  activeView: FeedView
  onSelect: (view: FeedView) => void
  icon?: React.ReactNode
}

function ViewChip({ label, view, activeView, onSelect, icon }: ViewChipProps) {
  const isActive = activeView === view
  return (
    <button
      type="button"
      onClick={() => onSelect(view)}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[11px] md:text-xs transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary
        ${
          isActive
            ? 'bg-primary/10 border-primary/60 text-primary'
            : 'bg-transparent border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      aria-pressed={isActive}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}
