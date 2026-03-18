import { useNavigate } from 'react-router-dom'
import { Pin, ChevronRight } from 'lucide-react'
import { Badge } from '../ui/Badge'
import type { Tab } from '../../types'
import { GENRE_LABELS } from '../../types'

interface TabRowProps {
  tab: Tab
}

export function TabRow({ tab }: TabRowProps) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(`/timeline/${tab.tabId}`)}
      className="w-full flex items-center gap-3 py-3 px-1 tappable"
    >
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-1.5 mb-0.5">
          {tab.pinnedAt && <Pin size={10} className="text-gold-400 shrink-0" />}
          <span className="text-[15px] font-medium text-gray-800 truncate">{tab.keyword}</span>
        </div>
        <span className="text-[12px] text-gray-400">{GENRE_LABELS[tab.defaultGenre]}</span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {tab.unreadCount > 0 && <Badge count={tab.unreadCount} />}
        <ChevronRight size={16} className="text-gray-300" />
      </div>
    </button>
  )
}
