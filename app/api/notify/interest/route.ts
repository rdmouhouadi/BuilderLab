// app/api/notify/interest/route.ts
// Called when someone clicks "I'm interested" on a project.
// Sends an email to the project owner and creates an in-app notification for them.
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendInterestNotification } from '@/lib/email'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { connectionId } = await request.json()

    // Fetch the connection with its related project and profile data
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

    // Supabase does not store emails in the profiles table for security reasons —
    // we must fetch them through the admin auth API
    const { data: ownerAuth } = await supabaseAdmin.auth.admin.getUserById(
      connection.projects.owner_id
    )

    if (!ownerAuth?.user?.email) {
      return NextResponse.json({ error: 'Owner email not found' }, { status: 404 })
    }

    // Build display names, falling back gracefully if fields are missing
    const senderProfile = connection.profiles
    const senderName = [senderProfile?.first_name, senderProfile?.last_name]
      .filter(Boolean).join(' ') || senderProfile?.name || 'A student'

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

    // Also create an in-app notification so the owner sees it in the notifications panel
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
