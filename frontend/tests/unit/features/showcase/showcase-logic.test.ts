import { describe, expect, it } from 'vitest'
import { parseSections, serializeSections } from '@/features/showcase/lib/sections'
import { isLive, publishMediaBlocker, sortDemos, sortMedia } from '@/features/showcase/lib/ordering'
import { createDemoSchema, mediaFormSchema, toFieldErrors } from '@/features/showcase/schemas'

describe('parseSections / serializeSections', () => {
  const text = ['## What it does', 'It walks.', '', '## Limitations', '- Flat ground only', '1. Stand', '2. Walk'].join('\n')

  it('parses headings, paragraphs, bullets and steps', () => {
    expect(parseSections(text)).toEqual([
      { heading: 'What it does', paragraphs: ['It walks.'] },
      { heading: 'Limitations', bullets: ['Flat ground only'], steps: ['Stand', 'Walk'] },
    ])
  })

  it('puts text before the first heading under "Overview"', () => {
    expect(parseSections('Hello')).toEqual([{ heading: 'Overview', paragraphs: ['Hello'] }])
  })

  it('round-trips', () => {
    const sections = parseSections(text)
    expect(parseSections(serializeSections(sections))).toEqual(sections)
  })
})

describe('ordering helpers', () => {
  it('sorts demos by sprint, then order, then title', () => {
    const demos = [
      { title: 'C', sprint: 2, order: 1 },
      { title: 'B', sprint: 1, order: 2 },
      { title: 'A', sprint: 1, order: 2 },
      { title: 'D', sprint: 1, order: 1 },
    ]
    expect(sortDemos(demos).map((d) => d.title)).toEqual(['D', 'A', 'B', 'C'])
  })

  it('sorts media by order without mutating input', () => {
    const media = [{ order: 2 }, { order: 0 }]
    expect(sortMedia(media)).toEqual([{ order: 0 }, { order: 2 }])
    expect(media[0]).toEqual({ order: 2 })
  })

  it('treats only published, non-deleted docs as live', () => {
    expect(isLive({ published: true, deletedAt: null })).toBe(true)
    expect(isLive({ published: true })).toBe(true)
    expect(isLive({ published: false, deletedAt: null })).toBe(false)
    expect(isLive({ published: true, deletedAt: new Date() })).toBe(false)
  })

  it('blocks publishing media under a draft, deleted or missing demo', () => {
    expect(publishMediaBlocker({ published: true, deletedAt: null })).toBeNull()
    expect(publishMediaBlocker({ published: false, deletedAt: null })).toMatch(/Publish the demo first/)
    expect(publishMediaBlocker({ published: true, deletedAt: new Date() })).toMatch(/no longer exists/)
    expect(publishMediaBlocker(null)).toMatch(/no longer exists/)
  })
})

describe('schemas', () => {
  const validDemo = {
    slug: 'walk-demo',
    title: 'Walk Demo',
    capability: 'Locomotion',
    summary: 'It walks.',
    status: 'working',
    environment: 'simulation',
    sprint: '1',
    order: '0',
    sectionsText: '## What\nIt walks.',
  } as const

  it('accepts a valid demo and coerces numbers and sections', () => {
    const parsed = createDemoSchema.parse(validDemo)
    expect(parsed.sprint).toBe(1)
    expect(parsed.sectionsText).toEqual([{ heading: 'What', paragraphs: ['It walks.'] }])
  })

  it.each(['Walk Demo', 'walk--demo', '-walk', 'walk_demo', ''])('rejects slug %j', (slug) => {
    const result = createDemoSchema.safeParse({ ...validDemo, slug })
    expect(result.success).toBe(false)
    if (!result.success) expect(toFieldErrors(result.error)).toHaveProperty('slug')
  })

  it('requires alt text for images only', () => {
    const base = { source: '/assets/a.png', caption: 'A photo', order: 0 }
    const image = mediaFormSchema.safeParse({ ...base, type: 'image' })
    expect(image.success).toBe(false)
    if (!image.success) expect(toFieldErrors(image.error)).toHaveProperty('alt')
    expect(mediaFormSchema.safeParse({ ...base, type: 'video' }).success).toBe(true)
  })
})
