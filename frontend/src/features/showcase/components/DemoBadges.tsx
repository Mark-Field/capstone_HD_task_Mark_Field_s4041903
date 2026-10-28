import { cn } from '@/lib/utils'
import type { DemoEnvironment, DemoStatus } from '@/types/firestore'

const STATUS_STYLES: Record<DemoStatus, string> = {
  working: 'bg-emerald-500/15 text-emerald-400',
  partial: 'bg-amber-500/15 text-amber-400',
  planned: 'bg-zinc-500/20 text-zinc-300',
}

const pill = 'rounded-full px-3 py-1 text-xs font-semibold capitalize'

export function DemoBadges({
  status,
  environment,
  capability,
}: {
  status: DemoStatus
  environment: DemoEnvironment
  capability: string
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <span className={cn(pill, STATUS_STYLES[status])}>{status}</span>
      <span className={cn(pill, 'bg-sky-500/15 text-sky-400')}>{environment}</span>
      <span className={cn(pill, 'bg-white/10 normal-case text-zinc-300')}>{capability}</span>
    </div>
  )
}
