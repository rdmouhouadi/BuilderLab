// lib/supabase-admin.ts
// Admin Supabase client using the service_role key — bypasses Row Level Security.
// ONLY use this in server-side API routes, never in Client Components.
//
// Lazily initialized: the client is created on first use, not at
// import time. This matters during `next build`, which imports every
// API route to collect its metadata — SUPABASE_SERVICE_ROLE_KEY is a
// runtime-only secret (never a build arg), so it would be undefined
// at that point if the client were created eagerly at module scope.
import { createClient, SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

function getSupabaseAdmin(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return client
}

// Proxy so existing call sites (supabaseAdmin.from(...), etc.) keep
// working unchanged — only the underlying client creation is deferred.
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabaseAdmin()[prop as keyof SupabaseClient]
  },
})