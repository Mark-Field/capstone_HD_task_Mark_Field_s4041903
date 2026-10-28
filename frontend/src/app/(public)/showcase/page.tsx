import type { Metadata } from 'next'
import { Clapperboard } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { DemoCard } from '@/features/showcase/components/DemoCard'
import { listPublishedDemos } from '@/features/showcase/lib/queries'

export const metadata: Metadata = {
  title: 'Showcase',
  description: 'Demos of what the RedbackBots @Home GR-3 humanoid can do in simulation.',
}

// Read Firestore on every request so edits appear on reload without a redeploy.
export const dynamic = 'force-dynamic'

export default async function ShowcasePage() {
  const demos = await listPublishedDemos()

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Showcase</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-5xl">What the robot can do</h1>
        <p className="mt-4 text-lg text-zinc-400">
          Each demo pairs a short clip with a plain-language explanation of how the behaviour works and
          where it falls short. Ordered by sprint.
        </p>
      </header>

      {demos.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-white/15">
          <EmptyState
            icon={Clapperboard}
            title="Demos coming soon"
            description="The team hasn’t published any demos yet. Check back after the next sprint."
          />
        </div>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {demos.map((demo) => (
            <DemoCard key={demo.id} demo={demo} />
          ))}
        </div>
      )}
    </main>
  )
}
