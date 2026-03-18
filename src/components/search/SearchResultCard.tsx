import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { SearchResult } from '../../hooks/useSearch'
import { GENRE_LABELS } from '../../types'

interface SearchResultCardProps {
  result: SearchResult
  onViewTimeline: () => void
  onSave: () => void
}

export function SearchResultCard({ result, onViewTimeline, onSave }: SearchResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 mt-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{result.emoji}</span>
        <div>
          <h2 className="text-[17px] font-semibold text-gray-800">{result.keyword}</h2>
          <span className="text-[12px] text-gray-400">{GENRE_LABELS[result.genre]}</span>
        </div>
      </div>

      {/* Summary */}
      <p className="text-[14px] text-gray-600 leading-relaxed mb-4">
        {result.summary}
      </p>

      {/* Timeline preview */}
      {result.timelineOutput && (
        <div className="space-y-2 mb-4">
          {result.timelineOutput.timeline
            .flatMap((e) => e.items)
            .slice(0, 3)
            .map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2"
              >
                <span className="text-gray-400 text-xs mt-0.5 shrink-0">{item.date?.slice(0, 4)}</span>
                <span className="font-medium leading-snug">{item.title}</span>
              </div>
            ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onViewTimeline}
          className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-gold-400 text-white rounded-full text-sm font-semibold tappable shadow-sm"
        >
          タイムラインで見る
          <ArrowRight size={15} />
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2.5 border border-gold-400 text-gold-600 rounded-full text-sm font-semibold tappable"
        >
          保存
        </button>
      </div>
    </motion.div>
  )
}
