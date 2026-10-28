import type { Demo, DemoMedia } from '@/types/firestore'

/** Serialisable view of a demo (timestamps stripped) for passing to components. */
export type DemoView = Omit<Demo, 'createdBy' | 'createdAt' | 'updatedAt' | 'deletedAt' | '_schemaVersion'> & {
  id: string
}

export type MediaView = Omit<DemoMedia, 'createdBy' | 'createdAt' | 'updatedAt' | 'deletedAt' | '_schemaVersion'> & {
  id: string
}

export interface AdminDemoView extends DemoView {
  media: MediaView[]
}

export interface FormActionResult {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string>
}
