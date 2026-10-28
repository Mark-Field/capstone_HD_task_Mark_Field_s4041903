// Seeds the showcase with the team's current demos. Safe to re-run (fixed document IDs).
// Usage (from frontend/): pnpm run seed:showcase   — reads .env.local
import { cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64
if (!key) {
  console.error('FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 is not set. Run `pnpm run env:sync` at the repo root first.')
  process.exit(1)
}

const app = initializeApp({
  credential: cert(JSON.parse(Buffer.from(key, 'base64').toString('utf8'))),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
})
const db = getFirestore(app)

const demos = [
  {
    id: 'walk-demo',
    title: 'Walk Demo',
    capability: 'Locomotion',
    summary:
      'The Fourier GR-3 humanoid walking on flat ground in simulation — the foundation every other @Home behaviour is built on.',
    status: 'working',
    environment: 'simulation',
    sprint: 1,
    order: 1,
    sections: [
      {
        heading: 'What it does',
        paragraphs: [
          'The robot follows a scripted list of velocity commands — stand, walk forward, turn, walk faster, stop — while staying upright. No step is hand-animated: every leg movement comes from a neural network deciding, 50 times a second, where each leg joint should go.',
        ],
      },
      {
        heading: 'How it works',
        steps: [
          'The simulator (MuJoCo) loads the GR-3 model and spawns it in its default standing pose.',
          'Each policy step, the robot’s state — body rotation, gravity direction, joint angles and speeds, the velocity command and its last action — is stacked with the previous 40 steps (1,960 values).',
          'The whole-body control policy (wbc_yaw.pt) turns that history into target angles for the 12 leg joints.',
          'A PD controller converts the targets into motor torques, clipped to the real GR-3’s torque limits, while the arms and waist hold a fixed pose.',
        ],
      },
      {
        heading: 'The test sequence',
        bullets: [
          'Settle — 2.5 s standing still to find balance.',
          'Walk forward — 5 s at 0.3 m/s.',
          'Turn — 3 s at 0.1 m/s while rotating at 0.4 rad/s.',
          'Fast — 4 s at 0.5 m/s.',
          'Stop — 2 s returning to a stable stand.',
        ],
      },
      {
        heading: 'Limitations',
        bullets: [
          'Flat ground only — no stairs, slopes or obstacles in this clip.',
          'Commands are scripted; the robot isn’t perceiving or planning here.',
          'Simulation only — not yet run on the physical robot.',
        ],
      },
    ],
    media: [
      {
        id: 'walk-demo-video',
        type: 'video',
        src: '/assets/walk_demo.mp4',
        caption: 'GR-3 settling, walking forward, turning, speeding up and stopping. Tracking camera, MuJoCo simulation.',
      },
    ],
  },
  {
    id: 'interaction-demo',
    title: 'Interaction Demo',
    capability: 'Environment interaction',
    summary:
      'The GR-3 pulls a chair out from a table so a guest can sit down — the robot’s first time physically changing the world around it.',
    status: 'working',
    environment: 'simulation',
    sprint: 2,
    order: 1,
    sections: [
      {
        heading: 'What it does',
        paragraphs: [
          'As part of the RoboCup@Home Receptionist task, the robot walks to the guest’s chair, places both hands on top of the chair back and walks backwards to slide it 0.35 m out from the table. It then lets go, steps back out of the way, and waits until the guest is seated.',
        ],
      },
      {
        heading: 'Interacting with the environment',
        paragraphs: [
          'Walking only needs the robot to stay upright. Pulling a chair means it has to know where an object is, put its hands in exactly the right place, and move its whole body while holding on — without bumping the table or the guest.',
        ],
        bullets: [
          'Positioning: it corrects its heading and sideways drift every step so it lines up squarely behind the chair.',
          'Arms and legs together: the legs keep walking under the learned policy while the arms are steered separately to hold the chair.',
          'Making room: it backs off a further 0.30 m after releasing so the guest has space to sit.',
        ],
      },
      {
        heading: 'How it works',
        steps: [
          'Approach: walk to 0.30 m behind the chair back, then stand still for 1 s to settle.',
          'Reach: inverse kinematics works out the seven arm joint angles that put each hand 6 cm above the chair back, 12 cm either side of centre.',
          'Grasp: lower the hands onto the top edge (0.90 m high). Arm moves are blended smoothly so the robot stays balanced.',
          'Pull: walk backwards at 0.10 m/s; the chair follows the hands, up to 0.35 m.',
          'Release, retract and back off, then wait for the guest to sit.',
        ],
      },
      {
        heading: 'Safety checks',
        bullets: [
          'If the robot’s body drops below 0.6 m (a sign it is falling), it lets go immediately.',
          'If the pull takes longer than 12 s, it releases and moves on.',
        ],
      },
      {
        heading: 'Limitations',
        bullets: [
          'The chair is moved kinematically — it follows the hands rather than being dragged by simulated grip and friction.',
          'The hands are simple blocks resting on the chair back; there are no fingers.',
          'Chair positions come from the scene file rather than being detected by the camera.',
          'Simulation only — not yet run on the physical robot.',
        ],
      },
    ],
    media: [
      {
        id: 'interaction-demo-video',
        type: 'video',
        src: '/assets/env_iteraction_demo.mp4',
        caption: 'GR-3 gripping a chair back with both hands, pulling it out and stepping back for the guest. MuJoCo simulation.',
      },
    ],
  },
  {
    id: 'pathing-demo',
    title: 'Pathing Demo',
    capability: 'Path planning & obstacle avoidance',
    summary:
      'The GR-3 finds its own way through a furnished room — sensing obstacles with simulated depth cameras, mapping as it goes and planning around anything in its way.',
    status: 'working',
    environment: 'simulation',
    sprint: 2,
    order: 2,
    sections: [
      {
        heading: 'What it does',
        paragraphs: [
          'The robot is given a list of waypoints — a doorway, a table, a guest — and walks to each without hitting walls or furniture. It isn’t given a map: it discovers obstacles with its sensors and plans around them as it moves.',
        ],
      },
      {
        heading: 'Raycasts as depth cameras',
        paragraphs: [
          'The real GR-3 senses distance with depth cameras on its head and torso. Rendering full depth images every step is slow, so the simulation fires 42 individual rays from those two camera positions instead. Each ray reports how far it travelled before hitting something — the same information as one depth-camera pixel.',
          'Rays fan out forward, slightly left and right, and to each side, angled from level down to 69° toward the floor, with a 1.5 m range.',
        ],
        bullets: [
          'Red: a steep ray hit something close — back up and turn away.',
          'Amber: a shallow ray hit something — slow down, keep going.',
          'Grey: the ray hit the floor — ignored.',
          'Green: nothing within 1.5 m — clear.',
        ],
      },
      {
        heading: 'From rays to a route',
        steps: [
          'Build a map: every ray updates a top-down 10 cm grid — cells it passes through become more likely free, the cell it hits more likely blocked.',
          'Plan a path: blocked cells are grown by 0.3 m (the robot’s leg swing), then A* search finds the shortest route and trims zig-zags wherever a straight line is clear.',
          'Re-plan: every 0.2 s the robot checks whether new obstacles block its route, and plans again if they do or after it has had to back away.',
        ],
      },
      {
        heading: 'Obstacle avoidance',
        bullets: [
          'Turn: more than ~26° off course, pivot on the spot first.',
          'Navigate: walk toward the next path point at up to 0.5 m/s, slowing near obstacles.',
          'Back up: a steep ray hit within 0.8 m — step backwards briefly.',
          'Rotate: turn toward the more open side until the front is clear beyond 1.2 m.',
        ],
      },
      {
        heading: 'Limitations',
        bullets: [
          'Rays are perfect measurements — no sensor noise like a real camera.',
          '42 rays see far less than a full depth image; thin objects between rays can be missed.',
          'The map is flat, so overhangs such as table tops are treated like solid walls.',
          'People moving through the room aren’t predicted.',
          'Simulation only — not yet run on the physical robot.',
        ],
      },
    ],
    media: [
      {
        id: 'pathing-demo-video',
        type: 'video',
        src: '/assets/pathing_demo.mp4',
        caption: 'GR-3 navigating between waypoints. The coloured lines are the raycasts standing in for its depth cameras.',
      },
    ],
  },
]

const batch = db.batch()
for (const { id, media, ...demo } of demos) {
  batch.set(db.collection('demos').doc(id), {
    ...demo,
    published: true,
    createdBy: 'seed-script',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    deletedAt: null,
    _schemaVersion: 1,
  })
  media.forEach(({ id: mediaId, ...m }, order) => {
    batch.set(db.collection('media').doc(mediaId), {
      ...m,
      demoId: id,
      provider: 'local',
      alt: null,
      order,
      published: true,
      createdBy: 'seed-script',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      deletedAt: null,
      _schemaVersion: 1,
    })
  })
}
await batch.commit()
console.log(`Seeded ${demos.length} demos.`)
