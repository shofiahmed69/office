/**
 * YouTube Data API v3 - fetch real videos by keyword and optional channel filter.
 * When YOUTUBE_API_KEY is not set, uses Piped API then Invidious API (free, no key).
 */

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'
const PIPED_API_BASES = [
  'https://pipedapi.kavin.rocks',
  'https://api.piped.yt',
  'https://pipedapi.leptons.xyz',
  'https://piped-api.privacy.com.de',
  'https://api.piped.private.coffee',
]
const INVIDIOUS_API_BASES = [
  'https://inv.nadeko.net',
  'https://invidious.nerdvpn.de',
  'https://vid.puffyan.us',
  'https://invidious.flokinet.to',
]

export interface YouTubeVideoItem {
  externalId: string
  title: string
  description: string
  contentUrl: string
  thumbnailUrl: string
  durationSeconds: number
  channelTitle: string
  publishedAt: string
}

/** Official YouTube channel IDs for university / free course content */
export const TRUSTED_CHANNEL_IDS: Record<string, string> = {
  MIT_OCW: 'UCFe34eD4lQUo3L_T6T2eO_g', // MIT OpenCourseWare
  MIT_OPEN_LEARNING: 'UCN0QBfKk0ZSytyX_16M11fA',
  STANFORD: 'UC2pmfLm7iq6Q5e2b6bqVqYg', // Stanford Online
  HARVARD: 'UCN0QBfKk0ZSytyX_16M11fA', // Harvard - use generic search if no dedicated channel
  CRASHCOURSE: 'UCX6b17PVsYBQ0ip5gyeme-Q',
  KHAN: 'UC4a-Gbdw7vOaccHmFo40b9g',
}

export class YouTubeService {
  private apiKey: string | undefined

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.YOUTUBE_API_KEY
  }

  /**
   * Search videos by query. Uses YouTube API if key is set, else Piped (free).
   */
  async searchVideos(options: {
    q: string
    maxResults?: number
    channelId?: string
    order?: 'relevance' | 'date' | 'viewCount' | 'rating'
    videoDuration?: 'short' | 'medium' | 'long'
  }): Promise<YouTubeVideoItem[]> {
    if (this.apiKey) {
      return this.searchVideosYouTube(options)
    }
    return this.searchVideosFree(options.q, options.maxResults || 12)
  }

  /**
   * Search using YouTube Data API v3 (requires YOUTUBE_API_KEY).
   */
  private async searchVideosYouTube(options: {
    q: string
    maxResults?: number
    channelId?: string
    order?: 'relevance' | 'date' | 'viewCount' | 'rating'
    videoDuration?: 'short' | 'medium' | 'long'
  }): Promise<YouTubeVideoItem[]> {
    const maxResults = Math.min(options.maxResults || 10, 25)
    const params = new URLSearchParams({
      part: 'snippet',
      q: options.q,
      type: 'video',
      maxResults: String(maxResults),
      key: this.apiKey!,
    })
    if (options.channelId) params.set('channelId', options.channelId)
    if (options.order) params.set('order', options.order)
    if (options.videoDuration) params.set('videoDuration', options.videoDuration)

    const res = await fetch(`${YOUTUBE_API_BASE}/search?${params}`)
    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { error?: { message?: string } }
      throw new Error(err?.error?.message || `YouTube API error: ${res.status}`)
    }

    const data = await res.json() as { error?: { message?: string }; items?: { id?: { videoId?: string }; snippet?: { title?: string; description?: string; thumbnails?: { high?: { url?: string }; default?: { url?: string } }; channelTitle?: string; publishedAt?: string } }[] }
    const items = data.items || []
    if (items.length === 0) return []

    const videoIds = items.map((i: { id?: { videoId?: string } }) => i.id?.videoId).filter((id): id is string => Boolean(id))
    const details = await this.getVideoDetails(videoIds)

    return items
      .map((item: any) => {
        const id = item.id?.videoId
        if (!id) return null
        const detail = details.find((d) => d.id === id)
        return {
          externalId: id,
          title: item.snippet?.title || 'Untitled',
          description: item.snippet?.description || '',
          contentUrl: `https://www.youtube.com/watch?v=${id}`,
          thumbnailUrl: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url || '',
          durationSeconds: detail?.durationSeconds ?? 0,
          channelTitle: item.snippet?.channelTitle || '',
          publishedAt: item.snippet?.publishedAt || '',
        }
      })
      .filter(Boolean) as YouTubeVideoItem[]
  }

  /**
   * Search using free APIs: Piped first, then Invidious (no API key).
   */
  async searchVideosFree(q: string, maxResults: number = 12): Promise<YouTubeVideoItem[]> {
    const limit = Math.min(maxResults, 20)
    const piped = await this.searchVideosPiped(q, limit)
    if (piped.length > 0) return piped
    const invidious = await this.searchVideosInvidious(q, limit)
    if (invidious.length > 0) return invidious
    throw new Error('Video search is temporarily unavailable. Try again in a few minutes.')
  }

  /**
   * Search using Piped public API (free, no API key).
   * Piped requires both q and filter (e.g. "videos"). Returns { items: StreamItem[] }.
   */
  private async searchVideosPiped(q: string, limit: number): Promise<YouTubeVideoItem[]> {
    const query = encodeURIComponent(String(q || '').trim())
    const filter = 'videos' // required by Piped; options: videos, channels, playlists, all
    for (const base of PIPED_API_BASES) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15_000)
        const res = await fetch(`${base}/search?q=${query}&filter=${encodeURIComponent(filter)}`, {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
            'User-Agent': 'ScholarPass/1.0 (educational; +https://github.com/scholarpass)',
          },
        })
        clearTimeout(timeoutId)
        if (!res.ok) continue
        let data: unknown
        try {
          const text = await res.text()
          data = text ? JSON.parse(text) : null
        } catch {
          continue
        }
        // Reject server-side error payloads (e.g. YouTube backend failure)
        if (data && typeof data === 'object' && 'error' in (data as Record<string, unknown>)) continue
        const raw =
          Array.isArray(data)
            ? data
            : data && typeof data === 'object'
              ? (data as Record<string, unknown>).items ?? (data as Record<string, unknown>).relatedStreams ?? []
              : []
        const items = Array.isArray(raw) ? raw : []
        const videos = items
          .filter((item: unknown) => {
            if (!item || typeof item !== 'object') return false
            const o = item as Record<string, unknown>
            if (o.type === 'channel' || o.type === 'playlist') return false
            return (o.videoId && String(o.videoId)) || (o.url && String(o.url).includes('v='))
          })
          .slice(0, limit)
          .map((item: Record<string, unknown>) => {
            const url = item.url != null ? String(item.url) : ''
            const videoId =
              (item.videoId && String(item.videoId)) ||
              (url && url.match(/[?&]v=([^&]+)/)?.[1]) ||
              ''
            if (!videoId) return null
            const duration = item.duration ?? item.lengthSeconds ?? 0
            let secs = 0
            if (typeof duration === 'number' && !Number.isNaN(duration)) secs = Math.floor(duration)
            else if (typeof duration === 'string' && /^\d+$/.test(duration)) secs = parseInt(duration, 10)
            else if (typeof duration === 'string') secs = this.parseDuration(duration)
            return {
              externalId: videoId,
              title: String(item.title || 'Untitled'),
              description: String(item.description || item.shortDescription || ''),
              contentUrl: `https://www.youtube.com/watch?v=${videoId}`,
              thumbnailUrl:
                (item.thumbnailUrl && String(item.thumbnailUrl)) ||
                (item.thumbnail && String(item.thumbnail)) ||
                `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
              durationSeconds: secs,
              channelTitle: String(item.uploaderName || item.uploader || item.author || ''),
              publishedAt: String(item.uploadedDate || item.uploaded || ''),
            }
          })
          .filter(Boolean) as YouTubeVideoItem[]
        if (videos.length > 0) return videos
      } catch {
        continue
      }
    }
    return []
  }

  /**
   * Search using Invidious public API (free, no API key). Used when Piped fails.
   */
  private async searchVideosInvidious(q: string, limit: number): Promise<YouTubeVideoItem[]> {
    const query = encodeURIComponent(String(q || '').trim())
    for (const base of INVIDIOUS_API_BASES) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15_000)
        const res = await fetch(`${base}/api/v1/search?q=${query}&type=video`, {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
            'User-Agent': 'ScholarPass/1.0 (educational; +https://github.com/scholarpass)',
          },
        })
        clearTimeout(timeoutId)
        if (!res.ok) continue
        let rawItems: unknown
        try {
          rawItems = await res.json()
        } catch {
          continue
        }
        if (rawItems && typeof rawItems === 'object' && 'error' in (rawItems as Record<string, unknown>)) continue
        const items = Array.isArray(rawItems) ? rawItems : []
        if (items.length === 0) continue
        const videos = items
          .filter((item: unknown): item is Record<string, unknown> => item !== null && typeof item === 'object' && (!!(item as Record<string, unknown>).videoId || (item as Record<string, unknown>).type === 'video'))
          .slice(0, limit)
          .map((item: Record<string, unknown>) => {
            const videoId = String(item.videoId || '')
            if (!videoId) return null
            const thumbs = item.videoThumbnails as { quality?: string; url?: string }[] | undefined
            const thumb = Array.isArray(thumbs) && thumbs.length > 0 ? (thumbs.find((t) => t.quality === 'medium') || thumbs[0]).url : undefined
            return {
              externalId: videoId,
              title: String(item.title || 'Untitled'),
              description: String(item.description || item.descriptionHtml || ''),
              contentUrl: `https://www.youtube.com/watch?v=${videoId}`,
              thumbnailUrl: thumb || `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
              durationSeconds: Number(item.lengthSeconds) || 0,
              channelTitle: String(item.author || ''),
              publishedAt: String(item.publishedText || item.published || ''),
            }
          })
          .filter(Boolean) as YouTubeVideoItem[]
        if (videos.length > 0) return videos
      } catch {
        continue
      }
    }
    return []
  }

  /** Get duration and details for video IDs (videos.list part=contentDetails) */
  private async getVideoDetails(videoIds: string[]): Promise<{ id: string; durationSeconds: number }[]> {
    if (videoIds.length === 0) return []
    if (!this.apiKey) return []

    const params = new URLSearchParams({
      part: 'contentDetails',
      id: videoIds.join(','),
      key: this.apiKey,
    })
    const res = await fetch(`${YOUTUBE_API_BASE}/videos?${params}`)
    if (!res.ok) return []

    const data = await res.json() as { items?: { id: string; contentDetails?: { duration?: string } }[] }
    const items = data.items || []
    return items.map((item) => ({
      id: item.id,
      durationSeconds: this.parseDuration(item.contentDetails?.duration),
    }))
  }

  private parseDuration(iso?: string): number {
    if (!iso) return 0
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!match) return 0
    const h = parseInt(match[1] || '0', 10)
    const m = parseInt(match[2] || '0', 10)
    const s = parseInt(match[3] || '0', 10)
    return h * 3600 + m * 60 + s
  }

  /**
   * Build search query for a roadmap module (subject + module name + topic) for university-style results.
   */
  buildSearchQuery(subject: string, moduleName: string, topic: string, sourceHint?: 'MIT' | 'Stanford' | 'Harvard'): string {
    const parts = [subject, moduleName, topic].filter(Boolean).join(' ')
    if (sourceHint) return `${sourceHint} ${parts} lecture`
    return `${parts} course lecture`
  }

  /**
   * Get topic suggestions for the content library (from Invidious/Piped, same source as videos). Used for "Discover by topic".
   */
  async getTopicSuggestions(maxTopics: number = 24): Promise<string[]> {
    const seeds = ['learn', 'programming', 'tutorial', 'python', 'javascript', 'react', 'math', 'course']
    const seen = new Set<string>()
    const normalize = (s: string) => s.trim().replace(/\s+/g, ' ')
    const add = (raw: string) => {
      const t = normalize(raw)
      if (t.length > 1 && t.length < 50) seen.add(t)
    }

    for (const base of INVIDIOUS_API_BASES) {
      try {
        for (const q of seeds) {
          const res = await fetch(`${base}/api/v1/search/suggestions?q=${encodeURIComponent(q)}`, {
            headers: { Accept: 'application/json' },
            signal: AbortSignal.timeout(5000),
          })
          if (!res.ok) continue
          const data = (await res.json()) as { suggestions?: string[] }
          const list = data.suggestions ?? []
          list.forEach((s: string) => add(s))
        }
        if (seen.size >= maxTopics) break
      } catch {
        continue
      }
    }

    const fromApi = Array.from(seen).slice(0, maxTopics)
    if (fromApi.length > 0) return fromApi

    return DEFAULT_TOPICS.slice(0, maxTopics)
  }
}

const DEFAULT_TOPICS = [
  'JavaScript',
  'Python',
  'React',
  'Computer Science',
  'Mathematics',
  'Data Structures',
  'Web Development',
  'Machine Learning',
  'SQL',
  'Algorithms',
  'Calculus',
  'Physics',
  'Node.js',
  'TypeScript',
  'HTML CSS',
  'Java',
  'C++',
  'Statistics',
  'Linear Algebra',
  'Chemistry',
  'History',
  'Economics',
  'Psychology',
  'Core concepts',
]

export default new YouTubeService()
