'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Clock, CheckCircle, Loader2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VideoEmbed } from '@/components/ui/video-embed'
import { StaggerContainer, StaggerItem } from '@/components/motion'
import { contentService } from '@/services/content.service'
import {
  MOCK_COURSES,
  markVideoCompleted,
  getCompletedVideoIds,
  isVideoUnlocked,
  markVideoCompletedForTopic,
  getCompletedVideoIdsForTopic,
  isVideoUnlockedForTopic,
} from '@/data/mock-courses'

interface DiscoverVideo {
  id: string
  title: string
  thumbnail: string
  duration: string
  youtubeId: string
}

interface ApiContent {
  id: number
  title: string
  description?: string
  content_url?: string
  contentUrl?: string
  external_id?: string
  externalId?: string
  duration_seconds?: number
  durationSeconds?: number
  sourceUrl?: string
}

export default function ContentWatchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseIdParam = searchParams.get('courseId')
  const topicParam = searchParams.get('topic')
  const videoId = searchParams.get('videoId')
  const contentIdParam = searchParams.get('contentId')

  const courseId = courseIdParam ? Number(courseIdParam) : null
  const topic = topicParam?.trim() || null
  const contentId = contentIdParam ? parseInt(contentIdParam, 10) : null
  const fromRoadmapParam = searchParams.get('fromRoadmap')
  const fromRoadmapId = fromRoadmapParam ? parseInt(fromRoadmapParam, 10) : null

  const isTopicMode = !!topic && !!videoId && !contentId
  const isCourseMode = !!courseId && !!videoId && !topic && !contentId
  const isContentIdMode = !!contentId && Number.isInteger(contentId)

  const course = courseId ? MOCK_COURSES.find((c) => c.id === courseId) : null
  const courseVideo = course?.videos.find((v) => v.id === videoId)

  const [topicVideos, setTopicVideos] = React.useState<DiscoverVideo[]>([])
  const [topicLoading, setTopicLoading] = React.useState(isTopicMode)
  const [completedIds, setCompletedIds] = React.useState<string[]>([])
  const [contentById, setContentById] = React.useState<ApiContent | null>(null)
  const [contentByIdLoading, setContentByIdLoading] = React.useState(isContentIdMode)
  const [contentByIdError, setContentByIdError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (courseId) {
      setCompletedIds(getCompletedVideoIds(courseId))
    }
  }, [courseId])

  React.useEffect(() => {
    if (topic) {
      setCompletedIds(getCompletedVideoIdsForTopic(topic))
    }
  }, [topic])

  React.useEffect(() => {
    if (!isContentIdMode || !contentId) return
    setContentByIdLoading(true)
    setContentByIdError(null)
    contentService
      .getById(contentId)
      .then((res) => {
        const raw = res?.data as unknown
        const obj = raw && typeof raw === 'object' ? raw as Record<string, unknown> : undefined
        const inner = obj?.data && typeof obj.data === 'object' ? obj.data as Record<string, unknown> : undefined
        const c = inner?.content ?? obj?.content ?? (obj?.data as ApiContent) ?? null
        setContentById(c as ApiContent)
      })
      .catch(() => {
        setContentByIdError('Video not found')
        setContentById(null)
      })
      .finally(() => setContentByIdLoading(false))
  }, [contentId, isContentIdMode])

  React.useEffect(() => {
    if (!isTopicMode || !topic) return
    setTopicLoading(true)
    contentService
      .discoverByTopic(topic, 12)
      .then((res) => {
        const list = res?.data?.videos ?? []
        setTopicVideos(Array.isArray(list) ? list : [])
      })
      .catch(() => setTopicVideos([]))
      .finally(() => setTopicLoading(false))
  }, [isTopicMode, topic])

  if (isContentIdMode && contentById && !contentByIdLoading) {
    return (
      <ContentIdWatchMode
        content={contentById}
        backHref={fromRoadmapId ? `/roadmap/${fromRoadmapId}` : '/content'}
        backLabel={fromRoadmapId ? 'Back to Roadmap' : 'Back to Content'}
      />
    )
  }

  if (isContentIdMode && contentByIdLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        <p className="text-gray-600">Loading video...</p>
      </div>
    )
  }

  if (isContentIdMode && (contentByIdError || !contentById)) {
    return (
      <StaggerContainer className="space-y-6">
        <StaggerItem>
          <p className="text-gray-600">{contentByIdError ?? 'Video not found'}</p>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/content">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Content Library
            </Link>
          </Button>
        </StaggerItem>
      </StaggerContainer>
    )
  }

  if (isCourseMode && course && courseVideo) {
    return (
      <CourseWatchMode
        courseId={courseId!}
        course={course}
        video={courseVideo}
        videoId={videoId!}
        completedIds={completedIds}
        setCompletedIds={setCompletedIds}
      />
    )
  }

  if (isTopicMode && topic && videoId) {
    return (
      <TopicWatchMode
        topic={topic}
        videoId={videoId}
        topicVideos={topicVideos}
        topicLoading={topicLoading}
        completedIds={completedIds}
        setCompletedIds={setCompletedIds}
      />
    )
  }

  return (
    <StaggerContainer className="space-y-6">
      <StaggerItem>
        <p className="text-gray-600">Video not found</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/content">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Content Library
          </Link>
        </Button>
      </StaggerItem>
    </StaggerContainer>
  )
}

function ContentIdWatchMode({
  content,
  backHref,
  backLabel,
}: {
  content: ApiContent
  backHref: string
  backLabel: string
}) {
  const urlOrId =
    content.content_url ??
    content.contentUrl ??
    content.sourceUrl ??
    (content.external_id || content.externalId
      ? `https://www.youtube.com/watch?v=${content.external_id || content.externalId}`
      : '')
  const durationSec = content.duration_seconds ?? content.durationSeconds ?? 0
  const durationStr = durationSec
    ? `${Math.floor(durationSec / 60)}:${String(durationSec % 60).padStart(2, '0')}`
    : ''

  return (
    <StaggerContainer className="space-y-6" staggerDelay={0.05}>
      <StaggerItem>
        <Button variant="ghost" size="sm" className="mb-2 -ml-2" asChild>
          <Link href={backHref}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel}
          </Link>
        </Button>
      </StaggerItem>
      <StaggerItem>
        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm overflow-hidden">
          {urlOrId ? (
            <VideoEmbed
              urlOrId={urlOrId}
              className="mb-6 rounded-xl overflow-hidden"
              title={content.title}
            />
          ) : (
            <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 mb-6">
              No video available
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-4">{content.title}</h1>
          {durationStr && (
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {durationStr}
            </p>
          )}
        </div>
      </StaggerItem>
    </StaggerContainer>
  )
}

function TopicWatchMode({
  topic,
  videoId,
  topicVideos,
  topicLoading,
  completedIds,
  setCompletedIds,
}: {
  topic: string
  videoId: string
  topicVideos: DiscoverVideo[]
  topicLoading: boolean
  completedIds: string[]
  setCompletedIds: React.Dispatch<React.SetStateAction<string[]>>
}) {
  const router = useRouter()

  if (topicLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-4">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
        <p className="text-gray-600 text-sm sm:text-base">Loading video...</p>
      </div>
    )
  }

  const topicVideo = topicVideos.find((v) => v.id === videoId)
  if (!topicVideo) {
    return (
      <div className="max-w-xl mx-auto px-4 space-y-6">
        <nav>
          <Link
            href="/content"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Content Library
          </Link>
        </nav>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <p className="text-gray-600">Video not found.</p>
        </div>
      </div>
    )
  }

  const videoIndex = topicVideos.findIndex((v) => v.id === videoId)
  const nextVideo = videoIndex >= 0 && videoIndex < topicVideos.length - 1 ? topicVideos[videoIndex + 1] : null
  const unlocked = videoIndex >= 0 && (videoIndex === 0 || isVideoUnlockedForTopic(topicVideos, videoIndex, completedIds))
  const alreadyCompleted = completedIds.includes(videoId)

  const handleMarkComplete = () => {
    markVideoCompletedForTopic(topic, videoId)
    setCompletedIds((prev) => (prev.includes(videoId) ? prev : [...prev, videoId]))
    if (nextVideo) {
      router.push(`/content/watch?topic=${encodeURIComponent(topic)}&videoId=${encodeURIComponent(nextVideo.id)}`)
    } else {
      router.push(`/content/topic/${encodeURIComponent(topic)}`)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      <nav className="px-1">
        <Link
          href={`/content/topic/${encodeURIComponent(topic)}`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 transition-colors py-2 -my-2 rounded-lg touch-manipulation"
        >
          <ArrowLeft className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">Back to {topic}</span>
        </Link>
      </nav>

      <article className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="aspect-video w-full bg-gray-900">
          {unlocked ? (
            <VideoEmbed
              urlOrId={topicVideo.youtubeId}
              className="w-full h-full rounded-none"
              title={topicVideo.title}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 px-6 py-8 bg-gradient-to-b from-gray-800 to-gray-900">
              <div className="rounded-full bg-white/10 p-5">
                <Lock className="w-12 h-12 text-white/80 sm:w-14 sm:h-14" />
              </div>
              <p className="text-white/90 text-center text-sm sm:text-base font-medium max-w-sm">
                Complete the previous video first to unlock this one.
              </p>
              <Link
                href={`/content/topic/${encodeURIComponent(topic)}`}
                className="text-teal-400 hover:text-teal-300 text-sm font-medium underline underline-offset-2"
              >
                Back to course
              </Link>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500 mb-2">
            <span className="font-medium text-teal-600">
              Video {videoIndex + 1} of {topicVideos.length}
            </span>
            <span className="text-gray-300">·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {topicVideo.duration}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-tight">
            {topicVideo.title}
          </h1>

          {unlocked && (
            <div className="mt-6 flex flex-col sm:flex-row sm:flex-wrap gap-3">
              <Button
                onClick={handleMarkComplete}
                className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white h-11 px-5 rounded-xl font-medium shadow-sm touch-manipulation"
              >
                <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                {alreadyCompleted
                  ? nextVideo
                    ? 'Go to next video'
                    : 'Back to course'
                  : `Mark as complete${nextVideo ? ' & go to next' : ''}`}
              </Button>
              {nextVideo && (
                <Button variant="outline" className="w-full sm:w-auto h-11 rounded-xl" asChild>
                  <Link
                    href={`/content/watch?topic=${encodeURIComponent(topic)}&videoId=${encodeURIComponent(nextVideo.id)}`}
                  >
                    Skip to next video
                  </Link>
                </Button>
              )}
              <Button variant="ghost" className="w-full sm:w-auto h-11 rounded-xl text-gray-600" asChild>
                <Link href={`/content/topic/${encodeURIComponent(topic)}`}>Back to course</Link>
              </Button>
            </div>
          )}
        </div>
      </article>
    </div>
  )
}

function CourseWatchMode({
  courseId,
  course,
  video,
  videoId,
  completedIds,
  setCompletedIds,
}: {
  courseId: number
  course: (typeof MOCK_COURSES)[0]
  video: (typeof MOCK_COURSES)[0]['videos'][0]
  videoId: string
  completedIds: string[]
  setCompletedIds: React.Dispatch<React.SetStateAction<string[]>>
}) {
  const router = useRouter()
  const videoIndex = course.videos.findIndex((v) => v.id === videoId)
  const unlocked = videoIndex >= 0 && isVideoUnlocked(course, videoIndex, completedIds)
  const nextVideo = videoIndex >= 0 && videoIndex < course.videos.length - 1 ? course.videos[videoIndex + 1] : null
  const nextUnlocked = nextVideo ? isVideoUnlocked(course, videoIndex + 1, completedIds) : false
  const alreadyCompleted = completedIds.includes(video.id)

  const handleMarkComplete = () => {
    markVideoCompleted(courseId, video.id)
    setCompletedIds((prev) => (prev.includes(video.id) ? prev : [...prev, video.id]))
    if (nextVideo) {
      router.push(`/content/watch?courseId=${courseId}&videoId=${nextVideo.id}`)
    } else {
      router.push(`/content/course/${courseId}`)
    }
  }

  return (
    <StaggerContainer className="space-y-6" staggerDelay={0.05}>
      <StaggerItem>
        <Button variant="ghost" size="sm" className="mb-2 -ml-2" asChild>
          <Link href={`/content/course/${courseId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {course.name}
          </Link>
        </Button>
      </StaggerItem>
      <StaggerItem>
        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm overflow-hidden">
          {!unlocked ? (
            <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
              This video is locked. Complete the previous video first.
            </div>
          ) : video.youtubeId ? (
            <VideoEmbed urlOrId={video.youtubeId} className="mb-6 rounded-xl overflow-hidden" title={video.title} />
          ) : (
            <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 mb-6">
              No video embed
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-4">{video.title}</h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {video.duration}
          </p>
          {unlocked && (
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={handleMarkComplete} className="bg-teal-600 hover:bg-teal-700">
                {alreadyCompleted ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Completed · {nextVideo ? 'Go to next video' : 'Back to course'}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as complete
                    {nextVideo ? ' & go to next' : ''}
                  </>
                )}
              </Button>
              {nextVideo && (
                <Button variant="outline" asChild>
                  <Link href={`/content/watch?courseId=${courseId}&videoId=${nextVideo.id}`}>Skip to next video</Link>
                </Button>
              )}
              <Button variant="ghost" asChild>
                <Link href={`/content/course/${courseId}`}>Back to course</Link>
              </Button>
            </div>
          )}
        </div>
      </StaggerItem>
    </StaggerContainer>
  )
}
