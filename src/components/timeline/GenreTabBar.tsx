import type { Genre } from '../../types'
import { GENRE_LABELS } from '../../types'

interface GenreTabBarProps {
  genres: Genre[]
  active: Genre
  onChange: (genre: Genre) => void
}

export function GenreTabBar({ genres, active, onChange }: GenreTabBarProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide px-4 py-2 bg-white border-b border-gray-100">
      {genres.map((genre) => {
        const isActive = genre === active
        return (
          <button
            key={genre}
            onClick={() => onChange(genre)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors tappable ${
              isActive
                ? 'bg-gold-400 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {GENRE_LABELS[genre]}
          </button>
        )
      })}
    </div>
  )
}
