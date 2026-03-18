import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search as SearchIcon, X, Clock, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearch, saveSearchAsTab } from '../../hooks/useSearch'
import { SearchResultCard } from './SearchResultCard'
import { TimelineCardSkeleton } from '../ui/Skeleton'
import { BottomSheet } from '../layout/BottomSheet'
import { db } from '../../db'
import { useUIStore } from '../../stores/uiStore'
import type { SearchHistory, Group } from '../../types'

const SUGGESTED_KEYWORDS = [
  'ジェフ・ベゾス',
  'NVIDIA',
  '生成AI',
  'Apple',
  'ChatGPT',
  'スティーブ・ジョブズ',
  '量子コンピュータ',
  'マーク・ザッカーバーグ',
]

export function SearchScreen() {
  const navigate = useNavigate()
  const { addToast } = useUIStore()
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [history, setHistory] = useState<SearchHistory[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [saveSheetOpen, setSaveSheetOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { search, status, result, error } = useSearch()

  useEffect(() => {
    db.searchHistory.orderBy('searchedAt').reverse().limit(10).toArray().then(setHistory)
    db.groups.orderBy('sortOrder').toArray().then(setGroups)
  }, [])

  const handleSearch = async (keyword: string) => {
    if (!keyword.trim()) return
    setQuery(keyword)
    setFocused(false)
    inputRef.current?.blur()
    await search(keyword)
    // Refresh history
    db.searchHistory.orderBy('searchedAt').reverse().limit(10).toArray().then(setHistory)
  }

  const handleDeleteHistory = async (historyId: string) => {
    await db.searchHistory.delete(historyId)
    setHistory((h) => h.filter((i) => i.historyId !== historyId))
  }

  const handleSave = async (groupId: string) => {
    if (!result) return
    try {
      const tabId = await saveSearchAsTab(result, groupId)
      setSaveSheetOpen(false)
      addToast(`「${result.keyword}」を保存しました`, 'success')
      navigate(`/timeline/${tabId}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '保存に失敗しました'
      addToast(msg, 'error')
    }
  }

  const handleViewTimeline = async () => {
    if (!result) return
    // Check if already saved
    const existing = await db.tabs.filter((t) => t.keyword === result.keyword && !t.isArchived).first()
    if (existing) {
      navigate(`/timeline/${existing.tabId}`)
    } else {
      setSaveSheetOpen(true)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 bg-white">
        <h1 className="text-[32px] font-serif text-gold-400 mb-4">検索</h1>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div
            className={`flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-3 h-11 transition-all ${
              focused ? 'ring-2 ring-gold-400' : ''
            }`}
          >
            <SearchIcon size={16} className="text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              placeholder="人物・企業・テーマを入力..."
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
              maxLength={50}
            />
            {query && (
              <button onClick={() => setQuery('')}>
                <X size={15} className="text-gray-400" />
              </button>
            )}
          </div>
          <button
            onClick={() => handleSearch(query)}
            disabled={!query.trim() || status === 'loading'}
            className="px-4 h-11 bg-gold-400 text-white rounded-xl text-sm font-semibold tappable disabled:opacity-50"
          >
            調べる
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-28">
        {/* Search history dropdown */}
        <AnimatePresence>
          {focused && history.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-white rounded-xl shadow-md border border-gray-100 mt-2"
            >
              {history.map((h) => (
                <div
                  key={h.historyId}
                  className="flex items-center gap-2 px-4 py-2.5 tappable"
                  onMouseDown={() => handleSearch(h.keyword)}
                >
                  <Clock size={13} className="text-gray-400 shrink-0" />
                  <span className="flex-1 text-sm text-gray-700">{h.keyword}</span>
                  <button
                    onMouseDown={(e) => { e.stopPropagation(); handleDeleteHistory(h.historyId) }}
                    className="text-gray-300 hover:text-gray-500"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 rounded-xl text-sm text-red-600 border-l-4 border-red-400">
            {error}
          </div>
        )}

        {/* Loading */}
        {status === 'loading' && (
          <div className="mt-4 space-y-3">
            <TimelineCardSkeleton />
            <TimelineCardSkeleton />
          </div>
        )}

        {/* Result */}
        {status === 'success' && result && (
          <SearchResultCard
            result={result}
            onViewTimeline={handleViewTimeline}
            onSave={() => setSaveSheetOpen(true)}
          />
        )}

        {/* Suggested keywords */}
        {status === 'idle' && (
          <div className="mt-6">
            <p className="text-[13px] font-semibold text-gray-400 mb-3">おすすめキーワード</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_KEYWORDS.map((kw) => (
                <button
                  key={kw}
                  onClick={() => handleSearch(kw)}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 shadow-xs tappable"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Save to group sheet */}
      <BottomSheet
        open={saveSheetOpen}
        onClose={() => setSaveSheetOpen(false)}
        title="グループを選択"
      >
        <div className="px-4 py-2">
          {groups.length === 0 && (
            <p className="text-sm text-gray-400 py-4 text-center">グループがありません</p>
          )}
          {groups.map((group) => (
            <button
              key={group.groupId}
              onClick={() => handleSave(group.groupId)}
              className="flex items-center gap-3 w-full py-3 tappable"
            >
              <span className="text-2xl">{group.emoji}</span>
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ background: group.colorHex }}
              />
              <span className="text-[15px] text-gray-800">{group.name}</span>
              <ChevronRight size={16} className="ml-auto text-gray-300" />
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  )
}
