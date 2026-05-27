// types/index.ts
// Defines the shape of all data objects used across the app.
// TypeScript uses these to catch type errors at compile time.

// ─── User Profile ────────────────────────────────────────────────
export type Profile = {
  id: string
  name: string
  first_name: string | null
  last_name: string | null
  country: string | null
  bio: string | null
  school: string | null           // Legacy — kept for backward compatibility
  major: string | null            // Legacy — kept for backward compatibility
  builder_type: 'student' | 'bootcamp' | 'self_learner' | 'professional' | null
  institution: string | null      // Replaces school — adapts label per builder_type
  program: string | null          // Replaces major — adapts label per builder_type
  avg_rating: number              // Auto-calculated by SQL trigger
  ratings_count: number
  preferred_contact_type: string | null
  preferred_contact_value: string | null
  created_at: string
}

// ─── Project ─────────────────────────────────────────────────────
export type Project = {
  id: string
  owner_id: string
  title: string
  problem: string | null
  level: 'beginner' | 'intermediate' | 'advanced' | string
  domain: string | null
  status: 'open' | 'in_progress' | 'completed'
  duration: string | null
  spots: number | null
  website_url: string | null
  github_url: string | null
  is_public: boolean
  // Privacy settings — false = members + followers only
  show_build_log: boolean
  show_chat: boolean
  show_milestones: boolean
  show_team: boolean
  created_at: string
  // Joined relations — only present when fetched with SQL joins
  profiles?: Profile
  project_skills?: ProjectSkill[]
  project_members?: { user_id: string }[]
  project_updates?: { created_at: string }[]
}

// ─── Project Skill ───────────────────────────────────────────────
export type ProjectSkill = {
  id: string
  project_id: string
  skill_needed: string
}

// ─── Project Member ──────────────────────────────────────────────
export type ProjectMember = {
  id: string
  project_id: string
  user_id: string
  role: string | null
  status: 'active' | 'left'
  rating_required: boolean
  is_hiveos_manager: boolean  // Only one manager per project at a time
  leave_reason: string | null // Visible to owner + concerned member only
  left_at: string | null
  joined_at: string
}

// ─── Connection Request ──────────────────────────────────────────
export type Connection = {
  id: string
  sender_id: string
  project_id: string
  message: string | null
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
}

// ─── Milestone ───────────────────────────────────────────────────
export type Milestone = {
  id: string
  project_id: string
  title: string
  completed: boolean
  position: number
  created_at: string
}

// ─── HiveOS Task ─────────────────────────────────────────────────
export type Task = {
  id: string
  project_id: string
  milestone_id: string | null   // Optionally linked to a milestone
  assignee_id: string | null    // Member the task is assigned to
  created_by: string | null
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'blocked' | 'done'
  priority: 'none' | 'low' | 'medium' | 'high'
  due_date: string | null
  position: number
  created_at: string
  updated_at: string
  // Joined assignee profile
  assignee?: {
    id: string
    name: string | null
    first_name: string | null
    last_name: string | null
  }
}

// ─── Project Update (Build Log) ──────────────────────────────────
export type ProjectUpdate = {
  id: string
  project_id: string
  author_id: string
  type: 'update' | 'milestone' | 'blocker' | 'decision' | 'demo'
  content: string
  created_at: string
  profiles?: {
    id: string
    name: string | null
    first_name: string | null
    last_name: string | null
    avg_rating: number
  }
}

// ─── Project Message (Team Chat) ─────────────────────────────────
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

// ─── Notification ────────────────────────────────────────────────
export type Notification = {
  id: string
  user_id: string
  type:
    | 'connection_request'
    | 'connection_accepted'
    | 'new_member'
    | 'new_message'
    | 'new_project_published'
    | 'task_assigned'           // HiveOS — notified when a task is assigned to you
  title: string
  body: string | null
  link: string | null
  read: boolean
  created_at: string
}

// ─── Project Follower ────────────────────────────────────────────
export type ProjectFollower = {
  id: string
  project_id: string
  user_id: string
  created_at: string
}

// ─── Project Comment (Community Feedback) ────────────────────────
export type ProjectComment = {
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
    avg_rating: number
  }
}