'use client'

import { useState } from 'react'
import { ExternalLink, Play } from 'lucide-react'

interface DemoEmbedProps {
  provider: 'youtube' | 'vimeo'
  videoId: string
  caption: string
}

const PROVIDERS = {
  youtube: {
    name: 'YouTube',
    embed: (id: string) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`,
    watch: (id: string) => `https://www.youtube.com/watch?v=${id}`,
  },
  vimeo: {
    name: 'Vimeo',
    embed: (id: string) => `https://player.vimeo.com/video/${id}?autoplay=1`,
    watch: (id: string) => `https://vimeo.com/${id}`,
  },
} as const

/** Loads the provider's player only after the viewer clicks play. */
export function DemoEmbed({ provider, videoId, caption }: DemoEmbedProps) {
  const [active, setActive] = useState(false)
  const p = PROVIDERS[provider]

  return (
    <figure className="overflow-hidden rounded-2xl border border-white/10 bg-black">
      {active ? (
        <iframe
          src={p.embed(encodeURIComponent(videoId))}
          title={caption}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="aspect-video w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          className="group flex aspect-video w-full items-center justify-center bg-zinc-900"
          aria-label={`Play video: ${caption}`}
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand shadow-lg shadow-brand/30 transition group-hover:scale-105">
            <Play className="h-7 w-7 translate-x-0.5 text-white" />
          </span>
        </button>
      )}
      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-400">
        <span>{caption}</span>
        <a
          href={p.watch(encodeURIComponent(videoId))}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-brand hover:underline"
        >
          Open on {p.name} <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </figcaption>
    </figure>
  )
}
