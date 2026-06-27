// components/NotificationsClient.tsx
// Displays all user notifications
'use client'

import Link from 'next/link'
import { Notification } from '@/types'
import { getTimeLabel } from '@/lib/timeLabel'
import BackButton from '@/components/BackButton'

type Props = {
  notifications: Notification[]
}

// Visual config by notification type
const NOTIF_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  connection_request: { icon: '👋', label: 'New interest',    color: '#5EEAD4' },
  connection_accepted:{ icon: '✅', label: 'Request accepted', color: '#6EE7B7' },
  new_member:        { icon: '🎉', label: 'New member',       color: '#A5B4FC' },
  new_message:       { icon: '💬', label: 'New message',      color: '#FCD34D' },
}

export default function NotificationsClient({ notifications }: Props) {
  // Separate unread from read notifications
  const unread = notifications.filter(n => !n.read)
  const read = notifications.filter(n => n.read)

  function NotifRow({ notif }: { notif: Notification }) {
    const config = NOTIF_CONFIG[notif.type] ?? {
      icon: '🔔', label: 'Notification', color: '#94A3B8'
    }

    return (
      <Link
        href={notif.link ?? '#'}
        className="flex items-start gap-4 px-5 py-4 transition-colors rounded-2xl"
        style={{
          backgroundColor: '#161B28',
          border: '1px solid #1E2840',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = '#0D9488')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E2840')}
      >
        {/* Icon */}
        <span className="text-xl flex-shrink-0 mt-0.5">{config.icon}</span>

        <div className="flex-1 min-w-0">
          {/* Badge type + timestamp */}
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs px-2 py-0.5 rounded-md font-medium"
              style={{
                backgroundColor: `${config.color}20`,
                color: config.color,
              }}
            >
              {config.label}
            </span>
            <span className="text-xs" style={{ color: '#475569' }}>
              {getTimeLabel(notif.created_at)}
            </span>
          </div>

          {/* Title */}
          <p className="text-sm font-medium mb-0.5" style={{ color: '#F1F5F9' }}>
            {notif.title}
          </p>

          {/* Body */}
          {notif.body && (
            <p className="text-xs leading-relaxed" style={{ color: '#64748B' }}>
              {notif.body}
            </p>
          )}
        </div>
      </Link>
    )
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">

      <BackButton fallback="/" />

      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#F1F5F9' }}>
          Notifications
        </h1>
        <p className="text-sm" style={{ color: '#64748B' }}>
          {notifications.length === 0
            ? 'No notifications yet.'
            : `${notifications.length} notification${notifications.length !== 1 ? 's' : ''}`
          }
        </p>
      </div>

      {notifications.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ backgroundColor: '#161B28', border: '1px solid #1E2840' }}
        >
          <p className="text-2xl mb-3">🔔</p>
          <p className="text-sm" style={{ color: '#475569' }}>
            You&apos;re all caught up!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">

          {/* Unread section */}
          {unread.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: '#475569' }}
              >
                New · {unread.length}
              </h2>
              <div className="flex flex-col gap-2">
                {unread.map(n => <NotifRow key={n.id} notif={n} />)}
              </div>
            </div>
          )}

          {/* Read section */}
          {read.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: '#475569' }}
              >
                Earlier · {read.length}
              </h2>
              <div className="flex flex-col gap-2">
                {read.map(n => <NotifRow key={n.id} notif={n} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  )
}