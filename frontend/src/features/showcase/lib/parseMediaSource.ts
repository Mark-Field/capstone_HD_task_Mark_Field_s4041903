import type { MediaProvider, MediaType } from '@/types/firestore'

export type ParsedMediaSource =
  | { ok: true; provider: MediaProvider; src: string }
  | { ok: false; error: string }

const LOCAL_PATH = /^\/assets\/[\w .\-[\]()]+\.(mp4|webm|png|jpe?g|webp)$/i
const VIDEO_EXT = new Set(['mp4', 'webm'])
const YOUTUBE_ID = /^[\w-]{11}$/
const VIMEO_ID = /^\d{6,12}$/
const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'])

function parseLocal(input: string, type: MediaType): ParsedMediaSource {
  const match = LOCAL_PATH.exec(input)
  if (!match || input.includes('..')) {
    return { ok: false, error: 'Local files must be an /assets/ path ending in .mp4, .webm, .png, .jpg or .webp' }
  }
  const isVideoFile = VIDEO_EXT.has(match[1]!.toLowerCase())
  if (isVideoFile !== (type === 'video')) {
    return { ok: false, error: type === 'video' ? 'Videos must be .mp4 or .webm' : 'Images must be .png, .jpg or .webp' }
  }
  return { ok: true, provider: 'local', src: input }
}

function youtubeId(url: URL): string | null {
  if (url.hostname === 'youtu.be') return url.pathname.slice(1)
  if (!YOUTUBE_HOSTS.has(url.hostname)) return null
  if (url.pathname === '/watch') return url.searchParams.get('v')
  const [, kind, id] = url.pathname.split('/')
  return kind === 'embed' || kind === 'shorts' ? (id ?? null) : null
}

function vimeoId(url: URL): string | null {
  if (url.hostname === 'vimeo.com' || url.hostname === 'www.vimeo.com') return url.pathname.split('/')[1] ?? null
  if (url.hostname === 'player.vimeo.com') {
    const [, kind, id] = url.pathname.split('/')
    return kind === 'video' ? (id ?? null) : null
  }
  return null
}

/**
 * Validates a media source. Accepts a local `/assets/` file, or (videos only)
 * a YouTube/Vimeo URL — for those, only the provider and video ID are kept.
 */
export function parseMediaSource(raw: string, type: MediaType): ParsedMediaSource {
  const input = raw.trim()
  if (input.startsWith('/')) return parseLocal(input, type)

  let url: URL
  try {
    url = new URL(input)
  } catch {
    return { ok: false, error: 'Enter an /assets/ path or a YouTube or Vimeo URL' }
  }
  if (url.protocol !== 'https:') return { ok: false, error: 'URL must use https' }
  if (type === 'image') return { ok: false, error: 'Images must be an /assets/ path' }

  const yt = youtubeId(url)
  if (yt !== null) {
    return YOUTUBE_ID.test(yt) ? { ok: true, provider: 'youtube', src: yt } : { ok: false, error: 'Not a valid YouTube video URL' }
  }
  const vimeo = vimeoId(url)
  if (vimeo !== null) {
    return VIMEO_ID.test(vimeo) ? { ok: true, provider: 'vimeo', src: vimeo } : { ok: false, error: 'Not a valid Vimeo video URL' }
  }
  return { ok: false, error: 'Only YouTube and Vimeo video URLs are supported' }
}

/** Rebuilds a URL the admin can paste back into the form when editing. */
export function mediaSourceToInput(provider: MediaProvider, src: string): string {
  if (provider === 'youtube') return `https://www.youtube.com/watch?v=${src}`
  if (provider === 'vimeo') return `https://vimeo.com/${src}`
  return src
}
