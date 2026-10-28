export default function ShowcaseLoading() {
  return (
    <main className="mx-auto max-w-6xl animate-pulse px-4 py-12 sm:px-6 sm:py-16" aria-busy="true" aria-label="Loading demos">
      <div className="h-3 w-24 rounded bg-white/10" />
      <div className="mt-4 h-10 w-2/3 rounded bg-white/10" />
      <div className="mt-4 h-5 w-1/2 rounded bg-white/10" />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-64 rounded-2xl border border-white/10 bg-white/[0.03]" />
        ))}
      </div>
    </main>
  )
}
