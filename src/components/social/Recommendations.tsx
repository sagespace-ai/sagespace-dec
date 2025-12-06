import { useNavigate } from 'react-router-dom'
import { Users, TrendingUp, Sparkles } from 'lucide-react'
import { Card2035, Card2035Content, Card2035Header, Card2035Title } from '../ui/Card2035'
import { FollowButton } from './FollowButton'
import { apiService } from '../../services/api'
import { useQuery } from '@tanstack/react-query'
import { FadeIn } from '../motion/FadeIn'
import LoadingSpinner from '../LoadingSpinner'
import { EmptyState } from '../ui/EmptyState'

interface UserRecommendation {
  id: string
  name: string
  email: string
  avatar?: string
  reason: string
  mutual_followers?: number
}

interface ContentRecommendation {
  id: string
  title: string
  type: string
  thumbnail?: string
  author?: {
    id: string
    name: string
    avatar?: string
  }
  reason: string
}

export function Recommendations() {
  const navigate = useNavigate()
  // const { showToast } = useToast()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => {
      const { data, error } = await apiService.customRequest<{
        users: UserRecommendation[]
        content: ContentRecommendation[]
      }>('/recommendations')
      if (error) throw new Error(error)
      return data || { users: [], content: [] }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  const users = data?.users || []
  const content = data?.content || []

  return (
    <div className="space-y-6">
      {/* User Recommendations */}
      <Card2035>
        <Card2035Header>
          <Card2035Title className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            People You May Know
          </Card2035Title>
        </Card2035Header>
        <Card2035Content>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : error ? (
            <EmptyState
              icon={<Users className="h-8 w-8 text-gray-400" />}
              title="Failed to Load Recommendations"
              description={error instanceof Error ? error.message : 'An error occurred'}
              action={{
                label: 'Try Again',
                onClick: () => refetch(),
              }}
            />
          ) : users.length === 0 ? (
            <EmptyState
              icon={<Users className="h-8 w-8 text-gray-400" />}
              title="No Recommendations"
              description="Start following people to get personalized recommendations"
            />
          ) : (
            <div className="space-y-3">
              {users.map((user, index) => (
                <FadeIn key={user.id} delay={index * 0.05}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <div
                      className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                      onClick={() => navigate(`/profile/${user.id}`)}
                    >
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-primary">
                            {user.name[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {user.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.reason}
                        </p>
                      </div>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <FollowButton userId={user.id} userName={user.name} size="sm" />
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          )}
        </Card2035Content>
      </Card2035>

      {/* Content Recommendations */}
      <Card2035>
        <Card2035Header>
          <Card2035Title className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trending Content
          </Card2035Title>
        </Card2035Header>
        <Card2035Content>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : content.length === 0 ? (
            <EmptyState
              icon={<Sparkles className="h-8 w-8 text-gray-400" />}
              title="No Trending Content"
              description="Check back later for trending content"
            />
          ) : (
            <div className="space-y-3">
              {content.map((item, index) => (
                <FadeIn key={item.id} delay={index * 0.05}>
                  <div
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => navigate('/home')}
                  >
                    {item.thumbnail && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-1">
                        {item.title}
                      </h3>
                      {item.author && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">
                          by {item.author.name}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.reason}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          )}
        </Card2035Content>
      </Card2035>
    </div>
  )
}
