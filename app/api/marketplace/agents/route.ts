import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import type { MarketplaceWhereInput } from "@/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const featured = searchParams.get("featured") === "true"
    const trending = searchParams.get("trending") === "true"

    const where: MarketplaceWhereInput = {}
    if (category) where.category = category
    if (featured) where.featured = true
    if (trending) where.trending = true

    const agents = await prisma.marketplaceAgent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json({ agents })
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

    const agent = await prisma.marketplaceAgent.create({
      data: {
        creatorId,
        name,
        description,
        category,
        price,
        config,
      },
    })

    return NextResponse.json({ success: true, agent })
  } catch (error) {
    console.error("[marketplace] Error creating agent:", error)
    return NextResponse.json({ error: "Failed to create agent" }, { status: 500 })
  }
}
