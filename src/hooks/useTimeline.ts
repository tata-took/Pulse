import { useState, useEffect, useCallback } from 'react'
import { db } from '../db'
import { useSettingsStore } from '../stores/settingsStore'
import { generateTimeline, generateInsights } from '../services/claude'
import { getWikipediaSummary } from '../services/wikipedia'
import { fetchNews } from '../services/newsapi'
import type { Tab, GenreCache, Genre, TimelineEra, DataWarning, FetchStatus } from '../types'
import { GENRE_SORT_ORDER, GENRE_CACHE_TTL } from '../types'

export function useTimeline(tabId: string, genre: Genre) {
  const { settings } = useSettingsStore()
  const [status, setStatus] = useState<FetchStatus>('idle')
  const [tab, setTab] = useState<Tab | null>(null)
  const [eras, setEras] = useState<TimelineEra[]>([])
  const [dataWarning, setDataWarning] = useState<DataWarning>(null)
  const [cache, setCache] = useState<GenreCache | null>(null)

  const loadFromCache = useCallback(async (t: Tab, g: Genre) => {
    const cached = await db.genreCaches
      .where('[tabId+genre]')
      .equals([t.tabId, g])
      .first()
      .catch(() =>
        db.genreCaches
          .filter((c) => c.tabId === t.tabId && c.genre === g)
          .first()
      )

    return cached ?? null
  }, [])

  const refresh = useCallback(async (forceRefresh = false) => {
    if (!tabId || !genre) return

    setStatus('loading')

    try {
      const t = await db.tabs.get(tabId)
      if (!t) { setStatus('error'); return }
      setTab(t)

      // Check cache
      const cached = await loadFromCache(t, genre)
      const now = new Date()

      if (cached && !forceRefresh && cached.expiresAt > now) {
        // Valid cache
        const allEras = [...cached.timelineData, ...cached.insightsData]
        setEras(allEras)
        setDataWarning(cached.dataWarning)
        setCache(cached)
        setStatus('success')

        // Mark items as read
        await db.tabs.update(tabId, { lastViewedAt: now })
        return
      }

      // Need fresh data
      if (!settings.claudeApiKey) {
        if (cached) {
          // Use stale cache
          setEras([...cached.timelineData, ...cached.insightsData])
          setDataWarning(cached.dataWarning)
          setStatus('partial')
        } else {
          setStatus('error')
        }
        return
      }

      // Show stale cache while refreshing
      if (cached) {
        setEras([...cached.timelineData, ...cached.insightsData])
        setDataWarning(cached.dataWarning)
        setStatus('partial')
      }

      let wikiText = ''
      let newsText = ''
      let warning: DataWarning = null

      const [wikiResult, newsArticles] = await Promise.allSettled([
        getWikipediaSummary(t.keyword),
        settings.newsApiKey ? fetchNews(settings.newsApiKey, t.keyword) : Promise.resolve([]),
      ])

      if (wikiResult.status === 'fulfilled' && wikiResult.value) {
        wikiText = wikiResult.value.extract
      } else {
        warning = 'no_wikipedia'
      }

      if (newsArticles.status === 'fulfilled' && Array.isArray(newsArticles.value) && newsArticles.value.length > 0) {
        newsText = newsArticles.value
          .slice(0, 10)
          .map((a) => `${a.title}: ${a.description || ''}`)
          .join('\n')
      } else if (!warning) {
        warning = 'no_news'
      }

      if (!wikiText && !newsText) warning = 'no_realtime'

      const output = await generateTimeline(
        settings.claudeApiKey,
        t.keyword,
        genre,
        wikiText,
        newsText,
        warning
      )

      let insightEra: TimelineEra[] = []
      if (genre !== 'news' && genre !== 'skill') {
        try {
          const insight = await generateInsights(settings.claudeApiKey, t.keyword, genre, output.timeline)
          insightEra = [insight]
        } catch {
          // optional
        }
      }

      const ttl = GENRE_CACHE_TTL[genre]
      const cacheData: GenreCache = {
        cacheId: cached?.cacheId ?? crypto.randomUUID(),
        tabId,
        genre,
        timelineData: output.timeline,
        insightsData: insightEra,
        sortOrder: GENRE_SORT_ORDER[genre],
        cachedAt: now,
        expiresAt: new Date(now.getTime() + ttl),
        dataWarning: warning,
        unreadCount: 0,
      }

      if (cached) {
        await db.genreCaches.put({ ...cacheData, cacheId: cached.cacheId })
      } else {
        await db.genreCaches.add(cacheData)
      }

      await db.tabs.update(tabId, { lastUpdatedAt: now, lastViewedAt: now })

      setEras([...output.timeline, ...insightEra])
      setDataWarning(warning)
      setCache(cacheData)
      setStatus('success')
    } catch (err) {
      console.error('Timeline load error:', err)
      setStatus('error')
    }
  }, [tabId, genre, settings.claudeApiKey, settings.newsApiKey, loadFromCache])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { status, tab, eras, dataWarning, cache, refresh: () => refresh(true) }
}
