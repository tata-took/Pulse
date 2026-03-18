import type { Genre } from '../../types'
import { GENRE_LABELS } from '../../types'

interface GenrePillProps {
  genre: Genre
  active?: boolean
  onClick?: () => void
}

export function GenrePill({ genre, active = false, onClick }: GenrePillProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
        active
          ? 'bg-gold-400 text-white shadow-sm'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {GENRE_LABELS[genre]}
    </button>
  )
}
