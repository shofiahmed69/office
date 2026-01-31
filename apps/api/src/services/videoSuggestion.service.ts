/**
 * Video suggestions scoped to course topics only.
 * Topics are derived from the user's roadmaps; only those topics get suggestions.
 * Results are cached in topic_video_suggestions and filtered for relevance.
 */

import { query } from '../config/database'
import youtubeService from './youtube.service'
import { AppError } from '../middleware/error.middleware'

const CACHE_MAX_AGE_DAYS = 7
const MIN_CACHE_COUNT = 6

export interface VideoSuggestionItem {
  id: string
  title: string
  thumbnail: string
  duration: string
  youtubeId: string
  channelTitle?: string
}

function normalizeTopic(topic: string): string {
  return topic
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

/** Extract all course topic strings from a user's roadmaps (subject + module names + module topics). */
export async function getCourseTopicsForUser(userId: number): Promise<string[]> {
  const result = await query<{ subject: string; roadmap_data: { modules?: { name?: string; topics?: string[] }[] } }>(
    `SELECT subject, roadmap_data FROM user_learning_roadmaps WHERE user_id = $1 AND status = 'active'`,
    [userId]
  )
  const seen = new Set<string>()
  for (const row of result.rows) {
    const subject = (row.subject || '').trim()
    if (subject) seen.add(normalizeTopic(subject))
    const modules = row.roadmap_data?.modules ?? []
    for (const mod of modules) {
      const name = (mod.name || '').trim()
      if (name) seen.add(normalizeTopic(name))
      const topics = Array.isArray(mod.topics) ? mod.topics : []
      for (const t of topics) {
        if (typeof t === 'string' && t.trim()) seen.add(normalizeTopic(t.trim()))
      }
    }
  }
  return Array.from(seen)
}

/** Check if a topic is one of the user's course topics (normalized match). */
export async function isCourseTopicForUser(userId: number, topic: string): Promise<boolean> {
  const normalized = normalizeTopic(topic)
  if (!normalized) return false
  const courseTopics = await getCourseTopicsForUser(userId)
  return courseTopics.some((ct) => ct === normalized || ct.includes(normalized) || normalized.includes(ct))
}

/** Topic words for relevance filtering (skip very short words). */
function topicWords(topic: string): string[] {
  return topic
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length >= 2)
}

/** True if title or description contains at least one topic word. */
function isRelevantToTopic(title: string, description: string, topic: string): boolean {
  const words = topicWords(topic)
  if (words.length === 0) return true
  const text = `${(title || '').toLowerCase()} ${(description || '').toLowerCase()}`
  return words.some((w) => text.includes(w))
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** Map cache rows to VideoSuggestionItem[]. */
function mapCacheRowsToVideos(
  rows: Array<{
    external_id: string
    title: string
    thumbnail_url: string | null
    duration_seconds: number
    channel_title: string | null
  }>
): VideoSuggestionItem[] {
  return rows.map((row) => ({
    id: row.external_id,
    title: row.title,
    thumbnail: row.thumbnail_url || `https://img.youtube.com/vi/${row.external_id}/mqdefault.jpg`,
    duration: formatDuration(row.duration_seconds),
    youtubeId: row.external_id,
    channelTitle: row.channel_title || undefined,
  }))
}

/**
 * Get video suggestions for a topic. Topic must be one of the user's course topics.
 * Uses cache when fresh; otherwise fetches from YouTube/Piped, filters by relevance, and caches.
 * When fetch fails, returns stale cache if any (so UX stays good when Piped/Invidious are down).
 */
export async function getSuggestionsForTopic(
  userId: number,
  topic: string,
  maxResults: number = 12
): Promise<{ topic: string; videos: VideoSuggestionItem[]; fromCache?: boolean }> {
  const normalized = normalizeTopic(topic)
  if (!normalized) {
    throw new AppError('Topic is required', 400)
  }

  const courseTopics = await getCourseTopicsForUser(userId)
  const isAllowed =
    courseTopics.includes(normalized) ||
    courseTopics.some((ct) => ct.includes(normalized) || normalized.includes(ct))
  if (!isAllowed) {
    throw new AppError('Topic is not part of your course. Only topics from your roadmaps are allowed.', 400)
  }

  const limit = Math.min(Math.max(1, maxResults), 25)

  // Prefer cache if we have enough rows and newest is recent
  const cacheResult = await query<{
    external_id: string
    title: string
    thumbnail_url: string | null
    duration_seconds: number
    channel_title: string | null
    created_at: Date
  }>(
    `SELECT external_id, title, thumbnail_url, duration_seconds, channel_title, created_at
     FROM topic_video_suggestions
     WHERE topic_normalized = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [normalized, limit]
  )

  const cacheRows = cacheResult.rows
  const newestAt = cacheRows[0]?.created_at
  const cacheFresh =
    newestAt &&
    cacheRows.length >= Math.min(limit, MIN_CACHE_COUNT) &&
    Date.now() - newestAt.getTime() < CACHE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000

  if (cacheFresh && cacheRows.length >= limit) {
    return { topic: topic.trim(), videos: mapCacheRowsToVideos(cacheRows.slice(0, limit)) }
  }

  // Fetch from YouTube/Piped with strict educational query
  const searchQuery = `${topic.trim()} course lecture tutorial`
  let fetched: Awaited<ReturnType<typeof youtubeService.searchVideos>>
  try {
    fetched = await youtubeService.searchVideos({
      q: searchQuery,
      maxResults: limit + 10,
      order: 'relevance',
      videoDuration: 'medium',
    })
  } catch (err) {
    // When external API fails, return stale cache if we have any (better UX than "unavailable")
    if (cacheRows.length > 0) {
      const videos = mapCacheRowsToVideos(cacheRows.slice(0, limit))
      return { topic: topic.trim(), videos, fromCache: true }
    }
    const message = err instanceof Error ? err.message : 'Video search is temporarily unavailable.'
    throw new AppError(message, 503)
  }

  // Keep only videos relevant to the topic (title/description contains topic words)
  const relevant = fetched.filter((v) => isRelevantToTopic(v.title, v.description, topic.trim())).slice(0, limit)

  // Upsert into cache
  for (const v of relevant) {
    await query(
      `INSERT INTO topic_video_suggestions
       (topic_normalized, external_id, title, description, thumbnail_url, content_url, duration_seconds, channel_title, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'youtube')
       ON CONFLICT (topic_normalized, external_id) DO UPDATE SET
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         thumbnail_url = EXCLUDED.thumbnail_url,
         duration_seconds = EXCLUDED.duration_seconds,
         channel_title = EXCLUDED.channel_title,
         created_at = NOW()`,
      [
        normalized,
        v.externalId,
        v.title,
        v.description?.slice(0, 5000) ?? '',
        v.thumbnailUrl || `https://img.youtube.com/vi/${v.externalId}/mqdefault.jpg`,
        v.contentUrl,
        v.durationSeconds ?? 0,
        v.channelTitle ?? null,
      ]
    )
  }

  const videos: VideoSuggestionItem[] = relevant.map((v) => ({
    id: v.externalId,
    title: v.title,
    thumbnail: v.thumbnailUrl || `https://img.youtube.com/vi/${v.externalId}/mqdefault.jpg`,
    duration: formatDuration(v.durationSeconds ?? 0),
    youtubeId: v.externalId,
    channelTitle: v.channelTitle || undefined,
  }))

  return { topic: topic.trim(), videos }
}

export default {
  getCourseTopicsForUser,
  isCourseTopicForUser,
  getSuggestionsForTopic,
}
