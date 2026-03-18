import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

interface NavBarProps {
  title: string
  subtitle?: string
  onBack?: () => void
  right?: React.ReactNode
}

export function NavBar({ title, subtitle, onBack, right }: NavBarProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) onBack()
    else navigate(-1)
  }

  return (
    <div
      className="sticky top-0 z-30 flex items-center h-11 px-4 border-b border-gray-100"
      style={{ background: 'var(--surface-nav)', backdropFilter: 'blur(12px)' }}
    >
      <button
        onClick={handleBack}
        className="flex items-center gap-1 text-gold-500 font-medium text-sm tappable min-w-[60px]"
      >
        <ChevronLeft size={20} strokeWidth={2.5} />
        戻る
      </button>

      <div className="flex-1 text-center">
        <p className="text-[15px] font-semibold text-gray-800 truncate leading-tight">{title}</p>
        {subtitle && (
          <p className="text-[11px] text-gray-400 leading-tight">{subtitle}</p>
        )}
      </div>

      <div className="min-w-[60px] flex justify-end">
        {right}
      </div>
    </div>
  )
}
