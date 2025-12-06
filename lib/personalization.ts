import type { SageTemplate, StarterConversation } from "@/lib/sage-templates"
import type { UserProfile } from "@/types/user"
import type { ChatMessage } from "@/types/chat"

/**
 * Get personalized starter conversations for a Sage based on user profile
 */
export function getPersonalizedStarterConversations(
  sage: SageTemplate,
  user: UserProfile | null,
  recentMessages: ChatMessage[] = [],
  maxCount: number = 5,
): StarterConversation[] {
  if (!sage.starterConversations || sage.starterConversations.length === 0) {
    return []
  }

  let candidates = [...sage.starterConversations]

  // Filter and rank based on user profile
  if (user) {
    // Score each starter based on relevance
    const scored = candidates.map((starter) => {
      let score = 0

      // Match profession
      if (user.profession) {
        const professionLower = user.profession.toLowerCase()
        const tagsLower = starter.tags?.map((t) => t.toLowerCase()) || []
        const promptLower = starter.prompt.toLowerCase()

        // Science/research professions prefer work-related starters
        if (
          professionLower.includes("scientist") ||
          professionLower.includes("researcher") ||
          professionLower.includes("microbiologist") ||
          professionLower.includes("engineer")
        ) {
          if (tagsLower.includes("work") || tagsLower.includes("stress") || promptLower.includes("work")) {
            score += 3
          }
          if (tagsLower.includes("lab") || promptLower.includes("lab") || promptLower.includes("experiment")) {
            score += 2
          }
        }

        // Students prefer learning/study-related
        if (professionLower.includes("student")) {
          if (tagsLower.includes("learning") || tagsLower.includes("study") || promptLower.includes("study")) {
            score += 3
          }
        }

        // Gamers prefer fun/playful starters
        if (professionLower.includes("gamer") || professionLower.includes("game")) {
          if (tagsLower.includes("fun") || tagsLower.includes("play") || promptLower.includes("game")) {
            score += 3
          }
        }
      }

      // Match interests
      if (user.interests && starter.tags) {
        const interestLower = user.interests.map((i) => i.toLowerCase())
        const tagsLower = starter.tags.map((t) => t.toLowerCase())
        const matches = interestLower.filter((i) => tagsLower.includes(i))
        score += matches.length * 2
      }

      return { starter, score }
    })

    // Sort by score (highest first)
    scored.sort((a, b) => b.score - a.score)
    candidates = scored.map((s) => s.starter)
  }

  // Filter out recently used starters based on conversation history
  if (recentMessages.length > 0) {
    const recentTopics = new Set<string>()
    recentMessages.forEach((msg) => {
      if (msg.authorType === "user" && msg.blocks) {
        const textBlock = msg.blocks.find((b) => b.type === "text")
        if (textBlock && "text" in textBlock) {
          const text = textBlock.text.toLowerCase()
          // Extract key topics from recent messages
          if (text.includes("sleep")) recentTopics.add("sleep")
          if (text.includes("work") || text.includes("workload")) recentTopics.add("work")
          if (text.includes("stress") || text.includes("overwhelmed")) recentTopics.add("stress")
          if (text.includes("exercise") || text.includes("workout")) recentTopics.add("exercise")
          if (text.includes("anxiety") || text.includes("worry")) recentTopics.add("anxiety")
        }
      }
    })

    // Deprioritize starters that match recent topics
    candidates = candidates.map((starter) => {
      const tagsLower = starter.tags?.map((t) => t.toLowerCase()) || []
      const promptLower = starter.prompt.toLowerCase()
      const matchesRecent = tagsLower.some((tag) => recentTopics.has(tag)) || 
                           recentTopics.has(promptLower.split(" ")[0]?.toLowerCase() || "")
      
      return { starter, matchesRecent }
    })
    .sort((a, b) => {
      // Prefer starters that don't match recent topics
      if (a.matchesRecent && !b.matchesRecent) return 1
      if (!a.matchesRecent && b.matchesRecent) return -1
      return 0
    })
    .map((s) => s.starter)
  }

  // Add some randomness to avoid always showing the same ones
  const shuffled = [...candidates]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  // Return top N
  return shuffled.slice(0, maxCount)
}

// NOTE: getUserProfile has been moved to lib/personalization-server.ts
// to avoid importing server-only code (@/lib/supabase/server) in client components.
// Import it from lib/personalization-server.ts if you need it in server components or API routes.

