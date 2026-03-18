import { RefreshCw } from 'lucide-react'
import type { FetchStatus } from '../../types'

interface UpdateStatusBarProps {
  status: FetchStatus
  cachedAt?: Date | null
  onRefresh?: () => void
}

export function UpdateStatusBar({ status, cachedAt, onRefresh }: UpdateStatusBarProps) {
  const formatTime = (d: Date) => {
    const diff = Date.now() - d.getTime()
    if (diff < 60_000) return 'たった今'
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}分前`
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}時間前`
    return d.toLocaleDateString('ja-JP')
  }

  return (
    <div className="flex items-center justify-between px-4 py-1.5 bg-gray-50 border-b border-gray-100 text-[11px]">
      <span className="text-gray-500">
        {status === 'loading' && '更新中...'}
        {status === 'partial' && 'キャッシュを表示しています'}
        {status === 'success' && cachedAt && `更新: ${formatTime(cachedAt)}`}
        {status === 'error' && '取得に失敗しました'}
        {status === 'idle' && ''}
      </span>
      {onRefresh && status !== 'loading' && (
        <button
          onClick={onRefresh}
          className="flex items-center gap-1 text-gold-600 font-medium tappable"
        >
          <RefreshCw size={11} />
          更新
        </button>
      )}
    </div>
  )
}
