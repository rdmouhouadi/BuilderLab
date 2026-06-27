// components/ProjectDetail/ProjectMilestonesCard.tsx
// The main card on the project page: milestone checklist with a
// progress bar, followed by the Build Log and Team Chat sections.
// Each of the three sections can be public or private — when
// private, non-members see a locked placeholder instead.
import { Milestone, Project, ProjectUpdate, ProjectMessage } from '@/types'
import { colors, radius, fontSize, styles } from '@/lib/design-tokens'
import { cardStyle, sectionTitle } from './shared'
import ProjectUpdates from '@/components/ProjectUpdates'
import ProjectChat from '@/components/ProjectChat'

type Props = {
  project: Project
  milestones: Milestone[]
  updates: ProjectUpdate[]
  initialMessages: ProjectMessage[]
  currentUserId: string | null
  isOwner: boolean
  isMember: boolean
  canSeePrivate: boolean // true if owner, member, or follower

  // Milestone actions — owner only
  newMilestone: string
  addingMilestone: boolean
  onNewMilestoneChange: (value: string) => void
  onAddMilestone: () => void
  onToggleMilestone: (milestone: Milestone) => void
  onDeleteMilestone: (id: string) => void
}

export default function ProjectMilestonesCard({
  project,
  milestones,
  updates,
  initialMessages,
  currentUserId,
  isOwner,
  isMember,
  canSeePrivate,
  newMilestone,
  addingMilestone,
  onNewMilestoneChange,
  onAddMilestone,
  onToggleMilestone,
  onDeleteMilestone,
}: Props) {
  // Percentage of completed milestones, used for the progress bar
  const progress = milestones.length > 0
    ? Math.round((milestones.filter(m => m.completed).length / milestones.length) * 100)
    : 0

  return (
    <div style={cardStyle}>

      {/* ── Milestones header + progress bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h2 style={sectionTitle}>Milestones</h2>
        <span style={{ fontSize: fontSize.xs, color: colors.text.muted }}>
          {milestones.filter(m => m.completed).length}/{milestones.length} completed
        </span>
      </div>

      {milestones.length > 0 && (
        <div style={{ width: '100%', height: '3px', borderRadius: radius.full, backgroundColor: colors.bg.hover, marginBottom: '12px' }}>
          <div style={{ width: `${progress}%`, height: '3px', borderRadius: radius.full, backgroundColor: colors.accent.teal, transition: 'width 0.4s ease' }} />
        </div>
      )}

      {/* ── Milestone list — only visible if public or the viewer is allowed in ── */}
      {project.show_milestones || canSeePrivate ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
            {milestones.length === 0 && (
              <p style={{ fontSize: fontSize.xs, color: colors.text.muted, textAlign: 'center', padding: '16px 0' }}>
                No milestones yet.{isOwner && ' Add your first one below.'}
              </p>
            )}
            {milestones.map(milestone => (
              <div
                key={milestone.id}
                className="group"
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 10px', borderRadius: radius.lg,
                  backgroundColor: colors.bg.surface,
                }}
              >
                {/* Checkbox — only the owner can toggle it */}
                <button
                  onClick={() => isOwner && onToggleMilestone(milestone)}
                  style={{
                    width: '14px', height: '14px', borderRadius: '3px',
                    border: `1px solid ${milestone.completed ? colors.accent.teal : colors.border.default}`,
                    backgroundColor: milestone.completed ? colors.accent.teal : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, cursor: isOwner ? 'pointer' : 'default',
                    transition: 'all 0.15s',
                  }}
                >
                  {milestone.completed && (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                <span style={{
                  fontSize: fontSize.sm, flex: 1,
                  color: milestone.completed ? colors.text.muted : colors.text.secondary,
                  textDecoration: milestone.completed ? 'line-through' : 'none',
                }}>
                  {milestone.title}
                </span>

                {/* Delete — owner only, shown on hover */}
                {isOwner && (
                  <button
                    onClick={() => onDeleteMilestone(milestone.id)}
                    className="opacity-0 group-hover:opacity-100"
                    style={{ fontSize: fontSize.xs, color: colors.text.muted, background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add milestone input — owner only */}
          {isOwner && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Add a milestone..."
                value={newMilestone}
                onChange={e => onNewMilestoneChange(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onAddMilestone()}
                style={{
                  flex: 1, backgroundColor: colors.bg.surface,
                  border: `0.5px solid ${colors.border.default}`,
                  borderRadius: radius.lg, color: colors.text.primary,
                  fontSize: fontSize.sm, padding: '7px 10px',
                  outline: 'none', fontFamily: 'inherit',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = colors.accent.teal)}
                onBlur={e => (e.currentTarget.style.borderColor = colors.border.default)}
              />
              <button
                onClick={onAddMilestone}
                disabled={addingMilestone || !newMilestone.trim()}
                style={{ ...styles.btnTeal, opacity: !newMilestone.trim() ? 0.5 : 1 }}
              >
                Add
              </button>
            </div>
          )}
        </>
      ) : (
        <p style={{ fontSize: fontSize.xs, color: colors.text.muted, textAlign: 'center', padding: '12px 0' }}>
          🔒 Milestones are private. Follow to see progress.
        </p>
      )}

      {/* ── Build Log — public or members/followers only ── */}
      <div style={{ marginTop: '16px' }}>
        {project.show_build_log || canSeePrivate ? (
          <ProjectUpdates
            projectId={project.id}
            updates={updates}
            currentUserId={currentUserId}
            canPost={isOwner || isMember}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '16px', backgroundColor: colors.bg.elevated, border: `0.5px solid ${colors.border.default}`, borderRadius: radius.xl }}>
            <p style={{ fontSize: fontSize.xs, color: colors.text.muted }}>🔒 Build Log is private. Follow to see updates.</p>
          </div>
        )}
      </div>

      {/* ── Team Chat — public or members/followers only ── */}
      <div style={{ marginTop: '16px' }}>
        {project.show_chat || canSeePrivate ? (
          <ProjectChat
            projectId={project.id}
            initialMessages={initialMessages}
            currentUserId={currentUserId}
            canChat={isOwner || isMember}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '16px', backgroundColor: colors.bg.elevated, borderRadius: radius.xl, border: `0.5px solid ${colors.border.default}` }}>
            <p style={{ fontSize: fontSize.xs, color: colors.text.muted }}>🔒 Team Chat is private. Follow to see the conversation.</p>
          </div>
        )}
      </div>
    </div>
  )
}