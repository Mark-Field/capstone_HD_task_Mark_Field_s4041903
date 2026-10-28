'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { ExternalLink, Plus } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { cn } from '@/lib/utils'
import { setDemoPublished, setMediaPublished, softDeleteDemo, softDeleteMedia } from '../../actions/showcase.actions'
import type { AdminDemoView, FormActionResult } from '../../types'
import { DemoForm, MediaForm, NewPageForm } from './ShowcaseForms'

type Editing =
  | { kind: 'new-demo' }
  | { kind: 'edit-demo'; slug: string }
  | { kind: 'new-media'; demoId: string }
  | { kind: 'edit-media'; id: string }
  | null

function PublishBadge({ published }: { published: boolean }) {
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-xs font-medium',
        published ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
      )}
    >
      {published ? 'Published' : 'Draft'}
    </span>
  )
}

const smallButton = 'rounded-md px-2.5 py-1 text-xs font-medium hover:bg-zinc-100 disabled:opacity-50 dark:hover:bg-zinc-800'

export function ShowcaseAdmin({ demos }: { demos: AdminDemoView[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<Editing>(null)
  const [pending, startTransition] = useTransition()
  const close = () => setEditing(null)

  function run(action: () => Promise<FormActionResult>, success: string) {
    startTransition(async () => {
      const res = await action()
      if (res.success) {
        toast.success(success)
        router.refresh()
      } else {
        toast.error(res.error ?? 'Something went wrong')
      }
    })
  }

  return (
    <div className="space-y-6">
      {editing?.kind === 'new-demo' ? (
        <NewPageForm onDone={close} />
      ) : (
        <button
          type="button"
          onClick={() => setEditing({ kind: 'new-demo' })}
          className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black"
        >
          <Plus className="h-4 w-4" /> New demo page
        </button>
      )}

      {demos.length === 0 && editing?.kind !== 'new-demo' && (
        <EmptyState title="No demos yet" description="Create a demo, add its video, then publish both to show it on the public site." />
      )}

      {demos.map((demo) => (
        <div key={demo.id} className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">{demo.title}</h2>
                <PublishBadge published={demo.published} />
              </div>
              <p className="text-xs text-zinc-500">
                /showcase/{demo.id} · Sprint {demo.sprint} · Order {demo.order} · {demo.status}
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              {demo.published && (
                <Link href={`/showcase/${demo.id}`} target="_blank" className={cn(smallButton, 'inline-flex items-center gap-1')}>
                  View <ExternalLink className="h-3 w-3" />
                </Link>
              )}
              <button type="button" className={smallButton} onClick={() => setEditing({ kind: 'edit-demo', slug: demo.id })}>
                Edit
              </button>
              <button
                type="button"
                className={smallButton}
                disabled={pending}
                onClick={() => run(() => setDemoPublished(demo.id, !demo.published), demo.published ? 'Demo unpublished' : 'Demo published')}
              >
                {demo.published ? 'Unpublish' : 'Publish'}
              </button>
              <button
                type="button"
                className={cn(smallButton, 'text-red-600')}
                disabled={pending}
                onClick={() => {
                  if (confirm(`Delete "${demo.title}"? It will disappear from the public site.`)) run(() => softDeleteDemo(demo.id), 'Demo deleted')
                }}
              >
                Delete
              </button>
            </div>
          </div>

          {editing?.kind === 'edit-demo' && editing.slug === demo.id && (
            <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
              <DemoForm initial={demo} onDone={close} />
            </div>
          )}

          <div className="space-y-2 border-t border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Media</p>
            {demo.media.length === 0 && <p className="text-sm text-zinc-500">No media yet.</p>}
            {demo.media.map((m) => (
              <div key={m.id}>
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-zinc-50 px-3 py-2 dark:bg-zinc-950">
                  <div className="flex min-w-0 items-center gap-2">
                    <PublishBadge published={m.published} />
                    <span className="truncate text-sm">
                      {m.type} · {m.provider === 'local' ? m.src : `${m.provider}:${m.src}`} — {m.caption}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button type="button" className={smallButton} onClick={() => setEditing({ kind: 'edit-media', id: m.id })}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className={smallButton}
                      disabled={pending}
                      onClick={() => run(() => setMediaPublished(m.id, !m.published), m.published ? 'Media unpublished' : 'Media published')}
                    >
                      {m.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      className={cn(smallButton, 'text-red-600')}
                      disabled={pending}
                      onClick={() => {
                        if (confirm('Delete this media item?')) run(() => softDeleteMedia(m.id), 'Media deleted')
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {editing?.kind === 'edit-media' && editing.id === m.id && (
                  <div className="mt-2">
                    <MediaForm demoId={demo.id} initial={m} onDone={close} />
                  </div>
                )}
              </div>
            ))}
            {editing?.kind === 'new-media' && editing.demoId === demo.id ? (
              <MediaForm demoId={demo.id} onDone={close} />
            ) : (
              <button type="button" className={cn(smallButton, 'inline-flex items-center gap-1')} onClick={() => setEditing({ kind: 'new-media', demoId: demo.id })}>
                <Plus className="h-3 w-3" /> Add media
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
