import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react'
import Layout from '../components/Layout'
import { Card2035, Card2035Content } from '../components/ui/Card2035'
import { Button2035 } from '../components/ui/Button2035'
import { BackButton } from '../components/navigation/BackButton'
import { FadeIn } from '../components/motion/FadeIn'
import { EmptyState } from '../components/ui/EmptyState'
import { apiService } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import LoadingSpinner from '../components/LoadingSpinner'

interface Purchase {
  id: string
  user_id: string
  item_id: string
  stripe_session_id: string | null
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  purchased_at: string
  created_at: string
  updated_at: string
}

export default function PurchaseHistory() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all')

  useEffect(() => {
    fetchPurchases()
  }, [])

  const fetchPurchases = async () => {
    setLoading(true)
    try {
      const { data, error } = await apiService.getPurchases()
      if (error) {
        throw new Error(error)
      }
      setPurchases(data || [])
    } catch (error: any) {
      console.error('Failed to fetch purchases:', error)
      showToast(error.message || 'Failed to load purchase history', 'error')
    } finally {
      setLoading(false)
    }
  }

  const filteredPurchases = purchases.filter((purchase) => {
    if (filter === 'all') return true
    return purchase.status === filter
  })

  const getStatusIcon = (status: Purchase['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'refunded':
        return <RefreshCw className="h-5 w-5 text-gray-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusLabel = (status: Purchase['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'pending':
        return 'Pending'
      case 'failed':
        return 'Failed'
      case 'refunded':
        return 'Refunded'
      default:
        return status
    }
  }

  const getStatusColor = (status: Purchase['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20'
      case 'failed':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
      case 'refunded':
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20'
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const totalSpent = purchases
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0)

  const completedCount = purchases.filter((p) => p.status === 'completed').length

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200/10 dark:border-gray-800 pb-6 mb-6">
            <div className="flex items-center gap-4">
              <BackButton className="md:hidden" />
              <div>
                <h1 className="text-3xl font-black leading-tight tracking-tight text-gray-900 dark:text-white">
                  Purchase History
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {completedCount} completed purchase{completedCount !== 1 ? 's' : ''} • ${totalSpent.toFixed(2)} total spent
                </p>
              </div>
            </div>
            <Button2035 variant="secondary" size="sm" onClick={fetchPurchases} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button2035>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card2035>
              <Card2035Content className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      ${totalSpent.toFixed(2)}
                    </p>
                  </div>
                  <ShoppingBag className="h-8 w-8 text-primary opacity-50" />
                </div>
              </Card2035Content>
            </Card2035>
            <Card2035>
              <Card2035Content className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {completedCount}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
                </div>
              </Card2035Content>
            </Card2035>
            <Card2035>
              <Card2035Content className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Purchases</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {purchases.length}
                    </p>
                  </div>
                  <ShoppingBag className="h-8 w-8 text-primary opacity-50" />
                </div>
              </Card2035Content>
            </Card2035>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/20'
              }`}
            >
              All ({purchases.length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/20'
              }`}
            >
              Completed ({purchases.filter((p) => p.status === 'completed').length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/20'
              }`}
            >
              Pending ({purchases.filter((p) => p.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('failed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'failed'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/20'
              }`}
            >
              Failed ({purchases.filter((p) => p.status === 'failed').length})
            </button>
          </div>

          {/* Purchases List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredPurchases.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag />}
              title="No purchases found"
              description={
                filter === 'all'
                  ? "You haven't made any purchases yet. Visit the marketplace to get started!"
                  : `No ${filter} purchases found.`
              }
              action={{
                label: 'Browse Marketplace',
                onClick: () => navigate('/marketplace'),
              }}
            />
          ) : (
            <div className="space-y-3">
              {filteredPurchases.map((purchase, index) => (
                <FadeIn key={purchase.id} delay={index * 0.05}>
                  <Card2035 interactive>
                    <Card2035Content>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                            {getStatusIcon(purchase.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                Item #{purchase.item_id.substring(0, 8)}
                              </h3>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                                  purchase.status
                                )}`}
                              >
                                {getStatusLabel(purchase.status)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {formatDate(purchase.purchased_at)}
                            </p>
                            {purchase.stripe_session_id && (
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                Session: {purchase.stripe_session_id.substring(0, 20)}...
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            ${purchase.amount.toFixed(2)}
                          </p>
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
    </Layout>
  )
}
