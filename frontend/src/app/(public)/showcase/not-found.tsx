import Link from 'next/link'

export default function ShowcaseNotFound() {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <p className="text-6xl font-bold text-white/15">404</p>
      <h1 className="mt-4 text-2xl font-bold">Demo not found</h1>
      <p className="mt-2 text-zinc-400">This demo doesn&apos;t exist or isn&apos;t published yet.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/showcase" className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand/90">
          Browse all demos
        </Link>
        <Link href="/" className="rounded-full border border-white/15 px-6 py-2.5 text-sm font-medium hover:border-white/40">
          Go home
        </Link>
      </div>
    </main>
  )
}
