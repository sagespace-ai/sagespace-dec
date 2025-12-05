import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { SAGE_TEMPLATES } from "@/lib/sage-templates"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query") || ""
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Get built-in sages
    let builtInSages = SAGE_TEMPLATES.map((sage) => ({
      id: sage.id,
      name: sage.name,
      domain: sage.domain,
      avatarUrl: undefined,
      emoji: sage.avatar,
      colorTheme: getColorForDomain(sage.domain),
      tags: sage.capabilities,
      isUserCreated: false,
      role: sage.role,
      description: sage.description,
    }))

    // Filter by query
    if (query) {
      const lowerQuery = query.toLowerCase()
      builtInSages = builtInSages.filter(
        (s) =>
          s.name.toLowerCase().includes(lowerQuery) ||
          s.domain.toLowerCase().includes(lowerQuery) ||
          s.tags.some((t) => t.toLowerCase().includes(lowerQuery)),
      )
    }

    // Get custom personas if user is authenticated
    let customSages: typeof builtInSages = []
    if (user?.id) {
      const { data: agents } = await supabase.from("agents").select("*").eq("user_id", user.id)

      customSages =
        agents?.map((agent) => ({
          id: agent.id,
          name: agent.name,
          domain: "Personal Development",
          avatarUrl: undefined,
          emoji: agent.avatar || "🤖",
          colorTheme: "from-purple-500 to-pink-500",
          tags: [],
          isUserCreated: true,
          role: agent.role || "Custom Sage",
          description: "Custom AI Assistant", // agents table might not have systemPrompt exposed directly or it might be named differently
        })) || []
    }

    // Combine and paginate
    const allSages = [...builtInSages, ...customSages]
    const paginatedSages = allSages.slice(offset, offset + limit)

    return NextResponse.json({
      items: paginatedSages,
      total: allSages.length,
    })
  } catch (error) {
    console.error("[sages] GET error:", error)
    return NextResponse.json({ error: "Failed to fetch sages" }, { status: 500 })
  }
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
