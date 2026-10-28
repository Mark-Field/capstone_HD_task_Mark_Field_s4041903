interface DemoOrderFields {
  sprint: number
  order: number
  title: string
}

/** Sprint first, then display order, then title so ties are stable. */
export function sortDemos<T extends DemoOrderFields>(demos: T[]): T[] {
  return [...demos].sort((a, b) => a.sprint - b.sprint || a.order - b.order || a.title.localeCompare(b.title))
}

export function sortMedia<T extends { order: number }>(media: T[]): T[] {
  return [...media].sort((a, b) => a.order - b.order)
}

export function isLive(doc: { published?: unknown; deletedAt?: unknown }): boolean {
  return doc.published === true && doc.deletedAt == null
}

/** Returns an error message if media can't be published under this parent demo, otherwise null. */
export function publishMediaBlocker(parent: { published: boolean; deletedAt: unknown } | null): string | null {
  if (!parent || parent.deletedAt != null) return 'This media belongs to a demo that no longer exists.'
  if (!parent.published) return 'Publish the demo first — media can’t be public while its demo is a draft.'
  return null
}
