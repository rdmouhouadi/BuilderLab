// lib/email.ts
// Transactional email helpers — all sent via the Resend API.

import { Resend } from 'resend'

// Sent to the project owner when someone expresses interest in joining
export async function sendInterestNotification({
  ownerEmail,
  ownerName,
  senderName,
  projectTitle,
  message,
  projectUrl,
}: {
  ownerEmail: string
  ownerName: string
  senderName: string
  projectTitle: string
  message: string
  projectUrl: string
}) {
  // Initialise Resend inside the function to avoid Next.js bundling issues
  const resend = new Resend(process.env.RESEND_API_KEY)

  await resend.emails.send({
    from: 'BuilderLab <onboarding@resend.dev>',
    to: ownerEmail,
    subject: `${senderName} is interested in "${projectTitle}"`,
    html: `...`
  })
}

// Sent to the applicant when a project owner accepts their join request
export async function sendAcceptedNotification({
  senderEmail,
  senderName,
  ownerName,
  projectTitle,
  projectUrl,
}: {
  senderEmail: string
  senderName: string
  ownerName: string
  projectTitle: string
  projectUrl: string
}) {
  const resend = new Resend(process.env.RESEND_API_KEY)

  await resend.emails.send({
    from: 'BuilderLab <onboarding@resend.dev>',
    to: senderEmail,
    subject: `You've been accepted to collaborate on "${projectTitle}"!`,
    html: `...`
  })
}
