// app/auth/callback/route.ts
// Cette route est appelée automatiquement par Supabase
// après qu'un utilisateur confirme son email ou se connecte
// Elle échange le "code" temporaire contre une vraie session

import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // On récupère l'URL complète de la requête
  const { searchParams, origin } = new URL(request.url)

  // Supabase ajoute un "code" dans l'URL après authentification
  // Ce code est temporaire — on doit l'échanger contre une session
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()

    // exchangeCodeForSession transforme le code temporaire
    // en une vraie session utilisateur avec des cookies
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Connexion réussie — on redirige vers le feed
      return NextResponse.redirect(`${origin}/`)
    }
  }

  // Si quelque chose s'est mal passé, on redirige vers le login
  // avec un message d'erreur dans l'URL
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}