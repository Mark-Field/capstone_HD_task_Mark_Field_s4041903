import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mkdir, writeFile } from 'node:fs/promises'
import { getAdminUid } from '@/features/showcase/lib/admin'
import { createDemoPage } from '@/features/showcase/actions/demo-page.actions'

vi.mock('server-only', () => ({}))
vi.mock('@/features/showcase/lib/admin', () => ({ getAdminUid: vi.fn() }))
vi.mock('node:fs', () => {
  const existsSync = vi.fn(() => true)
  return { existsSync, default: { existsSync } }
})
vi.mock('node:fs/promises', () => {
  const fns = { mkdir: vi.fn(), writeFile: vi.fn() }
  return { ...fns, default: fns }
})

const CODE = 'export default function Page() { return null }'

describe('createDemoPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('NODE_ENV', 'development')
    vi.mocked(getAdminUid).mockResolvedValue('admin1')
  })
  afterEach(() => vi.unstubAllEnvs())

  it('rejects non-admins without writing', async () => {
    vi.mocked(getAdminUid).mockResolvedValue(null)
    expect((await createDemoPage('my-demo', CODE)).success).toBe(false)
    expect(writeFile).not.toHaveBeenCalled()
  })

  it('refuses outside local development', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const res = await createDemoPage('my-demo', CODE)
    expect(res.error).toMatch(/running locally/)
    expect(writeFile).not.toHaveBeenCalled()
  })

  it.each(['../evil', 'My Demo', '[slug]', '(public)'])('rejects slug %j', async (slug) => {
    const res = await createDemoPage(slug, CODE)
    expect(res.fieldErrors?.slug).toBeDefined()
    expect(mkdir).not.toHaveBeenCalled()
  })

  it('requires code', async () => {
    expect((await createDemoPage('my-demo', '   ')).fieldErrors?.code).toBeDefined()
  })

  it('writes page.tsx inside the showcase folder without overwriting', async () => {
    expect(await createDemoPage('my-demo', CODE)).toEqual({ success: true })
    const [file, contents, options] = vi.mocked(writeFile).mock.calls[0]!
    expect(String(file)).toMatch(/src[\\/]app[\\/]\(public\)[\\/]showcase[\\/]my-demo[\\/]page\.tsx$/)
    expect(contents).toBe(`${CODE}\n`)
    expect(options).toEqual({ flag: 'wx' })
  })

  it('reports an existing page as a slug error', async () => {
    vi.mocked(mkdir).mockRejectedValueOnce(Object.assign(new Error('exists'), { code: 'EEXIST' }))
    expect((await createDemoPage('walk-demo', CODE)).fieldErrors?.slug).toMatch(/already exists/)
  })
})
