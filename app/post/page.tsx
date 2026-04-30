// app/post/page.tsx
// Page pour créer un nouveau projet
// 'use client' car on utilise useState pour gérer le formulaire
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import PageTransition from '@/components/PageTransition'
import { SKILLS, DOMAINS, LEVELS, DURATIONS } from '@/lib/constants'

export default function PostProjectPage() {
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  // État du formulaire — un objet qui contient tous les champs
  const [form, setForm] = useState({
    title: '',
    problem: '',
    level: '',
    domain: '',
    duration: '', // Durée estimée du projet
    spots: '',    // Nombre de collaborateurs recherchés
  })

  // Les skills recherchées sont un tableau séparé
  // car un projet peut en avoir plusieurs
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])

  // État de chargement — pour désactiver le bouton pendant l'envoi
  const [loading, setLoading] = useState(false)

  // Message d'erreur à afficher si quelque chose échoue
  const [error, setError] = useState<string | null>(null)

  // Met à jour un champ du formulaire
  // On utilise le nom du champ pour savoir lequel mettre à jour
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Ajoute ou retire une skill de la sélection
  // Si elle est déjà sélectionnée, on la retire — sinon on l'ajoute
  function toggleSkill(skill: string) {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    )
  }

  // Soumission du formulaire
  async function handleSubmit(e: React.FormEvent) {
    // Empêche le rechargement de la page par défaut
    e.preventDefault()
    setError(null)

    // Validation — les champs obligatoires doivent être remplis
    if (!form.title || !form.problem || !form.level || !form.domain) {
      setError('All fields are mandatory.')
      return
    }

    if (selectedSkills.length === 0) {
      setError('Select at least one skill.')
      return
    }

    setLoading(true)

    try {
      // On récupère l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // Ne devrait pas arriver grâce au middleware
        // mais on gère le cas par sécurité
        router.push('/login')
        return
      }

      // Étape 1 — On insère le projet dans la table projects
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          owner_id: user.id,
          title: form.title,
          problem: form.problem,
          level: form.level,
          domain: form.domain,
          // parseInt retourne NaN si vide — on stocke null dans ce cas
          spots: form.spots ? parseInt(form.spots) : null,
          duration: form.duration || null,
          status: 'open',
        })
        // .select() retourne le projet créé avec son id généré
        .select()
        .single()

      if (projectError) throw projectError

      // Étape 2 — On insère les skills recherchées
      // On crée un objet par skill avec le project_id
      const skillsToInsert = selectedSkills.map(skill => ({
        project_id: project.id,
        skill_needed: skill,
      }))

      const { error: skillsError } = await supabase
        .from('project_skills')
        .insert(skillsToInsert)

      if (skillsError) throw skillsError

      // Tout s'est bien passé — on redirige vers le feed
      router.push('/')

    } catch (err: any) {
      // On affiche l'erreur Supabase si quelque chose échoue
      setError(err.message ?? 'An error occurred.')
    } finally {
      // Dans tous les cas, on réactive le bouton
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <main className="max-w-2xl mx-auto px-4 py-10">

        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#F1F5F9' }}>
            Post a project
          </h1>
          <p className="text-sm" style={{ color: '#64748B' }}>
            Describe your project and the skills needed.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Project title */}
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="text-sm font-medium" style={{ color: '#94A3B8' }}>
              Project title <span style={{ color: '#0D9488' }}>*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="Ex: Nutritional Tracking App for Rural Areas"
              value={form.title}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
              style={{ backgroundColor: '#161B28', border: '1px solid #1E2840', color: '#F1F5F9' }}
              onFocus={e => (e.currentTarget.style.borderColor = '#0D9488')}
              onBlur={e => (e.currentTarget.style.borderColor = '#1E2840')}
            />
          </div>

          {/* Problem description */}
          <div className="flex flex-col gap-2">
            <label htmlFor="problem" className="text-sm font-medium" style={{ color: '#94A3B8' }}>
              Problem being solved <span style={{ color: '#0D9488' }}>*</span>
            </label>
            <textarea
              id="problem"
              name="problem"
              placeholder="Describe the problem your project aims to solve and what you are trying to build..."
              value={form.problem}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors resize-none"
              style={{ backgroundColor: '#161B28', border: '1px solid #1E2840', color: '#F1F5F9' }}
              onFocus={e => (e.currentTarget.style.borderColor = '#0D9488')}
              onBlur={e => (e.currentTarget.style.borderColor = '#1E2840')}
            />
          </div>

          {/* Domain + Level sur la même ligne */}
          <div className="grid grid-cols-2 gap-4">

            {/* Domain */}
            <div className="flex flex-col gap-2">
              <label htmlFor="domain" className="text-sm font-medium" style={{ color: '#94A3B8' }}>
                Domain <span style={{ color: '#0D9488' }}>*</span>
              </label>
              <select
                id="domain"
                name="domain"
                value={form.domain}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
                style={{
                  backgroundColor: '#161B28',
                  border: '1px solid #1E2840',
                  color: form.domain ? '#F1F5F9' : '#475569',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#0D9488')}
                onBlur={e => (e.currentTarget.style.borderColor = '#1E2840')}
              >
                <option value="" disabled>Choose a domain</option>
                {DOMAINS.map(domain => (
                  <option key={domain} value={domain} style={{ backgroundColor: '#161B28' }}>
                    {domain}
                  </option>
                ))}
              </select>
            </div>

            {/* Level */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ color: '#94A3B8' }}>
                Expected level <span style={{ color: '#0D9488' }}>*</span>
              </label>
              <div className="flex gap-2">
                {/* On utilise LEVELS depuis constants.ts
                    pour avoir la même liste partout dans l'app */}
                {LEVELS.map(level => (
                  <button
                    key={level}
                    type="button"
                    // type="button" est crucial — sans ça le bouton
                    // soumet le formulaire au lieu de sélectionner le niveau
                    onClick={() => setForm(prev => ({ ...prev, level }))}
                    className="flex-1 py-2.5 rounded-xl text-xs font-medium capitalize transition-all"
                    style={{
                      backgroundColor: form.level === level
                        ? 'rgba(13,148,136,0.2)'
                        : '#161B28',
                      border: form.level === level
                        ? '1px solid #0D9488'
                        : '1px solid #1E2840',
                      color: form.level === level ? '#5EEAD4' : '#64748B',
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Duration + Spots sur la même ligne */}
          <div className="grid grid-cols-2 gap-4">

            {/* Duration */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ color: '#94A3B8' }}>
                Estimated duration
              </label>
              <select
                name="duration"
                value={form.duration}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
                style={{
                  backgroundColor: '#161B28',
                  border: '1px solid #1E2840',
                  color: form.duration ? '#F1F5F9' : '#475569',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#0D9488')}
                onBlur={e => (e.currentTarget.style.borderColor = '#1E2840')}
              >
                <option value="">Select duration</option>
                {/* On utilise DURATIONS depuis constants.ts */}
                {DURATIONS.map(d => (
                  <option key={d} value={d} style={{ backgroundColor: '#161B28' }}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Spots */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ color: '#94A3B8' }}>
                Spots needed
              </label>
              <input
                name="spots"
                type="number"
                min="1"
                max="10"
                placeholder="Ex: 3"
                value={form.spots}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
                style={{ backgroundColor: '#161B28', border: '1px solid #1E2840', color: '#F1F5F9' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#0D9488')}
                onBlur={e => (e.currentTarget.style.borderColor = '#1E2840')}
              />
            </div>
          </div>

          {/* Desired skills */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: '#94A3B8' }}>
              Desired skills <span style={{ color: '#0D9488' }}>*</span>
              <span className="ml-2 text-xs" style={{ color: '#475569' }}>
                (Multiple selections possible)
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {/* On utilise SKILLS depuis constants.ts
                  pour avoir la même liste partout dans l'app */}
              {SKILLS.map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                  style={{
                    backgroundColor: selectedSkills.includes(skill)
                      ? 'rgba(13,148,136,0.2)'
                      : '#161B28',
                    border: selectedSkills.includes(skill)
                      ? '1px solid #0D9488'
                      : '1px solid #1E2840',
                    color: selectedSkills.includes(skill) ? '#5EEAD4' : '#64748B',
                  }}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div
              className="px-4 py-3 rounded-xl text-sm"
              style={{
                backgroundColor: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#FCA5A5',
              }}
            >
              {error}
            </div>
          )}

          {/* Publish button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-medium text-sm transition-all"
            style={{
              backgroundColor: loading ? '#0F766E' : '#0D9488',
              color: 'white',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Publishing...' : 'Publish the project'}
          </button>

        </form>
      </main>
    </PageTransition>
  )
}