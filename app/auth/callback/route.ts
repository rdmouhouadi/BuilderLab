// app/auth/callback/route.ts
// Called automatically by Supabase after a user confirms their email or signs in.
// Exchanges the one-time "code" in the URL for a real session stored in cookies.

import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)

  // Supabase appends a short-lived "code" to the URL after authentication
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()

    // Trade the temporary code for a full user session (sets secure cookies)
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Success — send the user to the home page
      return NextResponse.redirect(`${origin}/`)
    }
  }

  // Something went wrong — redirect back to login with an error flag
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
