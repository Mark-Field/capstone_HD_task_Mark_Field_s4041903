import type { DemoSection } from '@/types/firestore'

export function DemoSections({ sections }: { sections: DemoSection[] }) {
  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <section key={section.heading}>
          <h2 className="text-lg font-semibold">{section.heading}</h2>
          {section.paragraphs?.map((p) => (
            <p key={p} className="mt-2 text-zinc-400">
              {p}
            </p>
          ))}
          {section.bullets && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-zinc-400">
              {section.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          )}
          {section.steps && (
            <ol className="mt-3 space-y-3 text-zinc-400">
              {section.steps.map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs font-bold text-brand">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      ))}
    </div>
  )
}
