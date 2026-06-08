// lib/supabase-browser.ts
// Browser-side Supabase client — used inside Client Components.
// Handles auth interactions that require the browser (cookies, redirects, session state).

import { createBrowserClient } from '@supabase/ssr'

export function createBrowserSupabaseClient() {
  return createBrowserClient(
    // NEXT_PUBLIC_ prefix makes these env vars available in the browser bundle
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
