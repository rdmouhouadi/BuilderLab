// lib/constants.ts
// Toutes les constantes partagées de l'app
// Centralisées ici pour n'avoir qu'un seul endroit à modifier

// ─── Skills disponibles ───────────────────────────────────────────
export const SKILLS = [
  'Software Engineer',
  'Software Developer',
  'Data Scientist',
  'Data Analyst',
  'Data Engineer',
  'UI/UX Designer',
  'Cybersecurity Engineer',
  'DevOps Engineer',
  'Mobile Developer',
  'Machine Learning Engineer',
  'MLOPS Engineer',
  'Business Analyst',
]

// ─── Domaines disponibles ─────────────────────────────────────────
export const DOMAINS = [
  'Education',
  'Health',
  'AgriTech',
  'Fintech',
  'Logistics',
  'Environment',
  'Social Impact',
  'E-commerce',
  'Security',
  'Entertainment',
  'Other',
]

// ─── Niveaux disponibles ──────────────────────────────────────────
export const LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
]

// ─── Durées disponibles ───────────────────────────────────────────
export const DURATIONS = [
  '1 week',
  '2 weeks',
  '1 month',
  '2 months',
  '3 months',
  '6 months',
  '1 year+',
]

// ─── Types de contact préféré ─────────────────────────────────────
export const CONTACT_TYPES: Record<string, { label: string; icon: string; color: string }> = {
  discord:  { label: 'Discord',  icon: '🎮', color: '#5865F2' },
  whatsapp: { label: 'WhatsApp', icon: '💬', color: '#25D366' },
  slack:    { label: 'Slack',    icon: '⚡', color: '#E01E5A' },
  telegram: { label: 'Telegram', icon: '✈️', color: '#0088CC' },
  email:    { label: 'Email',    icon: '📧', color: '#0D9488' },
  linkedin: { label: 'LinkedIn', icon: '💼', color: '#0A66C2' },
}

// ─── Couleurs des skills ──────────────────────────────────────────
export const SKILL_COLORS: Record<string, { bg: string; text: string }> = {
  'Software Engineer':        { bg: 'rgba(13,148,136,0.14)',  text: '#5EEAD4' },
  'Software Developer':       { bg: 'rgba(13,148,136,0.14)',  text: '#5EEAD4' },
  'Data Scientist':           { bg: 'rgba(99,102,241,0.14)',  text: '#A5B4FC' },
  'Data Analyst':             { bg: 'rgba(99,102,241,0.14)',  text: '#A5B4FC' },
  'Data Engineer':            { bg: 'rgba(99,102,241,0.14)',  text: '#A5B4FC' },
  'UI/UX Designer':           { bg: 'rgba(14,165,233,0.14)',  text: '#7DD3FC' },
  'Cybersecurity Engineer':   { bg: 'rgba(239,68,68,0.14)',   text: '#FCA5A5' },
  'DevOps Engineer':          { bg: 'rgba(245,158,11,0.14)',  text: '#FCD34D' },
  'Machine Learning Engineer':{ bg: 'rgba(99,102,241,0.14)',  text: '#A5B4FC' },
  'MLOPS Engineer':           { bg: 'rgba(245,158,11,0.14)',  text: '#FCD34D' },
  'Business Analyst':         { bg: 'rgba(236,72,153,0.14)',  text: '#F9A8D4' },
}

// ─── Couleurs des niveaux ─────────────────────────────────────────
export const LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  'Beginner':     { bg: 'rgba(16,185,129,0.14)', text: '#6EE7B7' },
  'Intermediate': { bg: 'rgba(245,158,11,0.14)', text: '#FCD34D' },
  'Advanced':     { bg: 'rgba(239,68,68,0.14)',  text: '#FCA5A5' },
}

// ─── Couleurs des domaines / visual identity ─────────────────────
// Chaque domaine possède sa propre ambiance visuelle.
// Utilisé pour les mini banners des cartes projet.
//
// Objectif :
// - différenciation instantanée
// - feed moins répétitif
// - rendu plus premium
// - architecture scalable

export const DOMAIN_THEMES: Record<string, string> = {

  // Education
  Education: `
    from-sky-500/20
    via-blue-500/10
    to-indigo-500/20
  `,

  // Health
  Health: `
    from-cyan-500/20
    via-teal-500/10
    to-blue-500/20
  `,

  // Agriculture / green tech
  AgriTech: `
    from-lime-500/20
    via-green-500/10
    to-emerald-500/20
  `,

  // Finance / startup vibe
  Fintech: `
    from-emerald-500/20
    via-teal-500/10
    to-cyan-500/20
  `,

  // Logistics / industrial vibe
  Logistics: `
    from-orange-500/20
    via-amber-500/10
    to-yellow-500/20
  `,

  // Ecology / sustainability
  Environment: `
    from-green-500/20
    via-emerald-500/10
    to-teal-500/20
  `,

  // Human / social vibe
  'Social Impact': `
    from-pink-500/20
    via-rose-500/10
    to-red-500/20
  `,

  // Startup / commerce vibe
  'E-commerce': `
    from-violet-500/20
    via-purple-500/10
    to-fuchsia-500/20
  `,

  // Cybersecurity vibe
  Security: `
    from-rose-500/20
    via-red-500/10
    to-orange-500/20
  `,

  // Netflix / media vibe
  Entertainment: `
    from-fuchsia-500/20
    via-pink-500/10
    to-purple-500/20
  `,

  // Fallback
  Other: `
    from-slate-500/20
    via-gray-500/10
    to-zinc-500/20
  `,
}