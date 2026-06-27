// app/post/page.tsx
// Page to create a new project.
// 'use client' — uses useState to manage the form.
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import PageTransition from '@/components/PageTransition'
import { SKILLS, DOMAINS, LEVELS, DURATIONS } from '@/lib/constants'
import { colors, radius, fontSize, styles } from '@/lib/design-tokens'
import { Analytics } from "@vercel/analytics/next"

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

type FormState = {
  title: string
  problem: string
  level: string
  domain: string
  duration: string
  spots: string
  website_url: string
  github_url: string
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

const inputStyle = {
  width: '100%',
  backgroundColor: colors.bg.elevated,
  border: `0.5px solid ${colors.border.default}`,
  borderRadius: radius.lg,
  color: colors.text.primary,
  fontSize: fontSize.sm,
  padding: '8px 12px',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s',
}

const labelStyle = {
  fontSize: fontSize.xs,
  color: colors.text.muted,
  marginBottom: '4px',
  display: 'block' as const,
}

const requiredMark = (
  <span style={{ color: colors.accent.tealText, marginLeft: '2px' }}>*</span>
)

// ─────────────────────────────────────────
// Main component
// ─────────────────────────────────────────

export default function PostProjectPage() {
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  const [form, setForm] = useState<FormState>({
    title:       '',
    problem:     '',
    level:       '',
    domain:      '',
    duration:    '',
    spots:       '',
    website_url: '',
    github_url:  '',
  })

  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState<string | null>(null)

  // Focus / blur border handlers
  const onFocus = (e: React.FocusEvent<HTMLElement>) =>
    (e.currentTarget as HTMLElement).style.borderColor = colors.accent.teal
  const onBlur  = (e: React.FocusEvent<HTMLElement>) =>
    (e.currentTarget as HTMLElement).style.borderColor = colors.border.default

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Toggle a skill in/out of the selection
  function toggleSkill(skill: string) {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Validation
    if (!form.title || !form.problem || !form.level || !form.domain) {
      setError('Title, problem, domain and level are required.')
      return
    }
    if (selectedSkills.length === 0) {
      setError('Select at least one skill.')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // Step 1 — Insert the project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          owner_id:    user.id,
          title:       form.title,
          problem:     form.problem,
          level:       form.level,
          domain:      form.domain,
          spots:       form.spots    ? parseInt(form.spots) : null,
          duration:    form.duration || null,
          website_url: form.website_url.trim() || null,
          github_url:  form.github_url.trim()  || null,
          status:      'open',
        })
        .select()
        .single()

      if (projectError) throw projectError

      // Step 2 — Insert the required skills
      const { error: skillsError } = await supabase
        .from('project_skills')
        .insert(selectedSkills.map(skill => ({
          project_id:   project.id,
          skill_needed: skill,
        })))

      if (skillsError) throw skillsError

      router.push('/')

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : ''
      if (message.includes('projects_level_check')) {
        setError('Please select a valid level.')
      } else if (message.includes('duplicate')) {
        setError('A project with this title already exists.')
      } else {
        setError('Something went wrong. Please check your inputs and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────

  return (
    <PageTransition>
      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 16px' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{
            fontSize: fontSize.xl,
            fontWeight: 500,
            color: colors.text.primary,
            letterSpacing: '-0.02em',
            marginBottom: '4px',
          }}>
            Post a project
          </h1>
          <p style={{ fontSize: fontSize.sm, color: colors.text.muted }}>
            Describe your project and the skills you&apos;re looking for.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Title */}
          <div>
            <label style={labelStyle}>Project title {requiredMark}</label>
            <input
              name="title" type="text"
              placeholder="e.g. Nutritional tracking app for rural areas"
              value={form.title} onChange={handleChange}
              style={inputStyle} onFocus={onFocus} onBlur={onBlur}
            />
          </div>

          {/* Problem */}
          <div>
            <label style={labelStyle}>Problem being solved {requiredMark}</label>
            <textarea
              name="problem"
              placeholder="Describe the problem your project aims to solve and what you're building..."
              value={form.problem} onChange={handleChange}
              rows={4}
              style={{ ...inputStyle, resize: 'none' }}
              onFocus={onFocus} onBlur={onBlur}
            />
          </div>

          {/* Domain + Level */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

            {/* Domain */}
            <div>
              <label style={labelStyle}>Domain {requiredMark}</label>
              <select
                name="domain" value={form.domain} onChange={handleChange}
                style={{
                  ...inputStyle,
                  color: form.domain ? colors.text.primary : colors.text.muted,
                }}
                onFocus={onFocus} onBlur={onBlur}
              >
                <option value="" disabled>Choose a domain</option>
                {DOMAINS.map(d => (
                  <option key={d} value={d} style={{ backgroundColor: colors.bg.elevated }}>{d}</option>
                ))}
              </select>
            </div>

            {/* Level */}
            <div>
              <label style={labelStyle}>Expected level {requiredMark}</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {LEVELS.map(level => {
                  const isActive = form.level === level
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, level }))}
                      style={{
                        flex: 1,
                        padding: '7px 4px',
                        borderRadius: radius.lg,
                        fontSize: fontSize.xs,
                        fontWeight: isActive ? 500 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        textTransform: 'capitalize',
                        backgroundColor: isActive ? colors.accent.tealDim  : colors.bg.elevated,
                        border:          isActive ? `0.5px solid ${colors.accent.tealBorder}` : `0.5px solid ${colors.border.default}`,
                        color:           isActive ? colors.accent.tealText : colors.text.muted,
                      }}
                    >
                      {level}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Duration + Spots */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

            {/* Duration */}
            <div>
              <label style={labelStyle}>Estimated duration</label>
              <select
                name="duration" value={form.duration} onChange={handleChange}
                style={{
                  ...inputStyle,
                  color: form.duration ? colors.text.primary : colors.text.muted,
                }}
                onFocus={onFocus} onBlur={onBlur}
              >
                <option value="">Select duration</option>
                {DURATIONS.map(d => (
                  <option key={d} value={d} style={{ backgroundColor: colors.bg.elevated }}>{d}</option>
                ))}
              </select>
            </div>

            {/* Spots */}
            <div>
              <label style={labelStyle}>Spots needed</label>
              <input
                name="spots" type="number" min="1" max="10"
                placeholder="e.g. 3"
                value={form.spots} onChange={handleChange}
                style={inputStyle} onFocus={onFocus} onBlur={onBlur}
              />
            </div>
          </div>

          {/* Website + GitHub */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

            {/* Website / Demo */}
            <div>
              <label style={labelStyle}>Demo / Website</label>
              <input
                name="website_url" type="url"
                placeholder="https://your-demo.vercel.app"
                value={form.website_url} onChange={handleChange}
                style={inputStyle} onFocus={onFocus} onBlur={onBlur}
              />
            </div>

            {/* GitHub */}
            <div>
              <label style={labelStyle}>GitHub repository</label>
              <input
                name="github_url" type="url"
                placeholder="https://github.com/you/repo"
                value={form.github_url} onChange={handleChange}
                style={inputStyle} onFocus={onFocus} onBlur={onBlur}
              />
            </div>
          </div>

          {/* Skills */}
          <div>
            <label style={{ ...labelStyle, marginBottom: '8px' }}>
              Skills needed {requiredMark}
              <span style={{ color: colors.text.muted, marginLeft: '6px', fontWeight: 400 }}>
                (multiple selections allowed)
              </span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {SKILLS.map(skill => {
                const isActive = selectedSkills.includes(skill)
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    style={{
                      fontSize: fontSize.xs,
                      fontWeight: isActive ? 500 : 400,
                      padding: '4px 10px',
                      borderRadius: radius.lg,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      backgroundColor: isActive ? colors.accent.tealDim  : colors.bg.elevated,
                      border:          isActive ? `0.5px solid ${colors.accent.tealBorder}` : `0.5px solid ${colors.border.default}`,
                      color:           isActive ? colors.accent.tealText : colors.text.muted,
                    }}
                  >
                    {skill}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              padding: '10px 14px',
              borderRadius: radius.lg,
              backgroundColor: colors.status.dangerDim,
              border: `0.5px solid rgba(239,68,68,0.25)`,
              color: colors.status.danger,
              fontSize: fontSize.sm,
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.btnPrimary,
              width: '100%',
              padding: '10px',
              fontSize: fontSize.sm,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Publishing...' : 'Publish project'}
          </button>

        </form>
      </main>
      <Analytics />
    </PageTransition>
  )
}