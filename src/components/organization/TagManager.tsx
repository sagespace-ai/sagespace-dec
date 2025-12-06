import { useState, useEffect } from 'react'
import { Tag, X, Plus, Hash } from 'lucide-react'
import { Card2035, Card2035Content } from '../ui/Card2035'
import { Button2035 } from '../ui/Button2035'
import { Input2035 } from '../ui/Input2035'
import { apiService } from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { FadeIn } from '../motion/FadeIn'
import LoadingSpinner from '../LoadingSpinner'

interface Tag {
  id: string
  name: string
  color?: string
  item_count?: number
}

interface TagManagerProps {
  itemId?: string
  selectedTagIds?: string[]
  onTagToggle?: (tagId: string) => void
  onClose?: () => void
  compact?: boolean
}

export function TagManager({ itemId, selectedTagIds = [], onTagToggle, onClose, compact = false }: TagManagerProps) {
  const { showToast } = useToast()
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#6366f1')

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await apiService.getTags()
      if (error) throw new Error(error)
      setTags(data || [])
    } catch (error: any) {
      showToast(error.message || 'Failed to load tags', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      showToast('Tag name is required', 'warning')
      return
    }

    try {
      const { data, error } = await apiService.createTag({
        name: newTagName.trim(),
        color: newTagColor,
      })
      if (error) throw new Error(error)
      showToast('Tag created successfully', 'success')
      setNewTagName('')
      setNewTagColor('#6366f1')
      setShowCreateForm(false)
      loadTags()
      if (data && itemId) {
        // Auto-add tag to item
        await handleToggleTag(data.id)
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to create tag', 'error')
    }
  }

  const handleToggleTag = async (tagId: string) => {
    if (!itemId) {
      onTagToggle?.(tagId)
      return
    }

    const isSelected = selectedTagIds.includes(tagId)

    try {
      if (isSelected) {
        const { error } = await apiService.removeTagFromItem(itemId, tagId)
        if (error) throw new Error(error)
        showToast('Tag removed', 'success')
      } else {
        const { error } = await apiService.addTagToItem(itemId, tagId)
        if (error) throw new Error(error)
        showToast('Tag added', 'success')
      }
      onTagToggle?.(tagId)
    } catch (error: any) {
      showToast(error.message || 'Failed to update tag', 'error')
    }
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {isLoading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <>
            {tags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id)
              return (
                <button
                  key={tag.id}
                  onClick={() => handleToggleTag(tag.id)}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                  }`}
                  style={isSelected ? { backgroundColor: tag.color || '#6366f1' } : {}}
                >
                  <Hash className="h-3 w-3" />
                  {tag.name}
                </button>
              )
            })}
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
            >
              <Plus className="h-3 w-3" />
              New Tag
            </button>
          </>
        )}
        {showCreateForm && (
          <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
            <Input2035
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Tag name"
              className="text-xs"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateTag()
                } else if (e.key === 'Escape') {
                  setShowCreateForm(false)
                  setNewTagName('')
                }
              }}
            />
            <Button2035 variant="primary" size="sm" onClick={handleCreateTag}>
              Add
            </Button2035>
            <button
              onClick={() => {
                setShowCreateForm(false)
                setNewTagName('')
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card2035>
      <Card2035Content>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Tags
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {showCreateForm ? (
          <div className="space-y-3">
            <Input2035
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Tag name"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 dark:text-gray-300">Color:</label>
              <input
                type="color"
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                className="h-8 w-16 rounded border border-gray-300 dark:border-gray-700"
              />
              <Input2035
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                placeholder="#6366f1"
                className="flex-1"
              />
            </div>
            <div className="flex gap-2">
              <Button2035 variant="primary" size="sm" onClick={handleCreateTag}>
                Create
              </Button2035>
              <Button2035
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowCreateForm(false)
                  setNewTagName('')
                }}
              >
                Cancel
              </Button2035>
            </div>
          </div>
        ) : (
          <>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.map((tag, index) => {
                    const isSelected = selectedTagIds.includes(tag.id)
                    return (
                      <FadeIn key={tag.id} delay={index * 0.05}>
                        <button
                          onClick={() => handleToggleTag(tag.id)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            isSelected
                              ? 'text-white'
                              : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                          }`}
                          style={isSelected ? { backgroundColor: tag.color || '#6366f1' } : {}}
                        >
                          <Hash className="h-4 w-4" />
                          {tag.name}
                          {tag.item_count !== undefined && tag.item_count > 0 && (
                            <span className="ml-1 text-xs opacity-75">
                              ({tag.item_count})
                            </span>
                          )}
                        </button>
                      </FadeIn>
                    )
                  })}
                </div>
                <Button2035
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowCreateForm(true)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create New Tag
                </Button2035>
              </>
            )}
          </>
        )}
      </Card2035Content>
    </Card2035>
  )
}
