'use client'

import { useState } from 'react'
import { Lightbulb, Bug, Heart, CheckCircle } from 'lucide-react'
import Eyebrow from '@/components/marketing/Eyebrow'
import ScrollReveal from '@/components/marketing/ScrollReveal'
import {
  colors, radiusMkt, fontSizeMkt, fontFamily, shadows, layout, breakpoints,
} from '@/lib/design-tokens'

type Subject = 'suggestion' | 'bug' | 'journey'

const SUBJECTS: { id: Subject; label: string; icon: React.ReactNode; hint: string }[] = [
  {
    id: 'suggestion',
    label: 'Suggestion',
    icon: <Lightbulb size={15} />,
    hint: 'Share a feature idea or improvement. What would make BuilderLab more useful for you?',
  },
  {
    id: 'bug',
    label: 'Bug report',
    icon: <Bug size={15} />,
    hint: "Tell us what happened, what you expected, and how to reproduce it. Screenshots help.",
  },
  {
    id: 'journey',
    label: 'Join the journey',
    icon: <Heart size={15} />,
    hint: "Tell us about yourself, your background, and what role you'd be excited to bring to early projects.",
  },
]

const ROLES = [
  'Software Engineering',
  'Data Science',
  'Data Analysis & Engineering',
  'Design & UX',
  'Product & Community',
  'Not sure yet',
]

const SUCCESS_MSGS: Record<Subject, { title: string; body: string }> = {
  suggestion: {
    title: "Thanks for the suggestion!",
    body: "We read every piece of feedback. If your idea shapes something on the roadmap, you'll hear about it.",
  },
  bug: {
    title: "Bug reported — thank you!",
    body: "We'll investigate and follow up if we need more details. You're helping make the platform better.",
  },
  journey: {
    title: "Welcome to the journey!",
    body: "We'll be in touch soon. In the meantime, check out the feed and explore what builders are working on.",
  },
}

function Wrap({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      width: '100%', maxWidth: layout.maxWidth,
      margin: '0 auto', padding: `0 ${layout.wrapPadding}`, ...style,
    }}>
      {children}
    </div>
  )
}

const CHANNELS = [
  { icon: <Lightbulb size={18} />, title: 'Suggestions', body: "Have a feature idea? We're building in public and love input from the community." },
  { icon: <Bug size={18} />, title: 'Bug reports', body: "Found something broken? Help us fix it fast by describing exactly what happened." },
  { icon: <Heart size={18} />, title: 'Join the journey', body: "Interested in shaping the platform early? Tell us who you are and what you bring." },
]

export default function ContactPage() {
  const [subject, setSubject] = useState<Subject>('suggestion')
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [role, setRole]       = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors]   = useState<{ name?: boolean; email?: boolean; message?: boolean }>({})
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending]     = useState(false)

  const currentHint = SUBJECTS.find(s => s.id === subject)?.hint ?? ''

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors = {
      name:    !name.trim(),
      email:   !email.trim(),
      message: !message.trim(),
    }
    setErrors(newErrors)
    if (Object.values(newErrors).some(Boolean)) return

    setSending(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, role: subject === 'journey' ? role : undefined, message }),
      })
      if (!res.ok) throw new Error('send failed')
      setSubmitted(true)
    } catch {
      alert('Something went wrong. Please try again or email us directly.')
    } finally {
      setSending(false)
    }
  }

  function inputStyle(hasError?: boolean) {
    return {
      width: '100%',
      fontFamily: fontFamily.body,
      fontSize: '15px',
      color: colors.text.base,
      padding: '12px 14px',
      borderRadius: radiusMkt.sm,
      border: `1px solid ${hasError ? colors.status.danger : colors.border.mkt2}`,
      backgroundColor: colors.bg.mkt,
      outline: 'none',
      transition: 'border-color .15s, box-shadow .15s',
      boxSizing: 'border-box' as const,
    }
  }

  function labelStyle() {
    return {
      display: 'block',
      fontSize: '13.5px',
      fontWeight: 600,
      color: colors.text.soft,
      marginBottom: '8px',
    }
  }

  return (
    <>
      {/* Page Hero */}
      <section style={{ padding: '72px 0 8px' }}>
        <Wrap>
          <Eyebrow>Get in touch</Eyebrow>
          <h1 style={{
            fontFamily: fontFamily.head, fontSize: fontSizeMkt.pageHero,
            lineHeight: 1.04, marginTop: '22px',
          }}>Let&apos;s talk.</h1>
          <p style={{
            marginTop: '22px', fontSize: '20px', lineHeight: 1.6,
            color: colors.text.muted2, maxWidth: '520px',
          }}>
            Questions, ideas, bugs, or just want to be part of what we&apos;re building — we&apos;re all ears.
          </p>
        </Wrap>
      </section>

      {/* Form grid */}
      <section style={{ padding: '48px 0 120px' }}>
        <Wrap>
          <div className="contact-grid" style={{
            display: 'grid', gridTemplateColumns: '1fr 1.15fr',
            gap: '56px', alignItems: 'start',
          }}>
            {/* Left: intro */}
            <ScrollReveal>
              <h2 style={{
                fontFamily: fontFamily.head,
                fontSize: 'clamp(28px, 3.4vw, 40px)',
                marginBottom: '16px',
              }}>
                How can we help?
              </h2>
              <p style={{
                color: colors.text.muted2, fontSize: '17px', lineHeight: 1.65,
                marginBottom: '30px', maxWidth: '420px',
              }}>
                Whether it&apos;s a bug, an idea, or you just want to join the earliest wave of builders on BuilderLab — this is the place.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {CHANNELS.map(({ icon, title, body }) => (
                  <div
                    key={title}
                    style={{
                      display: 'flex', gap: '14px', alignItems: 'flex-start',
                      padding: '18px 20px', borderRadius: radiusMkt.md,
                      border: `1px solid ${colors.border.mkt}`,
                      backgroundColor: colors.bg.mktSurface,
                      transition: 'border-color .15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = colors.border.accent }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = colors.border.mkt }}
                  >
                    <span style={{
                      flexShrink: 0, width: '40px', height: '40px', borderRadius: '10px',
                      display: 'grid', placeItems: 'center',
                      background: `rgba(${colors.accent.glowRgb},0.1)`,
                      border: `1px solid ${colors.border.accent}`,
                      color: colors.accent.bright,
                    }}>
                      {icon}
                    </span>
                    <div>
                      <h4 style={{ fontFamily: fontFamily.head, fontSize: '15px', marginBottom: '2px' }}>{title}</h4>
                      <p style={{ color: colors.text.muted2, fontSize: '13.5px', lineHeight: 1.5 }}>{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            {/* Right: form card */}
            <ScrollReveal delay={80}>
              <div style={{
                padding: '36px', borderRadius: radiusMkt.md,
                background: `linear-gradient(180deg, ${colors.bg.mktSurface}, ${colors.bg.mkt2})`,
                border: `1px solid ${colors.border.mkt}`,
                boxShadow: shadows.card,
              }}>
                {submitted ? (
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    textAlign: 'center', padding: '24px 0',
                  }}>
                    <span style={{
                      width: '56px', height: '56px', borderRadius: '50%',
                      display: 'grid', placeItems: 'center',
                      background: `rgba(${colors.accent.glowRgb},0.12)`,
                      border: `1px solid ${colors.border.accent}`,
                      color: colors.accent.bright, marginBottom: '18px',
                    }}>
                      <CheckCircle size={24} />
                    </span>
                    <h3 style={{ fontFamily: fontFamily.head, fontSize: '22px', marginBottom: '8px' }}>
                      {SUCCESS_MSGS[subject].title}
                    </h3>
                    <p style={{ color: colors.text.muted2, fontSize: '15px', maxWidth: '340px', marginBottom: '24px' }}>
                      {SUCCESS_MSGS[subject].body}
                    </p>
                    <button
                      onClick={() => { setSubmitted(false); setName(''); setEmail(''); setRole(''); setMessage('') }}
                      style={{
                        fontFamily: fontFamily.body, fontSize: fontSizeMkt.nav, fontWeight: 600,
                        padding: '10px 20px', borderRadius: radiusMkt.sm,
                        backgroundColor: colors.bg.surface2,
                        color: colors.text.base,
                        border: `1px solid ${colors.border.mkt}`,
                        cursor: 'pointer', transition: 'background .15s',
                      }}
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate>
                    {/* Subject chips */}
                    <div style={{ marginBottom: '20px' }}>
                      <span style={labelStyle()}>Subject</span>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                        {SUBJECTS.map(({ id, label, icon }) => {
                          const active = subject === id
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => setSubject(id)}
                              style={{
                                flex: 1,
                                minWidth: '110px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: '7px',
                                padding: '11px 12px', borderRadius: radiusMkt.sm,
                                border: `1px solid ${active ? colors.border.accent : colors.border.mkt2}`,
                                backgroundColor: active ? `rgba(${colors.accent.glowRgb},0.08)` : colors.bg.mkt,
                                color: active ? colors.accent.bright : colors.text.muted2,
                                fontSize: '13.5px', fontWeight: 500,
                                cursor: 'pointer', transition: 'all .15s',
                              }}
                            >
                              {icon}
                              {label}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Name */}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={labelStyle()}>
                        Name <span style={{ color: colors.accent.bright }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: false })) }}
                        placeholder="Your name"
                        style={inputStyle(errors.name)}
                        onFocus={e => {
                          (e.target as HTMLInputElement).style.borderColor = colors.accent.bright
                          ;(e.target as HTMLInputElement).style.boxShadow = `0 0 0 3px rgba(${colors.accent.glowRgb},0.16)`
                        }}
                        onBlur={e => {
                          (e.target as HTMLInputElement).style.borderColor = errors.name ? colors.status.danger : colors.border.mkt2
                          ;(e.target as HTMLInputElement).style.boxShadow = 'none'
                        }}
                      />
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={labelStyle()}>
                        Email <span style={{ color: colors.accent.bright }}>*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: false })) }}
                        placeholder="you@example.com"
                        style={inputStyle(errors.email)}
                        onFocus={e => {
                          (e.target as HTMLInputElement).style.borderColor = colors.accent.bright
                          ;(e.target as HTMLInputElement).style.boxShadow = `0 0 0 3px rgba(${colors.accent.glowRgb},0.16)`
                        }}
                        onBlur={e => {
                          (e.target as HTMLInputElement).style.borderColor = errors.email ? colors.status.danger : colors.border.mkt2
                          ;(e.target as HTMLInputElement).style.boxShadow = 'none'
                        }}
                      />
                    </div>

                    {/* Role field — shown only for "Join the journey" */}
                    {subject === 'journey' && (
                      <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle()}>Your background / role</label>
                        <select
                          value={role}
                          onChange={e => setRole(e.target.value)}
                          style={{
                            ...inputStyle(),
                            appearance: 'none' as const,
                            cursor: 'pointer',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%238a94a0' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 14px center',
                            paddingRight: '40px',
                          }}
                        >
                          <option value="">Select your role</option>
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                    )}

                    {/* Message */}
                    <div style={{ marginBottom: '8px' }}>
                      <label style={labelStyle()}>
                        Message <span style={{ color: colors.accent.bright }}>*</span>
                      </label>
                      <textarea
                        value={message}
                        onChange={e => { setMessage(e.target.value); setErrors(p => ({ ...p, message: false })) }}
                        placeholder="What's on your mind?"
                        rows={5}
                        style={{
                          ...inputStyle(errors.message),
                          resize: 'vertical' as const,
                          minHeight: '130px',
                          lineHeight: '1.55',
                        }}
                        onFocus={e => {
                          (e.target as HTMLTextAreaElement).style.borderColor = colors.accent.bright
                          ;(e.target as HTMLTextAreaElement).style.boxShadow = `0 0 0 3px rgba(${colors.accent.glowRgb},0.16)`
                        }}
                        onBlur={e => {
                          (e.target as HTMLTextAreaElement).style.borderColor = errors.message ? colors.status.danger : colors.border.mkt2
                          ;(e.target as HTMLTextAreaElement).style.boxShadow = 'none'
                        }}
                      />
                      <p style={{ fontSize: '12.5px', color: colors.text.dim, marginTop: '7px' }}>
                        {currentHint}
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={sending}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '100%', marginTop: '16px',
                        fontFamily: fontFamily.body, fontSize: fontSizeMkt.nav, fontWeight: 600,
                        letterSpacing: '-0.01em', padding: '13px 24px',
                        borderRadius: radiusMkt.sm,
                        background: sending ? colors.bg.surface2
                          : `linear-gradient(180deg, ${colors.accent.bright}, ${colors.accent.deep})`,
                        color: sending ? colors.text.muted2 : colors.accent.ink,
                        border: '1px solid transparent',
                        cursor: sending ? 'not-allowed' : 'pointer',
                        boxShadow: sending ? 'none' : shadows.btnPrimary,
                        transition: 'all .15s',
                      }}
                    >
                      {sending ? 'Sending…' : 'Send message'}
                    </button>
                  </form>
                )}
              </div>
            </ScrollReveal>
          </div>
        </Wrap>

        <style>{`
          @media (max-width: ${breakpoints.md}) {
            .contact-grid { grid-template-columns: 1fr !important; }
          }
          select option { background-color: ${colors.bg.mkt}; color: ${colors.text.base}; }
          input::placeholder, textarea::placeholder { color: ${colors.text.dim}; }
        `}</style>
      </section>
    </>
  )
}
