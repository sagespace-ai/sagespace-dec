import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Folder, FolderPlus } from 'lucide-react'
import Layout from '../components/Layout'
import { Card2035, Card2035Content, Card2035Header, Card2035Title } from '../components/ui/Card2035'
import { BackButton } from '../components/navigation/BackButton'
import { CollectionManager } from '../components/organization/CollectionManager'
import { UnifiedPostCard } from '../components/feed/UnifiedPostCard'
import { apiService } from '../services/api'
import { useQuery } from '@tanstack/react-query'
import { EmptyState } from '../components/ui/EmptyState'
import { FadeIn } from '../components/motion/FadeIn'
import LoadingSpinner from '../components/LoadingSpinner'
import type { FeedItem } from '../types'

export default function Collections() {
  const { id } = useParams()
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(id || null)

  const { data: collections, isLoading: collectionsLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const { data, error } = await apiService.getCollections()
      if (error) throw new Error(error)
      return data || []
    },
  })

  const { data: items, isLoading: itemsLoading } = useQuery({
    queryKey: ['collection-items', selectedCollectionId],
    queryFn: async () => {
      if (!selectedCollectionId) return []
      const { data, error } = await apiService.getCollectionItems(selectedCollectionId)
      if (error) throw new Error(error)
      return data || []
    },
    enabled: !!selectedCollectionId,
  })

  if (collectionsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    )
  }

  const selectedCollection = collections?.find((c) => c.id === selectedCollectionId)

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200/10 dark:border-gray-800 pb-6 mb-6">
            <div className="flex items-center gap-4">
              <BackButton className="md:hidden" />
              <div>
                <h1 className="text-3xl font-black leading-tight tracking-tight text-gray-900 dark:text-white">
                  Collections
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Organize your content into collections
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Collections List */}
            <div className="lg:col-span-1">
              <Card2035>
                <Card2035Header>
                  <Card2035Title className="flex items-center gap-2">
                    <Folder className="h-5 w-5" />
                    Your Collections
                  </Card2035Title>
                </Card2035Header>
                <Card2035Content>
                  <div className="space-y-2">
                    {collections && collections.length > 0 ? (
                      collections.map((collection, index) => (
                        <FadeIn key={collection.id} delay={index * 0.05}>
                          <button
                            onClick={() => setSelectedCollectionId(collection.id)}
                            className={`w-full text-left p-3 rounded-lg border transition-colors ${
                              selectedCollectionId === collection.id
                                ? 'bg-primary/10 border-primary'
                                : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                          >
                            <div className="flex items-center gap-3">
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
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                                  {collection.item_count || 0} item{(collection.item_count || 0) !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                          </button>
                        </FadeIn>
                      ))
                    ) : (
                      <EmptyState
                        icon={<FolderPlus className="h-8 w-8 text-gray-400" />}
                        title="No Collections"
                        description="Create a collection to organize your content"
                      />
                    )}
                  </div>
                </Card2035Content>
              </Card2035>

              {/* Collection Manager */}
              <div className="mt-6">
                <CollectionManager />
              </div>
            </div>

            {/* Collection Items */}
            <div className="lg:col-span-2">
              {selectedCollectionId ? (
                <>
                  {selectedCollection && (
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: selectedCollection.color || '#6366f1' }}
                        >
                          <Folder className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {selectedCollection.name}
                          </h2>
                          {selectedCollection.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {selectedCollection.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {itemsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <LoadingSpinner size="lg" />
                    </div>
                  ) : items && items.length > 0 ? (
                    <div className="space-y-4">
                      {items.map((item: FeedItem, index: number) => (
                        <FadeIn key={item.id} delay={index * 0.05}>
                          <UnifiedPostCard item={item} />
                        </FadeIn>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={<Folder className="h-8 w-8 text-gray-400" />}
                      title="Empty Collection"
                      description="This collection doesn't have any items yet. Add items from your feed to get started."
                    />
                  )}
                </>
              ) : (
                <EmptyState
                  icon={<Folder className="h-8 w-8 text-gray-400" />}
                  title="Select a Collection"
                  description="Choose a collection from the list to view its items, or create a new one."
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
