// lib/supabase.ts
// Server-side Supabase client for use in Server Components and API routes.
// Uses createServerClient (not createBrowserClient) because this code runs on the server.

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  // Read the cookies from the current HTTP request (needed for auth session)
  const cookieStore = await cookies()

  // createServerClient is synchronous — return it directly
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          // try/catch required because cookies are read-only in some server contexts
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Silently ignored inside pure Server Components
          }
        },
      },
    }
  )
}
