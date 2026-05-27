// components/HiveOSPanel.tsx
// HiveOS — task management panel for project teams.
// Slides in from the right on the project detail page.
// Accessible to members and owner only — not followers.
'use client'

import { useState, useMemo } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import { Task, Milestone } from '@/types'
import { colors, radius, fontSize, styles } from '@/lib/design-tokens'
import { useRouter } from 'next/navigation'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

type Member = {
  user_id: string
  is_hiveos_manager: boolean
  profiles: {
    id: string
    name: string | null
    first_name: string | null
    last_name: string | null
  } | null
}

type Props = {
  projectId: string
  tasks: Task[]
  milestones: Milestone[]
  members: Member[]
  currentUserId: string | null
  canManage: boolean  // Owner or HiveOS manager
  isOwner: boolean
  onClose: () => void
  onTasksChange: (tasks: Task[]) => void
}

// ─────────────────────────────────────────
// Constants
// ─────────────────────────────────────────

const STATUS_COLUMNS: {
  key: Task['status']
  label: string
  icon: string
}[] = [
  { key: 'todo',        label: 'To Do',       icon: '○' },
  { key: 'in_progress', label: 'In Progress',  icon: '◐' },
  { key: 'blocked',     label: 'Blocked',      icon: '✕' },
  { key: 'done',        label: 'Done',         icon: '●' },
]

const PRIORITY_STYLES: Record<Task['priority'], { color: string; label: string }> = {
  none:   { color: colors.text.muted,          label: '' },
  low:    { color: colors.status.success,      label: 'Low' },
  medium: { color: colors.status.warning,      label: 'Med' },
  high:   { color: colors.status.danger,       label: 'High' },
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

function getMemberName(member: Member) {
  const p = member.profiles
  if (!p) return 'Anonymous'
  const full = [p.first_name, p.last_name].filter(Boolean).join(' ')
  return full || p.name || 'Anonymous'
}

function getInitials(member: Member) {
  const p = member.profiles
  if (!p) return '?'
  const first = p.first_name?.[0]
  const last  = p.last_name?.[0]
  if (first || last) return [first, last].filter(Boolean).join('').toUpperCase()
  return p.name?.[0]?.toUpperCase() ?? '?'
}

function getAssigneeName(task: Task) {
  if (!task.assignee) return null
  const full = [task.assignee.first_name, task.assignee.last_name]
    .filter(Boolean).join(' ')
  return full || task.assignee.name || null
}

// ─────────────────────────────────────────
// Sub-component: TaskForm
// ─────────────────────────────────────────

type TaskFormProps = {
  projectId: string
  milestones: Milestone[]
  members: Member[]
  currentUserId: string | null
  onSave: (task: Task) => void
  onCancel: () => void
}

function TaskForm({ projectId, milestones, members, currentUserId, onSave, onCancel }: TaskFormProps) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    title:        '',
    description:  '',
    assignee_id:  '',
    milestone_id: '',
    priority:     'none' as Task['priority'],
    due_date:     '',
  })

  const inputStyle = {
    width: '100%',
    backgroundColor: colors.bg.elevated,
    border: `0.5px solid ${colors.border.default}`,
    borderRadius: radius.lg,
    color: colors.text.primary,
    fontSize: fontSize.xs,
    padding: '6px 9px',
    outline: 'none',
    fontFamily: 'inherit',
  }

  async function handleSave() {
    if (!form.title.trim()) return
    setSaving(true)

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        project_id:   projectId,
        created_by:  currentUserId,
        title:        form.title.trim(),
        description:  form.description.trim() || null,
        assignee_id:  form.assignee_id  || null,
        milestone_id: form.milestone_id || null,
        priority:     form.priority,
        due_date:     form.due_date     || null,
        status:       'todo',
      })
      .select('*, assignee:profiles!tasks_assignee_id_fkey(id, name, first_name, last_name)')
      .single()
    

    if (!error && data) onSave(data)
    setSaving(false)
  }

  const focusStyle  = (e: React.FocusEvent<HTMLElement>) =>
    (e.currentTarget as HTMLElement).style.borderColor = colors.accent.teal
  const blurStyle   = (e: React.FocusEvent<HTMLElement>) =>
    (e.currentTarget as HTMLElement).style.borderColor = colors.border.default

  return (
    <div style={{
      backgroundColor: colors.bg.surface,
      border: `0.5px solid ${colors.border.hover}`,
      borderRadius: radius.xl,
      padding: '14px',
      marginBottom: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }}>
      <p style={{ fontSize: fontSize.xs, fontWeight: 500, color: colors.text.secondary, marginBottom: '2px' }}>
        New task
      </p>

      {/* Title */}
      <input
        type="text" placeholder="Task title *"
        value={form.title}
        onChange={e => {
            setForm(p => ({ ...p, title: e.target.value }))
        }}
        style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}
        //autoFocus
      />

      {/* Description */}
      <textarea
        placeholder="Description (optional)"
        value={form.description}
        onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
        rows={2}
        style={{ ...inputStyle, resize: 'none' }}
        onFocus={focusStyle} onBlur={blurStyle}
      />

      {/* Assignee + Priority */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
        <div>
          <label style={{ fontSize: fontSize.xs, color: colors.text.muted, display: 'block', marginBottom: '3px' }}>
            Assign to
          </label>
          <select
            value={form.assignee_id}
            onChange={e => setForm(p => ({ ...p, assignee_id: e.target.value }))}
            style={{ ...inputStyle, color: form.assignee_id ? colors.text.primary : colors.text.muted }}
            onFocus={focusStyle} onBlur={blurStyle}
          >
            <option value="">Unassigned</option>
            {members.map(m => (
              <option key={m.user_id} value={m.user_id}
                style={{ backgroundColor: colors.bg.elevated }}>
                {getMemberName(m)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: fontSize.xs, color: colors.text.muted, display: 'block', marginBottom: '3px' }}>
            Priority
          </label>
          <select
            value={form.priority}
            onChange={e => setForm(p => ({ ...p, priority: e.target.value as Task['priority'] }))}
            style={inputStyle}
            onFocus={focusStyle} onBlur={blurStyle}
          >
            <option value="none">None</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {/* Milestone + Due date */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
        <div>
          <label style={{ fontSize: fontSize.xs, color: colors.text.muted, display: 'block', marginBottom: '3px' }}>
            Milestone
          </label>
          <select
            value={form.milestone_id}
            onChange={e => setForm(p => ({ ...p, milestone_id: e.target.value }))}
            style={{ ...inputStyle, color: form.milestone_id ? colors.text.primary : colors.text.muted }}
            onFocus={focusStyle} onBlur={blurStyle}
          >
            <option value="">None</option>
            {milestones.map(m => (
              <option key={m.id} value={m.id}
                style={{ backgroundColor: colors.bg.elevated }}>
                {m.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: fontSize.xs, color: colors.text.muted, display: 'block', marginBottom: '3px' }}>
            Due date
          </label>
          <input
            type="date" value={form.due_date}
            onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))}
            style={{ ...inputStyle, colorScheme: 'dark' }}
            onFocus={focusStyle} onBlur={blurStyle}
          />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', marginTop: '4px' }}>
        <button onClick={onCancel} style={{ ...styles.btnGhost, fontSize: fontSize.xs, padding: '4px 10px' }}>
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !form.title.trim()}
          style={{
            ...styles.btnPrimary,
            fontSize: fontSize.xs,
            padding: '4px 12px',
            opacity: !form.title.trim() ? 0.5 : 1,
            cursor: !form.title.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Adding...' : 'Add task'}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// Sub-component: TaskCard
// ─────────────────────────────────────────

type TaskCardProps = {
  task: Task
  canManage: boolean
  currentUserId: string | null
  members: Member[]
  milestones: Milestone[]
  onStatusChange: (taskId: string, status: Task['status']) => void
  onDelete: (taskId: string) => void
}

function TaskCard({
  task,
  canManage,
  currentUserId,
  members,
  milestones,
  onStatusChange,
  onDelete,
}: TaskCardProps) {
  const [expanded, setExpanded] = useState(false)

  const priority    = PRIORITY_STYLES[task.priority]
  const assignee    = getAssigneeName(task)
  const isAssignee  = task.assignee_id === currentUserId
  const canEdit     = canManage || isAssignee
  const milestone   = milestones.find(m => m.id === task.milestone_id)

  return (
    <div
      className="group"
      style={{
        backgroundColor: colors.bg.elevated,
        border: `0.5px solid ${colors.border.default}`,
        borderRadius: radius.lg,
        padding: '10px',
        transition: 'border-color 0.15s',
        cursor: 'pointer',
      }}
      onClick={() => setExpanded(p => !p)}
      onMouseEnter={e => (e.currentTarget.style.borderColor = colors.border.hover)}
      onMouseLeave={e => (e.currentTarget.style.borderColor = colors.border.default)}
    >
      {/* Task header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title + priority */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
            {task.priority !== 'none' && (
              <span style={{
                fontSize: '9px',
                fontWeight: 500,
                color: priority.color,
                backgroundColor: `${priority.color}18`,
                border: `0.5px solid ${priority.color}40`,
                borderRadius: radius.sm,
                padding: '1px 4px',
                flexShrink: 0,
              }}>
                {priority.label}
              </span>
            )}
            <span style={{
              fontSize: fontSize.xs,
              fontWeight: 500,
              color: task.status === 'done' ? colors.text.muted : colors.text.primary,
              textDecoration: task.status === 'done' ? 'line-through' : 'none',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {task.title}
            </span>
          </div>

          {/* Meta — assignee + due date + milestone */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {assignee && (
              <span style={{
                fontSize: fontSize.xs,
                color: colors.text.muted,
                display: 'flex', alignItems: 'center', gap: '3px',
              }}>
                👤 {assignee}
              </span>
            )}
            {task.due_date && (
              <span style={{
                fontSize: fontSize.xs,
                color: new Date(task.due_date) < new Date()
                  ? colors.status.danger
                  : colors.text.muted,
              }}>
                📅 {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
            {milestone && (
              <span style={{ fontSize: fontSize.xs, color: colors.text.muted }}>
                🏁 {milestone.title}
              </span>
            )}
          </div>
        </div>

        {/* Delete — manager only, on hover */}
        {canManage && (
          <button
            onClick={e => { e.stopPropagation(); onDelete(task.id) }}
            className="opacity-0 group-hover:opacity-100"
            style={{
              fontSize: fontSize.xs, color: colors.text.muted,
              background: 'none', border: 'none', cursor: 'pointer',
              flexShrink: 0, transition: 'opacity 0.15s',
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Expanded — description + status change */}
      {expanded && (
        <div
          style={{ marginTop: '10px', paddingTop: '10px', borderTop: `0.5px solid ${colors.border.default}` }}
          onClick={e => e.stopPropagation()}
        >
          {task.description && (
            <p style={{
              fontSize: fontSize.xs, color: colors.text.secondary,
              lineHeight: 1.5, marginBottom: '10px',
            }}>
              {task.description}
            </p>
          )}

          {/* Status change — assignee or manager */}
          {canEdit && (
            <div>
              <p style={{ fontSize: fontSize.xs, color: colors.text.muted, marginBottom: '6px' }}>
                Move to:
              </p>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {STATUS_COLUMNS
                  .filter(s => s.key !== task.status)
                  .map(s => (
                    <button
                      key={s.key}
                      onClick={() => onStatusChange(task.id, s.key)}
                      style={{
                        fontSize: fontSize.xs,
                        padding: '3px 8px',
                        borderRadius: radius.md,
                        cursor: 'pointer',
                        backgroundColor: colors.bg.hover,
                        color: colors.text.secondary,
                        border: `0.5px solid ${colors.border.default}`,
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget.style.backgroundColor = colors.accent.tealDim)
                        ;(e.currentTarget.style.color = colors.accent.tealText)
                        ;(e.currentTarget.style.borderColor = colors.accent.tealBorder)
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget.style.backgroundColor = colors.bg.hover)
                        ;(e.currentTarget.style.color = colors.text.secondary)
                        ;(e.currentTarget.style.borderColor = colors.border.default)
                      }}
                    >
                      {s.icon} {s.label}
                    </button>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────
// Main component: HiveOSPanel
// ─────────────────────────────────────────

export default function HiveOSPanel({
  projectId,
  tasks: initialTasks,
  milestones,
  members,
  currentUserId,
  canManage,
  isOwner,
  onClose,
  onTasksChange,
}: Props) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])
  const router = useRouter()

  const [tasks,       setTasks]       = useState<Task[]>(initialTasks)
  const [showForm,    setShowForm]    = useState(false)
  const [activeCol,   setActiveCol]   = useState<Task['status'] | 'all'>('all')

  // Sync tasks up to parent
  function updateTasks(updated: Task[]) {
    setTasks(updated)
    onTasksChange(updated)
  }

  // Add a new task
  function handleTaskAdded(task: Task) {
    const updated = [...tasks, task]
    updateTasks(updated)
    setShowForm(false)
  }

  // Change task status — auto Build Log entry
  async function handleStatusChange(taskId: string, status: Task['status']) {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    // Optimistic update
    updateTasks(tasks.map(t => t.id === taskId ? { ...t, status } : t))

    await supabase
      .from('tasks')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', taskId)

    // Auto Build Log entry for significant status changes
    if (status === 'blocked' || status === 'done') {
      const type = status === 'blocked' ? 'blocker' : 'update'
      const content = status === 'done'
        ? `✓ Task completed: "${task.title}"`
        : `⚠ Task blocked: "${task.title}"`

      await supabase.from('project_updates').insert({
        project_id: projectId,
        author_id:  currentUserId,
        type,
        content,
      })

      router.refresh()
    }
  }

  // Delete a task
  async function handleDelete(taskId: string) {
    updateTasks(tasks.filter(t => t.id !== taskId))
    await supabase.from('tasks').delete().eq('id', taskId)
  }

  // Assign HiveOS manager role — owner only, one at a time
  async function handleAssignManager(userId: string) {
    // Remove existing manager first
    await supabase
      .from('project_members')
      .update({ is_hiveos_manager: false })
      .eq('project_id', projectId)
      .eq('is_hiveos_manager', true)

    // Assign new manager
    await supabase
      .from('project_members')
      .update({ is_hiveos_manager: true })
      .eq('project_id', projectId)
      .eq('user_id', userId)

    router.refresh()
  }

  // Filter tasks by column
  const filteredTasks = activeCol === 'all'
    ? tasks
    : tasks.filter(t => t.status === activeCol)

  // Task counts per column
  const counts = STATUS_COLUMNS.reduce((acc, col) => {
    acc[col.key] = tasks.filter(t => t.status === col.key).length
    return acc
  }, {} as Record<string, number>)

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────
  
  return (
    <div style={{
      width: '320px',
      flexShrink: 0,
      backgroundColor: colors.bg.elevated,
      border: `0.5px solid ${colors.border.default}`,
      borderRadius: radius.xl,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      //maxHeight: '80vh',
      overflow: 'hidden',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        borderBottom: `0.5px solid ${colors.border.default}`,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: fontSize.sm, fontWeight: 500, color: colors.text.primary }}>
            HiveOS
          </span>
          <span style={{
            fontSize: fontSize.xs,
            backgroundColor: colors.accent.indigoDim,
            color: colors.accent.indigoText,
            border: `0.5px solid ${colors.accent.indigoBorder}`,
            borderRadius: radius.sm,
            padding: '1px 5px',
          }}>
            {tasks.length} tasks
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Add task button */}
          {canManage && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              style={{ ...styles.btnTeal, fontSize: fontSize.xs, padding: '3px 9px' }}
            >
              + Add task
            </button>
          )}
          {/* Close panel */}
          <button
            onClick={onClose}
            style={{
              fontSize: fontSize.sm,
              color: colors.text.muted,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px 4px',
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Column filter tabs */}
      <div style={{
        display: 'flex',
        gap: '2px',
        padding: '8px 12px',
        borderBottom: `0.5px solid ${colors.border.default}`,
        flexShrink: 0,
        overflowX: 'auto',
      }}>
        {/* All tab */}
        <button
          onClick={() => setActiveCol('all')}
          style={{
            fontSize: fontSize.xs,
            padding: '3px 8px',
            borderRadius: radius.md,
            cursor: 'pointer',
            backgroundColor: activeCol === 'all' ? colors.bg.hover : 'transparent',
            color:           activeCol === 'all' ? colors.text.primary : colors.text.muted,
            border:          activeCol === 'all' ? `0.5px solid ${colors.border.active}` : `0.5px solid transparent`,
            fontWeight:      activeCol === 'all' ? 500 : 400,
            whiteSpace: 'nowrap',
          }}
        >
          All · {tasks.length}
        </button>

        {STATUS_COLUMNS.map(col => (
          <button
            key={col.key}
            onClick={() => setActiveCol(col.key)}
            style={{
              fontSize: fontSize.xs,
              padding: '3px 8px',
              borderRadius: radius.md,
              cursor: 'pointer',
              backgroundColor: activeCol === col.key ? colors.bg.hover : 'transparent',
              color:           activeCol === col.key ? colors.text.primary : colors.text.muted,
              border:          activeCol === col.key ? `0.5px solid ${colors.border.active}` : `0.5px solid transparent`,
              fontWeight:      activeCol === col.key ? 500 : 400,
              whiteSpace: 'nowrap',
            }}
          >
            {col.icon} {col.label} · {counts[col.key]}
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}>

        {/* Task form */}
        {showForm && (
          <TaskForm
            projectId={projectId}
            milestones={milestones}
            members={members}
            currentUserId={currentUserId}
            onSave={handleTaskAdded}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Task list */}
        {filteredTasks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '32px 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
          }}>
            <p style={{ fontSize: fontSize.sm, color: colors.text.muted }}>
              {activeCol === 'all' ? 'No tasks yet.' : `No ${activeCol.replace('_', ' ')} tasks.`}
            </p>
            {canManage && activeCol === 'all' && (
              <button
                onClick={() => setShowForm(true)}
                style={{ ...styles.btnTeal, fontSize: fontSize.xs }}
              >
                + Add your first task
              </button>
            )}
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              canManage={canManage}
              currentUserId={currentUserId}
              members={members}
              milestones={milestones}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Manager assignment — owner only */}
      {isOwner && (
        <div style={{
          padding: '12px 16px',
          borderTop: `0.5px solid ${colors.border.default}`,
          flexShrink: 0,
        }}>
          <p style={{ fontSize: fontSize.xs, color: colors.text.muted, marginBottom: '8px' }}>
            HiveOS Manager
          </p>

          {/* Current manager display + revoke button */}
          {members.some(m => m.is_hiveos_manager) ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: colors.bg.elevated,
              border: `0.5px solid ${colors.accent.indigoBorder}`,
              borderRadius: radius.lg,
              padding: '6px 9px',
              marginBottom: '8px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  fontSize: fontSize.xs,
                  color: colors.accent.indigoText,
                }}>
                  ⚡ {getMemberName(members.find(m => m.is_hiveos_manager)!)}
                </span>
              </div>
              {/* Revoke manager role */}
              <button
                onClick={async () => {
                  await supabase
                    .from('project_members')
                    .update({ is_hiveos_manager: false })
                    .eq('project_id', projectId)
                    .eq('is_hiveos_manager', true)
                  router.refresh()
                }}
                style={{
                  fontSize: fontSize.xs,
                  color: colors.text.muted,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = colors.status.danger)}
                onMouseLeave={e => (e.currentTarget.style.color = colors.text.muted)}
              >
                Revoke
              </button>
            </div>
          ) : (
            <p style={{ fontSize: fontSize.xs, color: colors.text.muted, marginBottom: '8px', fontStyle: 'italic' }}>
              No manager assigned — you manage HiveOS.
            </p>
          )}

          {/* Assign new manager */}
          <select
            onChange={e => e.target.value && handleAssignManager(e.target.value)}
            value=""
            style={{
              width: '100%',
              backgroundColor: colors.bg.elevated,
              border: `0.5px solid ${colors.border.default}`,
              borderRadius: radius.lg,
              color: colors.text.secondary,
              fontSize: fontSize.xs,
              padding: '6px 9px',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          >
            <option value="">Assign a manager...</option>
            {members
              .filter(m => !m.is_hiveos_manager) // Only show non-managers
              .map(m => (
                <option
                  key={m.user_id}
                  value={m.user_id}
                  style={{ backgroundColor: colors.bg.elevated }}
                >
                  {getMemberName(m)}
                </option>
              ))
            }
          </select>

          <p style={{ fontSize: fontSize.xs, color: colors.text.muted, marginTop: '6px' }}>
            Only one manager at a time. They can create and manage tasks.
          </p>
        </div>
      )}
    </div>
  )
}