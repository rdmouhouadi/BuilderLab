// app/archive/page.tsx
// Page publique des projets complétés
// Accessible à tous — pas de protection par proxy
// C'est le "hall of fame" de BuilderLab — ce qui a été shipper
import { createClient } from '@/lib/supabase'
import { Project } from '@/types'
import ArchiveClient from '@/components/ArchiveClient'
import PageTransition from '@/components/PageTransition'

export default async function ArchivePage() {
  const supabase = await createClient()

  // On fetch tous les projets complétés et publics
  // avec leurs jointures habituelles
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
      <ArchiveClient projects={(projects as Project[]) ?? []} />
    </PageTransition>
  )
}