'use client'

/**
 * Embeds a YouTube video so it plays directly on your site.
 * Uses YouTube's official iframe embed (free, no API key, legal).
 */

function getYouTubeVideoId(urlOrId: string): string | null {
  if (!urlOrId?.trim()) return null
  const s = urlOrId.trim()
  // Already a video ID (11 chars, alphanumeric + - _)
  if (/^[\w-]{11}$/.test(s)) return s
  try {
    const u = new URL(s)
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0] || null
    if (u.hostname.includes('youtube.com'))
      return u.searchParams.get('v') || u.searchParams.get('vi') || null
  } catch {
    return null
  }
  return null
}

export interface VideoEmbedProps {
  /** YouTube URL (watch or youtu.be) or 11-char video ID */
  urlOrId: string
  /** Optional query params: no related videos (rel=0), modest branding, start time */
  start?: number
  /** Allow fullscreen */
  allowFullScreen?: boolean
  /** CSS class for the wrapper */
  className?: string
  /** Title for iframe (accessibility) */
  title?: string
}

export function VideoEmbed({
  urlOrId,
  start,
  allowFullScreen = true,
  className = '',
  title = 'YouTube video',
}: VideoEmbedProps) {
  const videoId = getYouTubeVideoId(urlOrId)
  if (!videoId) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 font-medium ${className}`}
        style={{ aspectRatio: '16/9' }}
      >
        Invalid or unsupported video URL
      </div>
    )
  }

  const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`)
  embedUrl.searchParams.set('rel', '0') // Prefer related videos from same channel
  embedUrl.searchParams.set('modestbranding', '1')
  if (start) embedUrl.searchParams.set('start', String(start))

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl bg-black ${className}`}
      style={{ aspectRatio: '16/9' }}
    >
      <iframe
        src={embedUrl.toString()}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen={allowFullScreen}
        className="absolute inset-0 h-full w-full"
      />
    </div>
  )
}

export { getYouTubeVideoId }
