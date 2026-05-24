// app/notifications/page.tsx
// Page complète des notifications
// Server Component — fetch toutes les notifications côté serveur
import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import NotificationsClient from '@/components/NotificationsClient'
import PageTransition from '@/components/PageTransition'

export default async function NotificationsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // On fetch toutes les notifications — pas de limite
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // On marque toutes comme lues à l'ouverture de la page
  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user.id)
    .eq('read', false)

  return (
    <PageTransition>
      <NotificationsClient notifications={notifications ?? []} />
    </PageTransition>
  )
}