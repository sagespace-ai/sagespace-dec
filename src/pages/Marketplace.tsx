import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Store, Bell } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import { Card2035, Card2035Header, Card2035Title, Card2035Content } from '../components/ui/Card2035'
import { Button2035 } from '../components/ui/Button2035'
import { EmptyState } from '../components/ui/EmptyState'
import { BackButton } from '../components/navigation/BackButton'
import { PurchaseModal } from '../components/marketplace/PurchaseModal'
import { FadeIn } from '../components/motion/FadeIn'
import { apiService } from '../services/api'
import { useToast } from '../contexts/ToastContext'

interface MarketplaceItem {
  id: string
  title: string
  creator: string
  creatorType: 'human' | 'ai'
  price: number
  rating: number
  reviews: number
  image: string
  verified: boolean
}

const marketplaceItems: MarketplaceItem[] = [
  {
    id: '1',
    title: 'Sci-Fi Story Starters',
    creator: 'HumanCreator',
    creatorType: 'human',
    price: 19.99,
    rating: 4.5,
    reviews: 1204,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKsdQYf7gPdNv2zSlMlE2eddgfHOWhqP_Ls1PS-2izkPP3frRziwGI5vl1kgmtHMyh8hTL8E0WTftBMqctNxM64b95KLcxWk5r9-hxwk39SZGHAximdbYriFS2ct3I_b7iXjk1cCeYemISgCTB3ryjLFXfRbyh2RR2MW8NwGXQXjGXaxtgLrXcjxg4s43LO8x9ZM4oMqHY_kRnly6o5_bStJNTkWGJs5KCHtVvFPstKsBNizqPw8aZJyLPoFvAVal2Pk2pyaLq_hDK',
    verified: true,
  },
  {
    id: '2',
    title: 'Python Dev Pack',
    creator: 'AICoder_v2',
    creatorType: 'ai',
    price: 24.99,
    rating: 5.0,
    reviews: 887,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmr01oVazBUyLF6rNxZn8NuaVtVSvJPUkjr4604yl0_rLQUy4eqUeLqAAQat3TB-Ma11qdvrNtwfIGlUs_w7eukRDGIKYpld_6BmYyO9YN3cn7FOYjzZktIJHMSOIgqc1ZbLeBiWA033RKQPSNDTUbDSzq1ElPZEoBrTGDWMdSkCDTBkb195_yfhDGN2fDK1MwUTOHePxODjuEPFfuRYUjd3ByJDu2Mb349h85upsIC9zbCVk7J9so_y9dP99dMCsp0slg8pxnUkrV',
    verified: true,
  },
  {
    id: '3',
    title: 'Marketing Campaign Ideas',
    creator: 'Verified_Marketer',
    creatorType: 'human',
    price: 39.0,
    rating: 4.0,
    reviews: 431,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1v6BlLfNwnFLLcN7lfF6UTFTOz04Vs5rXKG0dz1k5_Q_5poxO6KZb-PZeoD1VP_-0tTZqJab-6SzzbCx_gY15VjPwAcsJB39Wtrn9nAEjli-y-1W117CUA9D9an_BCutC1TJv85WAKh3IhURrkEi5EKnHZiFLcRAqVPd55aX9anDQeRLh4z8EJhg0W4FI5Yj0JEt81G7w_gATG981vseZ8yrgjkCihHpw3cZyfM8xWcNtkAwM2S4JLDtlj-g53UIOyHxUyodN2pcJ',
    verified: true,
  },
]

export default function Marketplace() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { showToast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('prompt-packs')
  const [walletBalance] = useState(1234.56)
  const [purchasedItem, setPurchasedItem] = useState<MarketplaceItem | null>(null)
  const [_isProcessing, setIsProcessing] = useState(false)

  // Handle Stripe redirect after payment
  useEffect(() => {
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')
    const sessionId = searchParams.get('session_id')

    if (success && sessionId) {
      showToast('Payment successful! Your purchase is being processed.', 'success')
      // Clear URL params
      navigate('/marketplace', { replace: true })
      // Optionally refresh marketplace or show success state
    } else if (canceled) {
      showToast('Payment canceled', 'warning')
      navigate('/marketplace', { replace: true })
    }
  }, [searchParams, navigate, showToast])

  const filteredItems = useMemo(() => {
    let items = marketplaceItems
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      items = items.filter(
        item =>
          item.title.toLowerCase().includes(query) ||
          item.creator.toLowerCase().includes(query)
      )
    }
    return items
  }, [searchQuery])

  const categories = [
    { id: 'prompt-packs', label: 'Prompt Packs', icon: 'code' },
    { id: 'visual-packs', label: 'Visual Packs', icon: 'image' },
    { id: 'simulations', label: 'Simulations', icon: 'view_in_ar' },
    { id: 'agent-personalities', label: 'Agent Personalities', icon: 'smart_toy' },
    { id: 'templates', label: 'Templates', icon: 'layers' },
    { id: 'workflows', label: 'Workflows', icon: 'account_tree' },
  ]

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    return (
      <div className="flex items-center text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="material-icons-outlined text-base">
            {i < fullStars ? 'star' : i === fullStars && hasHalfStar ? 'star_half' : 'star_border'}
          </span>
        ))}
      </div>
    )
  }

  const handlePurchase = async (item: MarketplaceItem) => {
    setIsProcessing(true)
    try {
      // Create Stripe Checkout session
      const { data, error } = await apiService.createCheckoutSession({
        itemId: item.id,
        itemTitle: item.title,
        price: item.price,
        itemType: 'marketplace_item',
      })

      if (error || !data) {
        throw new Error(error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error: any) {
      console.error('Purchase error:', error)
      showToast(error.message || 'Failed to initiate purchase', 'error')
      setIsProcessing(false)
    }
  }

  const handleViewInFeed = () => {
    setPurchasedItem(null)
    navigate('/home')
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-white/10 dark:border-white/10 px-6 py-3">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <BackButton className="md:hidden" />
            <div className="flex items-center gap-4">
              <div className="size-6 text-primary">
                <span className="material-icons-outlined text-4xl">hub</span>
              </div>
              <h2 className="text-black dark:text-white text-lg font-bold">AI Universe</h2>
            </div>
            <div className="min-w-[200px]">
              <SearchBar
                placeholder="Search assets..."
                onSearch={setSearchQuery}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => navigate('/home')}
                className="text-black dark:text-white text-sm font-medium hover:text-primary dark:hover:text-primary"
              >
                My Universe
              </button>
              <button className="text-black dark:text-white text-sm font-medium hover:text-primary dark:hover:text-primary">
                Creations
              </button>
              <button className="text-black dark:text-white text-sm font-medium hover:text-primary dark:hover:text-primary">
                Wallet
              </button>
              <button className="text-primary text-sm font-bold">Marketplace</button>
            </div>
            <Button2035 variant="primary" size="sm" onClick={() => navigate('/create')}>
              Upload Asset
            </Button2035>
            <button className="bg-white/10 dark:bg-white/10 p-2 rounded-lg text-black dark:text-white hover:bg-white/20">
              <Bell className="h-5 w-5" />
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full"></div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto p-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Sidebar - Categories */}
          <aside className="col-span-12 md:col-span-3">
            <div className="bg-white/5 dark:bg-white/5 rounded-xl border border-white/10 p-4">
              <h3 className="text-black dark:text-white text-base font-medium mb-4 px-3">
                Category Filters
              </h3>
              <div className="flex flex-col gap-1">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-primary/20 text-primary'
                        : 'hover:bg-white/10 dark:hover:bg-white/10 text-black dark:text-white'
                    }`}
                  >
                    <span className="material-icons-outlined text-lg">{category.icon}</span>
                    <p className="text-sm font-medium">{category.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="col-span-12 md:col-span-6">
            <div className="mb-8">
              <h1 className="text-4xl font-black text-black dark:text-white mb-2">
                Marketplace: The Human + AI Economy
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Buy and sell prompt packs, visual packs, simulations, agent personalities,
                templates, and entire workflows.
              </p>
            </div>

            {/* Editor's Picks */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-black dark:text-white mb-4 px-4">
                Editor's Picks
              </h3>
              <div className="flex gap-6 overflow-x-auto pb-4">
                {[1, 2, 3].map((item, index) => (
                  <FadeIn key={item} delay={index * 0.1}>
                    <Card2035 interactive className="flex-shrink-0 w-72 overflow-hidden">
                      <div className="w-full h-40 bg-gradient-to-br from-purple-500 to-blue-500"></div>
                      <Card2035Content>
                        <Card2035Header>
                          <Card2035Title>Featured Item {item}</Card2035Title>
                        </Card2035Header>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                          By Creator_{item}
                        </p>
                        <Button2035 variant="secondary" size="sm" className="w-full">
                          View Details
                        </Button2035>
                      </Card2035Content>
                    </Card2035>
                  </FadeIn>
                ))}
              </div>
            </div>

            {/* All Items */}
            <div>
              <h3 className="text-xl font-bold text-black dark:text-white mb-4 px-4">
                All {categories.find(c => c.id === selectedCategory)?.label}
                {searchQuery && ` (${filteredItems.length} results)`}
              </h3>
              {filteredItems.length === 0 ? (
                <EmptyState
                  icon={<Store className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
                  title={searchQuery ? 'No items found' : 'Marketplace is empty'}
                  description={
                    searchQuery
                      ? `No items match "${searchQuery}". Try a different search term or browse all categories.`
                      : 'The marketplace is currently empty. Check back soon for new assets, or upload your own!'
                  }
                  action={
                    searchQuery
                      ? {
                          label: 'Clear Search',
                          onClick: () => setSearchQuery(''),
                        }
                      : {
                          label: 'Upload Asset',
                          onClick: () => navigate('/create'),
                        }
                  }
                  secondaryAction={
                    searchQuery
                      ? {
                          label: 'Browse All',
                          onClick: () => {
                            setSearchQuery('')
                            setSelectedCategory('prompt-packs')
                          },
                        }
                      : undefined
                  }
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item, index) => (
                    <FadeIn key={item.id} delay={index * 0.05}>
                      <Card2035 interactive className="overflow-hidden">
                        <div
                          className="w-full h-40 bg-cover bg-center"
                          style={{ backgroundImage: `url(${item.image})` }}
                        ></div>
                        <Card2035Content>
                          <div className="p-4 flex flex-col gap-3">
                            <h4 className="text-black dark:text-white font-bold">{item.title}</h4>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                              <span className="material-icons-outlined text-base">
                                {item.creatorType === 'human' ? 'person' : 'smart_toy'}
                              </span>
                              <span>{item.creator}</span>
                              {item.verified && (
                                <div className="flex items-center gap-1 ml-auto text-green-400">
                                  <span className="material-icons-outlined text-base">verified_user</span>
                                  <span className="font-bold">98</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center text-sm">
                              {renderStars(item.rating)}
                              <span className="ml-2 text-gray-600 dark:text-gray-400">
                                ({item.reviews.toLocaleString()})
                              </span>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-white/10">
                              <p className="text-lg font-bold text-black dark:text-white">
                                ${item.price.toFixed(2)}
                              </p>
                              <Button2035 
                                variant="primary" 
                                size="sm"
                                onClick={() => handlePurchase(item)}
                              >
                                Buy Now
                              </Button2035>
                            </div>
                          </div>
                        </Card2035Content>
                      </Card2035>
                    </FadeIn>
                  ))}
              </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="col-span-12 md:col-span-3">
            <div className="bg-white/5 dark:bg-white/5 rounded-xl border border-white/10 p-4 sticky top-24">
              <div className="mb-6">
                <h3 className="text-base font-medium text-black dark:text-white mb-3">
                  Market Insights
                </h3>
                <div className="w-full h-40 bg-gray-700/50 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                  Chart: Top Performing Categories
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-base font-medium text-black dark:text-white mb-3">
                  Market Activity
                </h3>
                <ul className="flex flex-col gap-4 text-sm">
                  <li className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mt-1"></div>
                    <div>
                      <p className="text-black dark:text-white">Sale: 'Gothic Architecture' Visuals</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        Sold by <span className="text-primary/80">CreatorX</span> for $12.50
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mt-1"></div>
                    <div>
                      <p className="text-black dark:text-white">License: 'Helpful Assistant' Agent</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        Sold by <span className="text-primary/80">AI_Gen_4</span> for $5.00/mo
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="border-t border-white/10 pt-4">
                <h3 className="text-base font-medium text-black dark:text-white mb-3">My Wallet</h3>
                <div className="bg-primary/20 p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-sm text-primary/80">Balance</p>
                    <p className="text-2xl font-bold text-black dark:text-white">
                      ${walletBalance.toFixed(2)}
                    </p>
                  </div>
                  <Button2035 variant="secondary" size="sm">
                    Add Funds
                  </Button2035>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Purchase Modal */}
      {purchasedItem && (
        <PurchaseModal
          item={purchasedItem}
          onClose={() => setPurchasedItem(null)}
          onViewInFeed={handleViewInFeed}
        />
      )}
    </div>
  )
}
