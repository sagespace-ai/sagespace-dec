/**
 * ConversationHistory Component
 * 
 * Displays a list of past conversations for a Sage.
 * Allows users to select and resume conversations.
 */

import { useState, useEffect } from 'react'
import { MessageSquare, Trash2, Clock, X } from 'lucide-react'
import { Card2035, Card2035Content } from '../ui/Card2035'
import { FadeIn } from '../motion/FadeIn'
import { apiService } from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import LoadingSpinner from '../LoadingSpinner'

interface Conversation {
  id: string
  title: string | null
  created_at: string
  updated_at: string
  message_count?: number
  sage?: {
    id: string
    name: string
    role: string
    avatar: string
  }
}

interface ConversationHistoryProps {
  sageId: string
  onSelectConversation: (conversationId: string) => void
  currentConversationId?: string
  isOpen: boolean
  onClose: () => void
}

export function ConversationHistory({
  sageId,
  onSelectConversation,
  currentConversationId,
  isOpen,
  onClose,
}: ConversationHistoryProps) {
  const { showToast } = useToast()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadConversations()
    }
  }, [isOpen, sageId])

  const loadConversations = async () => {
    setLoading(true)
    try {
      const { data, error } = await apiService.getConversations()
      if (error) {
        throw new Error(error)
      }

      // Filter conversations for this sage
      const sageConversations = (data || []).filter(
        (conv) => conv.sage_id === sageId
      )
      setConversations(sageConversations)
    } catch (error: any) {
      console.error('Failed to load conversations:', error)
      showToast('Failed to load conversation history', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this conversation?')) {
      return
    }

    setDeletingId(conversationId)
    try {
      const { error } = await apiService.deleteConversation(conversationId)
      if (error) {
        throw new Error(error)
      }

      setConversations((prev) => prev.filter((c) => c.id !== conversationId))
      showToast('Conversation deleted', 'success')

      // If deleted conversation was current, clear it
      if (conversationId === currentConversationId) {
        onSelectConversation('')
      }
    } catch (error: any) {
      console.error('Failed to delete conversation:', error)
      showToast('Failed to delete conversation', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed top-0 right-0 h-full w-full md:w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 z-50 shadow-xl overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Conversation History
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="md" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500 dark:text-gray-400">
                <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs mt-2 opacity-75">
                  Start chatting to see your history here
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv, index) => (
                  <FadeIn key={conv.id} delay={index * 0.05}>
                    <Card2035
                      interactive
                      onClick={() => {
                        onSelectConversation(conv.id)
                        onClose()
                      }}
                      className={`cursor-pointer transition-all ${
                        conv.id === currentConversationId
                          ? 'ring-2 ring-primary'
                          : 'hover:ring-1 hover:ring-primary/50'
                      }`}
                    >
                      <Card2035Content>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <MessageSquare className="h-4 w-4 text-primary flex-shrink-0" />
                              <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {conv.title || 'New Conversation'}
                              </h3>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(conv.updated_at)}
                              </span>
                              {conv.message_count !== undefined && (
                                <span>{conv.message_count} messages</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={(e) => handleDelete(conv.id, e)}
                            disabled={deletingId === conv.id}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 transition-colors flex-shrink-0"
                            aria-label="Delete conversation"
                          >
                            {deletingId === conv.id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </Card2035Content>
                    </Card2035>
                  </FadeIn>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
