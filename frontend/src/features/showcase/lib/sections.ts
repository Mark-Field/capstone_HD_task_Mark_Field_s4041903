import type { DemoSection } from '@/types/firestore'

/**
 * Parses the admin form's plain-text format into sections:
 *   `## Heading` starts a section, `- item` is a bullet, `1. item` is a step,
 *   any other non-empty line is a paragraph.
 */
export function parseSections(text: string): DemoSection[] {
  const sections: DemoSection[] = []
  let current: DemoSection | undefined

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) continue

    if (line.startsWith('## ')) {
      current = { heading: line.slice(3).trim() }
      sections.push(current)
      continue
    }
    if (!current) {
      current = { heading: 'Overview' }
      sections.push(current)
    }

    const bullet = /^[-*]\s+(.*)$/.exec(line)
    const step = /^\d+[.)]\s+(.*)$/.exec(line)
    if (bullet) (current.bullets ??= []).push(bullet[1]!)
    else if (step) (current.steps ??= []).push(step[1]!)
    else (current.paragraphs ??= []).push(line)
  }
  return sections
}

export function serializeSections(sections: DemoSection[]): string {
  return sections
    .map((s) =>
      [
        `## ${s.heading}`,
        ...(s.paragraphs ?? []),
        ...(s.bullets ?? []).map((b) => `- ${b}`),
        ...(s.steps ?? []).map((step, i) => `${i + 1}. ${step}`),
      ].join('\n'),
    )
    .join('\n\n')
}
