'use client'

import * as React from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Clock, BookOpen, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VideoEmbed } from '@/components/ui/video-embed'
import { contentService } from '@/services/content.service'
import { StaggerContainer, StaggerItem } from '@/components/motion'
import type { Content } from '@/services/content.service'

export default function ContentWatchPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [content, setContent] = React.useState<Content | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!id) {
      setError('Invalid content ID')
      setLoading(false)
      return
    }
    
    // Try numeric ID for API call
    const numericId = Number(id)
    if (!Number.isNaN(numericId)) {
      contentService
        .getById(numericId)
        .then((res: any) => {
          const c = res?.data?.content ?? res?.content ?? res?.data
          if (c) setContent(c)
          else setError('Content not found')
        })
        .catch(() => setError('Content not found'))
        .finally(() => setLoading(false))
    } else {
      setError('Content not found')
      setLoading(false)
    }
  }, [id])

  const videoUrl = content
    ? (content as any).content_url ?? (content as any).contentUrl ?? content.sourceUrl
    : ''

  const isVideo = !!(videoUrl && (videoUrl.includes('youtube') || videoUrl.includes('youtu.be')))

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    )
  }

  if (error || !content) {
    return (
      <StaggerContainer className="space-y-6">
        <StaggerItem>
          <p className="text-gray-600">{error ?? 'Content not found'}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </StaggerItem>
      </StaggerContainer>
    )
  }

  return (
    <StaggerContainer className="space-y-6">
      <StaggerItem>
        <Link
          href="/content"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-2 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Content Library
        </Link>
      </StaggerItem>

      <StaggerItem>
        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
          {isVideo ? (
            <VideoEmbed
              urlOrId={videoUrl}
              className="mb-6"
              title={content.title}
            />
          ) : (
            <div className="mb-6 flex aspect-video items-center justify-center rounded-xl bg-gray-100 text-gray-500">
              {videoUrl ? (
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Open in new tab
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : (
                <span>No video URL</span>
              )}
            </div>
          )}

          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {content.title}
          </h1>
          {(content.description || (content as any).description) && (
            <p className="mt-2 text-gray-600 leading-relaxed">
              {(content as any).description ?? content.description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            {(content as any).duration_seconds != null && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {Math.round((content as any).duration_seconds / 60)} min
              </span>
            )}
            {content.durationMinutes != null && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {content.durationMinutes} min
              </span>
            )}
            {(content.sourceName || (content as any).source_name) && (
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                {content.sourceName ?? (content as any).source_name}
              </span>
            )}
          </div>

          {content.topics?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {content.topics.map((topic: string, i: number) => (
                <span
                  key={i}
                  className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>
      </StaggerItem>
    </StaggerContainer>
  )
}
