import 'server-only'
import { cache } from 'react'
import { adminDb } from '@/lib/firebase/admin'
import type { DemoSection } from '@/types/firestore'
import type { AdminDemoView, DemoView, MediaView } from '../types'
import { isLive, sortDemos, sortMedia } from './ordering'
import { slugSchema } from '../schemas'

type Data = Record<string, unknown>

function toDemoView(id: string, d: Data): DemoView {
  return {
    id,
    title: String(d.title ?? ''),
    capability: String(d.capability ?? ''),
    summary: String(d.summary ?? ''),
    status: d.status === 'partial' || d.status === 'planned' ? d.status : 'working',
    environment: d.environment === 'physical' ? 'physical' : 'simulation',
    sprint: Number(d.sprint ?? 0),
    order: Number(d.order ?? 0),
    sections: Array.isArray(d.sections) ? (d.sections as DemoSection[]) : [],
    published: d.published === true,
  }
}

function toMediaView(id: string, d: Data): MediaView {
  return {
    id,
    demoId: String(d.demoId ?? ''),
    type: d.type === 'image' ? 'image' : 'video',
    provider: d.provider === 'youtube' || d.provider === 'vimeo' ? d.provider : 'local',
    src: String(d.src ?? ''),
    caption: String(d.caption ?? ''),
    alt: typeof d.alt === 'string' ? d.alt : null,
    order: Number(d.order ?? 0),
    published: d.published === true,
  }
}

// Equality filters only, so no composite index is needed; deleted docs are filtered here.
export async function listPublishedDemos(): Promise<DemoView[]> {
  const snap = await adminDb.collection('demos').where('published', '==', true).get()
  return sortDemos(snap.docs.filter((doc) => isLive(doc.data())).map((doc) => toDemoView(doc.id, doc.data())))
}

export const getPublishedDemo = cache(async (slug: string) => {
  if (!slugSchema.safeParse(slug).success) return null
  const doc = await adminDb.collection('demos').doc(slug).get()
  const data = doc.data()
  if (!data || !isLive(data)) return null

  const mediaSnap = await adminDb.collection('media').where('demoId', '==', slug).get()
  const media = sortMedia(
    mediaSnap.docs.filter((m) => isLive(m.data())).map((m) => toMediaView(m.id, m.data())),
  )
  return { demo: toDemoView(doc.id, data), media }
})

export async function listDemosForAdmin(): Promise<AdminDemoView[]> {
  const [demoSnap, mediaSnap] = await Promise.all([adminDb.collection('demos').get(), adminDb.collection('media').get()])
  const media = mediaSnap.docs.filter((m) => m.data().deletedAt == null).map((m) => toMediaView(m.id, m.data()))

  return sortDemos(
    demoSnap.docs
      .filter((doc) => doc.data().deletedAt == null)
      .map((doc) => ({
        ...toDemoView(doc.id, doc.data()),
        media: sortMedia(media.filter((m) => m.demoId === doc.id)),
      })),
  )
}
