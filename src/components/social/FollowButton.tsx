import { useState, useEffect } from 'react'
import { UserPlus, UserCheck, Loader2 } from 'lucide-react'
import { Button2035 } from '../ui/Button2035'
import { apiService } from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { useAuth } from '../../contexts/AuthContext'

interface FollowButtonProps {
  userId: string
  userName?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

export function FollowButton({ userId, userName, variant = 'secondary', size = 'md', showIcon = true }: FollowButtonProps) {
  const { user: currentUser } = useAuth()
  const { showToast } = useToast()
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isToggling, setIsToggling] = useState(false)

  useEffect(() => {
    if (!currentUser || currentUser.id === userId) {
      setIsLoading(false)
      return
    }

    checkFollowStatus()
  }, [currentUser, userId])

  const checkFollowStatus = async () => {
    try {
      const { data, error } = await apiService.getFollows(userId, 'followers')
      if (error) throw new Error(error)
      
      const isFollowed = (data || []).some(
        (follow) => follow.follower_id === currentUser?.id
      )
      setIsFollowing(isFollowed)
    } catch (error: any) {
      console.error('Failed to check follow status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleFollow = async () => {
    if (!currentUser || currentUser.id === userId) return

    setIsToggling(true)
    try {
      if (isFollowing) {
        const { error } = await apiService.unfollowUser(userId)
        if (error) throw new Error(error)
        setIsFollowing(false)
        showToast(`Unfollowed ${userName || 'user'}`, 'success')
      } else {
        const { error } = await apiService.followUser(userId)
        if (error) throw new Error(error)
        setIsFollowing(true)
        showToast(`Following ${userName || 'user'}`, 'success')
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to update follow status', 'error')
    } finally {
      setIsToggling(false)
    }
  }

  // Don't show button for own profile
  if (!currentUser || currentUser.id === userId) {
    return null
  }

  if (isLoading) {
    return (
      <Button2035 variant={variant} size={size} disabled>
        <Loader2 className="h-4 w-4 animate-spin mr-1" />
        Loading...
      </Button2035>
    )
  }

  return (
    <Button2035
      variant={variant}
      size={size}
      onClick={handleToggleFollow}
      disabled={isToggling}
    >
      {isToggling ? (
        <Loader2 className="h-4 w-4 animate-spin mr-1" />
      ) : showIcon ? (
        isFollowing ? (
          <UserCheck className="h-4 w-4 mr-1" />
        ) : (
          <UserPlus className="h-4 w-4 mr-1" />
        )
      ) : null}
      {isFollowing ? 'Following' : 'Follow'}
    </Button2035>
  )
}
