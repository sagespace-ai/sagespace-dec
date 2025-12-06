"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { MessageCircle, Reply, Edit2, Trash2, Send, X } from "lucide-react"
import { Card2035, Card2035Content } from "../ui/Card2035"
import { Button2035 } from "../ui/Button2035"
import { Input2035 } from "../ui/Input2035"
import { MentionInput } from "./MentionInput"
import { apiService } from "../../services/api"
import { useToast } from "../../contexts/ToastContext"
import { useAuth } from "../../contexts/AuthContext"
import { formatDistanceToNow } from "../../utils/date"
import { FadeIn } from "../motion/FadeIn"
import LoadingSpinner from "../LoadingSpinner"

interface Comment {
  id: string
  feed_item_id: string
  user_id: string
  parent_id?: string
  content: string
  created_at: string
  updated_at: string
  author?: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  replies?: Comment[]
  replies_count?: number
}

interface CommentThreadProps {
  feedItemId: string
  onCommentCountChange?: (count: number) => void
}

export function CommentThread({ feedItemId, onCommentCountChange }: CommentThreadProps) {
  const { user: currentUser } = useAuth()
  const { showToast } = useToast()
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [commentInput, setCommentInput] = useState("")
  const [replyInput, setReplyInput] = useState<Record<string, string>>({})

  useEffect(() => {
    loadComments()
  }, [feedItemId])

  const loadComments = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await apiService.getComments(feedItemId)
      if (error) throw new Error(error)
      const commentsData = Array.isArray(data) ? data : (data as any)?.comments || []
      setComments(commentsData)
      onCommentCountChange?.(commentsData.length || 0)
    } catch (error: any) {
      showToast(error.message || "Failed to load comments", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentInput.trim()) return

    try {
      const { error } = await apiService.createComment({
        feed_item_id: feedItemId,
        content: commentInput.trim(),
      })
      if (error) throw new Error(error)
      showToast("Comment posted", "success")
      setCommentInput("")
      loadComments()
    } catch (error: any) {
      showToast(error.message || "Failed to post comment", "error")
    }
  }

  const handleSubmitReply = async (parentId: string) => {
    const replyText = replyInput[parentId]?.trim()
    if (!replyText) return

    try {
      const { error } = await apiService.createComment({
        feed_item_id: feedItemId,
        content: replyText,
        parent_comment_id: parentId,
      })
      if (error) throw new Error(error)
      showToast("Reply posted", "success")
      setReplyInput({ ...replyInput, [parentId]: "" })
      setReplyingTo(null)
      loadComments()
    } catch (error: any) {
      showToast(error.message || "Failed to post reply", "error")
    }
  }

  const handleUpdateComment = async (commentId: string, content: string) => {
    try {
      const { error } = await apiService.updateComment(commentId, content)
      if (error) throw new Error(error)
      showToast("Comment updated", "success")
      setEditingId(null)
      loadComments()
    } catch (error: any) {
      showToast(error.message || "Failed to update comment", "error")
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return
    }

    try {
      const { error } = await apiService.deleteComment(commentId)
      if (error) throw new Error(error)
      showToast("Comment deleted", "success")
      loadComments()
    } catch (error: any) {
      showToast(error.message || "Failed to delete comment", "error")
    }
  }

  const renderComment = (comment: Comment, isReply = false) => {
    const isOwnComment = currentUser?.id === comment.user_id
    const isEditing = editingId === comment.id

    return (
      <div key={comment.id} className={isReply ? "ml-8 mt-3" : "mt-4"}>
        <Card2035 className={isReply ? "bg-gray-50 dark:bg-gray-900" : ""}>
          <Card2035Content>
            <div className="flex items-start gap-3">
              {comment.author?.avatar ? (
                <img
                  src={comment.author.avatar || "/placeholder.svg"}
                  alt={comment.author.name}
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-primary">
                    {comment.author?.name?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">
                    {comment.author?.name || "Unknown User"}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    {formatDistanceToNow(new Date(comment.created_at))} ago
                  </span>
                </div>
                {isEditing ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const content = (e.target as any).content.value
                      if (content.trim()) {
                        handleUpdateComment(comment.id, content.trim())
                      }
                    }}
                    className="space-y-2"
                  >
                    <Input2035 name="content" defaultValue={comment.content} autoFocus className="text-sm" />
                    <div className="flex gap-2">
                      <Button2035 variant="primary" size="sm" type="submit">
                        Save
                      </Button2035>
                      <Button2035 variant="secondary" size="sm" type="button" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button2035>
                    </div>
                  </form>
                ) : (
                  <>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                    <div className="flex items-center gap-3 mt-2">
                      {!isReply && (
                        <button
                          onClick={() => {
                            setReplyingTo(replyingTo === comment.id ? null : comment.id)
                            setReplyInput({ ...replyInput, [comment.id]: "" })
                          }}
                          className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary flex items-center gap-1"
                        >
                          <Reply className="h-3 w-3" />
                          Reply
                          {comment.replies_count && comment.replies_count > 0 && <span>({comment.replies_count})</span>}
                        </button>
                      )}
                      {isOwnComment && (
                        <>
                          <button
                            onClick={() => setEditingId(comment.id)}
                            className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary flex items-center gap-1"
                          >
                            <Edit2 className="h-3 w-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Reply Input */}
            {replyingTo === comment.id && !isReply && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSubmitReply(comment.id)
                  }}
                  className="flex gap-2"
                >
                  <MentionInput
                    value={replyInput[comment.id] || ""}
                    onChange={(value) => setReplyInput({ ...replyInput, [comment.id]: value })}
                    placeholder="Write a reply... (use @ to mention)"
                    onMention={handleMention}
                    className="flex-1 text-sm"
                  />
                  <Button2035 variant="primary" size="sm" type="submit">
                    <Send className="h-4 w-4" />
                  </Button2035>
                  <Button2035
                    variant="secondary"
                    size="sm"
                    type="button"
                    onClick={() => {
                      setReplyingTo(null)
                      setReplyInput({ ...replyInput, [comment.id]: "" })
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button2035>
                </form>
              </div>
            )}

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-3 space-y-2">{comment.replies.map((reply) => renderComment(reply, true))}</div>
            )}
          </Card2035Content>
        </Card2035>
      </div>
    )
  }

  const handleMention = (userId: string, userName: string) => {
    // Mention detected - could create mention record here
    console.log(`Mentioned ${userName} (${userId})`)
  }

  return (
    <div className="space-y-4">
      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="flex gap-2">
        <MentionInput
          value={commentInput}
          onChange={setCommentInput}
          placeholder="Write a comment... (use @ to mention)"
          onMention={handleMention}
          className="flex-1"
        />
        <Button2035 variant="primary" size="md" type="submit" disabled={!commentInput.trim()}>
          <Send className="h-4 w-4 mr-1" />
          Post
        </Button2035>
      </form>

      {/* Comments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {comments.map((comment, index) => (
            <FadeIn key={comment.id} delay={index * 0.05}>
              {renderComment(comment)}
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  )
}
