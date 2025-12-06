import { useState, useEffect } from 'react'
import { FolderPlus, X, Edit2, Trash2, Plus, Folder } from 'lucide-react'
import { Card2035, Card2035Content, Card2035Header, Card2035Title } from '../ui/Card2035'
import { Button2035 } from '../ui/Button2035'
import { Input2035 } from '../ui/Input2035'
import { apiService } from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { FadeIn } from '../motion/FadeIn'
import LoadingSpinner from '../LoadingSpinner'

interface Collection {
  id: string
  name: string
  description?: string
  color?: string
  icon?: string
  item_count?: number
}

interface CollectionManagerProps {
  itemId?: string
  onCollectionSelect?: (collectionId: string) => void
  onClose?: () => void
}

export function CollectionManager({ itemId, onCollectionSelect, onClose }: CollectionManagerProps) {
  const { showToast } = useToast()
  const [collections, setCollections] = useState<Collection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366f1',
  })

  useEffect(() => {
    loadCollections()
  }, [])

  const loadCollections = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await apiService.getCollections()
      if (error) throw new Error(error)
      setCollections(data || [])
    } catch (error: any) {
      showToast(error.message || 'Failed to load collections', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      showToast('Collection name is required', 'warning')
      return
    }

    try {
      const { data, error } = await apiService.createCollection({
        name: formData.name,
        description: formData.description || undefined,
        color: formData.color,
      })
      if (error) throw new Error(error)
      showToast('Collection created successfully', 'success')
      setShowCreateForm(false)
      setFormData({ name: '', description: '', color: '#6366f1' })
      loadCollections()
      if (data && itemId) {
        // Auto-add item to new collection
        await handleAddToCollection(data.id)
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to create collection', 'error')
    }
  }

  const handleUpdate = async (id: string) => {
    if (!formData.name.trim()) {
      showToast('Collection name is required', 'warning')
      return
    }

    try {
      const { error } = await apiService.updateCollection(id, {
        name: formData.name,
        description: formData.description || undefined,
        color: formData.color,
      })
      if (error) throw new Error(error)
      showToast('Collection updated successfully', 'success')
      setEditingId(null)
      setFormData({ name: '', description: '', color: '#6366f1' })
      loadCollections()
    } catch (error: any) {
      showToast(error.message || 'Failed to update collection', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this collection? Items will not be deleted.')) {
      return
    }

    try {
      const { error } = await apiService.deleteCollection(id)
      if (error) throw new Error(error)
      showToast('Collection deleted successfully', 'success')
      loadCollections()
    } catch (error: any) {
      showToast(error.message || 'Failed to delete collection', 'error')
    }
  }

  const handleAddToCollection = async (collectionId: string) => {
    if (!itemId) return

    try {
      const { error } = await apiService.addItemToCollection(collectionId, itemId)
      if (error) throw new Error(error)
      showToast('Item added to collection', 'success')
      onCollectionSelect?.(collectionId)
      onClose?.()
    } catch (error: any) {
      showToast(error.message || 'Failed to add item to collection', 'error')
    }
  }

  const startEdit = (collection: Collection) => {
    setEditingId(collection.id)
    setFormData({
      name: collection.name,
      description: collection.description || '',
      color: collection.color || '#6366f1',
    })
    setShowCreateForm(true)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setShowCreateForm(false)
    setFormData({ name: '', description: '', color: '#6366f1' })
  }

  return (
    <Card2035>
      <Card2035Header>
        <div className="flex items-center justify-between">
          <Card2035Title className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Collections
          </Card2035Title>
          <div className="flex gap-2">
            {!showCreateForm && (
              <Button2035
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowCreateForm(true)
                  setEditingId(null)
                  setFormData({ name: '', description: '', color: '#6366f1' })
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button2035>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </Card2035Header>
      <Card2035Content>
        {showCreateForm ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name *
              </label>
              <Input2035
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="My Collection"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <Input2035
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="h-10 w-20 rounded border border-gray-300 dark:border-gray-700"
                />
                <Input2035
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#6366f1"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button2035
                variant="primary"
                size="sm"
                onClick={() => editingId ? handleUpdate(editingId) : handleCreate()}
              >
                {editingId ? 'Update' : 'Create'}
              </Button2035>
              <Button2035 variant="secondary" size="sm" onClick={cancelEdit}>
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
            ) : collections.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FolderPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No collections yet</p>
                <p className="text-sm mt-1">Create one to organize your content</p>
              </div>
            ) : (
              <div className="space-y-2">
                {collections.map((collection, index) => (
                  <FadeIn key={collection.id} delay={index * 0.05}>
                    <div
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        itemId
                          ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800'
                          : 'bg-gray-50 dark:bg-gray-900'
                      } border-gray-200 dark:border-gray-800`}
                      onClick={() => itemId && handleAddToCollection(collection.id)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: collection.color || '#6366f1' }}
                        >
                          <Folder className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {collection.name}
                          </h3>
                          {collection.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {collection.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {collection.item_count || 0} item{(collection.item_count || 0) !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      {!itemId && (
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              startEdit(collection)
                            }}
                            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Edit collection"
                          >
                            <Edit2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(collection.id)
                            }}
                            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Delete collection"
                          >
                            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      )}
                    </div>
                  </FadeIn>
                ))}
              </div>
            )}
          </>
        )}
      </Card2035Content>
    </Card2035>
  )
}
