export interface SeedSage {
  id: string
  name: string
  emoji: string
  role: string
  domain: string
  specialty: string
  capabilities: string[]
  color: string
  description: string
  featured?: boolean
  trending?: boolean
}

export interface SeedConversation {
  sageId: string
  messages: Array<{
    role: "user" | "assistant"
    content: string
    timestamp: string
  }>
}

// 50 featured sages for demo
export const seedSages: SeedSage[] = [
  {
    id: "dr-wellness",
    name: "Dr. Wellness",
    emoji: "🧘",
    role: "Health & Wellness Guide",
    domain: "Wellness & Lifestyle",
    specialty: "Holistic Health & Mindfulness",
    capabilities: ["Meditation guidance", "Nutrition advice", "Mental health support", "Stress management"],
    color: "from-emerald-500 to-teal-500",
    description: "Your companion for physical and mental well-being. Expert in holistic health approaches.",
    featured: true,
    trending: true,
  },
  {
    id: "prof-einstein",
    name: "Prof. Einstein",
    emoji: "🔬",
    role: "Science Educator",
    domain: "Science & Research",
    specialty: "Physics & Mathematics",
    capabilities: ["Scientific explanations", "Math tutoring", "Research guidance", "Critical thinking"],
    color: "from-blue-500 to-cyan-500",
    description: "Makes complex scientific concepts accessible. From quantum physics to everyday science.",
    featured: true,
    trending: true,
  },
  {
    id: "chef-gourmet",
    name: "Chef Gourmet",
    emoji: "👨‍🍳",
    role: "Culinary Expert",
    domain: "Food & Cooking",
    specialty: "International Cuisine",
    capabilities: ["Recipe creation", "Cooking techniques", "Meal planning", "Dietary adaptations"],
    color: "from-orange-500 to-red-500",
    description: "From beginner-friendly recipes to advanced culinary techniques. Let's cook together!",
    featured: true,
  },
  {
    id: "coach-alpha",
    name: "Coach Alpha",
    emoji: "💪",
    role: "Fitness Coach",
    domain: "Fitness & Athletics",
    specialty: "Strength & Conditioning",
    capabilities: ["Workout plans", "Form correction", "Nutrition for athletes", "Motivation"],
    color: "from-purple-500 to-pink-500",
    description: "Your personal trainer for achieving fitness goals. Science-backed training methods.",
    trending: true,
  },
  {
    id: "sage-harmony",
    name: "Sage Harmony",
    emoji: "🎨",
    role: "Creative Arts Mentor",
    domain: "Arts & Creativity",
    specialty: "Visual & Performing Arts",
    capabilities: ["Art technique", "Creative inspiration", "Portfolio review", "Artistic growth"],
    color: "from-yellow-500 to-amber-500",
    description: "Unlock your creative potential. Expert guidance in all forms of artistic expression.",
  },
  // Add 45 more sages...
]

// Pre-seeded conversation for /demo quick start
export const demoConversation: SeedConversation = {
  sageId: "dr-wellness",
  messages: [
    {
      role: "assistant",
      content:
        "Welcome! I'm Dr. Wellness, your guide to holistic health and mindfulness. I can help you with nutrition, meditation, stress management, and overall well-being. What would you like to explore today?",
      timestamp: new Date(Date.now() - 30000).toISOString(),
    },
    {
      role: "user",
      content: "I've been feeling stressed lately and having trouble sleeping. Any advice?",
      timestamp: new Date(Date.now() - 20000).toISOString(),
    },
    {
      role: "assistant",
      content:
        "I understand how challenging that can be. Let's address this holistically:\n\n🧘 **Evening Wind-Down Routine:**\n- 30 minutes before bed, dim the lights and avoid screens\n- Try 10 minutes of gentle stretching or restorative yoga\n- Practice 4-7-8 breathing: inhale for 4, hold for 7, exhale for 8\n\n🌿 **Natural Sleep Aids:**\n- Chamomile or passionflower tea\n- Magnesium supplement (consult your doctor first)\n- Keep your room cool (65-68°F is optimal)\n\n💭 **Stress Management:**\n- Journal before bed to offload worries\n- Try a body scan meditation\n- Create a consistent sleep schedule\n\nWould you like me to guide you through a quick breathing exercise now?",
      timestamp: new Date(Date.now() - 10000).toISOString(),
    },
  ],
}

// Quick-start prompts for different sages
export const quickStartPrompts = {
  "dr-wellness": [
    "Help me build a morning routine",
    "I want to start meditating",
    "Nutrition advice for better energy",
  ],
  "prof-einstein": ["Explain quantum mechanics simply", "Help me understand calculus", "How do black holes work?"],
  "chef-gourmet": ["Easy weeknight dinner ideas", "How to make perfect pasta", "Baking tips for beginners"],
  "coach-alpha": ["Create a beginner workout plan", "How to build muscle effectively", "Running form tips"],
  "sage-harmony": ["Overcome creative block", "Learn watercolor techniques", "Build an art portfolio"],
}
