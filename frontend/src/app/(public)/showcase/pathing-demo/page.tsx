import type { Metadata } from 'next'
import { DemoVideo } from '@/features/showcase/components/DemoVideo'

export const metadata: Metadata = {
  title: 'Pathing Demo',
  description:
    'The Fourier GR-3 humanoid planning paths and avoiding obstacles in simulation using raycasts that stand in for its depth cameras.',
}

const RAY_LEGEND = [
  { colour: 'bg-red-500', label: 'Red', meaning: 'Steep ray hit something close — back up and turn away.' },
  { colour: 'bg-amber-400', label: 'Amber', meaning: 'Shallow ray hit something — slow down, keep going.' },
  { colour: 'bg-zinc-400', label: 'Grey', meaning: 'Ray hit the floor — ignored.' },
  { colour: 'bg-green-500', label: 'Green', meaning: 'Nothing within 1.5 m — clear.' },
] as const

const NAV_STATES = [
  { state: 'Turn', detail: 'More than ~26° off course: pivot on the spot before walking.' },
  { state: 'Navigate', detail: 'Walk toward the next path point, faster when further away (up to 0.5 m/s).' },
  { state: 'Back up', detail: 'A steep ray hit within 0.8 m: step backwards for a moment.' },
  { state: 'Rotate', detail: 'Turn toward whichever side (left or right) has more room until the front is clear beyond 1.2 m.' },
  { state: 'Face', detail: 'On arrival, turn to face the table or person the waypoint points at.' },
] as const

const SPECS = [
  { label: 'Ray origins', value: '2 — head camera and torso camera mounts' },
  { label: 'Directions', value: 'Front, ±11°, and 90° left / right' },
  { label: 'Ray pitches', value: '0° to 69° downward (5 per forward direction)' },
  { label: 'Rays per tick', value: '42' },
  { label: 'Max range', value: '1.5 m' },
  { label: 'Map', value: '12 × 12 m grid, 10 cm cells' },
  { label: 'Planner', value: 'A* (8 directions) with shortcutting' },
  { label: 'Robot clearance', value: '0.3 m around the body' },
  { label: 'Video', value: '640 × 480 · 60 s' },
] as const

export default function PathingDemoPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="max-w-3xl">
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-400">Working</span>
          <span className="rounded-full bg-sky-500/15 px-3 py-1 text-sky-400">Simulation</span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-zinc-300">Path planning</span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-zinc-300">Obstacle avoidance</span>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">Pathing Demo</h1>
        <p className="mt-4 text-lg text-zinc-400">
          The GR-3 finds its own way through a furnished room — sensing obstacles with simulated depth
          cameras, building a map as it goes, and planning a route around anything in its way.
        </p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="lg:sticky lg:top-24">
            <DemoVideo
              src="/assets/pathing_demo.mp4"
              caption="GR-3 navigating between waypoints in MuJoCo. The coloured lines are the raycasts standing in for its depth cameras."
            />
          </div>
        </div>

        <div className="space-y-8 lg:col-span-2">
          <section>
            <h2 className="text-lg font-semibold">What it does</h2>
            <p className="mt-2 text-zinc-400">
              The robot is given a list of waypoints — a doorway, a table, a guest — and has to walk to
              each one without hitting walls or furniture. It isn&apos;t given a map of the room: it
              discovers obstacles with its sensors and plans around them as it moves.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Raycasts as depth cameras</h2>
            <p className="mt-2 text-zinc-400">
              The real GR-3 senses distance with depth cameras on its head and torso. Rendering full depth
              images every step is slow, so the simulation fires individual rays from those two camera
              positions instead. Each ray reports how far it travelled before hitting something — the same
              information a single depth-camera pixel gives.
            </p>
            <p className="mt-3 text-zinc-400">
              Rays fan out forward, slightly left and right, and to each side, angled from level down to
              69° toward the floor so they catch both tall furniture and low objects near the feet.
            </p>
            <ul className="mt-4 space-y-2">
              {RAY_LEGEND.map(({ colour, label, meaning }) => (
                <li key={label} className="flex items-start gap-3 text-sm">
                  <span className={`mt-1.5 h-1 w-6 shrink-0 rounded-full ${colour}`} aria-hidden />
                  <span className="text-zinc-400">
                    <span className="font-medium text-zinc-200">{label}:</span> {meaning}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Why two kinds of ray?</h2>
            <p className="mt-2 text-zinc-400">
              Shallow rays look far ahead, so they warn early but can over-react to a table edge the robot
              could easily pass. They only slow the robot down. Steep rays look at the floor just in front
              of the feet, so a hit there means something is genuinely in the way — only those make the
              robot back up and turn.
            </p>
          </section>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-bold">From rays to a route</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              title: 'Build a map',
              body: 'Every ray updates a top-down grid of the room. Cells a ray passes through become more likely to be free; the cell where it hits becomes more likely to be blocked. Free-space updates are deliberately weak, because a high ray can pass over a low obstacle.',
            },
            {
              title: 'Plan a path',
              body: 'Blocked cells are grown by 0.3 m — the width of the robot’s swinging legs — so any path through the gaps is wide enough to walk. A* search then finds the shortest route, and unnecessary zig-zags are cut out wherever a straight line is clear.',
            },
            {
              title: 'Re-plan when needed',
              body: 'Every 0.2 s the robot checks whether newly seen obstacles block its current path. If they do, or after it has had to back away from something, it plans a fresh route from where it stands.',
            },
          ].map(({ title, body }, i) => (
            <li key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <span className="text-xs font-semibold text-brand">0{i + 1}</span>
              <p className="mt-1 font-semibold">{title}</p>
              <p className="mt-2 text-sm text-zinc-400">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-bold">Obstacle avoidance, step by step</h2>
        <p className="mt-2 text-zinc-400">
          While following the path, the robot is always in one of these states. The planner chooses the
          route; these states keep it safe moment to moment.
        </p>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {NAV_STATES.map(({ state, detail }, i) => (
            <li key={state} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <span className="text-xs font-semibold text-brand">0{i + 1}</span>
              <p className="mt-1 font-semibold">{state}</p>
              <p className="mt-2 text-sm text-zinc-400">{detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold">Under the hood</h2>
          <dl className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2">
            {SPECS.map(({ label, value }) => (
              <div key={label} className="bg-zinc-950 p-5">
                <dt className="text-xs uppercase tracking-wider text-zinc-500">{label}</dt>
                <dd className="mt-1 font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-sm text-zinc-400">
            Implemented in <code className="font-mono text-zinc-300">core/navigator.py</code>,{' '}
            <code className="font-mono text-zinc-300">core/occupancy_map.py</code>,{' '}
            <code className="font-mono text-zinc-300">core/planner.py</code> and{' '}
            <code className="font-mono text-zinc-300">run_task.py</code>.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold">Limitations</h2>
          <ul className="mt-6 list-disc space-y-2 pl-5 text-zinc-400">
            <li>
              Rays are perfect measurements — no sensor noise, reflections or missing depth like a real
              camera produces.
            </li>
            <li>42 rays see far less than a full depth image; thin objects between rays can be missed.</li>
            <li>The map is flat (top-down), so overhangs such as table tops are treated like solid walls.</li>
            <li>Obstacles are assumed to stay still; people moving through the room aren&apos;t predicted.</li>
            <li>Simulation only — not yet run on the physical robot.</li>
          </ul>
        </div>
      </section>
    </main>
  )
}
