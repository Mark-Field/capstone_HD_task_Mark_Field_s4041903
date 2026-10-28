import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Footprints, Cpu, Box } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Home',
  description: 'See what the RMIT RedbackBots @Home Fourier GR-3 humanoid can do in simulation.',
}

const HIGHLIGHTS = [
  { icon: Footprints, value: '50 Hz', label: 'Learned walking policy' },
  { icon: Cpu, value: '31 DOF', label: 'Fourier GR-3 humanoid' },
  { icon: Box, value: 'MuJoCo', label: 'Physics simulation' },
] as const

export default function LandingPage() {
  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(237,33,41,0.25),transparent_60%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32">
          <span className="rounded-full border border-brand/40 bg-brand/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Road to RoboCup@Home 2027
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            A humanoid robot learning to help at <span className="text-brand">home</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-zinc-400">
            The RMIT RedbackBots @Home team is simulating the Fourier GR-3 humanoid completing domestic
            service tasks — walking, navigating, perceiving and deciding. This site shows our progress
            through short demos and plain-language explanations.
          </p>
          <Link
            href="/showcase/walk-demo"
            className="group mt-10 inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition hover:bg-brand/90"
          >
            Watch the walk demo
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {HIGHLIGHTS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <Icon className="h-5 w-5 text-brand" />
              <p className="mt-4 text-2xl font-bold">{value}</p>
              <p className="text-sm text-zinc-400">{label}</p>
            </div>
          ))}
        </div>

        <Link
          href="/showcase/walk-demo"
          className="group mt-8 flex flex-col gap-6 rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 transition hover:border-brand/50 sm:flex-row sm:items-center sm:justify-between sm:p-8"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Featured demo</p>
            <h2 className="mt-2 text-2xl font-bold">Walking in simulation</h2>
            <p className="mt-2 max-w-xl text-zinc-400">
              The GR-3 stands, walks forward, turns, speeds up and stops — driven entirely by a learned
              whole-body control policy. See the clip and how it works.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-white">
            Read the explanation
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      </section>
    </main>
  )
}
