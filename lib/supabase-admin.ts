// lib/supabase-admin.ts
// Client Supabase avec la clé service_role
// UNIQUEMENT pour les routes API côté serveur
// Ne jamais utiliser ce client dans des composants client
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)