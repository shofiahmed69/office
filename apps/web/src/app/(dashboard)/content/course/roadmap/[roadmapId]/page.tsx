'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Play, Clock, CheckCircle, Video, ChevronDown, ChevronRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { roadmapService, type RoadmapModule, type SubContent } from '@/services/roadmap.service';

interface NormalizedModule extends RoadmapModule {
  moduleName?: string;
  moduleDescription?: string;
  topics: string[];
  subContents?: SubContent[];
}

interface NormalizedRoadmap {
  id: number;
  subject: string;
  learningGoal: string;
  progressPercentage: number;
  modules: NormalizedModule[];
}

function normalizeRoadmap(row: Record<string, unknown>): NormalizedRoadmap | null {
  if (!row?.id) return null;
  const roadmapData = (row.roadmap_data ?? row.roadmapData) as { modules?: Record<string, unknown>[] } | undefined;
  const modules = roadmapData?.modules ?? [];
  const normalized: NormalizedModule[] = modules.map((m: Record<string, unknown>) => ({
    id: Number(m.id),
    roadmapId: Number(row.id),
    moduleName: (m.name as string) ?? (m.moduleName as string) ?? 'Module',
    moduleDescription: (m.description as string) ?? (m.moduleDescription as string),
    topics: Array.isArray(m.topics) ? (m.topics as string[]) : [],
    estimatedHours: Number(m.estimatedHours ?? m.estimated_hours ?? 0),
    status: ((m.status as string) ?? 'not_started') as RoadmapModule['status'],
    subContents: Array.isArray(m.subContents) ? (m.subContents as SubContent[]) : [],
  }));
  return {
    id: Number(row.id),
    subject: (row.subject as string) ?? 'Course',
    learningGoal: (row.learning_goal as string) ?? (row.learningGoal as string) ?? '',
    progressPercentage: Number(row.progress_percentage ?? row.progressPercentage ?? 0),
    modules: normalized,
  };
}

function formatDuration(item: SubContent): string {
  if (item.durationMinutes != null) return `${item.durationMinutes} min`;
  if (item.durationSeconds != null) return `${Math.round(item.durationSeconds / 60)} min`;
  return '';
}

export default function RoadmapCoursePage() {
  const params = useParams();
  const roadmapId = params?.roadmapId ? parseInt(params.roadmapId as string, 10) : NaN;
  const [roadmap, setRoadmap] = React.useState<NormalizedRoadmap | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [expandedModules, setExpandedModules] = React.useState<number[]>([]);

  React.useEffect(() => {
    if (!Number.isInteger(roadmapId)) {
      setLoading(false);
      setError('Invalid course');
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    roadmapService
      .getById(roadmapId)
      .then((res) => {
        if (cancelled) return;
        const raw = (res.data as { data?: { roadmap?: Record<string, unknown> }; roadmap?: Record<string, unknown> }).data?.roadmap
          ?? (res.data as { roadmap?: Record<string, unknown> }).roadmap;
        const normalized = raw ? normalizeRoadmap(raw as Record<string, unknown>) : null;
        setRoadmap(normalized ?? null);
        if (normalized?.modules?.length) setExpandedModules([normalized.modules[0].id]);
      })
      .catch(() => {
        if (!cancelled) setError('Course not found');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [roadmapId]);

  const toggleModule = (moduleId: number) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  };

  const totalVideos = roadmap?.modules?.reduce((s, m) => s + (m.subContents?.length ?? 0), 0) ?? 0;

  const getFirstVideoThumbnail = (module: NormalizedModule): string | undefined => {
    const sorted = (module.subContents ?? []).slice().sort((a, b) => a.sequenceOrder - b.sequenceOrder);
    return sorted[0]?.thumbnailUrl;
  };

  const getFirstVideoLink = (module: NormalizedModule): string | null => {
    const sorted = (module.subContents ?? []).slice().sort((a, b) => a.sequenceOrder - b.sequenceOrder);
    const first = sorted[0];
    return first ? `/content/watch?contentId=${first.contentId}&fromRoadmap=${course.id}` : null;
  };

  const backLink = (
    <Link
      href="/content"
      className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 -ml-2"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Content Library
    </Link>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        {backLink}
        <p className="text-gray-500">Loading course…</p>
      </div>
    );
  }

  if (error || roadmap === null) {
    return (
      <div className="space-y-6">
        {backLink}
        <p className="text-gray-600">{error ?? 'Course not found.'}</p>
      </div>
    );
  }

  const course = roadmap;

  const mainContent = React.createElement(
    'div',
    { className: 'space-y-8' },
    backLink,
    React.createElement(
      'div',
      {
        className:
          'rounded-2xl border border-gray-200/80 bg-gradient-to-br from-teal-500 to-cyan-600 p-6 md:p-8 shadow-sm relative overflow-hidden',
      },
      React.createElement('div', {
        className: "absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none",
      }),
      React.createElement(
        'div',
        { className: 'relative z-10' },
        React.createElement('h1', { className: 'text-2xl md:text-3xl font-bold text-white tracking-tight mb-1' }, course.subject),
        React.createElement('p', { className: 'text-white/90 text-sm md:text-base mb-3' }, `${course.modules.length} modules · ${totalVideos} videos · From your roadmap`),
        course.learningGoal && React.createElement('p', { className: 'text-white/80 text-sm max-w-2xl' }, course.learningGoal),
        React.createElement(
          'div',
          { className: 'mt-4 flex items-center gap-4' },
          React.createElement(Progress, { value: course.progressPercentage, className: 'w-48 h-2 bg-white/30' }),
          React.createElement('span', { className: 'text-sm font-medium text-white' }, `${course.progressPercentage}% complete`)
        )
      )
    ),
    React.createElement(
      'div',
      { className: 'space-y-4' },
      React.createElement('h2', { className: 'text-xl font-bold text-gray-900' }, 'Course content'),
      React.createElement('p', { className: 'text-sm text-gray-500' }, 'Each module contains videos and topics. Complete videos to track progress.'),
      course.modules.map((module, index) => {
        const isExpanded = expandedModules.includes(module.id);
        const name = module.moduleName ?? module.name ?? `Module ${index + 1}`;
        const videos = (module.subContents ?? []).sort((a, b) => a.sequenceOrder - b.sequenceOrder);
        const isUnlocked = index === 0 || (course.modules[index - 1]?.status === 'completed');
        const thumbnailUrl = getFirstVideoThumbnail(module);
        const firstVideoLink = getFirstVideoLink(module);
        return React.createElement(
          Card,
          { key: module.id, className: 'overflow-hidden border border-gray-200/80 shadow-sm' },
          React.createElement(
            'div',
            { className: 'flex items-stretch' },
            React.createElement(
              'div',
              { className: `relative w-32 sm:w-40 shrink-0 aspect-video bg-gray-100 ${!isUnlocked ? 'opacity-60' : ''}` },
              thumbnailUrl
                ? React.createElement('img', { src: thumbnailUrl, alt: '', className: 'absolute inset-0 w-full h-full object-cover' })
                : React.createElement('div', { className: 'absolute inset-0 bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center' }, React.createElement(Play, { className: 'w-10 h-10 text-teal-500' })),
              isUnlocked && firstVideoLink
                ? React.createElement(
                    Link,
                    {
                      href: firstVideoLink,
                      className: 'absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group',
                      onClick: (e: React.MouseEvent) => e.stopPropagation(),
                    },
                    React.createElement('div', { className: 'rounded-full bg-white/95 p-3 shadow-lg group-hover:scale-110 transition-transform' }, React.createElement(Play, { className: 'w-6 h-6 text-teal-600 ml-0.5' }))
                  )
                : !isUnlocked && React.createElement('div', { className: 'absolute inset-0 flex items-center justify-center bg-gray-900/40' }, React.createElement(Lock, { className: 'w-8 h-8 text-white' }))
            ),
            React.createElement(
              'button',
              {
                type: 'button',
                onClick: () => toggleModule(module.id),
                className: 'flex-1 p-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors text-left min-w-0',
              },
              React.createElement('div', { className: 'flex items-center gap-3 min-w-0 flex-1' }, React.createElement('div', { className: 'flex-1 min-w-0' }, React.createElement('h3', { className: 'font-semibold text-gray-900 truncate' }, `${index + 1}. ${name}`), module.moduleDescription && React.createElement('p', { className: 'text-sm text-gray-500 mt-0.5 line-clamp-2' }, module.moduleDescription), React.createElement('p', { className: 'text-xs text-gray-500 mt-1' }, `${videos.length} videos`)), isExpanded ? React.createElement(ChevronDown, { className: 'w-5 h-5 text-gray-500 shrink-0' }) : React.createElement(ChevronRight, { className: 'w-5 h-5 text-gray-500 shrink-0' })),
              !isUnlocked && React.createElement('span', { className: 'text-xs text-gray-500 shrink-0 hidden sm:inline' }, 'Complete previous to unlock')
            )
          ),
          isExpanded &&
            React.createElement(
              CardContent,
              { className: 'pt-0 pb-4 px-4 border-t border-gray-100' },
              module.moduleDescription && React.createElement('p', { className: 'text-sm text-gray-600 mb-4' }, module.moduleDescription),
              videos.length > 0 &&
                React.createElement(
                  'div',
                  { className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4' },
                  videos.map((item) =>
                    React.createElement(
                      Link,
                      {
                        key: item.contentId,
                        href: `/content/watch?contentId=${item.contentId}&fromRoadmap=${course.id}`,
                        className: 'flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-teal-50 hover:border-teal-200 transition-colors group',
                      },
                      React.createElement('div', { className: 'p-2 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors shrink-0' }, React.createElement(Play, { className: 'w-4 h-4 text-teal-600' })),
                      React.createElement('div', { className: 'flex-1 min-w-0' }, React.createElement('p', { className: 'text-sm font-medium text-gray-900 group-hover:text-teal-700 truncate' }, item.title), React.createElement('p', { className: 'text-xs text-gray-500 flex items-center gap-1' }, React.createElement(Video, { className: 'w-3 h-3' }), formatDuration(item))),
                      React.createElement(CheckCircle, { className: 'w-4 h-4 text-gray-300 shrink-0' })
                    )
                  )
                ),
              module.topics.length > 0 &&
                React.createElement(
                  'div',
                  null,
                  React.createElement('p', { className: 'text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2' }, 'Topics (unlock in order)'),
                  React.createElement(
                    'div',
                    { className: 'space-y-2' },
                    module.topics.map((topicName, i) => {
                      const topicIsUnlocked = index === 0 && i === 0;
                      const thumb = React.createElement(
                        'div',
                        { className: `relative w-24 sm:w-28 shrink-0 aspect-video rounded-lg overflow-hidden bg-gray-100 ${!topicIsUnlocked ? 'opacity-60' : ''}` },
                        React.createElement('div', { className: 'absolute inset-0 bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center' }, React.createElement(Video, { className: 'w-8 h-8 text-teal-500' })),
                        topicIsUnlocked && React.createElement('div', { className: 'absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors' }, React.createElement('div', { className: 'rounded-full bg-white/90 p-2' }, React.createElement(Play, { className: 'w-4 h-4 text-teal-600 ml-0.5' }))),
                        !topicIsUnlocked && React.createElement('div', { className: 'absolute inset-0 flex items-center justify-center bg-gray-900/40' }, React.createElement(Lock, { className: 'w-5 h-5 text-white' }))
                      );
                      return topicIsUnlocked
                        ? React.createElement(
                            Link,
                            {
                              key: `${module.id}-t-${i}`,
                              href: `/content/topic/${encodeURIComponent(topicName)}`,
                              className: 'flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-100 hover:bg-teal-50 hover:border-teal-200 transition-colors group',
                            },
                            thumb,
                            React.createElement('div', { className: 'flex-1 min-w-0 flex items-center gap-3' }, React.createElement('span', { className: 'flex-1 text-sm font-medium text-gray-900 group-hover:text-teal-700 truncate' }, topicName), React.createElement('span', { className: 'inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 shrink-0 group-hover:text-teal-700 transition-all' }, 'Explore', React.createElement(ArrowRight, { className: 'w-4 h-4' })))
                          )
                        : React.createElement(
                            'div',
                            {
                              key: `${module.id}-t-${i}`,
                              className: 'flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100 opacity-80',
                            },
                            thumb,
                            React.createElement('div', { className: 'flex-1 min-w-0 flex items-center gap-3' }, React.createElement('span', { className: 'flex-1 text-sm font-medium text-gray-500 truncate' }, topicName), React.createElement('span', { className: 'text-xs text-gray-500 shrink-0' }, 'Complete previous to unlock'))
                          );
                    })
                  )
                )
            )
        );
      })
    )
  );

  return mainContent;
}
