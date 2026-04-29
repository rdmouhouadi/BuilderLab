// app/post/page.tsx
// Page pour créer un nouveau projet
// 'use client' car on utilise useState pour gérer le formulaire
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'

// Liste des compétences disponibles
// Ce sont exactement les mêmes que dans FilterBar
// pour garder la cohérence
const SKILLS = ['Developer', 'Designer', 'Data Scientist', 'Business', 'Marketing']

// Liste des domaines disponibles
const DOMAINS = [
  'Education', 'Santé', 'AgriTech', 'Fintech',
  'Logistique', 'Environnement', 'Social', 'Autre'
]

export default function PostProjectPage() {
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  // État du formulaire — un objet qui contient tous les champs
  const [form, setForm] = useState({
    title: '',
    problem: '',
    level: '',
    domain: '',
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

    // Validation simple — tous les champs sont obligatoires
    if (!form.title || !form.problem || !form.level || !form.domain) {
      setError('Tous les champs sont obligatoires.')
      return
    }

    if (selectedSkills.length === 0) {
      setError('Sélectionne au moins une compétence recherchée.')
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
      setError(err.message ?? 'Une erreur est survenue.')
    } finally {
      // Dans tous les cas, on réactive le bouton
      setLoading(false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">

      {/* En-tête */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: '#F1F5F9' }}
        >
          Poster un projet
        </h1>
        <p style={{ color: '#64748B' }} className="text-sm">
          Décris ton projet et les compétences dont tu as besoin.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* Titre du projet */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="title"
            className="text-sm font-medium"
            style={{ color: '#94A3B8' }}
          >
            Titre du projet
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Ex: App de suivi nutritionnel pour zones rurales"
            value={form.title}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
            style={{
              backgroundColor: '#161B28',
              border: '1px solid #1E2840',
              color: '#F1F5F9',
            }}
            // Change la bordure au focus
            onFocus={e => (e.currentTarget.style.borderColor = '#0D9488')}
            onBlur={e => (e.currentTarget.style.borderColor = '#1E2840')}
          />
        </div>

        {/* Description du problème */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="problem"
            className="text-sm font-medium"
            style={{ color: '#94A3B8' }}
          >
            Problème à résoudre
          </label>
          <textarea
            id="problem"
            name="problem"
            placeholder="Décris le problème que ton projet veut résoudre et ce que tu cherches à construire..."
            value={form.problem}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors resize-none"
            style={{
              backgroundColor: '#161B28',
              border: '1px solid #1E2840',
              color: '#F1F5F9',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#0D9488')}
            onBlur={e => (e.currentTarget.style.borderColor = '#1E2840')}
          />
        </div>

        {/* Domaine */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="domain"
            className="text-sm font-medium"
            style={{ color: '#94A3B8' }}
          >
            Domaine
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
            <option value="" disabled>Sélectionne un domaine</option>
            {DOMAINS.map(domain => (
              <option key={domain} value={domain}
                style={{ backgroundColor: '#161B28' }}
              >
                {domain}
              </option>
            ))}
          </select>
        </div>

        {/* Niveau */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" style={{ color: '#94A3B8' }}>
            Niveau attendu
          </label>
          <div className="flex gap-3">
            {['débutant', 'intermédiaire', 'avancé'].map(level => (
              <button
                key={level}
                type="button"
                // type="button" est crucial — sans ça le bouton
                // soumet le formulaire au lieu de juste sélectionner le niveau
                onClick={() => setForm(prev => ({ ...prev, level }))}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-all"
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

        {/* Compétences recherchées */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" style={{ color: '#94A3B8' }}>
            Compétences recherchées
            <span className="ml-2 text-xs" style={{ color: '#475569' }}>
              (plusieurs possibles)
            </span>
          </label>
          <div className="flex flex-wrap gap-2">
            {SKILLS.map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  backgroundColor: selectedSkills.includes(skill)
                    ? 'rgba(13,148,136,0.2)'
                    : '#161B28',
                  border: selectedSkills.includes(skill)
                    ? '1px solid #0D9488'
                    : '1px solid #1E2840',
                  color: selectedSkills.includes(skill)
                    ? '#5EEAD4'
                    : '#64748B',
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

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-medium text-sm transition-all"
          style={{
            backgroundColor: loading ? '#0F766E' : '#0D9488',
            color: 'white',
            // opacity réduite quand chargement en cours
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Publication en cours...' : 'Publier le projet'}
        </button>

      </form>
    </main>
  )
}