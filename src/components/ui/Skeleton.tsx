export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`skeleton rounded-md ${className}`} />
  )
}

export function TimelineCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="w-2 h-2 rounded-full" />
        <Skeleton className="w-16 h-4" />
      </div>
      <Skeleton className="w-3/4 h-5" />
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-5/6 h-4" />
      <div className="flex gap-2 mt-2">
        <Skeleton className="w-20 h-3" />
        <Skeleton className="w-16 h-3" />
      </div>
    </div>
  )
}
