'use client'

import { useState } from 'react'
import { VideoOff } from 'lucide-react'

interface DemoVideoProps {
  src: string
  caption: string
}

export function DemoVideo({ src, caption }: DemoVideoProps) {
  const [failed, setFailed] = useState(false)

  return (
    <figure className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl shadow-brand/10">
      {failed ? (
        <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 p-6 text-center">
          <VideoOff className="h-8 w-8 text-zinc-500" />
          <p className="text-sm text-zinc-300">This video couldn&apos;t be loaded.</p>
          <a href={encodeURI(src)} className="text-sm font-medium text-brand underline-offset-4 hover:underline">
            Open the video file directly
          </a>
        </div>
      ) : (
        <video
          src={encodeURI(src)}
          controls
          playsInline
          preload="metadata"
          onError={() => setFailed(true)}
          className="aspect-[4/3] w-full"
        />
      )}
      <figcaption className="border-t border-white/10 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-400">
        {caption}
      </figcaption>
    </figure>
  )
}
