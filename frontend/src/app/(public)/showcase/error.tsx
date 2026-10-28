'use client'

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function ShowcaseError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <AlertTriangle className="h-10 w-10 text-brand" />
      <h1 className="mt-4 text-2xl font-bold">We couldn&apos;t load the demos</h1>
      <p className="mt-2 text-zinc-400">
        Something went wrong fetching the showcase content. It&apos;s usually temporary.
      </p>
      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand/90"
        >
          Try again
        </button>
        <Link href="/" className="rounded-full border border-white/15 px-6 py-2.5 text-sm font-medium hover:border-white/40">
          Go home
        </Link>
      </div>
    </main>
  )
}
