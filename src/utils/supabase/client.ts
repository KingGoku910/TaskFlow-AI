import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Create a singleton client instance for the browser
let client: ReturnType<typeof createClient> | undefined

export function getSupabaseClient() {
  if (!client) {
    client = createClient()
  }
  return client
}
