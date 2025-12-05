import { createClient as createSupabaseClient } from "@supabase/supabase-js"

let serviceRoleClient: ReturnType<typeof createSupabaseClient> | null = null

export function createClient() {
  if (serviceRoleClient) {
    return serviceRoleClient
  }

  serviceRoleClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )

  return serviceRoleClient
}
