import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { User, Edit, Sparkles, Heart, Calendar, TrendingUp } from 'lucide-react'
import Layout from '../components/Layout'
import { Card2035, Card2035Content } from '../components/ui/Card2035'
import { Button2035 } from '../components/ui/Button2035'
import { BackButton } from '../components/navigation/BackButton'
import { FadeIn } from '../components/motion/FadeIn'
import { UnifiedPostCard } from '../components/feed/UnifiedPostCard'
import { FollowButton } from '../components/social/FollowButton'
import { UserListModal } from '../components/social/UserListModal'
import { useFeed } from '../hooks/useFeed'
import { useUser } from '../contexts/UserContext'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { apiService } from '../services/api'
import { useQuery } from '@tanstack/react-query'
import type { FeedItem } from '../types'

export default function Profile() {
  const navigate = useNavigate()
  const { id: profileUserId } = useParams()
  const { user: currentUser, updateUser } = useUser()
  const { user: authUser } = useAuth()
  const { showToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [bio, setBio] = useState('')
  const [name, setName] = useState('')
  const [showFollowers, setShowFollowers] = useState(false)
  const [showFollowing, setShowFollowing] = useState(false)
  const { items } = useFeed({})

  // Determine which user's profile to show
  const isOwnProfile = !profileUserId || profileUserId === currentUser?.id || profileUserId === authUser?.id
  const displayUserId = profileUserId || currentUser?.id || authUser?.id

  // Fetch profile user data if viewing another user's profile
  const { data: profileUser } = useQuery({
    queryKey: ['user', displayUserId],
    queryFn: async () => {
      if (isOwnProfile) return currentUser
      // TODO: Fetch other user's profile
      return null
    },
    enabled: !isOwnProfile && !!displayUserId,
  })

  const user = isOwnProfile ? currentUser : profileUser

  // Fetch followers and following counts
  const { data: followersData } = useQuery({
    queryKey: ['followers', displayUserId],
    queryFn: async () => {
      const { data, error } = await apiService.getFollows(displayUserId, 'followers')
      if (error) throw new Error(error)
      return data || []
    },
    enabled: !!displayUserId,
  })

  const { data: followingData } = useQuery({
    queryKey: ['following', displayUserId],
    queryFn: async () => {
      const { data, error } = await apiService.getFollows(displayUserId, 'following')
      if (error) throw new Error(error)
      return data || []
    },
    enabled: !!displayUserId,
  })

  const followersCount = followersData?.length || 0
  const followingCount = followingData?.length || 0

  // Initialize from user context
  useEffect(() => {
    if (user) {
      setBio(user.bio || '')
      setName(user.name || '')
    }
  }, [user])

  // Filter to show only user's creations
  const userCreations = user ? items.filter((item: FeedItem) => item.user_id === (displayUserId || user.id)) : []

  if (!user) {
    return (
      <Layout>
        <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
          <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 dark:border-gray-700 border-t-primary mb-4"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading profile...</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  const handleSaveProfile = () => {
    updateUser({
      name,
      bio,
    })
    setIsEditing(false)
    showToast('Profile updated successfully', 'success')
  }

  const handleCancelEdit = () => {
    if (user) {
      setBio(user.bio)
      setName(user.name)
    }
    setIsEditing(false)
  }

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Header with Back Button */}
          <div className="flex items-center gap-4 mb-6">
            <BackButton className="md:hidden" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
          </div>

          {/* Profile Header Card */}
          <FadeIn>
            <Card2035 className="mb-6">
              <Card2035Content>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  {/* Avatar */}
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-24 h-24 rounded-full border-4 border-primary/20"
                    />
                    <button
                      onClick={() => setIsEditing(true)}
                      className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-white shadow-lg hover:bg-primary/90 transition-colors"
                      aria-label="Edit profile picture"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {isEditing ? (
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="text-2xl font-bold text-gray-900 dark:text-white bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1"
                          placeholder="Your name"
                        />
                      ) : (
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {user.name}
                        </h2>
                      )}
                      {isOwnProfile ? (
                        <Button2035
                          variant="secondary"
                          size="sm"
                          onClick={isEditing ? handleCancelEdit : () => setIsEditing(true)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          {isEditing ? 'Cancel' : 'Edit Profile'}
                        </Button2035>
                      ) : (
                        <FollowButton userId={displayUserId || ''} userName={user.name} />
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{user.email}</p>
                    
                    {isEditing ? (
                      <div className="space-y-4">
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="w-full p-3 bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white resize-none"
                          rows={3}
                          placeholder="Tell us about yourself..."
                        />
                        <div className="flex gap-2">
                          <Button2035 variant="primary" size="sm" onClick={handleSaveProfile}>
                            Save Changes
                          </Button2035>
                          <Button2035
                            variant="secondary"
                            size="sm"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </Button2035>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-700 dark:text-gray-300">{user.bio}</p>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-4">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {new Date(user.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </Card2035Content>
            </Card2035>
          </FadeIn>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <FadeIn delay={0.1}>
              <Card2035>
                <Card2035Content className="text-center py-4">
                  <Sparkles className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user.stats.creations}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Creations</p>
                </Card2035Content>
              </Card2035>
            </FadeIn>
            <FadeIn delay={0.2}>
              <Card2035>
                <Card2035Content className="text-center py-4">
                  <Heart className="h-6 w-6 text-rose-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user.stats.interactions}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Interactions</p>
                </Card2035Content>
              </Card2035>
            </FadeIn>
            <FadeIn delay={0.3}>
              <Card2035
                interactive
                onClick={() => setShowFollowers(true)}
                className="cursor-pointer"
              >
                <Card2035Content className="text-center py-4">
                  <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {followersCount}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Followers</p>
                </Card2035Content>
              </Card2035>
            </FadeIn>
            <FadeIn delay={0.4}>
              <Card2035
                interactive
                onClick={() => setShowFollowing(true)}
                className="cursor-pointer"
              >
                <Card2035Content className="text-center py-4">
                  <User className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {followingCount}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Following</p>
                </Card2035Content>
              </Card2035>
            </FadeIn>
          </div>

          {/* User's Creations */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                My Creations
              </h3>
              <Button2035 variant="secondary" size="sm" onClick={() => navigate('/create')}>
                <Sparkles className="h-4 w-4 mr-2" />
                Create New
              </Button2035>
            </div>

            {userCreations.length === 0 ? (
              <Card2035>
                <Card2035Content className="text-center py-12">
                  <Sparkles className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    You haven't created anything yet
                  </p>
                  <Button2035 variant="primary" size="md" onClick={() => navigate('/create')}>
                    Create Your First Piece
                  </Button2035>
                </Card2035Content>
              </Card2035>
            ) : (
              <div className="space-y-4">
                {userCreations.map((item, index) => (
                  <FadeIn key={item.id} delay={index * 0.05}>
                    <UnifiedPostCard item={item} />
                  </FadeIn>
                ))}
              </div>
            )}
          </div>

          {/* Followers/Following Modals */}
          <UserListModal
            isOpen={showFollowers}
            onClose={() => setShowFollowers(false)}
            title="Followers"
            users={(followersData || []).map((follow: any) => {
              const user = follow.follower || follow;
              return user && typeof user === 'object' && 'id' in user ? user : null;
            }).filter(Boolean) as any[]}
            isLoading={!followersData}
          />
          <UserListModal
            isOpen={showFollowing}
            onClose={() => setShowFollowing(false)}
            title="Following"
            users={(followingData || []).map((follow: any) => {
              const user = follow.following || follow;
              return user && typeof user === 'object' && 'id' in user ? user : null;
            }).filter(Boolean) as any[]}
            isLoading={!followingData}
          />
        </div>
      </div>
    </Layout>
  )
}
