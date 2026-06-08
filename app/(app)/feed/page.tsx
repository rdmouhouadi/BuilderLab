// app/feed/page.tsx
// Main projects feed — a Server Component, so data is fetched on the server
// before the page reaches the browser (faster initial load, better SEO).
// The fetched projects are then passed to the Feed client component for interactivity.

import { createClient } from '@/lib/supabase'
import { Project } from '@/types'
import Feed from '@/components/Feed'
import PageTransition from '@/components/PageTransition'
import { Analytics } from "@vercel/analytics/next"

export default async function HomePage() {
  const supabase = await createClient()

  // Get the logged-in user so we can exclude their own projects from the feed
  const { data: { user } } = await supabase.auth.getUser()

  // Base query — includes related skills, members, and updates for each project
  let query = supabase
    .from('projects')
    .select(`
      *,
      profiles!projects_owner_id_fkey(id, name, country, avg_rating),
      project_skills(skill_needed),
      project_members(user_id),
      project_updates(created_at)
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  // If logged in, exclude the user's own projects (they appear in their profile instead)
  if (user) {
    query = query.neq('owner_id', user.id)
  }

  const { data: projects, error } = await query

  if (error) {
    console.error('Error fetching projects:', error.message)
    return <div className="p-8 text-red-400">Error: {error.message}</div>
  }

  return (
    <PageTransition>
      {/* Pass currentUserId so the Feed component can hide projects the user already joined */}
      <Feed
        projects={(projects as Project[]) ?? []}
        currentUserId={user?.id ?? null}
      />
      <Analytics />
    </PageTransition>
  )
}