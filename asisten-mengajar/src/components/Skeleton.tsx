export function Skeleton() {
  return (
    <div className="space-y-4 p-6" aria-busy="true" aria-label="Sedang menghasilkan konten...">
      <div className="space-y-2">
        <div className="h-5 w-2/3 rounded-lg shimmer-bg" />
        <div className="h-4 w-full rounded-lg shimmer-bg" />
        <div className="h-4 w-5/6 rounded-lg shimmer-bg" />
      </div>
      <div className="space-y-2">
        <div className="h-5 w-1/2 rounded-lg shimmer-bg" />
        <div className="h-4 w-full rounded-lg shimmer-bg" />
        <div className="h-4 w-4/5 rounded-lg shimmer-bg" />
        <div className="h-4 w-full rounded-lg shimmer-bg" />
      </div>
      <div className="space-y-2">
        <div className="h-5 w-3/5 rounded-lg shimmer-bg" />
        <div className="h-4 w-full rounded-lg shimmer-bg" />
        <div className="h-4 w-3/4 rounded-lg shimmer-bg" />
      </div>
      <p className="text-sm text-emerald-400/60 text-center pt-2">
        AI sedang menyiapkan hasil untuk Anda…
      </p>
    </div>
  )
}
