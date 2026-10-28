import type { Timestamp } from 'firebase/firestore'

/**
 * Firestore collection type definitions.
 *
 * Keep in sync with:
 *   - src/lib/firebase/firestore.ts  (typed collection exports)
 *   - firebase/firestore.rules       (security rules)
 *   - docs/FIRESTORE-SCHEMA.md       (schema documentation)
 *
 * When adding a new collection, use the /firebase-collection skill.
 */

export interface UserProfile {
  uid: string
  email: string
  displayName: string | null
  photoURL: string | null
  role: 'user' | 'admin'
  createdAt: Timestamp
  updatedAt: Timestamp
  _schemaVersion: 1
}

export type CreateUserProfileInput = Omit<UserProfile, 'createdAt' | 'updatedAt'>

export type DemoStatus = 'working' | 'partial' | 'planned'
export type DemoEnvironment = 'simulation' | 'physical'

export interface DemoSection {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
  steps?: string[]
}

/** demos/{slug} — one robot behaviour shown on the public showcase. */
export interface Demo {
  title: string
  capability: string
  summary: string
  status: DemoStatus
  environment: DemoEnvironment
  sprint: number
  order: number
  sections: DemoSection[]
  published: boolean
  createdBy: string
  createdAt: Timestamp
  updatedAt: Timestamp
  deletedAt: Timestamp | null
  _schemaVersion: 1
}

export type MediaType = 'video' | 'image'
export type MediaProvider = 'local' | 'youtube' | 'vimeo'

/** media/{mediaId} — a video or image belonging to a demo. */
export interface DemoMedia {
  demoId: string
  type: MediaType
  provider: MediaProvider
  /** `/assets/...` path for local files, otherwise the provider's video ID. */
  src: string
  caption: string
  alt: string | null
  order: number
  published: boolean
  createdBy: string
  createdAt: Timestamp
  updatedAt: Timestamp
  deletedAt: Timestamp | null
  _schemaVersion: 1
}
