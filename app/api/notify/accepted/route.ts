// app/api/notify/accepted/route.ts
// Route API appelée quand une demande est acceptée
// Envoie un email au sender
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendAcceptedNotification } from '@/lib/email'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { connectionId } = await request.json()
    //const supabase = await createClient()

    // On récupère les infos nécessaires
    const { data: connection } = await supabaseAdmin
      .from('connections')
      .select(`
        *,
        projects(
          id,
          title,
          profiles!projects_owner_id_fkey(id, name, first_name, last_name)
        ),
        profiles!connections_sender_id_fkey(id, name, first_name, last_name)
      `)
      .eq('id', connectionId)
      .single()

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    // Email du sender
    const { data: senderAuth } = await supabaseAdmin.auth.admin.getUserById(
      connection.sender_id
    )

    if (!senderAuth?.user?.email) {
      return NextResponse.json({ error: 'Sender email not found' }, { status: 404 })
    }

    // Noms
    const senderProfile = connection.profiles
    const senderName = [senderProfile?.first_name, senderProfile?.last_name]
      .filter(Boolean).join(' ') || senderProfile?.name || 'there'

    const ownerProfile = connection.projects.profiles
    const ownerName = [ownerProfile?.first_name, ownerProfile?.last_name]
      .filter(Boolean).join(' ') || ownerProfile?.name || 'The project owner'

    await sendAcceptedNotification({
      senderEmail: senderAuth.user.email,
      senderName,
      ownerName,
      projectTitle: connection.projects.title,
      projectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/projects/${connection.projects.id}`,
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error sending accepted notification:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}