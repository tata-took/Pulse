import { useState, useCallback } from 'react'
import { useSettingsStore } from '../stores/settingsStore'
import { detectGenre, generateTimeline, generateInsights } from '../services/claude'
import { getWikipediaSummary } from '../services/wikipedia'
import { fetchNews } from '../services/newsapi'
import { db } from '../db'
import type { Genre, AITimelineOutput, DataWarning, FetchStatus } from '../types'
import { GENRE_SORT_ORDER, GENRE_CACHE_TTL, DEFAULT_GENRES_BY_GENRE, LIMITS } from '../types'

export interface SearchResult {
  keyword: string
  genre: Genre
  emoji: string
  summary: string
  timelineOutput: AITimelineOutput | null
}

export function useSearch() {
  const { settings } = useSettingsStore()
  const [status, setStatus] = useState<FetchStatus>('idle')
  const [result, setResult] = useState<SearchResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (keyword: string) => {
    if (!keyword.trim()) return
    if (!settings.claudeApiKey) {
      setError('Claude APIキーが設定されていません。設定画面で入力してください。')
      return
    }

    setStatus('loading')
    setError(null)
    setResult(null)

    try {
      // Save to search history
      await db.searchHistory.add({
        historyId: crypto.randomUUID(),
        keyword: keyword.trim(),
        genre: 'news' as Genre,
        searchedAt: new Date(),
      })

      // Limit history
      const allHistory = await db.searchHistory.orderBy('searchedAt').toArray()
      if (allHistory.length > LIMITS.SEARCH_HISTORY) {
        const toDelete = allHistory.slice(0, allHistory.length - LIMITS.SEARCH_HISTORY)
        await db.searchHistory.bulkDelete(toDelete.map((h) => h.historyId))
      }

      // Detect genre
      const genreResult = await detectGenre(settings.claudeApiKey, keyword)
      const genre = genreResult.genre

      // Update search history with correct genre
      const latestHistory = await db.searchHistory.orderBy('searchedAt').last()
      if (latestHistory) {
        await db.searchHistory.update(latestHistory.historyId, { genre })
      }

      // Fetch Wikipedia
      let wikiText = ''
      let dataWarning: DataWarning = null
      const wikiResult = await getWikipediaSummary(keyword)
      if (wikiResult) {
        wikiText = wikiResult.extract
      } else {
        dataWarning = 'no_wikipedia'
      }

      // Fetch News
      let newsText = ''
      if (settings.newsApiKey) {
        const articles = await fetchNews(settings.newsApiKey, keyword)
        if (articles.length > 0) {
          newsText = articles
            .slice(0, 10)
            .map((a) => `${a.title}: ${a.description || ''}`)
            .join('\n')
        } else {
          if (!dataWarning) dataWarning = 'no_news'
        }
      }

      // If both failed
      if (!wikiText && !newsText) {
        dataWarning = 'no_realtime'
      }

      // Generate timeline
      const timelineOutput = await generateTimeline(
        settings.claudeApiKey,
        keyword,
        genre,
        wikiText,
        newsText,
        dataWarning
      )

      // Generate AI insights (skip for news and skill)
      if (genre !== 'news' && genre !== 'skill') {
        try {
          const insightEra = await generateInsights(
            settings.claudeApiKey,
            keyword,
            genre,
            timelineOutput.timeline
          )
          timelineOutput.timeline.push(insightEra)
        } catch {
          // Insights are optional
        }
      }

      setResult({
        keyword,
        genre,
        emoji: genreResult.emoji,
        summary: wikiResult?.extract?.slice(0, 200) || '情報を取得中...',
        timelineOutput,
      })
      setStatus('success')
    } catch (err) {
      console.error('Search error:', err)
      setError('通信エラー。もう一度お試しください。')
      setStatus('error')
    }
  }, [settings.claudeApiKey, settings.newsApiKey])

  return { search, status, result, error }
}

// Save search result as a tab
export async function saveSearchAsTab(
  result: SearchResult,
  groupId: string
): Promise<string> {
  const tabId = crypto.randomUUID()
  const now = new Date()
  const genre = result.genre
  const activeGenres = DEFAULT_GENRES_BY_GENRE[genre] ?? [genre, 'news']

  // Count existing tabs in group
  const groupTabs = await db.tabs.where('groupId').equals(groupId).count()
  if (groupTabs >= LIMITS.TABS_PER_GROUP) {
    throw new Error('このグループはタブが上限に達しています')
  }

  const allTabs = await db.tabs.count()
  if (allTabs >= LIMITS.TABS_TOTAL) {
    throw new Error('タブが上限（20件）に達しています')
  }

  await db.tabs.add({
    tabId,
    keyword: result.keyword,
    activeGenres: activeGenres as Genre[],
    defaultGenre: genre,
    groupId,
    sortOrder: Date.now(),
    pinnedAt: null,
    createdAt: now,
    lastUpdatedAt: now,
    lastViewedAt: null,
    unreadCount: 0,
    isArchived: false,
  })

  // Cache the timeline data
  if (result.timelineOutput) {
    const ttl = GENRE_CACHE_TTL[genre]
    await db.genreCaches.add({
      cacheId: crypto.randomUUID(),
      tabId,
      genre,
      timelineData: result.timelineOutput.timeline.filter((e) => !e.isAI),
      insightsData: result.timelineOutput.timeline.filter((e) => e.isAI),
      sortOrder: GENRE_SORT_ORDER[genre],
      cachedAt: now,
      expiresAt: new Date(now.getTime() + ttl),
      dataWarning: result.timelineOutput.dataWarning,
      unreadCount: 0,
    })
  }

  return tabId
}
