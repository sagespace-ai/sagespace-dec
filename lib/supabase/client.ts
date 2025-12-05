import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

let clientInstance: SupabaseClient | null = null

export function createClient() {
  if (clientInstance) {
    return clientInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[v0] Supabase env vars missing. Using mock client for demo mode.")

    // Create a partial mock and cast it to SupabaseClient
    // This allows the app to function in a "Demo Mode" without crashing
    const mockClient = {
      auth: {
        getUser: async () => ({
          data: {
            user: {
              id: "demo-user-123",
              email: "demo@sagespace.ai",
              user_metadata: {},
              app_metadata: {},
              aud: "authenticated",
              created_at: new Date().toISOString(),
            },
          },
          error: null,
        }),
        getSession: async () => ({
          data: {
            session: {
              access_token: "demo-token",
              refresh_token: "demo-refresh-token",
              expires_in: 3600,
              token_type: "bearer",
              user: {
                id: "demo-user-123",
                email: "demo@sagespace.ai",
                user_metadata: {},
                app_metadata: {},
                aud: "authenticated",
                created_at: new Date().toISOString(),
              },
            },
          },
          error: null,
        }),
        onAuthStateChange: (callback: any) => {
          // Simulate signed in state immediately for demo purposes
          if (typeof window !== "undefined") {
            setTimeout(() => {
              callback("SIGNED_IN", {
                user: {
                  id: "demo-user-123",
                  email: "demo@sagespace.ai",
                },
              })
            }, 0)
          }
          return { data: { subscription: { unsubscribe: () => {} } } }
        },
        signOut: async () => ({ error: null }),
      },
      from: (table: string) => ({
        select: () => ({
          eq: (column: string, value: any) => ({
            single: async () => {
              if (table === "profiles") {
                return {
                  data: {
                    id: "demo-user-123",
                    name: "Demo User",
                    email: "demo@sagespace.ai",
                    image: null,
                    credits: 200,
                    xp: 50,
                    role: "user",
                    tier: "free",
                  },
                  error: null,
                }
              }
              return { data: null, error: null }
            },
            order: () => ({ data: [], error: null }),
          }),
          order: () => ({ data: [], error: null }),
          single: async () => ({ data: null, error: null }),
        }),
        insert: () => ({
          select: () => ({
            single: async () => ({ data: {}, error: null }),
          }),
        }),
        update: () => ({
          eq: () => ({
            select: () => ({
              single: async () => ({ data: {}, error: null }),
            }),
          }),
        }),
      }),
    } as unknown as SupabaseClient

    clientInstance = mockClient
    return clientInstance
  }

  clientInstance = createBrowserClient(supabaseUrl, supabaseAnonKey)

  return clientInstance
}
