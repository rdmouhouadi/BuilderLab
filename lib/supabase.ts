// Ce fichier crée la connexion entre Next.js et Supabase
// On utilise createBrowserClient pour le côté client (navigateur)
// C'est ce client qu'on réutilisera partout dans l'app pour
// lire et écrire des données

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    // Ces variables viennent du fichier .env.local
    // Le préfixe NEXT_PUBLIC_ les rend accessibles côté navigateur
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    // Le ! à la fin dit à TypeScript "je garantis que cette valeur existe"
    // Sans ça, TypeScript se plaindrait que la valeur pourrait être undefined
  )
}