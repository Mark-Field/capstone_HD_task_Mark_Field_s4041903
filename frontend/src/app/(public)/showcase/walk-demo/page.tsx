import type { Metadata } from 'next'
import { DemoVideo } from '@/features/showcase/components/DemoVideo'

export const metadata: Metadata = {
  title: 'Walk Demo',
  description: 'The Fourier GR-3 humanoid walking in MuJoCo using a learned whole-body control policy.',
}

const SEQUENCE = [
  { phase: 'Settle', duration: '2.5 s', command: 'Stand', detail: 'Robot holds its default standing pose and finds balance.' },
  { phase: 'Walk forward', duration: '5.0 s', command: '0.3 m/s', detail: 'Steady straight-line walking.' },
  { phase: 'Turn', duration: '3.0 s', command: '0.1 m/s + 0.4 rad/s yaw', detail: 'Slow forward motion while rotating.' },
  { phase: 'Fast', duration: '4.0 s', command: '0.5 m/s', detail: 'Higher walking speed.' },
  { phase: 'Stop', duration: '2.0 s', command: 'Stand', detail: 'Returns to a stable stand.' },
] as const

const SPECS = [
  { label: 'Simulator', value: 'MuJoCo (headless render)' },
  { label: 'Physics rate', value: '500 Hz (0.002 s step)' },
  { label: 'Policy rate', value: '50 Hz' },
  { label: 'Policy input', value: '1,960 values (49 × 40-step history)' },
  { label: 'Policy output', value: '12 leg joint targets' },
  { label: 'Video', value: '640 × 480 · 25 fps' },
] as const

export default function WalkDemoPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="max-w-3xl">
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-400">Working</span>
          <span className="rounded-full bg-sky-500/15 px-3 py-1 text-sky-400">Simulation</span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-zinc-300">Locomotion</span>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">Walk Demo</h1>
        <p className="mt-4 text-lg text-zinc-400">
          The Fourier GR-3 humanoid walking on flat ground in simulation — the foundation every other
          @Home behaviour (navigation, serving, guiding guests) is built on.
        </p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="lg:sticky lg:top-24">
            <DemoVideo
              src="/assets/walk_demo.mp4"
              caption="GR-3 settling, walking forward, turning, speeding up and stopping. Tracking camera, MuJoCo simulation."
            />
          </div>
        </div>

        <div className="space-y-8 lg:col-span-2">
          <section>
            <h2 className="text-lg font-semibold">What it does</h2>
            <p className="mt-2 text-zinc-400">
              The robot follows a scripted list of velocity commands — stand, walk, turn, walk faster,
              stop — while staying upright. No step is hand-animated: every leg movement comes from a
              neural network deciding, 50 times a second, where each leg joint should go.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">How it works</h2>
            <ol className="mt-3 space-y-3 text-zinc-400">
              {[
                'The simulator loads the GR-3 model and spawns it in its default standing pose.',
                'Each policy step, the robot’s state — body rotation, gravity direction, joint angles and speeds, the velocity command and its last action — is stacked with the previous 40 steps.',
                'The whole-body control policy (wbc_yaw.pt) turns that history into target angles for the 12 leg joints.',
                'A PD controller converts the targets into motor torques, clipped to the real GR-3’s torque limits, while the arms and waist hold a fixed pose.',
              ].map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs font-bold text-brand">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Limitations</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-zinc-400">
              <li>Flat ground only — no stairs, slopes or obstacles in this clip.</li>
              <li>Commands are scripted; the robot isn&apos;t perceiving or planning here.</li>
              <li>Simulation only — not yet run on the physical robot.</li>
            </ul>
          </section>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-bold">The test sequence</h2>
        <p className="mt-2 text-zinc-400">Durations are simulated time.</p>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {SEQUENCE.map(({ phase, duration, command, detail }, i) => (
            <li key={phase} className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <span className="text-xs font-semibold text-brand">0{i + 1}</span>
              <p className="mt-1 font-semibold">{phase}</p>
              <p className="mt-1 font-mono text-xs text-zinc-300">
                {duration} · {command}
              </p>
              <p className="mt-2 text-sm text-zinc-400">{detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-bold">Under the hood</h2>
        <dl className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {SPECS.map(({ label, value }) => (
            <div key={label} className="bg-zinc-950 p-5">
              <dt className="text-xs uppercase tracking-wider text-zinc-500">{label}</dt>
              <dd className="mt-1 font-medium">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-sm text-zinc-400">
          Reproduce it from <code className="font-mono text-zinc-300">gr3_aurora_sim/</code> with{' '}
          <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-zinc-200">bash scripts/render.sh walk</code>
        </p>
      </section>
    </main>
  )
}
