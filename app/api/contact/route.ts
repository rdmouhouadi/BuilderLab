import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const CONTACT_EMAIL = 'richiedieuveil@gmail.com'

const SUBJECT_LABELS: Record<string, string> = {
  suggestion: 'Suggestion',
  bug:        'Bug report',
  journey:    'Join the journey',
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, email, subject, role, message } = body

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const subjectLabel = SUBJECT_LABELS[subject] ?? subject
  const roleSection = role ? `<p><strong>Role:</strong> ${role}</p>` : ''

  const resend = new Resend(process.env.RESEND_API_KEY)

  const { error } = await resend.emails.send({
    from:    'BuilderLab Contact <onboarding@resend.dev>',
    to:      CONTACT_EMAIL,
    replyTo: email,
    subject: `[BuilderLab] ${subjectLabel} from ${name}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 560px; color: #eef2f6; background: #0a0d11; padding: 32px; border-radius: 12px;">
        <h2 style="font-size: 20px; margin: 0 0 6px; color: #eef2f6;">${subjectLabel}</h2>
        <p style="font-size: 13px; color: #5c6773; margin: 0 0 24px;">via BuilderLab contact form</p>
        <p><strong>From:</strong> ${name} (${email})</p>
        ${roleSection}
        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.07); margin: 20px 0;" />
        <p style="font-size: 15px; line-height: 1.65; white-space: pre-wrap;">${message}</p>
      </div>
    `,
  })

  if (error) {
    console.error('Resend error', error)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
