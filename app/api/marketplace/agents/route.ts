import { NextResponse } from "next/server"
import { supabase } from "@/lib/db"
import type { MarketplaceWhereInput } from "@/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const featured = searchParams.get("featured") === "true"
    const trending = searchParams.get("trending") === "true"

    let query = supabase.from("marketplace_agents").select("*")

    if (category) {
      query = query.eq("category", category)
    }
    if (featured) {
      query = query.eq("featured", true)
    }
    if (trending) {
      query = query.eq("trending", true)
    }

    const { data: agents, error } = await query.order("created_at", { ascending: false }).limit(50)

    if (error) throw error

    return NextResponse.json({ agents: agents || [] })
  } catch (error) {
    console.error("[marketplace] Error fetching agents:", error)
    return NextResponse.json({ error: "Failed to fetch agents" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { creatorId, name, description, category, price, config } = await request.json()

    if (!creatorId || !name || !category || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: agent, error } = await supabase
      .from("marketplace_agents")
      .insert({
        creator_id: creatorId,
        name,
        description,
        category,
        price,
        config,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, agent })
  } catch (error) {
    console.error("[marketplace] Error creating agent:", error)
    return NextResponse.json({ error: "Failed to create agent" }, { status: 500 })
  }
}
