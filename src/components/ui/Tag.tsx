import type { NodeColor } from '../../types'

const colorMap: Record<NodeColor, string> = {
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  orange: 'bg-orange-100 text-orange-700',
  purple: 'bg-purple-100 text-purple-700',
  gold: 'bg-yellow-100 text-yellow-700',
}

interface TagProps {
  label: string
  color?: NodeColor
  className?: string
}

export function Tag({ label, color = 'blue', className = '' }: TagProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${colorMap[color]} ${className}`}
    >
      {label}
    </span>
  )
}
