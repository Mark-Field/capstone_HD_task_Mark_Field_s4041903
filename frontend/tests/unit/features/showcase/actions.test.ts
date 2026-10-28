import { beforeEach, describe, expect, it, vi } from 'vitest'
import { adminDb } from '@/lib/firebase/admin'
import { getAdminUid } from '@/features/showcase/lib/admin'
import { createDemo, createMedia, setMediaPublished } from '@/features/showcase/actions/showcase.actions'

vi.mock('server-only', () => ({}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('firebase-admin/firestore', () => ({ FieldValue: { serverTimestamp: () => 'ts' } }))
vi.mock('@/features/showcase/lib/admin', () => ({ getAdminUid: vi.fn() }))

type DocData = Record<string, unknown> | undefined

/** Minimal in-memory stand-in for adminDb.collection(name).doc(id) / .add(). */
function mockDb(store: Record<string, Record<string, DocData>>) {
  const writes = { set: vi.fn(), update: vi.fn(), add: vi.fn() }
  Object.assign(adminDb, {
    collection: (name: string) => ({
      doc: (id: string) => ({
        get: async () => ({ exists: store[name]?.[id] !== undefined, data: () => store[name]?.[id] }),
        set: writes.set,
        update: writes.update,
      }),
      add: writes.add,
    }),
  })
  return writes
}

const demoInput = {
  slug: 'walk-demo',
  title: 'Walk',
  capability: 'Locomotion',
  summary: 'Walks',
  status: 'working',
  environment: 'simulation',
  sprint: 1,
  order: 0,
  sectionsText: '',
} as const

describe('showcase actions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('rejects non-admins without writing', async () => {
    vi.mocked(getAdminUid).mockResolvedValue(null)
    const writes = mockDb({})
    const res = await createDemo(demoInput)
    expect(res.success).toBe(false)
    expect(res.error).toMatch(/admin role/)
    expect(writes.set).not.toHaveBeenCalled()
  })

  it('creates a draft demo with schema version and null deletedAt', async () => {
    vi.mocked(getAdminUid).mockResolvedValue('admin1')
    const writes = mockDb({ demos: {} })
    expect(await createDemo(demoInput)).toEqual({ success: true })
    expect(writes.set).toHaveBeenCalledWith(
      expect.objectContaining({ published: false, deletedAt: null, _schemaVersion: 1, createdBy: 'admin1' }),
    )
  })

  it('rejects a duplicate slug', async () => {
    vi.mocked(getAdminUid).mockResolvedValue('admin1')
    const writes = mockDb({ demos: { 'walk-demo': { published: true, deletedAt: null } } })
    const res = await createDemo(demoInput)
    expect(res.fieldErrors?.slug).toMatch(/already in use/)
    expect(writes.set).not.toHaveBeenCalled()
  })

  it('rejects an invalid video URL with a field error and saves nothing', async () => {
    vi.mocked(getAdminUid).mockResolvedValue('admin1')
    const writes = mockDb({ demos: { 'walk-demo': { published: true, deletedAt: null } } })
    const res = await createMedia('walk-demo', { type: 'video', source: 'https://example.com/video', caption: 'c', order: 0 })
    expect(res.fieldErrors?.source).toBeDefined()
    expect(writes.add).not.toHaveBeenCalled()
  })

  it('stores only provider and ID for a YouTube URL', async () => {
    vi.mocked(getAdminUid).mockResolvedValue('admin1')
    const writes = mockDb({ demos: { 'walk-demo': { published: true, deletedAt: null } } })
    await createMedia('walk-demo', {
      type: 'video',
      source: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      caption: 'c',
      order: 0,
    })
    expect(writes.add).toHaveBeenCalledWith(expect.objectContaining({ provider: 'youtube', src: 'dQw4w9WgXcQ', published: false }))
  })

  it('refuses to publish media whose demo is a draft', async () => {
    vi.mocked(getAdminUid).mockResolvedValue('admin1')
    const writes = mockDb({
      demos: { 'walk-demo': { published: false, deletedAt: null } },
      media: { m1: { demoId: 'walk-demo', published: false, deletedAt: null } },
    })
    const res = await setMediaPublished('m1', true)
    expect(res.success).toBe(false)
    expect(res.error).toMatch(/Publish the demo first/)
    expect(writes.update).not.toHaveBeenCalled()
  })
})
