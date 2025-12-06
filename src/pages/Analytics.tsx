import { useState } from 'react'
import { TrendingUp, Eye, Heart, MessageCircle, Share2, Users, BarChart3, Sparkles, Download } from 'lucide-react'
import Layout from '../components/Layout'
import { Card2035, Card2035Content, Card2035Header, Card2035Title } from '../components/ui/Card2035'
import { BackButton } from '../components/navigation/BackButton'
import { FadeIn } from '../components/motion/FadeIn'
import { useQuery } from '@tanstack/react-query'
import { apiService } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { EmptyState } from '../components/ui/EmptyState'
import { formatDistanceToNow } from '../utils/date'

interface ContentMetrics {
  total_posts: number
  total_likes: number
  total_comments: number
  total_shares: number
  total_views: number
  average_engagement_rate: number
}

interface EngagementTrend {
  date: string
  likes: number
  comments: number
  shares: number
  views: number
}

interface TopContent {
  id: string
  title: string
  type: string
  thumbnail?: string
  likes_count: number
  comments_count: number
  shares_count: number
  views: number
  created_at: string
}

interface AnalyticsData {
  content_metrics: ContentMetrics
  engagement_trends: EngagementTrend[]
  top_content: TopContent[]
  follower_growth: {
    current: number
    change_7d: number
    change_30d: number
  }
  engagement_by_type: {
    type: string
    count: number
    avg_engagement: number
  }[]
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d')
  const [exporting, setExporting] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const { data, error } = await apiService.customRequest<AnalyticsData>('/analytics')
      if (error) throw new Error(error)
      return data
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  if (isLoading) {
    return (
      <Layout>
        <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
          <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
          <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <EmptyState
              icon={<BarChart3 className="h-12 w-12 text-gray-400" />}
              title="Failed to Load Analytics"
              description={error instanceof Error ? error.message : 'An error occurred'}
            />
          </div>
        </div>
      </Layout>
    )
  }

  const { content_metrics, engagement_trends, top_content, follower_growth, engagement_by_type } = data

  // Filter trends based on time range
  const filteredTrends = engagement_trends.filter((trend) => {
    const trendDate = new Date(trend.date)
    const now = new Date()
    if (timeRange === '7d') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return trendDate >= sevenDaysAgo
    } else if (timeRange === '30d') {
      return true // Already filtered to 30 days
    }
    return true
  })

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <BackButton className="md:hidden" />
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Track your content performance and engagement
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  setExporting(true)
                  try {
                    const { data } = await apiService.exportAnalytics('csv', timeRange)
                    if (data) {
                      const blob = new Blob([data], { type: 'text/csv' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `analytics-${Date.now()}.csv`
                      a.click()
                      URL.revokeObjectURL(url)
                    }
                  } catch (error) {
                    console.error('Export failed:', error)
                  } finally {
                    setExporting(false)
                  }
                }}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                aria-label="Export as CSV"
              >
                <Download size={16} />
                {exporting ? 'Exporting...' : 'Export CSV'}
              </button>
              <button
                onClick={async () => {
                  setExporting(true)
                  try {
                    const { data } = await apiService.exportAnalytics('json', timeRange)
                    if (data) {
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `analytics-${Date.now()}.json`
                      a.click()
                      URL.revokeObjectURL(url)
                    }
                  } catch (error) {
                    console.error('Export failed:', error)
                  } finally {
                    setExporting(false)
                  }
                }}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                aria-label="Export as JSON"
              >
                <Download size={16} />
                Export JSON
              </button>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="mb-6 flex gap-2">
            {(['7d', '30d', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/20'
                }`}
              >
                {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'All Time'}
              </button>
            ))}
          </div>

          {/* Content Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <FadeIn delay={0.1}>
              <Card2035>
                <Card2035Content className="text-center py-4">
                  <Sparkles className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {content_metrics.total_posts}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Posts</p>
                </Card2035Content>
              </Card2035>
            </FadeIn>
            <FadeIn delay={0.2}>
              <Card2035>
                <Card2035Content className="text-center py-4">
                  <Eye className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {content_metrics.total_views.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Views</p>
                </Card2035Content>
              </Card2035>
            </FadeIn>
            <FadeIn delay={0.3}>
              <Card2035>
                <Card2035Content className="text-center py-4">
                  <Heart className="h-6 w-6 text-rose-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {content_metrics.total_likes.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Likes</p>
                </Card2035Content>
              </Card2035>
            </FadeIn>
            <FadeIn delay={0.4}>
              <Card2035>
                <Card2035Content className="text-center py-4">
                  <MessageCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {content_metrics.total_comments.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Comments</p>
                </Card2035Content>
              </Card2035>
            </FadeIn>
            <FadeIn delay={0.5}>
              <Card2035>
                <Card2035Content className="text-center py-4">
                  <Share2 className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {content_metrics.total_shares.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Shares</p>
                </Card2035Content>
              </Card2035>
            </FadeIn>
            <FadeIn delay={0.6}>
              <Card2035>
                <Card2035Content className="text-center py-4">
                  <TrendingUp className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {content_metrics.average_engagement_rate.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Avg Engagement</p>
                </Card2035Content>
              </Card2035>
            </FadeIn>
          </div>

          {/* Follower Growth */}
          <FadeIn delay={0.2}>
            <Card2035 className="mb-6">
              <Card2035Header>
                <Card2035Title className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Follower Growth
                </Card2035Title>
              </Card2035Header>
              <Card2035Content>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {follower_growth.current}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      +{follower_growth.change_7d}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Last 7 Days</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      +{follower_growth.change_30d}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Last 30 Days</p>
                  </div>
                </div>
              </Card2035Content>
            </Card2035>
          </FadeIn>

          {/* Engagement Trends Chart */}
          <FadeIn delay={0.3}>
            <Card2035 className="mb-6">
              <Card2035Header>
                <Card2035Title className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Engagement Trends
                </Card2035Title>
              </Card2035Header>
              <Card2035Content>
                <div className="h-64 flex items-end justify-between gap-1">
                  {filteredTrends.map((trend, index) => {
                    const maxValue = Math.max(
                      ...filteredTrends.map((t) => t.likes + t.comments + t.shares + t.views)
                    )
                    const height = maxValue > 0 ? ((trend.likes + trend.comments + trend.shares + trend.views) / maxValue) * 100 : 0
                    const date = new Date(trend.date)
                    // const isWeekend = date.getDay() === 0 || date.getDay() === 6

                    return (
                      <div
                        key={trend.date}
                        className="flex-1 flex flex-col items-center group relative"
                        title={`${date.toLocaleDateString()}: ${trend.likes + trend.comments + trend.shares + trend.views} engagements`}
                      >
                        <div
                          className="w-full bg-primary rounded-t transition-all hover:opacity-80"
                          style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0' }}
                        />
                        {index % 7 === 0 && (
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 transform -rotate-45 origin-left">
                            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-primary rounded" />
                    <span>Total Engagement</span>
                  </div>
                </div>
              </Card2035Content>
            </Card2035>
          </FadeIn>

          {/* Top Performing Content */}
          <FadeIn delay={0.4}>
            <Card2035 className="mb-6">
              <Card2035Header>
                <Card2035Title>Top Performing Content</Card2035Title>
              </Card2035Header>
              <Card2035Content>
                {top_content.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No content yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {top_content.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          {item.thumbnail ? (
                            <img
                              src={item.thumbnail}
                              alt={item.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Sparkles className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {item.title}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDistanceToNow(new Date(item.created_at))} ago
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-rose-500">
                            <Heart className="h-4 w-4" />
                            <span>{item.likes_count}</span>
                          </div>
                          <div className="flex items-center gap-1 text-green-500">
                            <MessageCircle className="h-4 w-4" />
                            <span>{item.comments_count}</span>
                          </div>
                          <div className="flex items-center gap-1 text-purple-500">
                            <Share2 className="h-4 w-4" />
                            <span>{item.shares_count}</span>
                          </div>
                          <div className="flex items-center gap-1 text-blue-500">
                            <Eye className="h-4 w-4" />
                            <span>{item.views}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card2035Content>
            </Card2035>
          </FadeIn>

          {/* Engagement by Type */}
          <FadeIn delay={0.5}>
            <Card2035>
              <Card2035Header>
                <Card2035Title>Engagement by Content Type</Card2035Title>
              </Card2035Header>
              <Card2035Content>
                {engagement_by_type.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No data available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {engagement_by_type.map((type) => {
                      const maxEngagement = Math.max(...engagement_by_type.map((t) => t.avg_engagement))
                      const width = maxEngagement > 0 ? (type.avg_engagement / maxEngagement) * 100 : 0

                      return (
                        <div key={type.type}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                              {type.type}
                            </span>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-semibold">{type.avg_engagement.toFixed(1)}</span> avg engagement
                              <span className="ml-2 text-xs">({type.count} posts)</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${width}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </Card2035Content>
            </Card2035>
          </FadeIn>
        </div>
      </div>
    </Layout>
  )
}
