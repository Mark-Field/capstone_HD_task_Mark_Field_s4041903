'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ImageOff } from 'lucide-react'

export function DemoImage({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  const [failed, setFailed] = useState(false)

  return (
    <figure className="overflow-hidden rounded-2xl border border-white/10 bg-black">
      {failed ? (
        <div role="img" aria-label={alt} className="flex aspect-video flex-col items-center justify-center gap-3 p-6 text-center">
          <ImageOff className="h-8 w-8 text-zinc-500" />
          <p className="text-sm text-zinc-300">{alt}</p>
        </div>
      ) : (
        <Image
          src={encodeURI(src)}
          alt={alt}
          width={1280}
          height={720}
          sizes="(min-width: 1024px) 60vw, 100vw"
          onError={() => setFailed(true)}
          className="h-auto w-full"
        />
      )}
      <figcaption className="border-t border-white/10 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-400">
        {caption}
      </figcaption>
    </figure>
  )
}
