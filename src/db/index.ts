import Dexie, { type Table } from 'dexie'
import type {
  Tab, Group, GenreCache, NewsArticle,
  Favorite, Recommendation, SearchHistory, UpdateLog
} from '../types'

export class PulseDB extends Dexie {
  tabs!: Table<Tab>
  groups!: Table<Group>
  genreCaches!: Table<GenreCache>
  newsArticles!: Table<NewsArticle>
  favorites!: Table<Favorite>
  recommendations!: Table<Recommendation>
  searchHistory!: Table<SearchHistory>
  updateLogs!: Table<UpdateLog>

  constructor() {
    super('PulseDB')
    this.version(1).stores({
      tabs: 'tabId, groupId, sortOrder, pinnedAt, lastUpdatedAt, isArchived',
      groups: 'groupId, sortOrder, isDefault',
      genreCaches: 'cacheId, tabId, genre, expiresAt, cachedAt',
      newsArticles: 'articleId, tabId, publishedAt, isRead, isNew, cachedAt',
      favorites: 'favoriteId, tabId, genre, savedAt',
      recommendations: 'recId, generatedAt',
      searchHistory: 'historyId, searchedAt',
      updateLogs: 'logId, executedAt',
    })
  }
}

export const db = new PulseDB()
