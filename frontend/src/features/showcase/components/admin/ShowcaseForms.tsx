'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createDemo, createMedia, updateDemo, updateMedia } from '../../actions/showcase.actions'
import { mediaSourceToInput } from '../../lib/parseMediaSource'
import { serializeSections } from '../../lib/sections'
import type { DemoFormInput, MediaFormInput } from '../../schemas'
import type { AdminDemoView, FormActionResult, MediaView } from '../../types'

const inputClass =
  'w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900'

function Field({
  label,
  name,
  error,
  hint,
  children,
}: {
  label: string
  name: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-zinc-500">{hint}</p>}
      {error && (
        <p id={`${name}-error`} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

function useFormSubmit(onDone: () => void) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})

  function submit(action: () => Promise<FormActionResult>, successMessage: string) {
    startTransition(async () => {
      const res = await action()
      setErrors(res.fieldErrors ?? {})
      if (res.success) {
        toast.success(successMessage)
        onDone()
        router.refresh()
      } else if (res.error) {
        toast.error(res.error)
      }
    })
  }
  return { pending, errors, submit }
}

const SECTIONS_HINT = '"## Heading" starts a section. "- text" is a bullet, "1. text" a numbered step, other lines are paragraphs.'

export function DemoForm({ initial, onDone }: { initial?: AdminDemoView; onDone: () => void }) {
  const [values, setValues] = useState<Required<DemoFormInput>>({
    slug: initial?.id ?? '',
    title: initial?.title ?? '',
    capability: initial?.capability ?? '',
    summary: initial?.summary ?? '',
    status: initial?.status ?? 'working',
    environment: initial?.environment ?? 'simulation',
    sprint: initial?.sprint ?? 1,
    order: initial?.order ?? 0,
    sectionsText: initial ? serializeSections(initial.sections) : '',
  })
  const { pending, errors, submit } = useFormSubmit(onDone)
  const set = (key: keyof DemoFormInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }))
  const err = (key: string) => errors[key]
  const aria = (key: string) => ({ 'aria-invalid': Boolean(errors[key]), 'aria-describedby': errors[key] ? `${key}-error` : undefined })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit(() => (initial ? updateDemo(initial.id, values) : createDemo(values)), initial ? 'Demo updated' : 'Demo created as a draft')
      }}
      className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm sm:grid-cols-2 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <Field label="Slug (URL)" name="slug" error={err('slug')} hint={initial ? 'Slugs can’t be changed.' : 'e.g. walk-demo'}>
        <input id="slug" className={inputClass} value={values.slug} onChange={set('slug')} disabled={Boolean(initial)} {...aria('slug')} />
      </Field>
      <Field label="Title" name="title" error={err('title')}>
        <input id="title" className={inputClass} value={values.title} onChange={set('title')} {...aria('title')} />
      </Field>
      <Field label="Capability" name="capability" error={err('capability')} hint="e.g. Locomotion">
        <input id="capability" className={inputClass} value={values.capability} onChange={set('capability')} {...aria('capability')} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Sprint" name="sprint" error={err('sprint')}>
          <input id="sprint" type="number" className={inputClass} value={values.sprint} onChange={set('sprint')} {...aria('sprint')} />
        </Field>
        <Field label="Order" name="order" error={err('order')}>
          <input id="order" type="number" className={inputClass} value={values.order} onChange={set('order')} {...aria('order')} />
        </Field>
      </div>
      <Field label="Status" name="status" error={err('status')}>
        <select id="status" className={inputClass} value={values.status} onChange={set('status')}>
          <option value="working">Working</option>
          <option value="partial">Partial</option>
          <option value="planned">Planned</option>
        </select>
      </Field>
      <Field label="Environment" name="environment" error={err('environment')}>
        <select id="environment" className={inputClass} value={values.environment} onChange={set('environment')}>
          <option value="simulation">Simulation</option>
          <option value="physical">Physical</option>
        </select>
      </Field>
      <div className="sm:col-span-2">
        <Field label="Summary" name="summary" error={err('summary')}>
          <textarea id="summary" rows={2} className={inputClass} value={values.summary} onChange={set('summary')} {...aria('summary')} />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Explanation" name="sectionsText" error={err('sectionsText')} hint={SECTIONS_HINT}>
          <textarea
            id="sectionsText"
            rows={12}
            className={`${inputClass} font-mono`}
            value={values.sectionsText}
            onChange={set('sectionsText')}
            {...aria('sectionsText')}
          />
        </Field>
      </div>
      <FormButtons pending={pending} onCancel={onDone} label={initial ? 'Save changes' : 'Create draft'} />
    </form>
  )
}

export function MediaForm({ demoId, initial, onDone }: { demoId: string; initial?: MediaView; onDone: () => void }) {
  const [values, setValues] = useState<Required<MediaFormInput>>({
    type: initial?.type ?? 'video',
    source: initial ? mediaSourceToInput(initial.provider, initial.src) : '',
    caption: initial?.caption ?? '',
    alt: initial?.alt ?? '',
    order: initial?.order ?? 0,
  })
  const { pending, errors, submit } = useFormSubmit(onDone)
  const set = (key: keyof MediaFormInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }))
  const aria = (key: string) => ({ 'aria-invalid': Boolean(errors[key]), 'aria-describedby': errors[key] ? `${key}-error` : undefined })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit(() => (initial ? updateMedia(initial.id, values) : createMedia(demoId, values)), initial ? 'Media updated' : 'Media added as a draft')
      }}
      className="grid gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-2 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <Field label="Type" name="type" error={errors.type}>
        <select id="type" className={inputClass} value={values.type} onChange={set('type')}>
          <option value="video">Video</option>
          <option value="image">Image</option>
        </select>
      </Field>
      <Field label="Order" name="order" error={errors.order}>
        <input id="order" type="number" className={inputClass} value={values.order} onChange={set('order')} {...aria('order')} />
      </Field>
      <div className="sm:col-span-2">
        <Field
          label="Source"
          name="source"
          error={errors.source}
          hint="An /assets/ file (e.g. /assets/walk_demo.mp4) or a YouTube / Vimeo video URL."
        >
          <input id="source" className={inputClass} value={values.source} onChange={set('source')} {...aria('source')} />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Caption" name="caption" error={errors.caption}>
          <input id="caption" className={inputClass} value={values.caption} onChange={set('caption')} {...aria('caption')} />
        </Field>
      </div>
      {values.type === 'image' && (
        <div className="sm:col-span-2">
          <Field label="Alt text" name="alt" error={errors.alt}>
            <input id="alt" className={inputClass} value={values.alt} onChange={set('alt')} {...aria('alt')} />
          </Field>
        </div>
      )}
      <FormButtons pending={pending} onCancel={onDone} label={initial ? 'Save media' : 'Add media'} />
    </form>
  )
}

function FormButtons({ pending, onCancel, label }: { pending: boolean; onCancel: () => void; label: string }) {
  return (
    <div className="flex justify-end gap-2 sm:col-span-2">
      <button type="button" onClick={onCancel} className="rounded-md px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
        Cancel
      </button>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? 'Saving…' : label}
      </button>
    </div>
  )
}
