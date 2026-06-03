// app/profile/[id]/page.tsx
// Page profil publique — visible par tous
// Affiche les infos d'un builder sans possibilité d'édition
import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { Project } from '@/types'
import PageTransition from '@/components/PageTransition'
import Link from 'next/link'
import { SKILL_COLORS, LEVEL_COLORS, CONTACT_TYPES } from '@/lib/constants'
import BackButton from '@/components/BackButton'

type Props = {
  params: Promise<{ id: string }>
}

export default async function PublicProfilePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  // On récupère le profil public
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  // Profil introuvable → retour au feed
  if (error || !profile) redirect('/')

  // Projets postés par ce builder
  const { data: ownedProjects } = await supabase
    .from('projects')
    .select('*, project_skills(skill_needed)')
    .eq('owner_id', id)
    .order('created_at', { ascending: false })
    .returns<Project[]>()

  // Nom complet
  const fullName = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(' ') || profile.name || 'Anonymous'

  // Initiales
  const initials = [profile.first_name?.[0], profile.last_name?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase() || profile.name?.[0]?.toUpperCase() || '?'

  return (
    <PageTransition>
      <main className="max-w-4xl mx-auto px-4 py-10">

        <BackButton />

        {/* Header du profil */}
        <div
          className="rounded-2xl p-8 mb-6"
          style={{ backgroundColor: '#161B28', border: '1px solid #1E2840' }}
        >
          <div className="flex items-start justify-between mb-6">

            {/* Avatar + infos */}
            <div className="flex items-center gap-5">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #0D9488, #0EA5E9)' }}
              >
                {initials}
              </div>
              <div>
                <h1 className="text-xl font-bold mb-1" style={{ color: '#F1F5F9' }}>
                  {fullName}
                </h1>
                <div className="flex flex-wrap gap-3 mt-1">
                  {profile.country && (
                    <p className="text-sm flex items-center gap-1" style={{ color: '#475569' }}>
                      🌍 {profile.country}
                    </p>
                  )}
                  {profile.school && (
                    <p className="text-sm flex items-center gap-1" style={{ color: '#475569' }}>
                      🎓 {profile.school}
                    </p>
                  )}
                  {profile.major && (
                    <p className="text-sm flex items-center gap-1" style={{ color: '#475569' }}>
                      📚 {profile.major}
                    </p>
                  )}
                </div>

                {/* Contact préféré */}
                {profile.preferred_contact_type &&
                  CONTACT_TYPES[profile.preferred_contact_type] && (
                  <Link
                    href={profile.preferred_contact_value ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs mt-2 hover:opacity-80 transition-opacity"
                    style={{
                      color: CONTACT_TYPES[profile.preferred_contact_type].color
                    }}
                  >
                    {CONTACT_TYPES[profile.preferred_contact_type].icon}{' '}
                    {CONTACT_TYPES[profile.preferred_contact_type].label}
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm leading-relaxed mb-6" style={{ color: '#64748B' }}>
              {profile.bio}
            </p>
          )}

          {/* Stats */}
          <div
            className="flex items-center gap-6 pt-6"
            style={{ borderTop: '1px solid #1E2840' }}
          >
            <div>
              <p className="text-xl font-bold" style={{ color: '#F1F5F9' }}>
                {profile.avg_rating ? profile.avg_rating.toFixed(1) : '—'}
              </p>
              <p className="text-xs" style={{ color: '#475569' }}>
                ⭐ Avg rating ({profile.ratings_count ?? 0} reviews)
              </p>
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: '#F1F5F9' }}>
                {ownedProjects?.length ?? 0}
              </p>
              <p className="text-xs" style={{ color: '#475569' }}>
                Projects posted
              </p>
            </div>
          </div>
        </div>

        {/* Projets postés */}
        <h2 className="text-base font-semibold mb-4" style={{ color: '#94A3B8' }}>
          Projects
          <span
            className="ml-2 text-xs px-2 py-0.5 rounded-md"
            style={{ backgroundColor: '#0C1120', color: '#475569' }}
          >
            {ownedProjects?.length ?? 0}
          </span>
        </h2>

        {!ownedProjects || ownedProjects.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ backgroundColor: '#161B28', border: '1px solid #1E2840' }}
          >
            <p className="text-sm" style={{ color: '#475569' }}>
              No projects posted yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {ownedProjects.map(project => (
                <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block rounded-2xl p-5 transition-all border hover:border-teal-600"
                style={{
                    backgroundColor: '#161B28',
                    borderColor: '#1E2840'
                }}
                >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm" style={{ color: '#F1F5F9' }}>
                    {project.title}
                  </h3>
                  <span
                    className="text-xs px-2.5 py-0.5 rounded-md font-medium capitalize"
                    style={{
                      backgroundColor: project.status === 'open'
                        ? 'rgba(16,185,129,0.14)'
                        : 'rgba(245,158,11,0.14)',
                      color: project.status === 'open' ? '#6EE7B7' : '#FCD34D',
                    }}
                  >
                    {project.status}
                  </span>
                </div>
                <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: '#64748B' }}>
                  {project.problem}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.project_skills?.map(skill => {
                    const colors = SKILL_COLORS[skill.skill_needed] ?? {
                      bg: 'rgba(255,255,255,0.07)', text: '#CBD5E1'
                    }
                    return (
                      <span
                        key={skill.skill_needed}
                        className="text-xs px-2.5 py-0.5 rounded-md font-medium"
                        style={{ backgroundColor: colors.bg, color: colors.text }}
                      >
                        {skill.skill_needed}
                      </span>
                    )
                  })}
                  {project.level && (() => {
                    const colors = LEVEL_COLORS[project.level] ?? {
                      bg: 'rgba(255,255,255,0.07)', text: '#CBD5E1'
                    }
                    return (
                      <span
                        className="text-xs px-2.5 py-0.5 rounded-md font-medium capitalize"
                        style={{ backgroundColor: colors.bg, color: colors.text }}
                      >
                        {project.level}
                      </span>
                    )
                  })()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </PageTransition>
  )
}