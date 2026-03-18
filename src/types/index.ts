// ── ジャンル ──────────────────────────────────────
export type Genre = 'person' | 'company' | 'tech' | 'skill' | 'social' | 'news'

export const GENRE_LABELS: Record<Genre, string> = {
  person: '👤 人物',
  company: '🏢 企業',
  tech: '💻 テクノロジー',
  skill: '📚 スキルアップ',
  social: '🌐 社会・事件',
  news: '📰 ニュース',
}

export const GENRE_SORT_ORDER: Record<Genre, 'asc' | 'desc'> = {
  person: 'asc',
  company: 'asc',
  tech: 'desc',
  skill: 'desc',
  social: 'desc',
  news: 'desc',
}

export const GENRE_CACHE_TTL: Record<Genre, number> = {
  person: 7 * 24 * 60 * 60 * 1000,
  company: 7 * 24 * 60 * 60 * 1000,
  tech: 3 * 24 * 60 * 60 * 1000,
  skill: 7 * 24 * 60 * 60 * 1000,
  social: 1 * 24 * 60 * 60 * 1000,
  news: 6 * 60 * 60 * 1000,
}

// ── タイムラインアイテム ──────────────────────────
export type NodeColor = 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'gold'

export interface TimelineItem {
  itemId: string
  color: NodeColor
  tag: string
  title: string
  summary: string
  source: string
  date: string
  uncertain: boolean
  isNew: boolean
  isRead: boolean
  isFavorited: boolean
  importance: number
}

export interface TimelineEra {
  era: string
  isLatest: boolean
  isAI: boolean
  items: TimelineItem[]
}

// ── ニュース記事 ──────────────────────────────────
export interface NewsArticle {
  articleId: string
  tabId: string
  title: string
  summary: string
  source: string
  url: string
  publishedAt: Date
  cachedAt: Date
  isRead: boolean
  isNew: boolean
  isFavorited: boolean
}

// ── ジャンルキャッシュ ────────────────────────────
export type DataWarning = 'no_realtime' | 'no_wikipedia' | 'no_news' | null

export interface GenreCache {
  cacheId: string
  tabId: string
  genre: Genre
  timelineData: TimelineEra[]
  insightsData: TimelineEra[]
  sortOrder: 'asc' | 'desc'
  cachedAt: Date
  expiresAt: Date
  dataWarning: DataWarning
  unreadCount: number
}

// ── タブ ─────────────────────────────────────────
export interface Tab {
  tabId: string
  keyword: string
  activeGenres: Genre[]
  defaultGenre: Genre
  groupId: string
  sortOrder: number
  pinnedAt: Date | null
  createdAt: Date
  lastUpdatedAt: Date
  lastViewedAt: Date | null
  unreadCount: number
  isArchived: boolean
}

// ── グループ ──────────────────────────────────────
export interface Group {
  groupId: string
  name: string
  emoji: string
  colorHex: string
  sortOrder: number
  createdAt: Date
  isDefault: boolean
  hasUnread: boolean
}

// ── お気に入り ────────────────────────────────────
export interface Favorite {
  favoriteId: string
  tabId: string
  genre: Genre
  itemType: 'timeline_card' | 'news_article'
  title: string
  summary: string
  savedAt: Date
  tags: string[]
  usedForRecommend: boolean
}

// ── レコメンド ────────────────────────────────────
export interface Recommendation {
  recId: string
  type: Genre
  keyword: string
  reason: string
  emoji: string
  confidence: 'high' | 'medium'
  generatedAt: Date
}

// ── 検索履歴 ──────────────────────────────────────
export interface SearchHistory {
  historyId: string
  keyword: string
  genre: Genre
  searchedAt: Date
}

// ── 更新ログ ──────────────────────────────────────
export interface UpdateLog {
  logId: string
  executedAt: Date
  trigger: 'periodic_sync' | 'manual' | 'foreground' | 'app_launch'
  tabsProcessed: number
  tabsSkipped: number
  newArticlesCount: number
  duration: number
  status: 'success' | 'partial' | 'failed'
}

// ── 設定 ─────────────────────────────────────────
export interface AppSettings {
  autoUpdate: boolean
  updateMode: 'daily' | 'cache_expire' | 'manual'
  preferredHour: number
  wifiOnly: boolean
  skipLowBattery: boolean
  pushEnabled: boolean
  inAppBannerEnabled: boolean
  notifyThreshold: 1 | 5 | 'breaking'
  quietStart: number
  quietEnd: number
  quietEnabled: boolean
  claudeApiKey: string
  newsApiKey: string
}

// ── 上限値 ────────────────────────────────────────
export const LIMITS = {
  GROUPS: 10,
  TABS_TOTAL: 20,
  TABS_PER_GROUP: 10,
  COMPARE_COLUMNS: 6,
  FAVORITES: 100,
  SEARCH_HISTORY: 10,
  UPDATE_LOGS: 30,
  NEWS_ARTICLES: 20,
  STORAGE_WARN_MB: 45,
  STORAGE_MAX_MB: 50,
  ARCHIVE_DAYS: 90,
}

// ── デフォルトジャンルマッピング ──────────────────
export const DEFAULT_GENRES_BY_GENRE: Record<string, Genre[]> = {
  person: ['person', 'news'],
  company: ['company', 'news'],
  tech: ['tech', 'news'],
  skill: ['skill', 'news'],
  social: ['social', 'news'],
}

// ── AI出力型 ──────────────────────────────────────
export interface AITimelineOutput {
  keyword: string
  genre: Genre
  timeline: TimelineEra[]
  dataWarning: DataWarning
}

export interface AINewsOutput {
  news: {
    title: string
    summary: string
    source: string
    date: string
    url: string
  }[]
}

export interface AIInsightOutput {
  insights: {
    tag: string
    title: string
    body: string
    color: NodeColor
  }[]
}

export interface AIGenreDetection {
  genre: Genre
  confidence: 'high' | 'low'
  emoji: string
}

export type FetchStatus = 'idle' | 'loading' | 'success' | 'partial' | 'error'
