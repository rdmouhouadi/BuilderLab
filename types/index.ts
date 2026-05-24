// Ce fichier définit la "forme" des données
// TypeScript utilise ces types pour alerter s'il y'a une erreur
// Exemple : si j'écris project.titlee (faute de frappe),
// TypeScript le signale immédiatement

// ─── Profil utilisateur ───────────────────────────────────────────
export type Profile = {
  id: string           // UUID généré par Supabase Auth
  name: string
  first_name: string | null
  last_name: string | null
  country: string | null   // null = l'utilisateur n'a pas encore rempli ce champ
  bio: string | null
  school: string | null
  major: string | null
  avg_rating: number   // Moyenne calculée automatiquement par le trigger SQL
  ratings_count: number // Nombre total de notes reçues
  preferred_contact_type: string | null
  preferred_contact_value: string | null
  created_at: string   // Date au format ISO 8601 ex: "2024-01-15T10:30:00Z"
}

// ─── Projet ───────────────────────────────────────────────────────
export type Project = {
  id: string
  owner_id: string     // Référence vers profiles.id — qui a créé ce projet
  title: string
  problem: string | null
  // On liste les valeurs exactes autorisées — TypeScript refusera toute autre valeur
  level: 'Biginner' | 'Intermediate' | 'Advanced' | string
  domain: string | null
  status: 'open' | 'in_progress' | 'completed'
  duration: string | null // Ex: "2 weeks", "3 months"
  spots: number | null // nombre de collaborateurs recherhés
  created_at: string

  // Ces champs optionnels apparaissent quand on fait des jointures SQL
  // Exemple : quand on fetch un projet avec ses skills ET son auteur en même temps
  profiles?: Profile          // Le profil du créateur du projet
  project_skills?: ProjectSkill[] // Les compétences recherchées par ce projet

  //Champs pour les activity signals
  project_members?: {user_id: string}[] // Liste des membres connectés à ce projet
  project_updates?: { created_at: string }[] // Date du dernier update posté dans ce projet
}

// ─── Compétence recherchée par un projet ─────────────────────────
export type ProjectSkill = {
  id: string
  project_id: string   // Référence vers projects.id
  skill_needed: string // Ex: "Designer", "Data Scientist", "Dev Backend"
}

// ─── Demande de connexion ─────────────────────────────────────────
export type Connection = {
  id: string
  sender_id: string    // Celui qui envoie la demande
  project_id: string   // Le projet visé
  message: string | null
  // Les 3 états possibles d'une demande
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
}

// ─── Milestone — étape d'un projet ─────────────────────────────────────────
export type Milestone = {
  id: string
  project_id: string
  title: string
  completed: boolean
  position: number
  created_at: string
}

// ─── Update posté par un membre dans l'espace projet ────────────────────────────────────────
export type ProjectUpdate = {
  id: string
  project_id: string
  author_id: string
  type: 'update' | 'milestone' | 'blocker' | 'decision' | 'demo'
  content: string
  created_at: string
  // Jointure avec profiles
  profiles?: {
    id: string
    name: string | null
    first_name: string | null
    last_name: string | null
    avg_rating: number
  }
}

// ─── Message du group chat d'un projet ────────────────────────────────────────
export type ProjectMessage = {
  id: string
  project_id: string
  author_id: string
  content: string
  created_at: string
  profiles?: {
    id: string
    name: string | null
    first_name: string | null
    last_name: string | null
  }
}

// ─── Notification in-app ────────────────────────────────────────
export type Notification = {
  id: string
  user_id: string
  type: 'connection_request' | 'connection_accepted' | 'new_member' | 'new_message' | 'new_project_published'
  title: string
  body: string | null
  link: string | null
  read: boolean
  created_at: string
}