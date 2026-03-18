import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { GroupCard } from './GroupCard'
import { BottomSheet } from '../layout/BottomSheet'
import { db } from '../../db'
import { useUIStore } from '../../stores/uiStore'
import type { Group, Genre } from '../../types'
import { GENRE_LABELS, LIMITS } from '../../types'

const GROUP_COLORS = [
  '#D4A843', '#22C55E', '#3B82F6', '#EF4444', '#8B5CF6',
  '#F97316', '#06B6D4', '#EC4899', '#6B7280', '#84CC16',
]
const GROUP_EMOJIS = ['📁', '🌟', '💼', '🔥', '🎯', '📚', '💡', '🚀', '🎨', '🌿']

export function LibraryScreen() {
  const navigate = useNavigate()
  const { addToast } = useUIStore()
  const [groups, setGroups] = useState<Group[]>([])
  const [filterGenre, setFilterGenre] = useState<Genre | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('📁')
  const [newColor, setNewColor] = useState(GROUP_COLORS[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  const loadGroups = async () => {
    const all = await db.groups.orderBy('sortOrder').toArray()
    setGroups(all)
    setLoading(false)
  }

  useEffect(() => {
    // Initialize default group if none exist
    db.groups.count().then(async (count) => {
      if (count === 0) {
        await db.groups.add({
          groupId: crypto.randomUUID(),
          name: '未分類',
          emoji: '📁',
          colorHex: '#9898B0',
          sortOrder: 0,
          createdAt: new Date(),
          isDefault: true,
          hasUnread: false,
        })
      }
      loadGroups()
    })
  }, [])

  const handleCreateGroup = async () => {
    if (!newName.trim()) return
    if (groups.length >= LIMITS.GROUPS) {
      addToast('グループは最大10件まで作成できます', 'error')
      return
    }

    const exists = groups.some((g) => g.name === newName.trim())
    if (exists) {
      addToast('同じ名前のグループが既にあります', 'error')
      return
    }

    await db.groups.add({
      groupId: crypto.randomUUID(),
      name: newName.trim(),
      emoji: newEmoji,
      colorHex: newColor,
      sortOrder: Date.now(),
      createdAt: new Date(),
      isDefault: false,
      hasUnread: false,
    })

    setNewName('')
    setNewEmoji('📁')
    setNewColor(GROUP_COLORS[0])
    setCreateOpen(false)
    addToast('グループを作成しました', 'success')
    await loadGroups()
  }

  const filteredGroups = groups.filter((g) => {
    if (!searchQuery) return true
    return g.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const genres: Genre[] = ['person', 'company', 'tech', 'skill', 'social', 'news']

  const isEmpty = groups.length === 0

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[28px] font-serif text-gold-400">Pulse</h1>
          <button
            onClick={() => setCreateOpen(true)}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center tappable"
          >
            <Plus size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 h-10">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="グループを検索..."
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}>
              <X size={13} className="text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Genre filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide px-6 py-3 bg-white border-b border-gray-100">
        <button
          onClick={() => setFilterGenre(null)}
          className={`flex-shrink-0 px-3 py-1 rounded-full text-[12px] font-medium whitespace-nowrap tappable ${
            !filterGenre ? 'bg-gold-400 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          すべて
        </button>
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => setFilterGenre(filterGenre === genre ? null : genre)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-[12px] font-medium whitespace-nowrap tappable ${
              filterGenre === genre ? 'bg-gold-400 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {GENRE_LABELS[genre]}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-4 pb-28">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 skeleton rounded-xl" />
            ))}
          </div>
        ) : isEmpty ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <span className="text-5xl">🔍</span>
            <p className="text-[15px] text-gray-500 text-center">
              気になる人物・企業・テーマを<br />検索してみましょう
            </p>
            <button
              onClick={() => navigate('/search')}
              className="px-6 py-3 bg-gold-400 text-white rounded-full text-sm font-semibold tappable shadow-sm"
            >
              はじめての検索をする
            </button>
          </div>
        ) : (
          <AnimatePresence>
            {filteredGroups.map((group) => (
              <motion.div
                key={group.groupId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <GroupCard group={group} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Create Group Sheet */}
      <BottomSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="グループを作成"
      >
        <div className="px-5 py-4 space-y-4">
          {/* Name */}
          <div>
            <label className="text-[13px] font-medium text-gray-500 mb-1.5 block">グループ名</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value.slice(0, 20))}
              placeholder="例：テクノロジー"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-gold-400"
            />
          </div>

          {/* Emoji */}
          <div>
            <label className="text-[13px] font-medium text-gray-500 mb-1.5 block">アイコン</label>
            <div className="flex flex-wrap gap-2">
              {GROUP_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setNewEmoji(emoji)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center tappable ${
                    newEmoji === emoji ? 'ring-2 ring-gold-400 bg-gold-50' : 'bg-gray-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-[13px] font-medium text-gray-500 mb-1.5 block">カラー</label>
            <div className="flex flex-wrap gap-2">
              {GROUP_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewColor(color)}
                  className={`w-8 h-8 rounded-full tappable ${
                    newColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                  }`}
                  style={{ background: color }}
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleCreateGroup}
            disabled={!newName.trim()}
            className="w-full py-3 bg-gold-400 text-white rounded-xl text-[15px] font-semibold tappable disabled:opacity-50 mt-2"
          >
            作成する
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}
