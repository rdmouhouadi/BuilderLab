// lib/supabase.ts
// Client Supabase pour les Server Components Next.js
// On utilise createServerClient (pas createBrowserClient)
// parce que ce code s'exécute côté serveur

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  // await cookies() récupère les cookies de la requête HTTP en cours
  const cookieStore = await cookies()

  // createServerClient n'est PAS async — on le retourne directement
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          // try/catch nécessaire car dans certains contextes
          // les cookies sont en lecture seule
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignoré silencieusement dans les Server Components
          }
        },
      },
    }
  )
}