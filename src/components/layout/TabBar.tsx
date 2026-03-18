import { Link, useLocation } from 'react-router-dom'
import { Library, Search, Settings } from 'lucide-react'

const tabs = [
  { to: '/', icon: Library, label: 'ライブラリ' },
  { to: '/search', icon: Search, label: '検索' },
  { to: '/settings', icon: Settings, label: '設定' },
]

export function TabBar() {
  const location = useLocation()

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] border-t border-gray-100 z-40"
      style={{ background: 'var(--surface-nav)', backdropFilter: 'blur(12px)' }}
    >
      <div className="flex items-center pb-safe">
        {tabs.map(({ to, icon: Icon, label }) => {
          const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
          return (
            <Link
              key={to}
              to={to}
              className="flex-1 flex flex-col items-center py-2 gap-0.5 tappable"
            >
              <Icon
                size={22}
                className={isActive ? 'text-gold-400' : 'text-gray-400'}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span
                className={`text-[10px] font-semibold tracking-wide ${
                  isActive ? 'text-gold-500' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
