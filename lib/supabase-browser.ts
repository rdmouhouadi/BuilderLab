// lib/supabase-browser.ts
// Ce client est utilisé côté navigateur (Client Components)
// On l'utilise spécifiquement pour l'authentification
// car l'auth nécessite d'interagir avec le navigateur
// (cookies, redirections, état de session)

import { createBrowserClient } from '@supabase/ssr'

export function createBrowserSupabaseClient() {
  return createBrowserClient(
    // Ces variables sont accessibles côté navigateur
    // grâce au préfixe NEXT_PUBLIC_
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}