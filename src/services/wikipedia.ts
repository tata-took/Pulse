const BASE_URL = 'https://ja.wikipedia.org/api/rest_v1'
const TIMEOUT = 8000

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT)
  try {
    const res = await fetch(url, { signal: controller.signal })
    return res
  } finally {
    clearTimeout(timer)
  }
}

export interface WikipediaResult {
  title: string
  extract: string
  thumbnail?: { source: string }
}

export async function getWikipediaSummary(keyword: string): Promise<WikipediaResult | null> {
  try {
    // Try Japanese first
    const res = await fetchWithTimeout(
      `${BASE_URL}/page/summary/${encodeURIComponent(keyword)}`
    )
    if (res.ok) {
      const data = await res.json()
      return {
        title: data.title,
        extract: data.extract || '',
        thumbnail: data.thumbnail,
      }
    }

    // Fallback to English
    const enRes = await fetchWithTimeout(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(keyword)}`
    )
    if (enRes.ok) {
      const data = await enRes.json()
      return {
        title: data.title,
        extract: data.extract || '',
        thumbnail: data.thumbnail,
      }
    }

    return null
  } catch {
    return null
  }
}

export async function getWikipediaFullText(keyword: string): Promise<string> {
  try {
    const url = `https://ja.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&format=json&rvslots=main&titles=${encodeURIComponent(keyword)}&origin=*`
    const res = await fetchWithTimeout(url)
    if (!res.ok) return ''
    const data = await res.json()
    const pages = data.query?.pages ?? {}
    const page = Object.values(pages)[0] as { revisions?: { slots?: { main?: { '*': string } } }[] }
    const content = page?.revisions?.[0]?.slots?.main?.['*'] ?? ''
    // Strip wiki markup roughly
    return content.replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, '$1').slice(0, 3000)
  } catch {
    return ''
  }
}
