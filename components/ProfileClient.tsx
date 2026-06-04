// components/ProfileClient.tsx
// Displays and edits the authenticated user's profile.
// Broken into sub-components: ProfileEditForm, ProjectRow, ProjectSection.
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import { Project } from '@/types'
import { CONTACT_TYPES } from '@/lib/constants'
import { colors, radius, fontSize, styles } from '@/lib/design-tokens'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

type Profile = {
  id: string
  first_name: string | null
  last_name: string | null
  country: string | null
  bio: string | null
  school: string | null
  major: string | null
  builder_type: 'student' | 'bootcamp' | 'self_learner' | 'professional' | null
  institution: string | null
  program: string | null
  avg_rating: number
  ratings_count: number
  preferred_contact_type: string | null
  preferred_contact_value: string | null
}

type ProfileForm = {
  first_name: string
  last_name: string
  country: string
  bio: string
  builder_type: string
  institution: string
  program: string
  preferred_contact_type: string
  preferred_contact_value: string
}

type Props = {
  profile: Profile
  ownedProjects: Project[]
  joinedProjects: Project[]
  followedProjects: Project[]
  email: string
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

const inputStyle = {
  backgroundColor: colors.bg.surface,
  border: `0.5px solid ${colors.border.default}`,
  borderRadius: radius.lg,
  color: colors.text.primary,
  fontSize: fontSize.sm,
  padding: '7px 10px',
  outline: 'none',
  width: '100%',
  fontFamily: 'inherit',
}

const tagStyle = {
  ...styles.tag,
  fontSize: fontSize.xs,
  padding: '2px 7px',
}

// ─────────────────────────────────────────
// Sub-component: ProjectRow
// ─────────────────────────────────────────

function ProjectRow({ project, showOwner = false }: {
  project: Project
  showOwner?: boolean
}) {
  return (
    <Link
      href={`/projects/${project.id}`}
      onClick={() => sessionStorage.setItem('projectDetailFrom', '/profile')}
      style={{
        display: 'block',
        textDecoration: 'none',
        backgroundColor: colors.bg.elevated,
        border: `0.5px solid ${colors.border.default}`,
        borderRadius: radius.xxl,
        padding: '14px',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = colors.border.hover)}
      onMouseLeave={e => (e.currentTarget.style.borderColor = colors.border.default)}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <h3 style={{ fontSize: fontSize.sm, fontWeight: 500, color: colors.text.primary }}>
          {project.title}
        </h3>
        <span style={{
          fontSize: fontSize.xs,
          padding: '2px 7px',
          borderRadius: radius.md,
          backgroundColor: project.status === 'open' ? colors.status.successDim : colors.status.warningDim,
          color: project.status === 'open' ? colors.status.success : colors.status.warning,
          textTransform: 'capitalize',
          flexShrink: 0,
        }}>
          {project.status}
        </span>
      </div>

      {showOwner && (project.profiles as any)?.name && (
        <p style={{ fontSize: fontSize.xs, color: colors.text.muted, marginBottom: '4px' }}>
          by {(project.profiles as any).name}
        </p>
      )}

      <p style={{
        fontSize: fontSize.xs,
        color: colors.text.muted,
        lineHeight: 1.5,
        marginBottom: '10px',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical' as const,
        overflow: 'hidden',
      }}>
        {project.problem}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {project.project_skills?.map(skill => (
          <span key={skill.skill_needed} style={tagStyle}>{skill.skill_needed}</span>
        ))}
        {project.level && (
          <span style={{ ...tagStyle, color: colors.text.muted, textTransform: 'capitalize' }}>
            {project.level}
          </span>
        )}
      </div>
    </Link>
  )
}

// ─────────────────────────────────────────
// Sub-component: ProjectSection
// ─────────────────────────────────────────

function ProjectSection({
  title, count, projects, showOwner = false, emptyMessage, emptyAction,
}: {
  title: string
  count: number
  projects: Project[]
  showOwner?: boolean
  emptyMessage: string
  emptyAction?: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <h2 style={{ fontSize: fontSize.base, fontWeight: 500, color: colors.text.secondary }}>
          {title}
        </h2>
        <span style={{
          fontSize: fontSize.xs,
          padding: '1px 6px',
          borderRadius: radius.md,
          backgroundColor: colors.bg.hover,
          color: colors.text.muted,
          border: `0.5px solid ${colors.border.default}`,
        }}>
          {count}
        </span>
      </div>

      {projects.length === 0 ? (
        <div style={{
          backgroundColor: colors.bg.elevated,
          border: `0.5px solid ${colors.border.default}`,
          borderRadius: radius.xxl,
          padding: '32px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: fontSize.sm, color: colors.text.muted, marginBottom: emptyAction ? '8px' : '0' }}>
            {emptyMessage}
          </p>
          {emptyAction}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {projects.map(project => (
            <ProjectRow key={project.id} project={project} showOwner={showOwner} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────
// Sub-component: ProfileEditForm
// ─────────────────────────────────────────

const BUILDER_CONTEXT: Record<string, {
  institution: string
  program: string
  institutionPlaceholder: string
  programPlaceholder: string
}> = {
  student:      { institution: 'University / School',      program: 'Major / Specialty',       institutionPlaceholder: 'e.g. MIT, DSTI',           programPlaceholder: 'e.g. Computer Science' },
  bootcamp:     { institution: 'Bootcamp name',            program: 'Program',                  institutionPlaceholder: 'e.g. Le Wagon, Ironhack',  programPlaceholder: 'e.g. Full-Stack Web' },
  self_learner: { institution: 'Main learning platform',   program: 'Focus area',               institutionPlaceholder: 'e.g. Coursera, YouTube',   programPlaceholder: 'e.g. Machine Learning' },
  professional: { institution: 'Company / Organization',   program: 'Domain switching to',      institutionPlaceholder: 'e.g. Google, Freelance',   programPlaceholder: 'e.g. Data Engineering' },
}

const BUILDER_TYPES = [
  { value: 'student',      label: '🎓 Student' },
  { value: 'bootcamp',     label: '⚡ Bootcamp' },
  { value: 'self_learner', label: '📚 Self-learner' },
  { value: 'professional', label: '💼 Professional' },
]

function ProfileEditForm({ form, onChange, onBuilderTypeChange }: {
  form: ProfileForm
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onBuilderTypeChange: (type: string) => void
}) {
  const context = BUILDER_CONTEXT[form.builder_type] ?? BUILDER_CONTEXT.student

  const focusStyle = (e: React.FocusEvent<HTMLElement>) =>
    (e.currentTarget as HTMLElement).style.borderColor = colors.accent.teal
  const blurStyle  = (e: React.FocusEvent<HTMLElement>) =>
    (e.currentTarget as HTMLElement).style.borderColor = colors.border.default

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Builder type selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: fontSize.xs, color: colors.text.muted }}>I am a...</label>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {BUILDER_TYPES.map(type => {
            const isActive = form.builder_type === type.value
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => onBuilderTypeChange(type.value)}
                style={{
                  fontSize: fontSize.xs,
                  fontWeight: isActive ? 500 : 400,
                  padding: '5px 12px',
                  borderRadius: radius.lg,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  backgroundColor: isActive ? colors.accent.tealDim  : 'transparent',
                  color:           isActive ? colors.accent.tealText : colors.text.muted,
                  border:          isActive
                    ? `0.5px solid ${colors.accent.tealBorder}`
                    : `0.5px solid ${colors.border.default}`,
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.borderColor = colors.border.hover
                    ;(e.currentTarget as HTMLElement).style.color = colors.text.secondary
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.borderColor = colors.border.default
                    ;(e.currentTarget as HTMLElement).style.color = colors.text.muted
                  }
                }}
              >
                {type.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Grid fields */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: fontSize.xs, color: colors.text.muted }}>Country</label>
          <input name="country" type="text" placeholder="e.g. France"
            value={form.country} onChange={onChange}
            style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: fontSize.xs, color: colors.text.muted }}>{context.institution}</label>
          <input name="institution" type="text" placeholder={context.institutionPlaceholder}
            value={form.institution} onChange={onChange}
            style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: fontSize.xs, color: colors.text.muted }}>{context.program}</label>
          <input name="program" type="text" placeholder={context.programPlaceholder}
            value={form.program} onChange={onChange}
            style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: fontSize.xs, color: colors.text.muted }}>Preferred contact</label>
          <select name="preferred_contact_type" value={form.preferred_contact_type}
            onChange={onChange}
            style={{ ...inputStyle, color: form.preferred_contact_type ? colors.text.primary : colors.text.muted }}
            onFocus={focusStyle} onBlur={blurStyle}>
            <option value="">Select a platform</option>
            {Object.entries(CONTACT_TYPES).map(([key, val]) => (
              <option key={key} value={key} style={{ backgroundColor: colors.bg.elevated }}>
                {val.icon} {val.label}
              </option>
            ))}
          </select>
        </div>

        {form.preferred_contact_type && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: '1 / -1' }}>
            <label style={{ fontSize: fontSize.xs, color: colors.text.muted }}>
              {CONTACT_TYPES[form.preferred_contact_type]?.label} link or username
            </label>
            <input name="preferred_contact_value" type="text"
              placeholder={form.preferred_contact_type === 'email' ? 'your@email.com' : 'https://...'}
              value={form.preferred_contact_value} onChange={onChange}
              style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: '1 / -1' }}>
          <label style={{ fontSize: fontSize.xs, color: colors.text.muted }}>Bio</label>
          <textarea name="bio" rows={3}
            placeholder="Tell others about yourself, your skills, and what you want to build..."
            value={form.bio} onChange={onChange}
            style={{ ...inputStyle, resize: 'none' }}
            onFocus={focusStyle} onBlur={blurStyle} />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// Main component: ProfileClient
// ─────────────────────────────────────────

export default function ProfileClient({ profile, ownedProjects, joinedProjects, followedProjects, email }: Props) {
  const supabase = createBrowserSupabaseClient()

  const [editing, setEditing] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)

  const [form, setForm] = useState<ProfileForm>({
    first_name:              profile?.first_name              ?? '',
    last_name:               profile?.last_name               ?? '',
    country:                 profile?.country                 ?? '',
    bio:                     profile?.bio                     ?? '',
    builder_type:            profile?.builder_type            ?? 'student',
    institution:             profile?.institution ?? profile?.school ?? '',
    program:                 profile?.program     ?? profile?.major  ?? '',
    preferred_contact_type:  profile?.preferred_contact_type  ?? '',
    preferred_contact_value: profile?.preferred_contact_value ?? '',
  })

  const fullName = [form.first_name, form.last_name].filter(Boolean).join(' ')
  const initials = ([form.first_name?.[0], form.last_name?.[0]]
    .filter(Boolean).join('').toUpperCase()) || email[0].toUpperCase()

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleBuilderTypeChange(type: string) {
    setForm(prev => ({ ...prev, builder_type: type }))
  }

  async function handleSave() {
    setSaving(true)
    await supabase.from('profiles').update({
      first_name:              form.first_name,
      last_name:               form.last_name,
      name:                    fullName || null,
      country:                 form.country,
      bio:                     form.bio,
      builder_type:            form.builder_type,
      institution:             form.institution  || null,
      program:                 form.program      || null,
      preferred_contact_type:  form.preferred_contact_type  || null,
      preferred_contact_value: form.preferred_contact_value || null,
    }).eq('id', profile.id)

    setSaving(false)
    setSaved(true)
    setEditing(false)
    setTimeout(() => setSaved(false), 2000)
  }

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────

  return (
    <main style={{ maxWidth: '1152px', margin: '0 auto', padding: '32px 16px' }}>

      {/* Profile card */}
      <div style={{
        backgroundColor: colors.bg.elevated,
        border: `0.5px solid ${colors.border.default}`,
        borderRadius: radius.xxl,
        padding: '24px',
        marginBottom: '32px',
      }}>

        {/* Top row — avatar + name + actions */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

            {/* Avatar */}
            <div style={{
              width: '52px', height: '52px',
              borderRadius: radius.xl,
              backgroundColor: colors.accent.teal,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: fontSize.lg,
              fontWeight: 500,
              color: '#fff',
              flexShrink: 0,
            }}>
              {initials}
            </div>

            {/* Name inputs or display */}
            {editing ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <input name="first_name" type="text" placeholder="First name"
                  value={form.first_name} onChange={handleChange}
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = colors.accent.teal)}
                  onBlur={e => (e.currentTarget.style.borderColor = colors.border.default)} />
                <input name="last_name" type="text" placeholder="Last name"
                  value={form.last_name} onChange={handleChange}
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = colors.accent.teal)}
                  onBlur={e => (e.currentTarget.style.borderColor = colors.border.default)} />
              </div>
            ) : (
              <div>
                <h1 style={{ fontSize: fontSize.lg, fontWeight: 500, color: colors.text.primary, marginBottom: '2px' }}>
                  {fullName || 'No name yet'}
                </h1>
                <p style={{ fontSize: fontSize.xs, color: colors.text.muted }}>{email}</p>
                {form.preferred_contact_type && CONTACT_TYPES[form.preferred_contact_type] && (
                  <p style={{ fontSize: fontSize.xs, marginTop: '3px', color: CONTACT_TYPES[form.preferred_contact_type].color }}>
                    {CONTACT_TYPES[form.preferred_contact_type].icon}{' '}
                    {CONTACT_TYPES[form.preferred_contact_type].label}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Edit / Save / Cancel */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {saved && (
              <span style={{ fontSize: fontSize.xs, color: colors.status.success }}>✓ Saved</span>
            )}
            {editing ? (
              <>
                <button onClick={() => setEditing(false)} style={styles.btnGhost}>Cancel</button>
                <button onClick={handleSave} disabled={saving}
                  style={{ ...styles.btnPrimary, opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} style={styles.btnTeal}>
                Edit profile
              </button>
            )}
          </div>
        </div>

        {/* Edit form or display mode */}
        {editing ? (
          <ProfileEditForm
            form={form}
            onChange={handleChange}
            onBuilderTypeChange={handleBuilderTypeChange}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: fontSize.sm, color: colors.text.muted, lineHeight: 1.6 }}>
              {form.bio || 'No bio yet. Click "Edit profile" to add one.'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              {form.country && (
                <span style={{ fontSize: fontSize.xs, color: colors.text.muted }}>
                  🌍 {form.country}
                </span>
              )}
              {form.institution && (
                <span style={{ fontSize: fontSize.xs, color: colors.text.muted }}>
                  {form.builder_type === 'student'      ? '🎓' :
                   form.builder_type === 'bootcamp'     ? '⚡' :
                   form.builder_type === 'self_learner' ? '📚' : '💼'} {form.institution}
                </span>
              )}
              {form.program && (
                <span style={{ fontSize: fontSize.xs, color: colors.text.muted }}>
                  · {form.program}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: `0.5px solid ${colors.border.default}`,
        }}>
          <div>
            <p style={{ fontSize: fontSize.xl, fontWeight: 500, color: colors.text.primary, letterSpacing: '-0.02em' }}>
              {profile?.avg_rating ? profile.avg_rating.toFixed(1) : '—'}
            </p>
            <p style={{ fontSize: fontSize.xs, color: colors.text.muted }}>
              ⭐ avg rating · {profile?.ratings_count ?? 0} reviews
            </p>
          </div>
          <div>
            <p style={{ fontSize: fontSize.xl, fontWeight: 500, color: colors.text.primary, letterSpacing: '-0.02em' }}>
              {ownedProjects.length}
            </p>
            <p style={{ fontSize: fontSize.xs, color: colors.text.muted }}>
              projects posted
            </p>
          </div>
        </div>
      </div>

      {/* Project sections */}
      <ProjectSection
        title="Posted projects"
        count={ownedProjects.length}
        projects={ownedProjects}
        emptyMessage="You haven't posted any projects yet."
        emptyAction={
          <Link href="/post" style={{ fontSize: fontSize.sm, color: colors.accent.tealText }}>
            Post your first project →
          </Link>
        }
      />

      <ProjectSection
        title="Projects joined"
        count={joinedProjects.length}
        projects={joinedProjects}
        showOwner
        emptyMessage="You haven't joined any projects yet."
      />

      <ProjectSection
        title="Projects followed"
        count={followedProjects.length}
        projects={followedProjects}
        showOwner
        emptyMessage="You're not following any projects yet."
      />

    </main>
  )
}