import type { DataWarning } from '../../types'
import { AlertTriangle, Info, Newspaper, RefreshCw } from 'lucide-react'

interface WarningBannerProps {
  warning: DataWarning
  onRetry?: () => void
}

const configs = {
  no_realtime: {
    bg: 'bg-orange-50 border-l-4 border-orange-500',
    icon: AlertTriangle,
    iconColor: 'text-orange-500',
    title: 'リアルタイム情報を取得できませんでした',
    body: '表示内容はAIの学習データに基づきます。最新情報と異なる場合があります。',
  },
  no_wikipedia: {
    bg: 'bg-blue-50 border-l-4 border-blue-500',
    icon: Info,
    iconColor: 'text-blue-500',
    title: '基本情報の取得に失敗しました',
    body: 'ニュース情報のみ表示しています。',
  },
  no_news: {
    bg: 'bg-gray-50 border-l-4 border-gray-400',
    icon: Newspaper,
    iconColor: 'text-gray-500',
    title: '最新ニュースを取得できませんでした',
    body: '基本情報のみ表示しています。',
  },
}

export function WarningBanner({ warning, onRetry }: WarningBannerProps) {
  if (!warning) return null
  const config = configs[warning]
  const Icon = config.icon

  return (
    <div className={`${config.bg} rounded-r-lg p-3 mb-4`}>
      <div className="flex items-start gap-2">
        <Icon size={16} className={`${config.iconColor} mt-0.5 shrink-0`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">{config.title}</p>
          <p className="text-xs text-gray-600 mt-0.5">{config.body}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-gold-600 hover:text-gold-700"
            >
              <RefreshCw size={12} />
              再試行
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
