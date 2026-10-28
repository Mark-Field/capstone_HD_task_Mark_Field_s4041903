import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getServerSession } from '@/actions/auth.actions'
import { adminDb } from '@/lib/firebase/admin'
import { getAdminUid } from '@/features/showcase/lib/admin'

vi.mock('server-only', () => ({}))
vi.mock('@/actions/auth.actions', () => ({ getServerSession: vi.fn() }))

function mockUserDoc(doc: { exists: boolean; role?: string }) {
  const get = vi.fn().mockResolvedValue({ exists: doc.exists, get: (field: string) => (field === 'role' ? doc.role : undefined) })
  Object.assign(adminDb, { collection: vi.fn(() => ({ doc: vi.fn(() => ({ get })) })) })
}

describe('getAdminUid', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns null when signed out', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    expect(await getAdminUid()).toBeNull()
  })

  it('returns null for a normal user', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ uid: 'u1' } as Awaited<ReturnType<typeof getServerSession>>)
    mockUserDoc({ exists: true, role: 'user' })
    expect(await getAdminUid()).toBeNull()
  })

  it('returns null when the profile document is missing', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ uid: 'u1' } as Awaited<ReturnType<typeof getServerSession>>)
    mockUserDoc({ exists: false })
    expect(await getAdminUid()).toBeNull()
  })

  it('returns the uid for an admin', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ uid: 'admin1' } as Awaited<ReturnType<typeof getServerSession>>)
    mockUserDoc({ exists: true, role: 'admin' })
    expect(await getAdminUid()).toBe('admin1')
  })
})
