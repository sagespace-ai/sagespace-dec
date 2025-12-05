import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { query } = await request.json()
    const supabase = await createClient()

    // Fetch available agents
    const { data: agents } = await supabase.from("agents").select("*").limit(5)

    // Simulate council deliberation
    const consensus = `The council of ${agents?.length || 0} agents has deliberated on your query. Based on the Five Laws, we recommend proceeding with transparency and human oversight.`

    return NextResponse.json({ consensus, agents })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("[v0] Council error:", errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
