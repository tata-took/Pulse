import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Share2, Copy, AlertCircle, ExternalLink } from 'lucide-react'
import type { TimelineItem } from '../../types'
import { Tag } from '../ui/Tag'

const nodeColors: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
  gold: 'bg-yellow-500',
}

const newBorder: Record<string, string> = {
  new: 'border-l-4 border-green-500 bg-green-50',
  ai: 'border-l-4 border-yellow-400 bg-yellow-50',
  normal: 'border border-gray-100 bg-white',
  uncertain: 'border border-gray-100 bg-white',
}

interface TimelineCardProps {
  item: TimelineItem
  isAI?: boolean
  onFavorite?: (item: TimelineItem) => void
}

export function TimelineCard({ item, isAI, onFavorite }: TimelineCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [pressTimer, setPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const cardStyle = isAI
    ? newBorder.ai
    : item.isNew
    ? newBorder.new
    : newBorder.normal

  const handlePointerDown = () => {
    const t = setTimeout(() => setMenuOpen(true), 500)
    setPressTimer(t)
  }

  const handlePointerUp = () => {
    if (pressTimer) clearTimeout(pressTimer)
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: item.title, text: item.summary }).catch(() => {})
    } else {
      await navigator.clipboard.writeText(`${item.title}\n${item.summary}`)
    }
    setMenuOpen(false)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${item.title}\n${item.summary}`)
    setMenuOpen(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`relative rounded-xl p-4 shadow-sm mb-3 tappable ${cardStyle}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${nodeColors[item.color]}`} />
        <Tag label={item.tag} color={item.color} />
        {item.uncertain && (
          <AlertCircle size={12} className="text-gray-400" aria-label="不確かな情報" />
        )}
        {item.isFavorited && (
          <Star size={12} className="text-yellow-500 fill-yellow-500" />
        )}
        <span className="ml-auto text-[11px] text-gray-400">{item.date}</span>
      </div>

      {/* Title */}
      <h3 className="text-[15px] font-semibold text-gray-800 leading-snug mb-1">
        {item.title}
        {item.uncertain && <span className="ml-1 text-gray-400 text-xs">*</span>}
      </h3>

      {/* Summary */}
      <p className="text-[13px] text-gray-600 leading-relaxed">{item.summary}</p>

      {/* Footer */}
      <div className="flex items-center gap-3 mt-2">
        <span className="text-[11px] text-gray-400">{item.source}</span>
        {item.isNew && (
          <span className="text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
            NEW
          </span>
        )}
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute right-3 top-3 bg-white rounded-xl shadow-lg border border-gray-100 z-10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {[
              { icon: Star, label: 'お気に入り', action: () => { onFavorite?.(item); setMenuOpen(false) } },
              { icon: Share2, label: 'シェア', action: handleShare },
              { icon: Copy, label: 'コピー', action: handleCopy },
              { icon: ExternalLink, label: '閉じる', action: () => setMenuOpen(false) },
            ].map(({ icon: Icon, label, action }) => (
              <button
                key={label}
                onClick={action}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full text-left whitespace-nowrap"
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {menuOpen && (
        <div className="fixed inset-0 z-[5]" onClick={() => setMenuOpen(false)} />
      )}
    </motion.div>
  )
}
