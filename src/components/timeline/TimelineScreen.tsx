import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MoreHorizontal, Trash2, Pin, RefreshCw } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { NavBar } from '../layout/NavBar'
import { GenreTabBar } from './GenreTabBar'
import { UpdateStatusBar } from './UpdateStatusBar'
import { TimelineCard } from './TimelineCard'
import { WarningBanner } from '../ui/WarningBanner'
import { TimelineCardSkeleton } from '../ui/Skeleton'
import { BottomSheet } from '../layout/BottomSheet'
import { useTimeline } from '../../hooks/useTimeline'
import { db } from '../../db'
import { useUIStore } from '../../stores/uiStore'
import type { Genre, TimelineItem } from '../../types'
import { GENRE_LABELS } from '../../types'

export function TimelineScreen() {
  const { tabId } = useParams<{ tabId: string }>()
  const navigate = useNavigate()
  const { addToast } = useUIStore()
  const [activeGenre, setActiveGenre] = useState<Genre>('person')
  const [menuOpen, setMenuOpen] = useState(false)

  const { status, tab, eras, dataWarning, cache, refresh } = useTimeline(tabId!, activeGenre)

  useEffect(() => {
    if (tab) {
      setActiveGenre(tab.defaultGenre)
    }
  }, [tab?.defaultGenre])

  const handleDelete = async () => {
    if (!tabId) return
    setMenuOpen(false)
    const confirmed = window.confirm('このタブを削除しますか？')
    if (!confirmed) return
    await db.tabs.delete(tabId)
    await db.genreCaches.where('tabId').equals(tabId).delete()
    addToast('タブを削除しました', 'success')
    navigate('/')
  }

  const handlePin = async () => {
    if (!tabId || !tab) return
    setMenuOpen(false)
    const pinnedAt = tab.pinnedAt ? null : new Date()
    await db.tabs.update(tabId, { pinnedAt })
    addToast(pinnedAt ? 'ピン留めしました' : 'ピン留めを解除しました', 'success')
  }

  const handleFavorite = async (item: TimelineItem) => {
    await db.favorites.add({
      favoriteId: crypto.randomUUID(),
      tabId: tabId!,
      genre: activeGenre,
      itemType: 'timeline_card',
      title: item.title,
      summary: item.summary,
      savedAt: new Date(),
      tags: [item.tag],
      usedForRecommend: false,
    })
    addToast('お気に入りに追加しました ★', 'success')
  }

  const genres = tab?.activeGenres ?? []

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <NavBar
        title={tab?.keyword ?? ''}
        subtitle={tab ? GENRE_LABELS[tab.defaultGenre] : ''}
        right={
          <button
            onClick={() => setMenuOpen(true)}
            className="text-gray-500 tappable p-1"
          >
            <MoreHorizontal size={20} />
          </button>
        }
      />

      {genres.length > 0 && (
        <GenreTabBar
          genres={genres}
          active={activeGenre}
          onChange={setActiveGenre}
        />
      )}

      <UpdateStatusBar
        status={status}
        cachedAt={cache?.cachedAt}
        onRefresh={refresh}
      />

      <div className="flex-1 px-4 pt-4 pb-28">
        {dataWarning && (
          <WarningBanner warning={dataWarning} onRetry={refresh} />
        )}

        {status === 'loading' && eras.length === 0 && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <TimelineCardSkeleton key={i} />)}
          </div>
        )}

        {eras.map((era) => (
          <div key={era.era} className="mb-6">
            {/* Era label */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`text-xs font-bold tracking-widest ${
                  era.isLatest
                    ? 'text-green-600'
                    : era.isAI
                    ? 'text-yellow-600'
                    : 'text-gray-400'
                }`}
                style={{ fontFamily: era.isLatest || era.isAI ? undefined : '"DM Serif Display", serif' }}
              >
                {era.era}
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Cards */}
            <AnimatePresence>
              {era.items.map((item) => (
                <TimelineCard
                  key={item.itemId}
                  item={item}
                  isAI={era.isAI}
                  onFavorite={handleFavorite}
                />
              ))}
            </AnimatePresence>
          </div>
        ))}

        {status === 'error' && eras.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-gray-500 text-sm">データの取得に失敗しました</p>
            <button
              onClick={refresh}
              className="flex items-center gap-2 px-4 py-2 bg-gold-400 text-white rounded-full text-sm font-medium tappable"
            >
              <RefreshCw size={14} />
              再試行
            </button>
          </div>
        )}
      </div>

      {/* Options Menu */}
      <BottomSheet open={menuOpen} onClose={() => setMenuOpen(false)} title="メニュー">
        <div className="px-4 py-2">
          <button
            onClick={handlePin}
            className="flex items-center gap-3 w-full py-3 text-sm text-gray-700 tappable"
          >
            <Pin size={16} className="text-gray-400" />
            {tab?.pinnedAt ? 'ピン留めを解除' : 'ピン留め'}
          </button>
          <button
            onClick={refresh}
            className="flex items-center gap-3 w-full py-3 text-sm text-gray-700 tappable"
          >
            <RefreshCw size={16} className="text-gray-400" />
            今すぐ更新
          </button>
          <div className="h-px bg-gray-100 my-2" />
          <button
            onClick={handleDelete}
            className="flex items-center gap-3 w-full py-3 text-sm text-red-500 tappable"
          >
            <Trash2 size={16} />
            タブを削除
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}
