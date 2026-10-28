import { z } from 'zod'
import { parseSections } from './lib/sections'

export const slugSchema = z
  .string()
  .trim()
  .min(1, 'Slug is required')
  .max(60, 'Slug must be 60 characters or fewer')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and single hyphens')

export const demoFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100),
  capability: z.string().trim().min(1, 'Capability is required').max(50),
  summary: z.string().trim().min(1, 'Summary is required').max(300),
  status: z.enum(['working', 'partial', 'planned']),
  environment: z.enum(['simulation', 'physical']),
  sprint: z.coerce.number().int().min(1).max(10),
  order: z.coerce.number().int().min(0).max(1000),
  sectionsText: z.string().max(20000).transform(parseSections),
})

export const createDemoSchema = demoFormSchema.extend({ slug: slugSchema })

export const mediaFormSchema = z
  .object({
    type: z.enum(['video', 'image']),
    source: z.string().trim().min(1, 'Source is required').max(500),
    caption: z.string().trim().min(1, 'Caption is required').max(300),
    alt: z.string().trim().max(200).optional().default(''),
    order: z.coerce.number().int().min(0).max(1000),
  })
  .refine((m) => m.type !== 'image' || m.alt.length > 0, {
    message: 'Alt text is required for images',
    path: ['alt'],
  })

export type DemoFormInput = z.input<typeof createDemoSchema>
export type MediaFormInput = z.input<typeof mediaFormSchema>

export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.')
    out[key] ??= issue.message
  }
  return out
}
