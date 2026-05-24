// app/api/notify/interest/route.ts
// Route API appelée quand quelqu'un clique "I'm interested"
// Envoie un email au owner du projet
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendInterestNotification } from '@/lib/email'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { connectionId } = await request.json()
    //const supabase = await createClient()

    // On récupère les infos nécessaires pour l'email
    const { data: connection } = await supabaseAdmin
      .from('connections')
      .select(`
        *,
        projects(
          id,
          title,
          owner_id,
          profiles!projects_owner_id_fkey(id, name, first_name, last_name)
        ),
        profiles!connections_sender_id_fkey(id, name, first_name, last_name)
      `)
      .eq('id', connectionId)
      .single()

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    // On récupère l'email du owner via auth.users
    // Supabase ne stocke pas l'email dans profiles pour des raisons de sécurité
    const { data: ownerAuth } = await supabaseAdmin.auth.admin.getUserById(
      connection.projects.owner_id
    )

    if (!ownerAuth?.user?.email) {
      return NextResponse.json({ error: 'Owner email not found' }, { status: 404 })
    }

    // Nom complet du sender
    const senderProfile = connection.profiles
    const senderName = [senderProfile?.first_name, senderProfile?.last_name]
      .filter(Boolean).join(' ') || senderProfile?.name || 'A student'

    // Nom complet du owner
    const ownerProfile = connection.projects.profiles
    const ownerName = [ownerProfile?.first_name, ownerProfile?.last_name]
      .filter(Boolean).join(' ') || ownerProfile?.name || 'there'

    await sendInterestNotification({
      ownerEmail: ownerAuth.user.email,
      ownerName,
      senderName,
      projectTitle: connection.projects.title,
      message: connection.message ?? 'No message provided.',
      projectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/projects/${connection.projects.id}`,
    })

    // Crée une notification in-app pour le owner
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: connection.projects.owner_id,
        type: 'connection_request',
        title: `${senderName} is interested in "${connection.projects.title}"`,
        body: connection.message ?? null,
        link: `/projects/${connection.projects.id}`,
      })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error sending interest notification:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}