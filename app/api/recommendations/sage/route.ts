import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { SAGE_TEMPLATES } from "@/lib/sage-templates"
import type { SageMode, Mood, SageSummary, RecommendationResult } from "@/types/sage-selector"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mode, mood, limit = 5 } = body as { mode: SageMode; mood?: Mood; limit?: number }

    if (!mode || !["single", "circle", "duel", "council"].includes(mode)) {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Get recommended sages based on mood and mode
    const recommendations = await getRecommendations(mode, mood, limit, user?.id)

    // Log recommendation for analytics
    if (user?.id) {
      await logRecommendation(user.id, mode, mood, recommendations)
    }

    return NextResponse.json(recommendations)
  } catch (error) {
    console.error("[recommendations/sage] POST error:", error)
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 })
  }
}

async function getRecommendations(
  mode: SageMode,
  mood: Mood | undefined,
  limit: number,
  userId?: string,
): Promise<RecommendationResult> {
  // Map moods to domains
  const moodToDomain: Record<Mood, string[]> = {
    calm: ["Health & Wellness", "Creative & Arts"],
    stressed: ["Health & Wellness", "Personal Development"],
    curious: ["Science & Research", "Education & Learning", "Technology & Innovation"],
    focused: ["Business & Finance", "Technology & Innovation", "Education & Learning"],
    overwhelmed: ["Health & Wellness", "Personal Development"],
    playful: ["Creative & Arts", "Social & Community"],
  }

  // Get relevant domains based on mood
  const relevantDomains = mood ? moodToDomain[mood] : Object.keys(SAGE_TEMPLATES.map((s) => s.domain))

  // Filter sages by domains
  let candidatePool = SAGE_TEMPLATES.filter((sage) => relevantDomains.includes(sage.domain))

  // Add time-based weighting
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 12) {
    // Morning: boost fitness and productivity
    candidatePool = prioritizeDomains(candidatePool, ["Health & Wellness", "Personal Development"])
  } else if (hour >= 18) {
    // Evening: boost creative and wellness
    candidatePool = prioritizeDomains(candidatePool, ["Creative & Arts", "Health & Wellness"])
  }

  // Shuffle for randomness
  candidatePool = shuffleArray(candidatePool)

  // Convert to SageSummary
  const sages: SageSummary[] = candidatePool.slice(0, limit * 2).map((sage) => ({
    id: sage.id,
    name: sage.name,
    domain: sage.domain,
    emoji: sage.avatar,
    colorTheme: getColorForDomain(sage.domain),
    tags: sage.capabilities,
    isUserCreated: false,
    role: sage.role,
    description: sage.description,
  }))

  // Build result based on mode
  let primary: SageSummary | SageSummary[]
  let rationale: string

  switch (mode) {
    case "single":
      primary = sages[0]
      rationale = mood
        ? `Based on your ${mood} mood, we recommend ${primary.name} who specializes in ${primary.domain}.`
        : `${primary.name} is a great choice for ${primary.domain}.`
      break

    case "circle":
      primary = sages.slice(0, 4) // 3-4 sages for circle
      rationale = mood
        ? `For your ${mood} mood, we've assembled a circle of ${primary.length} sages with complementary expertise.`
        : `This circle brings together diverse perspectives across ${primary.map((s) => s.domain).join(", ")}.`
      break

    case "duel":
      primary = sages.slice(0, 2) // 2 opposing sages
      rationale = `These two expert sages will debate from different perspectives to give you balanced insights.`
      break

    case "council":
      primary = sages.slice(0, 5) // 5-7 sages for council
      rationale = `The council brings together ${primary.length} sages for deep, multi-perspective reasoning.`
      break

    default:
      primary = sages[0]
      rationale = `${primary.name} is recommended for you.`
  }

  return {
    primary,
    candidates: sages.slice(Array.isArray(primary) ? primary.length : 1, limit),
    rationale,
  }
}

async function logRecommendation(userId: string, mode: SageMode, mood: Mood | undefined, result: RecommendationResult) {
  // Store in a simple log (could be a dedicated table)
  console.log("[v0] Recommendation logged:", {
    userId,
    mode,
    mood,
    primaryIds: Array.isArray(result.primary) ? result.primary.map((s) => s.id) : [result.primary.id],
  })
}

function prioritizeDomains<T extends { domain: string }>(sages: T[], domains: string[]): T[] {
  return sages.sort((a, b) => {
    const aScore = domains.includes(a.domain) ? 1 : 0
    const bScore = domains.includes(b.domain) ? 1 : 0
    return bScore - aScore
  })
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function getColorForDomain(domain: string): string {
  const colorMap: Record<string, string> = {
    "Health & Wellness": "from-emerald-500 to-teal-500",
    "Education & Learning": "from-blue-500 to-cyan-500",
    "Creative & Arts": "from-yellow-500 to-amber-500",
    "Business & Finance": "from-green-500 to-emerald-500",
    "Science & Research": "from-blue-500 to-indigo-500",
    "Technology & Innovation": "from-indigo-500 to-purple-500",
    "Legal & Justice": "from-slate-600 to-slate-800",
    "Environment & Sustainability": "from-green-400 to-emerald-600",
    "Personal Development": "from-purple-500 to-pink-500",
    "Social & Community": "from-pink-500 to-rose-500",
  }
  return colorMap[domain] || "from-cyan-500 to-purple-500"
}
