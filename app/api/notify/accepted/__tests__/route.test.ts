import { describe, it, expect, vi, beforeEach } from 'vitest'

const {
  connectionsQuery,
  connectionsSingleMock,
  notificationsInsertMock,
  fromMock,
  getUserByIdMock,
  sendAcceptedMock,
} = vi.hoisted(() => {
  const connectionsSingleMock = vi.fn()
  const notificationsInsertMock = vi.fn()
  const getUserByIdMock = vi.fn()
  const sendAcceptedMock = vi.fn()

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
    sendAcceptedMock,
  }
})

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: fromMock,
    auth: { admin: { getUserById: getUserByIdMock } },
  },
}))

vi.mock('@/lib/email', () => ({
  sendAcceptedNotification: sendAcceptedMock,
}))

import { POST } from '../route'

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/notify/accepted', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const baseConnection = {
  id: 'conn_1',
  sender_id: 'user_sender',
  project_id: 'proj_1',
  projects: {
    id: 'proj_1',
    title: 'Cool Project',
    profiles: { id: 'user_owner', name: null, first_name: 'Owen', last_name: 'Ownersson' },
  },
  profiles: { id: 'user_sender', name: null, first_name: 'Sandra', last_name: 'Sender' },
}

describe('POST /api/notify/accepted', () => {
  beforeEach(() => {
    fromMock.mockClear()
    connectionsQuery.select.mockClear()
    connectionsQuery.eq.mockClear()
    connectionsSingleMock.mockReset().mockResolvedValue({ data: baseConnection })
    notificationsInsertMock.mockReset().mockResolvedValue({ error: null })
    getUserByIdMock.mockReset().mockResolvedValue({ data: { user: { email: 'sandra@example.com' } } })
    sendAcceptedMock.mockReset().mockResolvedValue(undefined)
  })

  it('returns 404 when the connection is not found', async () => {
    connectionsSingleMock.mockResolvedValue({ data: null })

    const res = await POST(makeRequest({ connectionId: 'missing' }))

    expect(res.status).toBe(404)
    expect(sendAcceptedMock).not.toHaveBeenCalled()
  })

  it("returns 404 when the applicant's email cannot be found", async () => {
    getUserByIdMock.mockResolvedValue({ data: { user: null } })

    const res = await POST(makeRequest({ connectionId: 'conn_1' }))

    expect(res.status).toBe(404)
    expect(sendAcceptedMock).not.toHaveBeenCalled()
  })

  it('emails the applicant and creates an in-app notification', async () => {
    const res = await POST(makeRequest({ connectionId: 'conn_1' }))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })

    expect(getUserByIdMock).toHaveBeenCalledWith('user_sender')

    expect(sendAcceptedMock).toHaveBeenCalledWith({
      senderEmail: 'sandra@example.com',
      senderName: 'Sandra Sender',
      ownerName: 'Owen Ownersson',
      projectTitle: 'Cool Project',
      projectUrl: expect.stringContaining('/projects/proj_1'),
    })

    expect(fromMock).toHaveBeenCalledWith('notifications')
    expect(notificationsInsertMock).toHaveBeenCalledWith({
      user_id: 'user_sender',
      type: 'connection_accepted',
      title: 'Your request to join "Cool Project" was accepted!',
      body: 'Owen Ownersson added you to the team.',
      link: '/projects/proj_1',
    })
  })

  it('falls back to default names when profile names are missing', async () => {
    connectionsSingleMock.mockResolvedValue({
      data: {
        ...baseConnection,
        projects: {
          ...baseConnection.projects,
          profiles: { id: 'user_owner', name: null, first_name: null, last_name: null },
        },
        profiles: { id: 'user_sender', name: null, first_name: null, last_name: null },
      },
    })

    await POST(makeRequest({ connectionId: 'conn_1' }))

    expect(sendAcceptedMock).toHaveBeenCalledWith(
      expect.objectContaining({
        senderName: 'there',
        ownerName: 'The project owner',
      })
    )
  })

  it('returns 500 if an unexpected error is thrown', async () => {
    connectionsSingleMock.mockRejectedValue(new Error('boom'))

    const res = await POST(makeRequest({ connectionId: 'conn_1' }))

    expect(res.status).toBe(500)
  })
})
