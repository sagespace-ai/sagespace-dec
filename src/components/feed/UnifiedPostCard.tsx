import { useState } from 'react'
import { Heart, MessageCircle, Share2, Bookmark, RefreshCw, Check, FolderPlus, Tag, Archive } from 'lucide-react'
import type { FeedItem } from '../../types'
import { Card2035, Card2035Content } from '../ui/Card2035'
import { useFeedInteractions } from '../../hooks/useFeedInteractions'
import { useUIStore } from '../../store/uiStore'
import { useAuth } from '../../contexts/AuthContext'
import { CollectionManager } from '../organization/CollectionManager'
import { TagManager } from '../organization/TagManager'
import { CommentThread } from '../social/CommentThread'
import { OptimizedImage } from '../ui/OptimizedImage'
import { apiService } from '../../services/api'
import { useToast } from '../../contexts/ToastContext'

interface UnifiedPostCardProps {
  item: FeedItem
  onRemixClick?: (item: FeedItem) => void
}

// Simple utility to format timestamps; falls back gracefully
function formatTimestamp(value?: string) {
  if (!value) return 'Just now'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Just now'
  return date.toLocaleString()
}


export function UnifiedPostCard({ item, onRemixClick }: UnifiedPostCardProps) {
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showCollectionManager, setShowCollectionManager] = useState(false)
  const [showTagManager, setShowTagManager] = useState(false)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [isArchived, setIsArchived] = useState(false)

  const { createInteraction } = useFeedInteractions()
  const { selectedFeedItems, toggleFeedItemSelection } = useUIStore()
  const { user: currentUser } = useAuth()
  const { showToast } = useToast()
  const isSelected = selectedFeedItems.includes(item.id)

  // Get author information
  const author = item.author || {
    id: item.user_id,
    name: 'Unknown User',
    email: '',
    avatar: `https://ui-avatars.com/api/?name=User&background=6366f1&color=fff`,
  }
  const isOwnPost = currentUser?.id === item.user_id

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFeedItemSelection(item.id)
  }

  const handleRemix = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onRemixClick) {
      onRemixClick(item)
    }
  }

  const title = item.title || 'New creation in your universe'
  const description = item.description || ''

  const initialLikes = item.likes_count ?? 0
  const initialComments = item.comments_count ?? 0

  const handleLike = async () => {
    const next = !liked
    setLiked(next)

    try {
      await createInteraction({
        feed_item_id: item.id,
        interaction_type: 'like',
      })
    } catch {
      // Revert on error
      setLiked(!next)
    }
  }
  const handleBookmark = () => setBookmarked((prev) => !prev)

  const handleToggleComments = () => setShowComments((prev) => !prev)

  const handleShare = () => {
    createInteraction({
      feed_item_id: item.id,
      interaction_type: 'share',
    }).catch(() => {
      // Sharing is best-effort; ignore failures for now
    })
  }

  const impliedTags = [`#${item.type}`, '#SageSpace']

  return (
    <Card2035 interactive className={isSelected ? 'ring-2 ring-primary' : ''}>
      <Card2035Content>
        <div className="flex items-start gap-4">
          {/* Selection Checkbox */}
          <button
            type="button"
            onClick={handleSelect}
            className={`mt-1 flex h-5 w-5 items-center justify-center rounded border-2 transition-all ${
              isSelected
                ? 'border-primary bg-primary text-white'
                : 'border-gray-300 dark:border-gray-600 hover:border-primary'
            }`}
            aria-label={isSelected ? 'Deselect item' : 'Select item for remix'}
          >
            {isSelected && <Check className="h-3 w-3" />}
          </button>

          {/* Avatar */}
          <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-primary/20">
            {author.avatar ? (
              <img
                src={author.avatar}
                alt={author.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const fallback = target.nextElementSibling as HTMLElement
                  if (fallback) fallback.style.display = 'flex'
                }}
              />
            ) : null}
            <div
              className="w-full h-full bg-gradient-to-tr from-primary/60 to-fuchsia-500/80 flex items-center justify-center text-white font-semibold text-sm"
              style={{ display: author.avatar ? 'none' : 'flex' }}
            >
              {author.name[0]?.toUpperCase() || 'U'}
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-gray-900 dark:text-white truncate">
                    {isOwnPost ? 'You' : author.name}
                  </span>
                  {isOwnPost && (
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                      You
                    </span>
                  )}
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    {item.type}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {formatTimestamp(item.created_at)}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <p className="text-sm text-gray-900 dark:text-gray-100 font-medium break-words">
                {title}
              </p>
              {description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 break-words">
                  {description}
                </p>
              )}

              {item.thumbnail && (
                <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-100 dark:bg-gray-900">
                  <OptimizedImage
                    src={item.thumbnail}
                    alt={title}
                    className="w-full h-auto object-cover"
                    lazy
                    placeholder={item.thumbnail}
                  />
                </div>
              )}
            </div>

            {/* Actions – UX inspired by SS_Vite PostCard, but purely client-side */}
            <div className="flex items-center justify-between pt-1 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleLike}
                  className={`inline-flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary ${
                    liked ? 'text-rose-500' : 'hover:text-rose-500'
                  }`}
                  aria-pressed={liked}
                  aria-label="Like this post"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      liked ? 'fill-current' : ''
                    } transition-transform`}
                  />
                  <span>
                    Appreciate
                    {initialLikes > 0 && (
                      <span className="ml-1 text-[10px] text-gray-400 dark:text-gray-500">
                        · {initialLikes.toLocaleString()}
                      </span>
                    )}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleComments}
                  className={`inline-flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary ${
                    showComments ? 'text-primary' : 'hover:text-primary'
                  }`}
                  aria-pressed={showComments}
                  aria-label="Comment on this post"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>
                    Respond
                    {initialComments > 0 && (
                      <span className="ml-1 text-[10px] text-gray-400 dark:text-gray-500">
                        · {initialComments.toLocaleString()}
                      </span>
                    )}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="hidden sm:inline-flex items-center gap-1 hover:text-emerald-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                  aria-label="Share this post"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>

                <button
                  type="button"
                  onClick={handleRemix}
                  className="inline-flex items-center gap-1 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                  aria-label="Remix this post"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="hidden sm:inline">Remix</span>
                </button>

                {isOwnPost && (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowCollectionManager(!showCollectionManager)}
                      className="hidden sm:inline-flex items-center gap-1 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                      aria-label="Add to collection"
                    >
                      <FolderPlus className="h-4 w-4" />
                      <span>Collection</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowTagManager(!showTagManager)}
                      className="hidden sm:inline-flex items-center gap-1 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                      aria-label="Manage tags"
                    >
                      <Tag className="h-4 w-4" />
                      <span>Tags</span>
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          if (isArchived) {
                            await apiService.unarchiveItem(item.id)
                            setIsArchived(false)
                            showToast('Item unarchived', 'success')
                          } else {
                            await apiService.archiveItem(item.id)
                            setIsArchived(true)
                            showToast('Item archived', 'success')
                          }
                        } catch (error: any) {
                          showToast(error.message || 'Failed to archive item', 'error')
                        }
                      }}
                      className="hidden sm:inline-flex items-center gap-1 hover:text-orange-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                      aria-label={isArchived ? 'Unarchive' : 'Archive'}
                    >
                      <Archive className={`h-4 w-4 ${isArchived ? 'fill-current' : ''}`} />
                      <span>{isArchived ? 'Unarchive' : 'Archive'}</span>
                    </button>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={handleBookmark}
                className={`inline-flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary ${
                  bookmarked ? 'text-amber-500' : 'hover:text-amber-500'
                }`}
                aria-pressed={bookmarked}
                aria-label="Save this post"
              >
                <Bookmark
                  className={`h-4 w-4 ${
                    bookmarked ? 'fill-current' : ''
                  } transition-transform`}
                />
                <span className="hidden sm:inline">Save</span>
              </button>
            </div>

            {/* Implied tags */}
            <div className="flex flex-wrap gap-2 pt-1">
              {impliedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-primary/5 px-2 py-0.5 text-[11px] font-medium text-primary/80"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Enhanced Comments with Threading */}
            {showComments && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <CommentThread
                  feedItemId={item.id}
                  onCommentCountChange={() => {
                    // Comment count updated - could refresh feed if needed
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </Card2035Content>

      {/* Collection Manager */}
      {showCollectionManager && isOwnPost && (
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <CollectionManager
            itemId={item.id}
            onClose={() => setShowCollectionManager(false)}
          />
        </div>
      )}

      {/* Tag Manager */}
      {showTagManager && isOwnPost && (
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <TagManager
            itemId={item.id}
            selectedTagIds={selectedTagIds}
            onTagToggle={(tagId) => {
              setSelectedTagIds((prev) =>
                prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
              )
            }}
            onClose={() => setShowTagManager(false)}
          />
        </div>
      )}
    </Card2035>
  )
}
