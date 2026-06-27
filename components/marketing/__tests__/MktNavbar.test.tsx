import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import MktNavbar from '../MktNavbar'

vi.mock('next/navigation', () => ({
  usePathname: () => '/vision',
}))

const { getSessionMock, onAuthStateChangeMock, singleMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
  onAuthStateChangeMock: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
  singleMock: vi.fn(),
}))

vi.mock('@/lib/supabase-browser', () => ({
  createBrowserSupabaseClient: () => ({
    auth: {
      getSession: getSessionMock,
      onAuthStateChange: onAuthStateChangeMock,
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: singleMock,
        }),
      }),
    }),
  }),
}))

describe('MktNavbar', () => {
  beforeEach(() => {
    getSessionMock.mockReset()
    onAuthStateChangeMock.mockClear()
    singleMock.mockReset()
  })

  it('renders nothing until the session check resolves', () => {
    getSessionMock.mockReturnValue(new Promise(() => {})) // never resolves

    const { container } = render(<MktNavbar />)

    expect(container).toBeEmptyDOMElement()
  })

  it('shows Sign in / Sign up when logged out', async () => {
    getSessionMock.mockResolvedValue({ data: { session: null } })

    render(<MktNavbar />)

    expect(await screen.findByRole('link', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sign up' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Projects' })).not.toBeInTheDocument()

    // Marketing nav links are always shown once the auth check resolves
    expect(screen.getByRole('link', { name: 'Vision' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Docs' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument()
  })

  it('shows Projects link + initials avatar when logged in', async () => {
    getSessionMock.mockResolvedValue({
      data: { session: { user: { id: 'u1', email: 'jane@example.com' } } },
    })
    singleMock.mockResolvedValue({ data: { name: null, first_name: 'Jane', last_name: 'Doe' } })

    render(<MktNavbar />)

    expect(await screen.findByRole('link', { name: 'Projects' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Your profile' })).toHaveTextContent('JD')
    expect(screen.queryByRole('link', { name: 'Sign in' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Sign up' })).not.toBeInTheDocument()
  })

  it('falls back to email initials when no profile name is set', async () => {
    getSessionMock.mockResolvedValue({
      data: { session: { user: { id: 'u1', email: 'jane@example.com' } } },
    })
    singleMock.mockResolvedValue({ data: { name: null, first_name: null, last_name: null } })

    render(<MktNavbar />)

    expect(await screen.findByRole('link', { name: 'Your profile' })).toHaveTextContent('JA')
  })
})
