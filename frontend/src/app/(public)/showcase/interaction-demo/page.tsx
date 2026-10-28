import type { Metadata } from 'next'
import { DemoVideo } from '@/features/showcase/components/DemoVideo'

export const metadata: Metadata = {
  title: 'Interaction Demo',
  description: 'The Fourier GR-3 humanoid pulling a chair out from a table for a guest in simulation.',
}

const SEQUENCE = [
  { phase: 'Approach', timing: '0.12 m/s', detail: 'Walks up to the chair back, staying square and centred, and stops 0.30 m away.' },
  { phase: 'Settle', timing: '1.0 s', detail: 'Stands still so the body is stable before the arms move.' },
  { phase: 'Reach', timing: '1.5 s', detail: 'Raises both hands to hover 6 cm above the top of the chair back.' },
  { phase: 'Grasp', timing: '0.6 s', detail: 'Lowers the hands onto the top edge, 12 cm either side of centre.' },
  { phase: 'Pull', timing: '0.10 m/s', detail: 'Walks backwards; the chair slides out with the hands, up to 0.35 m.' },
  { phase: 'Release', timing: '0.6 s', detail: 'Lifts the hands clear of the chair.' },
  { phase: 'Retract', timing: '1.5 s', detail: 'Returns the arms to their resting pose.' },
  { phase: 'Back off & wait', timing: '0.15 m/s', detail: 'Steps back another 0.30 m to give the guest room, then waits until they sit.' },
] as const

const SPECS = [
  { label: 'Scene', value: 'Room with a table, four chairs, a sofa and two guests' },
  { label: 'Pull distance', value: '0.35 m' },
  { label: 'Grasp height', value: '0.90 m (top edge of the chair back)' },
  { label: 'Arm control', value: 'Damped least-squares IK, 7 joints per arm' },
  { label: 'Leg control', value: 'Learned walking policy (wbc_yaw.pt)' },
  { label: 'Video', value: '640 × 480 · ~34 s' },
] as const

export default function InteractionDemoPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="max-w-3xl">
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-400">Working</span>
          <span className="rounded-full bg-sky-500/15 px-3 py-1 text-sky-400">Simulation</span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-zinc-300">Environment interaction</span>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">Interaction Demo</h1>
        <p className="mt-4 text-lg text-zinc-400">
          The GR-3 pulls a chair out from a table so a guest can sit down — a small act of hospitality
          from the RoboCup@Home Receptionist task, and the robot&apos;s first time physically changing
          the world around it.
        </p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="lg:sticky lg:top-24">
            <DemoVideo
              src="/assets/env_iteraction_demo.mp4"
              caption="GR-3 walking to a chair, gripping the chair back with both hands, pulling it out and stepping back for the guest. MuJoCo simulation."
            />
          </div>
        </div>

        <div className="space-y-8 lg:col-span-2">
          <section>
            <h2 className="text-lg font-semibold">What it does</h2>
            <p className="mt-2 text-zinc-400">
              After greeting a guest, the robot walks to their chair, places both hands on top of the
              chair back, and walks backwards to slide the chair out from the table. It then lets go,
              steps back out of the way, and waits until the guest is seated.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Interacting with the environment</h2>
            <p className="mt-2 text-zinc-400">
              Walking only needs the robot to stay upright. Pulling a chair means it has to understand
              where an object is, put its hands in exactly the right place, and move its whole body
              while holding on — all without bumping the table or the guest.
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-zinc-400">
              <li>
                <span className="text-zinc-200">Positioning:</span> it corrects its heading and sideways
                drift every step so it lines up squarely behind the chair.
              </li>
              <li>
                <span className="text-zinc-200">Arms and legs together:</span> the legs keep walking
                under the learned policy while the arms are steered separately to hold the chair.
              </li>
              <li>
                <span className="text-zinc-200">Making room:</span> it backs off after releasing so the
                guest has space to sit.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">How it works</h2>
            <ol className="mt-3 space-y-3 text-zinc-400">
              {[
                'The chair’s position and which way to pull it are known from the room layout.',
                'Inverse kinematics works out the seven arm joint angles that put each hand on the chair back. It tries two starting poses and keeps whichever lands closer.',
                'Arm movements are blended smoothly between poses so the robot doesn’t jerk or knock itself off balance.',
                'While pulling, the chair follows the hands’ backward movement — it only ever moves outward, and stops at 0.35 m.',
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
            <h2 className="text-lg font-semibold">Safety checks</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-zinc-400">
              <li>If the robot&apos;s body drops below 0.6 m (a sign it is falling), it lets go immediately.</li>
              <li>If the pull takes longer than 12 s, it releases and moves on.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Limitations</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-zinc-400">
              <li>
                The chair is moved kinematically — it follows the hands rather than being dragged by
                simulated grip and friction, so chair weight isn&apos;t modelled.
              </li>
              <li>The hands are simple blocks resting on the chair back; there are no fingers.</li>
              <li>Chair positions come from the scene file rather than being detected by the camera.</li>
              <li>Simulation only — not yet run on the physical robot.</li>
            </ul>
          </section>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-bold">Step by step</h2>
        <p className="mt-2 text-zinc-400">Each phase hands over to the next once its goal is reached.</p>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SEQUENCE.map(({ phase, timing, detail }, i) => (
            <li key={phase} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <span className="text-xs font-semibold text-brand">0{i + 1}</span>
              <p className="mt-1 font-semibold">{phase}</p>
              <p className="mt-1 font-mono text-xs text-zinc-300">{timing}</p>
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
          Implemented in <code className="font-mono text-zinc-300">gr3_aurora_sim/core/chair_puller.py</code>.
        </p>
      </section>
    </main>
  )
}
