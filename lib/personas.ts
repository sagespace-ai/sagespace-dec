import { supabase } from "./db"
import { SAGE_TEMPLATES } from "./sage-templates"
import { DEMO_MODE, DEMO_PERSONAS } from "@/lib/demo"

export async function getPersona(personaId: string, userId?: string) {
  if (DEMO_MODE.enabled) {
    const demo = DEMO_PERSONAS.find((p) => p.id === personaId)
    if (demo) return demo
  }

  // Check if it's a built-in persona
  const builtIn = SAGE_TEMPLATES.find((t) => t.id === personaId)
  if (builtIn) {
    return {
      id: builtIn.id,
      name: builtIn.name,
      systemPrompt: `You are ${builtIn.name}, a ${builtIn.role}. ${builtIn.description}. Your capabilities include: ${builtIn.capabilities.join(", ")}.`,
      config: {},
      isBuiltIn: true,
    }
  }

  // Otherwise, fetch from database
  if (!userId) return null

  const { data: customPersona } = await supabase
    .from("agents")
    .select("*")
    .eq("id", personaId)
    .eq("user_id", userId)
    .single()

  return customPersona
}

export async function getPersonasBatch(
  personaIds: string[],
  userId: string,
): Promise<
  Array<{
    id: string
    name: string
    systemPrompt: string
    config?: Record<string, unknown>
    isBuiltIn?: boolean
  } | null>
> {
  if (DEMO_MODE.enabled) {
    return personaIds.map((id) => DEMO_PERSONAS.find((p) => p.id === id) || null)
  }

  const results: Array<{
    id: string
    name: string
    systemPrompt: string
    config?: Record<string, unknown>
    isBuiltIn?: boolean
  } | null> = []

  // Separate built-in and custom persona IDs
  const builtInResults = personaIds
    .map((id) => SAGE_TEMPLATES.find((t) => t.id === id))
    .filter(Boolean)
    .map((t) => ({
      id: t!.id,
      name: t!.name,
      systemPrompt: `You are ${t!.name}, a ${t!.role}. ${t!.description}. Your capabilities include: ${t!.capabilities.join(", ")}.`,
      config: {},
      isBuiltIn: true,
    }))

  // Get custom personas from database in single query
  const { data: customResults } = await supabase.from("agents").select("*").in("id", personaIds).eq("user_id", userId)

  // Combine and return in original order
  const allPersonas = [...builtInResults, ...(customResults || [])]
  return personaIds.map((id) => allPersonas.find((p) => p.id === id) || null)
}

export async function getUserPersonas(userId: string) {
  if (DEMO_MODE.enabled) {
    return {
      builtIn: SAGE_TEMPLATES,
      custom: [],
    }
  }

  const { data: customPersonas } = await supabase
    .from("agents")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  return {
    builtIn: SAGE_TEMPLATES,
    custom: customPersonas || [],
  }
}

export async function createPersona(
  userId: string,
  data: {
    name: string
    systemPrompt: string
    config?: Record<string, unknown>
  },
) {
  const { data: result, error } = await supabase
    .from("agents")
    .insert({
      user_id: userId,
      name: data.name,
      role: data.systemPrompt,
      status: "online",
    })
    .select()
    .single()

  if (error) throw error
  return result
}

export async function updatePersona(
  personaId: string,
  userId: string,
  data: {
    name?: string
    systemPrompt?: string
    config?: Record<string, unknown>
  },
) {
  const { data: result, error } = await supabase
    .from("agents")
    .update({
      ...(data.name && { name: data.name }),
      ...(data.systemPrompt && { role: data.systemPrompt }),
    })
    .eq("id", personaId)
    .eq("user_id", userId)
    .select()

  if (error) throw error
  return result
}

export async function deletePersona(personaId: string, userId: string) {
  const { error } = await supabase.from("agents").delete().eq("id", personaId).eq("user_id", userId)

  if (error) throw error
  return { success: true }
}
