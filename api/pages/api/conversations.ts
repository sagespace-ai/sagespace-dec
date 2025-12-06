/**
 * GET /api/conversations - Get user's conversations
 * GET /api/conversations/:id - Get conversation with messages
 * DELETE /api/conversations/:id - Delete a conversation
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { createSupabaseAdmin, getAuthenticatedUser } from '../../lib/supabase'
import { ApiResponse } from '../../lib/types'

interface Conversation {
  id: string
  user_id: string
  sage_id: string
  title: string | null
  created_at: string
  updated_at: string
  sage?: {
    id: string
    name: string
    role: string
    avatar: string
  }
  message_count?: number
}

interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

interface ConversationWithMessages extends Conversation {
  messages: Message[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Conversation[] | ConversationWithMessages | null>>
) {
  // Get auth token
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '') || null
  const user = await getAuthenticatedUser(token)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const supabase = createSupabaseAdmin()
  const { id } = req.query

  if (req.method === 'GET') {
    if (id && id !== 'undefined') {
      // Get single conversation with messages
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (convError || !conversation) {
        return res.status(404).json({ error: 'Conversation not found' })
      }

      // Get messages
      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true })

      if (msgError) {
        return res.status(500).json({ error: msgError.message })
      }

      // Get sage info
      const { data: sage } = await supabase
        .from('sages')
        .select('id, name, role, avatar')
        .eq('id', conversation.sage_id)
        .single()

      return res.status(200).json({
        data: {
          ...conversation,
          sage,
          messages: messages || [],
        } as ConversationWithMessages,
      })
    } else {
      // Get all conversations for user
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`
          *,
          sages!inner(id, name, role, avatar)
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(50)

      if (error) {
        return res.status(500).json({ error: error.message })
      }

      // Get message counts for each conversation
      const conversationsWithCounts = await Promise.all(
        (conversations || []).map(async (conv: any) => {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)

          return {
            ...conv,
            sage: conv.sages,
            message_count: count || 0,
          }
        })
      )

      return res.status(200).json({
        data: conversationsWithCounts as Conversation[],
      })
    }
  }

  if (req.method === 'DELETE') {
    if (!id || id === 'undefined') {
      return res.status(400).json({ error: 'Conversation ID required' })
    }

    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({
      data: null,
      message: 'Conversation deleted successfully',
    })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
