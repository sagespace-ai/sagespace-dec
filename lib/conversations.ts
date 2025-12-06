import { supabase } from "./db"
import {
  DEMO_MODE,
  getDemoConversations,
  getDemoConversation,
  createDemoConversation,
  addDemoMessage,
} from "@/lib/demo"

export async function createConversation(userId: string, personaId?: string, title?: string) {
  if (DEMO_MODE.enabled) {
    return createDemoConversation(title || "New Conversation", personaId)
  }

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      user_id: userId,
      agent_id: personaId,
      title,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getConversation(conversationId: string, userId: string) {
  if (DEMO_MODE.enabled) {
    return getDemoConversation(conversationId)
  }

  const { data: conversation, error } = await supabase
    .from("conversations")
    .select(`
      *,
      messages:messages(*)
    `)
    .eq("id", conversationId)
    .eq("user_id", userId)
    .single()

  // If conversation doesn't exist or there's an error, return null instead of throwing
  if (error || !conversation) {
    console.warn(`[conversations] Conversation ${conversationId} not found for user ${userId}`)
    return null
  }

  // Sort messages by created_at
  if (conversation?.messages) {
    conversation.messages.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }

  return conversation
}

export async function getUserConversations(userId: string, limit = 50) {
  if (DEMO_MODE.enabled) {
    const convs = getDemoConversations()
    return convs.map((conv) => ({
      ...conv,
      messages: conv.messages.slice(-1),
      messageCount: conv.messages.length,
    }))
  }

  const { data, error } = await supabase
    .from("conversations")
    .select(`
      *,
      messages:messages(*)
    `)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(limit)

  if (error) throw error

  // Get just the latest message for each conversation
  return data?.map((conv: any) => ({
    ...conv,
    messages: conv.messages?.slice(-1) || [],
    messageCount: conv.messages?.length || 0,
  }))
}

export async function addMessage(
  conversationId: string,
  role: string,
  content: string,
  options: {
    name?: string
    tokensIn?: number
    tokensOut?: number
  } = {},
) {
  if (DEMO_MODE.enabled) {
    addDemoMessage(conversationId, role as "user" | "assistant", content)
    return {
      id: `demo-msg-${Date.now()}`,
      conversation_id: conversationId,
      role,
      content,
      created_at: new Date().toISOString(),
    }
  }

  // Create the message
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      role,
      content,
    })
    .select()
    .single()

  if (error) throw error

  // Update conversation's updated_at timestamp
  await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId)

  return data
}

export async function updateConversationTitle(conversationId: string, title: string) {
  const { data, error } = await supabase
    .from("conversations")
    .update({ title })
    .eq("id", conversationId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteConversation(conversationId: string, userId: string) {
  const { error } = await supabase.from("conversations").delete().eq("id", conversationId).eq("user_id", userId)

  if (error) throw error
  return { count: 1 }
}
