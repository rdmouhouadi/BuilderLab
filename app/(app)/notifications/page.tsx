// app/notifications/page.tsx
// Full notifications history page.
// Server Component — fetches all notifications on the server.
import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import NotificationsClient from '@/components/NotificationsClient'
import PageTransition from '@/components/PageTransition'
import { Analytics } from "@vercel/analytics/next"

export default async function NotificationsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all notifications for this user (no limit — this is the full history page)
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Mark all unread notifications as read when the user opens this page
  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user.id)
    .eq('read', false)

  return (
    <PageTransition>
      <NotificationsClient notifications={notifications ?? []} />
      <Analytics />
    </PageTransition>
  )
}
