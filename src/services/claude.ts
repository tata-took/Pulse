import type {
  Genre,
  AIGenreDetection,
  AITimelineOutput,
  AIInsightOutput,
  DataWarning,
  TimelineEra,
  NodeColor,
} from '../types'

async function callClaude(
  apiKey: string,
  prompt: string,
  maxTokens: number
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
    signal: AbortSignal.timeout(15000),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(`Claude API error ${response.status}: ${JSON.stringify(err)}`)
  }

  const data = await response.json()
  return data.content[0]?.text ?? ''
}

function parseJSON<T>(text: string): T {
  const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
  if (!match) throw new Error('No JSON found in response')
  return JSON.parse(match[0]) as T
}

// ── ジャンル判定 ──────────────────────────────────
export async function detectGenre(
  apiKey: string,
  keyword: string
): Promise<AIGenreDetection> {
  const prompt = `キーワード「${keyword}」のジャンルを判定してください。
必ずJSON形式のみで返答。前置き・後書き不要。
{"genre":"person|company|tech|skill|social","confidence":"high|low","emoji":"代表絵文字1文字"}`

  const text = await callClaude(apiKey, prompt, 100)
  return parseJSON<AIGenreDetection>(text)
}

// ── タイムライン生成 ──────────────────────────────
const TIMELINE_PROMPTS: Record<Genre, string> = {
  person: `生い立ち・学歴・キャリア・実績・最新ニュースを時系列（古い順）でまとめてください。ネガティブな出来事も含めてください。`,
  company: `設立背景・主要プロダクト・資金調達・業績・最新動向を時系列（古い順）でまとめてください。競合・買収・提携も含めてください。`,
  tech: `誕生・理論・実用化・普及・現在の課題を時系列（新しい順）でまとめてください。専門用語には括弧で補足してください。`,
  skill: `概要・ロードマップ（初級/中級/上級）・最新トレンドをステップ形式でまとめてください。`,
  social: `発端・経緯・現状・今後の見通しを時系列（新しい順）でまとめてください。複数の立場がある場合は両論併記してください。`,
  news: `最新ニュースを要約してください。`,
}

export async function generateTimeline(
  apiKey: string,
  keyword: string,
  genre: Genre,
  wikiContent: string,
  newsContent: string,
  dataWarning: DataWarning
): Promise<AITimelineOutput> {
  const isAscending = genre === 'person' || genre === 'company'

  const prompt = `キーワード「${keyword}」について${TIMELINE_PROMPTS[genre]}

参考情報:
${wikiContent ? `【Wikipedia】\n${wikiContent.slice(0, 2000)}` : ''}
${newsContent ? `【ニュース】\n${newsContent.slice(0, 1500)}` : ''}

以下のJSON形式のみで返答（前置き・後書き禁止）:
{
  "keyword": "${keyword}",
  "genre": "${genre}",
  "timeline": [
    {
      "era": "年号または時代ラベル",
      "isLatest": false,
      "isAI": false,
      "items": [
        {
          "itemId": "uuid",
          "color": "blue|green|red|orange|purple|gold",
          "tag": "タグ（5文字以内）",
          "title": "タイトル（30文字以内）",
          "summary": "要約（2〜3文・100文字以内）",
          "source": "出典",
          "date": "YYYY-MM-DD",
          "uncertain": false,
          "isNew": false,
          "isRead": false,
          "isFavorited": false,
          "importance": 50
        }
      ]
    }
  ],
  "dataWarning": ${JSON.stringify(dataWarning)}
}

ルール:
- 最新グループのeraは "✦ 最新" でisLatest: trueにする
- 不確かな情報はuncertain: trueにする
- ${isAscending ? '古い順（過去から現在）' : '新しい順（現在から過去）'}で並べる
- 5〜10個のeraグループに分ける
- 各eraに1〜4件のitemsを入れる`

  const text = await callClaude(apiKey, prompt, 1500)
  const parsed = parseJSON<AITimelineOutput>(text)

  // Ensure itemIds are unique
  parsed.timeline?.forEach((era) => {
    era.items?.forEach((item) => {
      if (!item.itemId) item.itemId = crypto.randomUUID()
    })
  })

  return parsed
}

// ── AI洞察生成 ────────────────────────────────────
export async function generateInsights(
  apiKey: string,
  keyword: string,
  _genre: Genre,
  timelineEras: TimelineEra[]
): Promise<TimelineEra> {
  const recentItems = timelineEras
    .flatMap((e) => e.items)
    .slice(-5)
    .map((i) => `${i.title}: ${i.summary}`)
    .join('\n')

  const prompt = `「${keyword}」に関する以下の情報から、重要な洞察・考察を2〜3件生成してください。

${recentItems}

以下のJSON形式のみで返答:
{
  "insights": [
    {
      "tag": "ラベル（6文字以内）",
      "title": "タイトル（25文字以内）",
      "body": "本文（2〜3文）",
      "color": "blue|green|red|orange|purple|gold"
    }
  ]
}`

  const text = await callClaude(apiKey, prompt, 300)
  const parsed = parseJSON<AIInsightOutput>(text)

  return {
    era: '✦ AI洞察',
    isLatest: false,
    isAI: true,
    items: parsed.insights.map((insight) => ({
      itemId: crypto.randomUUID(),
      color: insight.color as NodeColor,
      tag: insight.tag,
      title: insight.title,
      summary: insight.body,
      source: 'Claude AI',
      date: new Date().toISOString().split('T')[0],
      uncertain: false,
      isNew: false,
      isRead: false,
      isFavorited: false,
      importance: 60,
    })),
  }
}

// ── ニュース要約 ──────────────────────────────────
export async function summarizeNews(
  apiKey: string,
  keyword: string,
  articles: { title: string; description: string; source: { name: string }; publishedAt: string; url: string }[]
): Promise<{ title: string; summary: string; source: string; date: string; url: string }[]> {
  if (articles.length === 0) return []

  const articlesText = articles
    .slice(0, 15)
    .map((a, i) => `${i + 1}. [${a.source?.name}] ${a.title}: ${a.description || ''}`)
    .join('\n')

  const prompt = `「${keyword}」に関する以下のニュース記事を日本語で要約してください。

${articlesText}

以下のJSON形式のみで返答:
{
  "news": [
    {
      "title": "記事タイトル（日本語・30文字以内）",
      "summary": "要約（1〜2文・80文字以内）",
      "source": "出典名",
      "date": "YYYY-MM-DD",
      "url": "元のURL"
    }
  ]
}`

  const text = await callClaude(apiKey, prompt, 800)
  const parsed = parseJSON<{ news: { title: string; summary: string; source: string; date: string; url: string }[] }>(text)
  return parsed.news ?? []
}
