'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Play, Clock, Lock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StaggerContainer, StaggerItem } from '@/components/motion'
import {
  MOCK_COURSES,
  getCompletedVideoIds,
  isVideoUnlocked,
  type MockCourse,
  type MockVideo,
} from '@/data/mock-courses'

export default function CoursePage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params?.id)
  const course = MOCK_COURSES.find((c) => c.id === id) ?? null

  const [completedIds, setCompletedIds] = React.useState<string[]>([])

  React.useEffect(() => {
    if (typeof window === 'undefined' || !id) return
    setCompletedIds(getCompletedVideoIds(id))
  }, [id])

  if (!course) {
    return (
      <StaggerContainer className="space-y-6">
        <StaggerItem>
          <p className="text-gray-600">Course not found</p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </StaggerItem>
      </StaggerContainer>
    )
  }

  return (
    <StaggerContainer className="space-y-8" staggerDelay={0.08}>
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
        <div className="rounded-2xl border border-gray-200/80 bg-gradient-to-br from-teal-500 to-cyan-600 p-6 md:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-1">
              {course.name}
            </h1>
            <p className="text-white/90 text-sm md:text-base">
              {course.videos.length} videos · Complete each to unlock the next
            </p>
          </div>
        </div>
      </StaggerItem>

      <StaggerItem>
        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Videos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {course.videos.map((video, index) => (
              <VideoCard
                key={video.id}
                courseId={course.id}
                video={video}
                index={index}
                completedIds={completedIds}
                course={course}
              />
            ))}
          </div>
        </div>
      </StaggerItem>
    </StaggerContainer>
  )
}

function VideoCard({
  courseId,
  video,
  index,
  completedIds,
  course,
}: {
  courseId: number
  video: MockVideo
  index: number
  completedIds: string[]
  course: MockCourse
}) {
  const unlocked = isVideoUnlocked(course, index, completedIds)
  const completed = completedIds.includes(video.id)
  const href = unlocked ? `/content/watch?courseId=${courseId}&videoId=${video.id}` : '#'

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50 group">
      <Link
        href={href}
        onClick={(e) => !unlocked && e.preventDefault()}
        className={`block ${!unlocked ? 'cursor-not-allowed' : ''}`}
      >
        <div className="relative aspect-video bg-gray-200">
          <Image
            src={video.thumbnail}
            alt=""
            width={320}
            height={180}
            className="w-full h-full object-cover"
            unoptimized
          />
          {!unlocked && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Lock className="w-10 h-10 text-white" />
            </div>
          )}
          {unlocked && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                <Play className="w-5 h-5 text-teal-600 ml-0.5" fill="currentColor" />
              </div>
            </div>
          )}
          {completed && (
            <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          )}
          {!unlocked && (
            <span className="absolute bottom-2 left-2 text-xs font-bold text-white bg-black/60 px-2 py-1 rounded">
              Complete previous video to unlock
            </span>
          )}
        </div>
        <div className="p-3">
          <p className="font-semibold text-gray-900 text-sm line-clamp-2">
            {index + 1}. {video.title}
          </p>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {video.duration}
          </p>
        </div>
      </Link>
    </div>
  )
}
