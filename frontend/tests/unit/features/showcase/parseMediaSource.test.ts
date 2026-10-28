import { describe, expect, it } from 'vitest'
import { mediaSourceToInput, parseMediaSource } from '@/features/showcase/lib/parseMediaSource'

describe('parseMediaSource', () => {
  it.each([
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'youtube', 'dQw4w9WgXcQ'],
    ['https://youtu.be/dQw4w9WgXcQ', 'youtube', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/embed/dQw4w9WgXcQ', 'youtube', 'dQw4w9WgXcQ'],
    ['https://youtube.com/shorts/dQw4w9WgXcQ', 'youtube', 'dQw4w9WgXcQ'],
    ['https://vimeo.com/76979871', 'vimeo', '76979871'],
    ['https://player.vimeo.com/video/76979871', 'vimeo', '76979871'],
    ['  /assets/walk_demo.mp4  ', 'local', '/assets/walk_demo.mp4'],
  ])('accepts %s as a video', (input, provider, src) => {
    expect(parseMediaSource(input, 'video')).toEqual({ ok: true, provider, src })
  })

  it('accepts a local image with spaces and brackets in the name', () => {
    expect(parseMediaSource('/assets/[RBB] - Landscape Primary.png', 'image')).toMatchObject({ ok: true, provider: 'local' })
  })

  it.each([
    'https://example.com/video',
    'http://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://www.youtube.com/watch?v=short',
    'https://vimeo.com/channels/staffpicks',
    'javascript:alert(1)',
    'not a url',
    '/assets/../secrets.mp4',
    '/public/walk_demo.mp4',
    '/assets/walk_demo.exe',
  ])('rejects %s', (input) => {
    expect(parseMediaSource(input, 'video').ok).toBe(false)
  })

  it('rejects a mismatched file type', () => {
    expect(parseMediaSource('/assets/photo.png', 'video').ok).toBe(false)
    expect(parseMediaSource('/assets/walk_demo.mp4', 'image').ok).toBe(false)
  })

  it('rejects external URLs for images', () => {
    expect(parseMediaSource('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'image').ok).toBe(false)
  })

  it('round-trips stored sources back to form input', () => {
    for (const input of ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://vimeo.com/76979871', '/assets/walk_demo.mp4']) {
      const parsed = parseMediaSource(input, 'video')
      if (!parsed.ok) throw new Error('expected ok')
      expect(mediaSourceToInput(parsed.provider, parsed.src)).toBe(input)
    }
  })
})
