import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Film } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { DemoBadges } from '@/features/showcase/components/DemoBadges'
import { DemoSections } from '@/features/showcase/components/DemoSections'
import { MediaItem } from '@/features/showcase/components/MediaItem'
import { getPublishedDemo } from '@/features/showcase/lib/queries'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await getPublishedDemo((await params).slug)
  return result ? { title: result.demo.title, description: result.demo.summary } : { title: 'Demo not found' }
}

export default async function DemoPage({ params }: Props) {
  const result = await getPublishedDemo((await params).slug)
  if (!result) notFound()
  const { demo, media } = result

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="max-w-3xl">
        <DemoBadges status={demo.status} environment={demo.environment} capability={demo.capability} />
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">{demo.title}</h1>
        <p className="mt-4 text-lg text-zinc-400">{demo.summary}</p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="space-y-6 lg:sticky lg:top-24">
            {media.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15">
                <EmptyState icon={Film} title="Video coming soon" description="Footage for this demo hasn’t been published yet." />
              </div>
            ) : (
              media.map((m) => <MediaItem key={m.id} media={m} />)
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {demo.sections.length === 0 ? (
            <EmptyState title="Explanation coming soon" description="The team is still writing up how this works." />
          ) : (
            <DemoSections sections={demo.sections} />
          )}
        </div>
      </div>
    </main>
  )
}
