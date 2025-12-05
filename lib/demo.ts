// Demo mode utilities and mock data generators

export const DEMO_MODE = {
  enabled: !process.env.DATABASE_URL || !process.env.OPENAI_API_KEY,
  userId: "demo-user-123",
  userName: "Demo User",
  userEmail: "demo@sagespace.ai",
}

export interface DemoConversation {
  id: string
  userId: string
  title: string
  personaId?: string
  createdAt: Date
  messages: Array<{
    id: string
    role: "user" | "assistant"
    content: string
    createdAt: Date
  }>
}

// In-memory stores for demo mode
const demoConversations: DemoConversation[] = []
let demoCredits = 200
let demoXP = 50

export function getDemoConversations(): DemoConversation[] {
  return demoConversations
}

export function getDemoConversation(id: string): DemoConversation | null {
  return demoConversations.find((c) => c.id === id) || null
}

export function createDemoConversation(title: string, personaId?: string): DemoConversation {
  const conversation: DemoConversation = {
    id: `demo-conv-${Date.now()}`,
    userId: DEMO_MODE.userId,
    title,
    personaId,
    createdAt: new Date(),
    messages: [],
  }
  demoConversations.push(conversation)
  return conversation
}

export function addDemoMessage(conversationId: string, role: "user" | "assistant", content: string): void {
  const conversation = demoConversations.find((c) => c.id === conversationId)
  if (conversation) {
    conversation.messages.push({
      id: `demo-msg-${Date.now()}`,
      role,
      content,
      createdAt: new Date(),
    })
  }
}

export function generateMockResponse(userMessage: string, personaName?: string): string {
  const sage = personaName || "Sage"

  if (userMessage.toLowerCase().includes("hello") || userMessage.toLowerCase().includes("hi")) {
    return `Hello! I'm ${sage}, your AI companion. I'm running in demo mode, so I'll provide simulated responses. How can I help you today?`
  }

  if (userMessage.toLowerCase().includes("how are you")) {
    return `I'm doing well, thank you for asking! As a demo instance, I'm here to show you how SageSpace works. What would you like to explore?`
  }

  if (userMessage.toLowerCase().includes("what can you do")) {
    return `In demo mode, I can simulate conversations, show you the UI, and demonstrate SageSpace features. For real AI responses, you'd need to configure API keys. Would you like to learn more about any specific feature?`
  }

  return `[Demo Mode] This is a simulated response from ${sage}. In production with real API keys, I would analyze your question "${userMessage.slice(0, 50)}..." and provide a thoughtful, AI-generated answer. The UI and conversation flow work exactly the same - only the content generation is mocked.`
}

export function getDemoCredits(): number {
  return demoCredits
}

export function debitDemoCredits(amount: number): boolean {
  if (demoCredits >= amount) {
    demoCredits -= amount
    return true
  }
  return false
}

export function getDemoXP(): number {
  return demoXP
}

export function awardDemoXP(amount: number): void {
  demoXP += amount
}

export const DEMO_PERSONAS = [
  {
    id: "demo-persona-wellness",
    name: "Dr. Wellness",
    emoji: "🧘",
    domain: "Health & Mindfulness",
    specialty: "Mental health, meditation, wellness coaching",
    systemPrompt: "You are Dr. Wellness, a compassionate health and mindfulness coach.",
  },
  {
    id: "demo-persona-einstein",
    name: "Prof. Einstein",
    emoji: "🔬",
    domain: "Science & Research",
    specialty: "Physics, mathematics, scientific reasoning",
    systemPrompt: "You are Prof. Einstein, a brilliant scientist who explains complex topics clearly.",
  },
  {
    id: "demo-persona-chef",
    name: "Chef Gourmet",
    emoji: "👨‍🍳",
    domain: "Culinary Arts",
    specialty: "Cooking, recipes, nutrition",
    systemPrompt: "You are Chef Gourmet, a master chef with expertise in world cuisines.",
  },
  {
    id: "demo-persona-coach",
    name: "Coach Alpha",
    emoji: "💪",
    domain: "Fitness & Athletics",
    specialty: "Training, motivation, sports psychology",
    systemPrompt: "You are Coach Alpha, an inspiring fitness coach and motivator.",
  },
  {
    id: "demo-persona-harmony",
    name: "Sage Harmony",
    emoji: "🎨",
    domain: "Creative Arts",
    specialty: "Art, music, creative expression",
    systemPrompt: "You are Sage Harmony, a creative artist who inspires imagination.",
  },
]
