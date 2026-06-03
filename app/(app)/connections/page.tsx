// app/connections/page.tsx
// Server Component — fetch les demandes de connexion
import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import ConnectionsClient from '@/components/ConnectionsClient'
import PageTransition from '@/components/PageTransition'

export default async function ConnectionsPage() {
  const supabase = await createClient()

  // Vérifier que l'utilisateur est connecté
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // On récupère toutes les demandes reçues sur les projets
  // de l'utilisateur connecté
  const { data: received } = await supabase
    .from('connections')
    .select(`
      *,
      projects!inner(id, title, owner_id),
      profiles!connections_sender_id_fkey(id, name, country, avg_rating)
    `)
    // !inner filtre uniquement les connexions
    // sur les projets appartenant à l'utilisateur connecté
    .eq('projects.owner_id', user.id)
    .order('created_at', { ascending: false })

  // On récupère les demandes envoyées par l'utilisateur
  const { data: sent } = await supabase
    .from('connections')
    .select(`
      *,
      projects(id, title)
    `)
    .eq('sender_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <PageTransition>
      <ConnectionsClient
        received={received ?? []}
        sent={sent ?? []}
        currentUserId={user.id}
      />
    </PageTransition>
  )
}