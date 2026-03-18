import { useState } from 'react'
import { Eye, EyeOff, ChevronRight, Key, Database, RefreshCw, Info } from 'lucide-react'
import { useSettingsStore } from '../../stores/settingsStore'
import { db } from '../../db'
import { useUIStore } from '../../stores/uiStore'

export function SettingsScreen() {
  const { settings, updateSettings } = useSettingsStore()
  const { addToast } = useUIStore()
  const [showClaudeKey, setShowClaudeKey] = useState(false)
  const [showNewsKey, setShowNewsKey] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const handleClearCache = async () => {
    const ok = window.confirm('キャッシュデータを削除しますか？タブの情報は保持されます。')
    if (!ok) return
    await db.genreCaches.clear()
    await db.newsArticles.clear()
    addToast('キャッシュを削除しました', 'success')
  }

  const handleClearAll = async () => {
    const ok = window.confirm('すべてのデータを削除しますか？この操作は取り消せません。')
    if (!ok) return
    await db.tabs.clear()
    await db.groups.clear()
    await db.genreCaches.clear()
    await db.newsArticles.clear()
    await db.favorites.clear()
    await db.searchHistory.clear()
    await db.updateLogs.clear()
    updateSettings({ claudeApiKey: '', newsApiKey: '' })
    addToast('すべてのデータを削除しました', 'success')
    window.location.href = '/'
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="px-6 pt-8 pb-4 bg-white border-b border-gray-100">
        <h1 className="text-[28px] font-serif text-gold-400">設定</h1>
      </div>

      <div className="flex-1 px-4 pt-4 pb-28 space-y-2">
        {/* API Key Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => setActiveSection(activeSection === 'api' ? null : 'api')}
            className="w-full flex items-center gap-3 px-4 py-4 tappable"
          >
            <Key size={20} className="text-gold-500 shrink-0" />
            <div className="flex-1 text-left">
              <p className="text-[15px] font-medium text-gray-800">APIキー設定</p>
              <p className="text-[12px] text-gray-400">Claude & NewsAPI</p>
            </div>
            <ChevronRight
              size={16}
              className={`text-gray-300 transition-transform ${activeSection === 'api' ? 'rotate-90' : ''}`}
            />
          </button>

          {activeSection === 'api' && (
            <div className="px-4 pb-4 border-t border-gray-100 space-y-4 pt-4">
              {/* Claude API Key */}
              <div>
                <label className="text-[13px] font-medium text-gray-500 mb-1.5 block">
                  Anthropic (Claude) API Key
                </label>
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-gold-400">
                  <input
                    type={showClaudeKey ? 'text' : 'password'}
                    value={settings.claudeApiKey}
                    onChange={(e) => updateSettings({ claudeApiKey: e.target.value })}
                    placeholder="sk-ant-..."
                    className="flex-1 text-sm outline-none bg-transparent"
                  />
                  <button onClick={() => setShowClaudeKey(!showClaudeKey)} className="text-gray-400">
                    {showClaudeKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  console.anthropic.com で取得できます
                </p>
              </div>

              {/* NewsAPI Key */}
              <div>
                <label className="text-[13px] font-medium text-gray-500 mb-1.5 block">
                  NewsAPI Key
                  <span className="ml-1 text-gray-400 font-normal">（任意）</span>
                </label>
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-gold-400">
                  <input
                    type={showNewsKey ? 'text' : 'password'}
                    value={settings.newsApiKey}
                    onChange={(e) => updateSettings({ newsApiKey: e.target.value })}
                    placeholder="newsapi.org から取得"
                    className="flex-1 text-sm outline-none bg-transparent"
                  />
                  <button onClick={() => setShowNewsKey(!showNewsKey)} className="text-gray-400">
                    {showNewsKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  newsapi.org で無料登録・取得できます
                </p>
              </div>

              <div className="bg-amber-50 rounded-lg p-3 text-[12px] text-amber-700 border border-amber-200">
                ⚠️ APIキーはお使いのデバイスにのみ保存されます。第三者には送信されません。
              </div>
            </div>
          )}
        </div>

        {/* Auto Update */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <button
            onClick={() => setActiveSection(activeSection === 'update' ? null : 'update')}
            className="w-full flex items-center gap-3 px-4 py-4 tappable"
          >
            <RefreshCw size={20} className="text-blue-500 shrink-0" />
            <div className="flex-1 text-left">
              <p className="text-[15px] font-medium text-gray-800">自動更新</p>
              <p className="text-[12px] text-gray-400">{settings.autoUpdate ? 'オン' : 'オフ'}</p>
            </div>
            <ChevronRight
              size={16}
              className={`text-gray-300 transition-transform ${activeSection === 'update' ? 'rotate-90' : ''}`}
            />
          </button>

          {activeSection === 'update' && (
            <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[14px] text-gray-700">自動更新</span>
                <button
                  onClick={() => updateSettings({ autoUpdate: !settings.autoUpdate })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    settings.autoUpdate ? 'bg-gold-400' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      settings.autoUpdate ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="text-[13px] font-medium text-gray-500 mb-2 block">更新タイミング</label>
                {(['daily', 'cache_expire', 'manual'] as const).map((mode) => {
                  const labels = { daily: '毎日', cache_expire: 'キャッシュ期限切れ時', manual: '手動のみ' }
                  return (
                    <button
                      key={mode}
                      onClick={() => updateSettings({ updateMode: mode })}
                      className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg mb-1 text-sm tappable ${
                        settings.updateMode === mode ? 'bg-gold-50 text-gold-700' : 'text-gray-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        settings.updateMode === mode ? 'border-gold-400' : 'border-gray-300'
                      }`}>
                        {settings.updateMode === mode && <div className="w-2 h-2 rounded-full bg-gold-400" />}
                      </div>
                      {labels[mode]}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <button
            onClick={() => setActiveSection(activeSection === 'data' ? null : 'data')}
            className="w-full flex items-center gap-3 px-4 py-4 tappable"
          >
            <Database size={20} className="text-red-400 shrink-0" />
            <div className="flex-1 text-left">
              <p className="text-[15px] font-medium text-gray-800">データ管理</p>
              <p className="text-[12px] text-gray-400">キャッシュ・削除</p>
            </div>
            <ChevronRight
              size={16}
              className={`text-gray-300 transition-transform ${activeSection === 'data' ? 'rotate-90' : ''}`}
            />
          </button>

          {activeSection === 'data' && (
            <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-3">
              <button
                onClick={handleClearCache}
                className="w-full py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 font-medium tappable"
              >
                古いキャッシュを削除
              </button>
              <button
                onClick={handleClearAll}
                className="w-full py-2.5 border border-red-200 rounded-xl text-sm text-red-500 font-medium tappable"
              >
                全データを削除
              </button>
            </div>
          )}
        </div>

        {/* About */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-4">
          <div className="flex items-center gap-3">
            <Info size={20} className="text-gray-400 shrink-0" />
            <div>
              <p className="text-[15px] font-medium text-gray-800">アプリについて</p>
              <p className="text-[12px] text-gray-400">Pulse v1.0 — あなたの情報参謀</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
