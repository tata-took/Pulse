interface BadgeProps {
  count: number
  max?: number
  className?: string
}

export function Badge({ count, max = 99, className = '' }: BadgeProps) {
  if (count <= 0) return null
  const label = count > max ? `${max}+` : String(count)
  return (
    <span
      className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none ${className}`}
    >
      {label}
    </span>
  )
}
