import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { DemoView } from '../types'
import { DemoBadges } from './DemoBadges'

export function DemoCard({ demo }: { demo: DemoView }) {
  return (
    <Link
      href={`/showcase/${demo.id}`}
      className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-brand/50 hover:bg-white/[0.05]"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Sprint {demo.sprint}</p>
      <h2 className="mt-2 text-xl font-bold">{demo.title}</h2>
      <div className="mt-3">
        <DemoBadges status={demo.status} environment={demo.environment} capability={demo.capability} />
      </div>
      <p className="mt-4 flex-1 text-sm text-zinc-400">{demo.summary}</p>
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white">
        View demo
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  )
}
