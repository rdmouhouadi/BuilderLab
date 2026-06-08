// proxy.ts (used as middleware)
// Runs before every request to check auth state and protect routes.

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // Create a mutable response that we can attach new cookies to
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Special Supabase client for middleware — must both read and write cookies
  // so the user session stays refreshed across requests
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Update cookies on both the request and the response objects
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: do not remove this line — it also silently refreshes the session token
  const { data: { user } } = await supabase.auth.getUser()

  // Pages that require the user to be logged in
  const protectedPaths = ['/post', '/profile', '/connections', '/notifications']
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  // Redirect unauthenticated users away from protected pages
  if (isProtectedPath && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect already-authenticated users away from the login / signup pages
  if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') && user) {
    return NextResponse.redirect(new URL('/feed', request.url))
  }

  return supabaseResponse
}

// Apply this middleware to all routes except static files and images
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
