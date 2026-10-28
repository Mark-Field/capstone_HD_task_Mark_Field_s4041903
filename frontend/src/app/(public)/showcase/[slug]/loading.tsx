export default function DemoLoading() {
  return (
    <main className="mx-auto max-w-6xl animate-pulse px-4 py-12 sm:px-6 sm:py-16" aria-busy="true" aria-label="Loading demo">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-6 w-20 rounded-full bg-white/10" />
        ))}
      </div>
      <div className="mt-4 h-12 w-1/2 rounded bg-white/10" />
      <div className="mt-4 h-5 w-2/3 rounded bg-white/10" />
      <div className="mt-10 grid gap-10 lg:grid-cols-5">
        <div className="aspect-[4/3] rounded-2xl bg-white/[0.06] lg:col-span-3" />
        <div className="space-y-4 lg:col-span-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 rounded bg-white/10" />
          ))}
        </div>
      </div>
    </main>
  )
}
