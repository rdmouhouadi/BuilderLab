import { describe, it, expect, vi, beforeEach } from 'vitest'

const {
  connectionsQuery,
  connectionsSingleMock,
  notificationsInsertMock,
  fromMock,
  getUserByIdMock,
  sendInterestMock,
} = vi.hoisted(() => {
  const connectionsSingleMock = vi.fn()
  const notificationsInsertMock = vi.fn()
  const getUserByIdMock = vi.fn()
  const sendInterestMock = vi.fn()

  const connectionsQuery: Record<string, ReturnType<typeof vi.fn>> = {}
  connectionsQuery.select = vi.fn(() => connectionsQuery)
  connectionsQuery.eq = vi.fn(() => connectionsQuery)
  connectionsQuery.single = connectionsSingleMock

  const fromMock = vi.fn((table: string) => {
    if (table === 'connections') return connectionsQuery
    if (table === 'notifications') return { insert: notificationsInsertMock }
    throw new Error(`Unexpected table: ${table}`)
  })

  return {
    connectionsQuery,
    connectionsSingleMock,
    notificationsInsertMock,
    fromMock,
    getUserByIdMock,
    sendInterestMock,
  }
})

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: fromMock,
    auth: { admin: { getUserById: getUserByIdMock } },
  },
}))

vi.mock('@/lib/email', () => ({
  sendInterestNotification: sendInterestMock,
}))

import { POST } from '../route'

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/notify/interest', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const baseConnection = {
  id: 'conn_1',
  sender_id: 'user_sender',
  project_id: 'proj_1',
  message: 'I would love to help build this!',
  projects: {
    id: 'proj_1',
    title: 'Cool Project',
    owner_id: 'user_owner',
    profiles: { id: 'user_owner', name: null, first_name: 'Owen', last_name: 'Ownersson' },
  },
  profiles: { id: 'user_sender', name: null, first_name: 'Sandra', last_name: 'Sender' },
}

describe('POST /api/notify/interest', () => {
  beforeEach(() => {
    fromMock.mockClear()
    connectionsQuery.select.mockClear()
    connectionsQuery.eq.mockClear()
    connectionsSingleMock.mockReset().mockResolvedValue({ data: baseConnection })
    notificationsInsertMock.mockReset().mockResolvedValue({ error: null })
    getUserByIdMock.mockReset().mockResolvedValue({ data: { user: { email: 'owner@example.com' } } })
    sendInterestMock.mockReset().mockResolvedValue(undefined)
  })

  it('returns 404 when the connection is not found', async () => {
    connectionsSingleMock.mockResolvedValue({ data: null })

    const res = await POST(makeRequest({ connectionId: 'missing' }))

    expect(res.status).toBe(404)
    expect(sendInterestMock).not.toHaveBeenCalled()
  })

  it("returns 404 when the project owner's email cannot be found", async () => {
    getUserByIdMock.mockResolvedValue({ data: { user: null } })

    const res = await POST(makeRequest({ connectionId: 'conn_1' }))

    expect(res.status).toBe(404)
    expect(sendInterestMock).not.toHaveBeenCalled()
  })

  it('emails the project owner and creates an in-app notification', async () => {
    const res = await POST(makeRequest({ connectionId: 'conn_1' }))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })

    expect(getUserByIdMock).toHaveBeenCalledWith('user_owner')

    expect(sendInterestMock).toHaveBeenCalledWith({
      ownerEmail: 'owner@example.com',
      ownerName: 'Owen Ownersson',
      senderName: 'Sandra Sender',
      projectTitle: 'Cool Project',
      message: 'I would love to help build this!',
      projectUrl: expect.stringContaining('/projects/proj_1'),
    })

    expect(fromMock).toHaveBeenCalledWith('notifications')
    expect(notificationsInsertMock).toHaveBeenCalledWith({
      user_id: 'user_owner',
      type: 'connection_request',
      title: 'Sandra Sender is interested in "Cool Project"',
      body: 'I would love to help build this!',
      link: '/projects/proj_1',
    })
  })

  it('falls back to default names when profile names are missing', async () => {
    connectionsSingleMock.mockResolvedValue({
      data: {
        ...baseConnection,
        message: null,
        projects: {
          ...baseConnection.projects,
          profiles: { id: 'user_owner', name: null, first_name: null, last_name: null },
        },
        profiles: { id: 'user_sender', name: null, first_name: null, last_name: null },
      },
    })

    await POST(makeRequest({ connectionId: 'conn_1' }))

    expect(sendInterestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        senderName: 'A student',
        ownerName: 'there',
        message: 'No message provided.',
      })
    )
  })

  it('returns 500 if an unexpected error is thrown', async () => {
    connectionsSingleMock.mockRejectedValue(new Error('boom'))

    const res = await POST(makeRequest({ connectionId: 'conn_1' }))

    expect(res.status).toBe(500)
  })
})
