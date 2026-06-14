import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const { insertMock, fromMock, sendMock } = vi.hoisted(() => {
  const insertMock = vi.fn()
  return {
    insertMock,
    fromMock: vi.fn(() => ({ insert: insertMock })),
    sendMock: vi.fn(),
  }
})

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: { from: fromMock },
}))

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(function () {
    return { emails: { send: sendMock } }
  }),
}))

import { POST } from '../route'

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/contact', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/contact', () => {
  beforeEach(() => {
    fromMock.mockClear()
    insertMock.mockReset().mockResolvedValue({ error: null })
    sendMock.mockReset().mockResolvedValue({ data: { id: 'email_1' }, error: null })
  })

  it('returns 400 when required fields are missing', async () => {
    const res = await POST(makeRequest({ name: '', email: '', message: '' }))

    expect(res.status).toBe(400)
    expect(insertMock).not.toHaveBeenCalled()
    expect(sendMock).not.toHaveBeenCalled()
  })

  it('saves the submission to contact_messages and emails the owner', async () => {
    const res = await POST(makeRequest({
      name: 'Jane Doe',
      email: 'jane@example.com',
      subject: 'bug',
      message: 'Something is broken',
    }))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })

    expect(fromMock).toHaveBeenCalledWith('contact_messages')
    expect(insertMock).toHaveBeenCalledWith({
      name: 'Jane Doe',
      email: 'jane@example.com',
      subject: 'bug',
      role: null,
      message: 'Something is broken',
    })

    expect(sendMock).toHaveBeenCalledTimes(1)
    const payload = sendMock.mock.calls[0][0]
    expect(payload.to).toBe('rd.mouhouadi@gmail.com')
    expect(payload.replyTo).toBe('jane@example.com')
    expect(payload.subject).toContain('Jane Doe')
    expect(payload.html).toContain('Bug report')
  })

  it('still sends the email even if the DB insert fails', async () => {
    insertMock.mockResolvedValue({ error: { message: 'db unreachable' } })

    const res = await POST(makeRequest({
      name: 'Jane Doe',
      email: 'jane@example.com',
      subject: 'suggestion',
      message: 'Here is an idea',
    }))

    expect(res.status).toBe(200)
    expect(sendMock).toHaveBeenCalledTimes(1)
  })

  it('returns 500 when Resend fails to send', async () => {
    sendMock.mockResolvedValue({ data: null, error: { message: 'send failed' } })

    const res = await POST(makeRequest({
      name: 'Jane Doe',
      email: 'jane@example.com',
      subject: 'suggestion',
      message: 'Here is an idea',
    }))

    expect(res.status).toBe(500)
  })

  it('passes the role through for "join the journey" submissions', async () => {
    await POST(makeRequest({
      name: 'Jane Doe',
      email: 'jane@example.com',
      subject: 'journey',
      role: 'Design & UX',
      message: 'I want to help',
    }))

    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ role: 'Design & UX' }))

    const payload = sendMock.mock.calls[0][0]
    expect(payload.html).toContain('Design & UX')
  })
})
