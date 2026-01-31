'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { ArrowLeft, Play, Clock, Lock, CheckCircle, Loader2 } from 'lucide-react'
import { VideoCardSkeleton } from '@/components/ui/skeleton'
import { contentService } from '@/services/content.service'
import {
  getCompletedVideoIdsForTopic,
  isVideoUnlockedForTopic,
  markVideoCompletedForTopic,
} from '@/data/mock-courses'

interface DiscoverVideo {
  id: string
  title: string
  thumbnail: string
  duration: string
  youtubeId: string
  channelTitle?: string
}

// In-memory cache: show topic videos instantly on revisit while refetching in background
const topicVideoCache = new Map<string, { videos: DiscoverVideo[] }>()

export default function TopicCoursePage() {
  const params = useParams()
  const topic = typeof params?.topic === 'string' ? decodeURIComponent(params.topic) : ''

  const [videos, setVideos] = React.useState<DiscoverVideo[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [completedIds, setCompletedIds] = React.useState<string[]>([])

  React.useEffect(() => {
    if (!topic) {
      setError('Topic is required')
      setLoading(false)
      return
    }
    setError(null)
    const cached = topicVideoCache.get(topic)
    if (cached?.videos.length) {
      setVideos(cached.videos)
      setLoading(false)
    } else {
      setLoading(true)
    }

    contentService
      .discoverByTopic(topic, 12)
      .then((res) => {
        const list = res?.data?.videos ?? []
        const dataError = res?.data?.error
        setVideos(Array.isArray(list) ? list : [])
        if (list?.length) topicVideoCache.set(topic, { videos: list })
        if (dataError && (!list || list.length === 0)) setError(dataError)
        else if (!dataError) setError(null)
      })
      .catch((err: { data?: { error?: string }; message?: string }) => {
        const msg = err?.data?.error ?? err?.message ?? 'Failed to load videos'
        const isNotCourseTopic = typeof msg === 'string' && (msg.includes('not part of your course') || msg.includes('Only topics from your roadmaps'))
        setError(isNotCourseTopic ? 'This topic isn’t in your course. Choose a topic from your learning path (Content → Your courses).' : msg)
        if (!topicVideoCache.get(topic)?.videos.length) setVideos([])
      })
      .finally(() => setLoading(false))
  }, [topic])

  React.useEffect(() => {
    if (!topic) return
    setCompletedIds(getCompletedVideoIdsForTopic(topic))
  }, [topic])

  if (!topic) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <nav className="mb-6 py-2">
          <Link
            href="/content"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 transition-colors touch-manipulation py-1"
          >
            <ArrowLeft className="w-4 h-4 flex-shrink-0" />
            Back to Content Library
          </Link>
        </nav>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 text-center shadow-sm">
          <p className="text-gray-600 text-sm sm:text-base">Topic is required.</p>
        </div>
      </div>
    )
  }

  const showEmptyState = !loading && (!!error || videos.length === 0)
  const completedCount = completedIds.length
  const totalCount = videos.length

  if (showEmptyState) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <nav className="mb-6 py-2">
          <Link
            href="/content"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 transition-colors touch-manipulation py-1"
          >
            <ArrowLeft className="w-4 h-4 flex-shrink-0" />
            Back to Content Library
          </Link>
        </nav>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <p className="text-gray-700 font-medium text-sm sm:text-base">{error || 'No videos found for this topic.'}</p>
          <p className="text-sm text-gray-500 mt-2">
            Discovery uses Piped and Invidious (free). If unavailable, try again in a few minutes.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 sm:space-y-6 md:space-y-8 max-w-6xl mx-auto px-4 sm:px-6">
      <nav className="py-1 -mx-1">
        <Link
          href="/content"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 transition-colors touch-manipulation py-2 px-1 rounded-lg min-h-[44px] min-w-[44px]"
        >
          <ArrowLeft className="w-4 h-4 flex-shrink-0" />
          Back to Content Library
        </Link>
      </nav>

      <header className="rounded-2xl border border-gray-200/80 bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-600 px-5 py-6 sm:px-6 sm:py-8 md:px-10 md:py-10 shadow-lg shadow-teal-500/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 pointer-events-none" />
        <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-white tracking-tight leading-tight">
            {topic}
          </h1>
          <p className="mt-2 text-white/90 text-xs sm:text-sm md:text-base max-w-xl">
            {loading && videos.length === 0
              ? 'Finding videos...'
              : totalCount > 0
                ? `${completedCount} of ${totalCount} completed · Watch in order to unlock the next`
                : `${totalCount} videos`}
          </p>
          {loading && videos.length > 0 && (
            <span className="inline-flex items-center gap-2 mt-3 text-white/90 text-xs font-medium">
              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
              Refreshing...
            </span>
          )}
        </div>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Videos</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Complete each video to unlock the next</p>
        </div>
        <div className="p-4 sm:p-6">
          {loading && videos.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <VideoCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {videos.map((video, index) => (
                <TopicVideoCard
                  key={video.id}
                  topic={topic}
                  video={video}
                  index={index}
                  videos={videos}
                  completedIds={completedIds}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function TopicVideoCard({
  topic,
  video,
  index,
  videos,
  completedIds,
}: {
  topic: string
  video: DiscoverVideo
  index: number
  videos: DiscoverVideo[]
  completedIds: string[]
}) {
  const unlocked = isVideoUnlockedForTopic(videos, index, completedIds)
  const completed = completedIds.includes(video.id)
  const href = unlocked ? `/content/watch?topic=${encodeURIComponent(topic)}&videoId=${encodeURIComponent(video.id)}` : '#'

  return (
    <article
      className={`rounded-xl border overflow-hidden bg-white shadow-sm transition-all duration-200 group active:scale-[0.99] ${
        unlocked
          ? 'border-gray-200 hover:border-teal-200 hover:shadow-md'
          : 'border-gray-100 bg-gray-50/50 opacity-90'
      }`}
    >
      <Link
        href={href}
        onClick={(e) => !unlocked && e.preventDefault()}
        className={`block min-h-[120px] ${unlocked ? '' : 'cursor-not-allowed'}`}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <div className="relative aspect-video bg-gray-100 overflow-hidden">
          <Image
            src={video.thumbnail}
            alt=""
            width={400}
            height={225}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02] group-active:scale-[1.01]"
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
          <span className="absolute bottom-2 right-2 rounded bg-black/75 px-2 py-0.5 text-[10px] sm:text-xs font-medium text-white">
            {video.duration}
          </span>
          {!unlocked && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 sm:gap-3 bg-black/50 px-4">
              <div className="rounded-full bg-white/20 p-3 sm:p-4">
                <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <span className="text-[11px] sm:text-xs font-medium text-white/95 text-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-black/40 backdrop-blur-sm">
                Complete previous video to unlock
              </span>
            </div>
          )}
          {unlocked && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 bg-black/25">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white shadow-lg flex items-center justify-center ring-4 ring-white/30">
                <Play className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 ml-0.5 sm:ml-1" fill="currentColor" />
              </div>
            </div>
          )}
          {completed && (
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-teal-500 shadow-md flex items-center justify-center ring-2 ring-white">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          )}
        </div>
        <div className="p-3 sm:p-4">
          <span className="text-[10px] sm:text-xs font-medium text-teal-600 mb-1 sm:mb-1.5 block">
            Video {index + 1} of {videos.length}
          </span>
          <h3 className="font-semibold text-gray-900 text-xs sm:text-sm leading-snug line-clamp-2 min-h-[2.25rem] sm:min-h-[2.5rem]">
            {video.title}
          </h3>
          {video.channelTitle && (
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1.5 sm:mt-2 truncate">{video.channelTitle}</p>
          )}
          <p className="text-[10px] sm:text-xs text-gray-400 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
            {video.duration}
          </p>
        </div>
      </Link>
    </article>
  )
}
