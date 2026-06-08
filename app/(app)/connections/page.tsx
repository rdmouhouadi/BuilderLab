// app/connections/page.tsx
// Connection requests management — shows incoming and outgoing join requests.
// Server Component — fetches data on the server before rendering.
import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import ConnectionsClient from '@/components/ConnectionsClient'
import PageTransition from '@/components/PageTransition'
import { Analytics } from "@vercel/analytics/next"

export default async function ConnectionsPage() {
  const supabase = await createClient()

  // Redirect to login if the user is not authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all join requests received on projects owned by the current user.
  // The `!inner` join ensures we only get connections for this user's projects.
  const { data: received } = await supabase
    .from('connections')
    .select(`
      *,
      projects!inner(id, title, owner_id),
      profiles!connections_sender_id_fkey(id, name, country, avg_rating)
    `)
    .eq('projects.owner_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch all join requests sent by the current user
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
      <Analytics />
    </PageTransition>
  )
}
