// middleware.ts
// Le middleware s'exécute avant chaque requête
// C'est ici qu'on vérifie si l'utilisateur est connecté
// et qu'on le redirige si nécessaire

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // On crée une réponse qu'on pourra modifier
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Client Supabase spécial pour le middleware
  // Il a besoin de lire ET écrire les cookies
  // pour maintenir la session utilisateur à jour
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // On met à jour les cookies dans la requête ET la réponse
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

  // Récupère la session actuelle
  // IMPORTANT : ne jamais supprimer cette ligne
  // elle rafraîchit automatiquement le token de session
  const { data: { user } } = await supabase.auth.getUser()

  // Pages qui nécessitent d'être connecté
  const protectedPaths = ['/post', '/profile', '/connections', '/notifications']
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  // Si la page est protégée et l'utilisateur n'est pas connecté
  // on le redirige vers /login
  if (isProtectedPath && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si l'utilisateur est connecté et essaie d'aller sur /login
  // on le redirige vers le feed — pas besoin de se reconnecter
  if (request.nextUrl.pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/feed', request.url))
  }

  return supabaseResponse
}

// On dit à Next.js sur quelles routes appliquer le middleware/proxy
// On exclut les fichiers statiques et les images
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}