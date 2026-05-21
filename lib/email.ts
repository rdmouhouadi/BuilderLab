// lib/email.ts
// Fonctions d'envoi d'emails via Resend

import { Resend } from 'resend'

// Email envoyé au owner quand quelqu'un exprime son intérêt
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
  // On initialise Resend à l'intérieur de la fonction
  // pour éviter les problèmes de bundling avec Next.js
  const resend = new Resend(process.env.RESEND_API_KEY)

  await resend.emails.send({
    from: 'BuilderLab <onboarding@resend.dev>',
    to: ownerEmail,
    subject: `${senderName} is interested in "${projectTitle}"`,
    html: `...` // garde le même HTML
  })
}

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
  // Même chose — initialisation locale
  const resend = new Resend(process.env.RESEND_API_KEY)

  await resend.emails.send({
    from: 'BuilderLab <onboarding@resend.dev>',
    to: senderEmail,
    subject: `You've been accepted to collaborate on "${projectTitle}"!`,
    html: `...` // garde le même HTML
  })
}