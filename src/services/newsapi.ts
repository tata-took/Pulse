const BASE_URL = 'https://newsapi.org/v2/everything'
const TIMEOUT = 8000

export interface NewsAPIArticle {
  title: string
  description: string
  source: { name: string }
  url: string
  publishedAt: string
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT)
  try {
    return await fetch(url, { signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchNews(
  apiKey: string,
  keyword: string,
  fromDate?: string
): Promise<NewsAPIArticle[]> {
  if (!apiKey) return []

  const params = new URLSearchParams({
    q: keyword,
    language: 'ja',
    sortBy: 'publishedAt',
    pageSize: fromDate ? '20' : '30',
    apiKey,
  })

  if (fromDate) {
    params.set('from', fromDate)
  }

  try {
    const res = await fetchWithTimeout(`${BASE_URL}?${params.toString()}`)
    if (!res.ok) return []
    const data = await res.json()
    return (data.articles ?? []) as NewsAPIArticle[]
  } catch {
    return []
  }
}
