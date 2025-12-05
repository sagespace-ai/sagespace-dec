// Database seeding script for development
// Run: npx tsx scripts/seed-database.ts

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: "demo@sagespace.ai" },
    update: {},
    create: {
      email: "demo@sagespace.ai",
      name: "Demo User",
      credits: 200,
      xp: 0,
      role: "user",
    },
  })

  console.log("✅ Created user:", user.email)

  // Create demo personas
  const personas = [
    {
      name: "Strategist",
      systemPrompt: "You are a strategic thinker who helps users see the big picture and plan effectively.",
      config: { model: "gpt-4.1-mini", temperature: 0.7 },
    },
    {
      name: "Engineer",
      systemPrompt: "You are a technical expert who helps users with engineering and implementation details.",
      config: { model: "gpt-4.1-mini", temperature: 0.5 },
    },
    {
      name: "Critic",
      systemPrompt: "You are a constructive critic who helps users identify weaknesses and improve their work.",
      config: { model: "gpt-4.1-mini", temperature: 0.8 },
    },
  ]

  for (const persona of personas) {
    const existingPersona = await prisma.persona.findFirst({
      where: {
        userId: user.id,
        name: persona.name,
      },
    })

    if (!existingPersona) {
      await prisma.persona.create({
        data: {
          userId: user.id,
          ...persona,
        },
      })
      console.log(`✅ Created persona: ${persona.name}`)
    } else {
      console.log(`⏭️  Persona already exists: ${persona.name}`)
    }
  }

  // Create demo conversation
  const conversation = await prisma.conversation.create({
    data: {
      userId: user.id,
      title: "Welcome to SageSpace",
      mood: "curious",
      stats: {
        totalMessages: 2,
        totalTokens: 150,
      },
    },
  })

  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation.id,
        role: "user",
        content: "Hello! What can you help me with?",
        tokensIn: 8,
        tokensOut: 0,
      },
      {
        conversationId: conversation.id,
        role: "assistant",
        name: "Sage",
        content:
          "Welcome to SageSpace! I can help you with strategic thinking, technical implementation, and constructive feedback. What would you like to explore?",
        tokensIn: 8,
        tokensOut: 35,
      },
    ],
  })

  console.log("✅ Created demo conversation")

  console.log("🎉 Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
