import { BusFront } from 'lucide-react'

const Loader = ({ label = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12" role="status" aria-live="polite">
      {/* Bus animation on road */}
      <div className="relative">
        <div className="animate-float">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--role-soft)] text-[var(--role-primary)]">
            <BusFront size={28} />
          </div>
        </div>
        {/* Road line */}
        <div
          className="mt-2 h-1 w-20 rounded-full"
          style={{
            background: 'repeating-linear-gradient(90deg, #cbd5e1 0, #cbd5e1 6px, transparent 6px, transparent 12px)',
            animation: 'road-move 0.6s linear infinite',
          }}
        />
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  )
}

export const BusCardSkeleton = () => (
  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm overflow-hidden">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 rounded-xl animate-shimmer" />
        <div>
          <div className="mb-2 h-4 w-32 rounded-md animate-shimmer" />
          <div className="h-3 w-20 rounded-md animate-shimmer" />
        </div>
      </div>
      <div className="h-6 w-16 rounded-lg animate-shimmer" />
    </div>
    <div className="mb-3 flex gap-2">
      <div className="h-5 w-20 rounded-full animate-shimmer" />
      <div className="h-5 w-14 rounded-full animate-shimmer" />
    </div>
    <div className="mb-3 h-16 rounded-xl animate-shimmer" />
    <div className="mb-3 grid grid-cols-3 gap-2">
      <div className="h-4 rounded animate-shimmer" />
      <div className="h-4 rounded animate-shimmer" />
      <div className="h-4 rounded animate-shimmer" />
    </div>
    <div className="h-10 w-full rounded-xl animate-shimmer" />
  </article>
)

export const DashboardSkeleton = () => (
  <div className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 h-3 w-20 rounded animate-shimmer" />
          <div className="h-7 w-16 rounded animate-shimmer" />
        </div>
      ))}
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      <div className="h-64 rounded-2xl border border-slate-200 bg-white animate-shimmer" />
      <div className="h-64 rounded-2xl border border-slate-200 bg-white animate-shimmer" />
    </div>
  </div>
)

export default Loader
