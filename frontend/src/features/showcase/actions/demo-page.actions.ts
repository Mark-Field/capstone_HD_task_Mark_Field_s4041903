'use server'

import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { getAdminUid } from '../lib/admin'
import { slugSchema } from '../schemas'
import type { FormActionResult } from '../types'

const SHOWCASE_DIR = ['src', 'app', '(public)', 'showcase']
const MAX_CODE_LENGTH = 100_000

function findShowcaseDir(): string | null {
  for (const root of [process.cwd(), path.join(process.cwd(), 'frontend')]) {
    const dir = path.join(root, ...SHOWCASE_DIR)
    if (existsSync(dir)) return dir
  }
  return null
}

/**
 * Saves admin-typed page code as src/app/(public)/showcase/<slug>/page.tsx.
 * Local development only: a deployed site can't add code files, and allowing it would let a
 * stolen admin login run arbitrary code on the server.
 */
export async function createDemoPage(slug: string, code: string): Promise<FormActionResult> {
  if (!(await getAdminUid())) return { success: false, error: 'You need the admin role to change showcase content.' }
  if (process.env.NODE_ENV !== 'development') {
    return { success: false, error: 'New pages can only be created while running locally with pnpm run dev.' }
  }

  const parsedSlug = slugSchema.safeParse(slug)
  if (!parsedSlug.success) return { success: false, fieldErrors: { slug: parsedSlug.error.issues[0]!.message } }
  if (typeof code !== 'string' || !code.trim()) return { success: false, fieldErrors: { code: 'Page code is required' } }
  if (code.length > MAX_CODE_LENGTH) return { success: false, fieldErrors: { code: 'Page code is too long' } }

  const showcaseDir = findShowcaseDir()
  if (!showcaseDir) return { success: false, error: 'Could not find the showcase folder in this project.' }

  const pageDir = path.join(showcaseDir, parsedSlug.data)
  try {
    await mkdir(pageDir)
    await writeFile(path.join(pageDir, 'page.tsx'), code.endsWith('\n') ? code : `${code}\n`, { flag: 'wx' })
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'EEXIST') {
      return { success: false, fieldErrors: { slug: 'A page with that slug already exists' } }
    }
    throw err
  }
  return { success: true }
}
