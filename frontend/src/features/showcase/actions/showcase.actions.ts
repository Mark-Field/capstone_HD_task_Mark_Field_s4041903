'use server'

import { revalidatePath } from 'next/cache'
import { FieldValue } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase/admin'
import { getAdminUid } from '../lib/admin'
import { parseMediaSource } from '../lib/parseMediaSource'
import { publishMediaBlocker } from '../lib/ordering'
import { createDemoSchema, demoFormSchema, mediaFormSchema, slugSchema, toFieldErrors } from '../schemas'
import type { DemoFormInput, MediaFormInput } from '../schemas'
import type { FormActionResult } from '../types'

const FORBIDDEN: FormActionResult = { success: false, error: 'You need the admin role to change showcase content.' }
const demos = () => adminDb.collection('demos')
const media = () => adminDb.collection('media')

function refresh(slug?: string) {
  revalidatePath('/dashboard/showcase')
  revalidatePath('/showcase')
  if (slug) revalidatePath(`/showcase/${slug}`)
}

async function getLiveDemo(slug: string) {
  if (!slugSchema.safeParse(slug).success) return null
  const snap = await demos().doc(slug).get()
  const data = snap.data()
  return data && data.deletedAt == null ? data : null
}

export async function createDemo(input: DemoFormInput): Promise<FormActionResult> {
  const uid = await getAdminUid()
  if (!uid) return FORBIDDEN

  const parsed = createDemoSchema.safeParse(input)
  if (!parsed.success) return { success: false, fieldErrors: toFieldErrors(parsed.error) }
  const { slug, sectionsText, ...fields } = parsed.data

  const ref = demos().doc(slug)
  if ((await ref.get()).exists) return { success: false, fieldErrors: { slug: 'That slug is already in use' } }

  await ref.set({
    ...fields,
    sections: sectionsText,
    published: false,
    createdBy: uid,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    deletedAt: null,
    _schemaVersion: 1,
  })
  refresh(slug)
  return { success: true }
}

export async function updateDemo(slug: string, input: DemoFormInput): Promise<FormActionResult> {
  if (!(await getAdminUid())) return FORBIDDEN
  if (!(await getLiveDemo(slug))) return { success: false, error: 'Demo not found.' }

  const parsed = demoFormSchema.safeParse(input)
  if (!parsed.success) return { success: false, fieldErrors: toFieldErrors(parsed.error) }
  const { sectionsText, ...fields } = parsed.data

  await demos().doc(slug).update({ ...fields, sections: sectionsText, updatedAt: FieldValue.serverTimestamp() })
  refresh(slug)
  return { success: true }
}

export async function setDemoPublished(slug: string, published: boolean): Promise<FormActionResult> {
  if (!(await getAdminUid())) return FORBIDDEN
  if (!(await getLiveDemo(slug))) return { success: false, error: 'Demo not found.' }

  await demos().doc(slug).update({ published: published === true, updatedAt: FieldValue.serverTimestamp() })
  refresh(slug)
  return { success: true }
}

export async function softDeleteDemo(slug: string): Promise<FormActionResult> {
  if (!(await getAdminUid())) return FORBIDDEN
  if (!(await getLiveDemo(slug))) return { success: false, error: 'Demo not found.' }

  await demos().doc(slug).update({
    published: false,
    deletedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  refresh(slug)
  return { success: true }
}

function parseMediaInput(input: MediaFormInput) {
  const parsed = mediaFormSchema.safeParse(input)
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error) } as const
  const source = parseMediaSource(parsed.data.source, parsed.data.type)
  if (!source.ok) return { fieldErrors: { source: source.error } } as const
  const { type, caption, alt, order } = parsed.data
  return { fields: { type, caption, alt: alt || null, order, provider: source.provider, src: source.src } } as const
}

export async function createMedia(demoId: string, input: MediaFormInput): Promise<FormActionResult> {
  const uid = await getAdminUid()
  if (!uid) return FORBIDDEN
  if (!(await getLiveDemo(demoId))) return { success: false, error: 'Demo not found.' }

  const result = parseMediaInput(input)
  if ('fieldErrors' in result) return { success: false, fieldErrors: result.fieldErrors }

  await media().add({
    ...result.fields,
    demoId,
    published: false,
    createdBy: uid,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    deletedAt: null,
    _schemaVersion: 1,
  })
  refresh(demoId)
  return { success: true }
}

async function getLiveMedia(id: string) {
  if (!/^[\w-]{1,128}$/.test(id)) return null
  const data = (await media().doc(id).get()).data()
  return data && data.deletedAt == null ? data : null
}

export async function updateMedia(id: string, input: MediaFormInput): Promise<FormActionResult> {
  if (!(await getAdminUid())) return FORBIDDEN
  const existing = await getLiveMedia(id)
  if (!existing) return { success: false, error: 'Media not found.' }

  const result = parseMediaInput(input)
  if ('fieldErrors' in result) return { success: false, fieldErrors: result.fieldErrors }

  await media().doc(id).update({ ...result.fields, updatedAt: FieldValue.serverTimestamp() })
  refresh(String(existing.demoId))
  return { success: true }
}

export async function setMediaPublished(id: string, published: boolean): Promise<FormActionResult> {
  if (!(await getAdminUid())) return FORBIDDEN
  const existing = await getLiveMedia(id)
  if (!existing) return { success: false, error: 'Media not found.' }

  if (published === true) {
    const parent = (await demos().doc(String(existing.demoId)).get()).data()
    const blocker = publishMediaBlocker(
      parent ? { published: parent.published === true, deletedAt: parent.deletedAt } : null,
    )
    if (blocker) return { success: false, error: blocker }
  }

  await media().doc(id).update({ published: published === true, updatedAt: FieldValue.serverTimestamp() })
  refresh(String(existing.demoId))
  return { success: true }
}

export async function softDeleteMedia(id: string): Promise<FormActionResult> {
  if (!(await getAdminUid())) return FORBIDDEN
  const existing = await getLiveMedia(id)
  if (!existing) return { success: false, error: 'Media not found.' }

  await media().doc(id).update({
    published: false,
    deletedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  refresh(String(existing.demoId))
  return { success: true }
}
