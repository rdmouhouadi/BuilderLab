// app/hivecheck/page.tsx
// Public leaderboard of completed and public projects.
// Future: sorted by HiveCheck peer review score.
// Accessible to all — no auth required.
import { createClient } from '@/lib/supabase'
import { Project } from '@/types'
import HiveCheckClient from '@/components/HiveCheckClient'
import PageTransition from '@/components/PageTransition'

export default async function HiveCheckPage() {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('projects')
    .select(`
      *,
      profiles!projects_owner_id_fkey(id, name, first_name, last_name, country, avg_rating),
      project_skills(skill_needed),
      project_members(user_id)
    `)
    .eq('status', 'completed')
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  return (
    <PageTransition>
      <HiveCheckClient projects={(projects as Project[]) ?? []} />
    </PageTransition>
  )
}