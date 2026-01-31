'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowRight,
  Clock,
  Target,
  CheckCircle,
  Circle,
  PlayCircle,
  Play,
  ChevronDown,
  ChevronRight,
  Video,
  Lock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/layouts/PageHeader';
import { roadmapService, type RoadmapModule, type SubContent } from '@/services/roadmap.service';

interface NormalizedModule extends RoadmapModule {
  topics: string[];
  subContents?: SubContent[];
}

interface NormalizedRoadmap {
  id: number;
  subject: string;
  learningGoal: string;
  progressPercentage: number;
  status: string;
  hoursPerWeek: number;
  estimatedWeeks: number;
  createdAt: string;
  modules: NormalizedModule[];
}

function normalizeRoadmapRow(row: Record<string, unknown>): NormalizedRoadmap | null {
  if (!row?.id) return null;
  const roadmapData = (row.roadmap_data ?? row.roadmapData) as { modules?: NormalizedModule[] } | undefined;
  const modules = roadmapData?.modules ?? [];
  const normalizedModules: NormalizedModule[] = modules.map((m: Record<string, unknown>) => ({
    id: Number(m.id),
    roadmapId: Number(row.id),
    moduleName: (m.name as string) ?? (m.moduleName as string) ?? 'Module',
    moduleDescription: (m.description as string) ?? (m.moduleDescription as string),
    topics: Array.isArray(m.topics) ? (m.topics as string[]) : [],
    estimatedHours: Number(m.estimatedHours ?? m.estimated_hours ?? 0),
    status: ((m.status as string) ?? 'not_started') as RoadmapModule['status'],
    completedAt: m.completedAt as string | undefined,
    subContents: Array.isArray(m.subContents) ? (m.subContents as SubContent[]) : [],
  }));
  return {
    id: Number(row.id),
    subject: (row.subject as string) ?? 'Roadmap',
    learningGoal: (row.learning_goal as string) ?? (row.learningGoal as string) ?? '',
    progressPercentage: Number(row.progress_percentage ?? row.progressPercentage ?? 0),
    status: (row.status as string) ?? 'active',
    hoursPerWeek: Number(row.hours_per_week ?? row.hoursPerWeek ?? 0),
    estimatedWeeks: Number(row.estimated_weeks ?? row.estimatedWeeks ?? 0),
    createdAt: (row.created_at as string) ?? (row.updated_at as string) ?? '',
    modules: normalizedModules,
  };
}

const statusStyles = {
  completed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
  in_progress: { bg: 'bg-teal-100', text: 'text-teal-700', icon: PlayCircle },
  not_started: { bg: 'bg-gray-100', text: 'text-gray-500', icon: Circle },
};

export default function RoadmapDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const roadmapId = id ? parseInt(id, 10) : NaN;

  const [roadmap, setRoadmap] = React.useState<NormalizedRoadmap | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [expandedModules, setExpandedModules] = React.useState<number[]>([]);

  React.useEffect(() => {
    if (!id || !Number.isInteger(roadmapId)) {
      setLoading(false);
      setError('Invalid roadmap');
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
        const normalized = raw ? normalizeRoadmapRow(raw as Record<string, unknown>) : null;
        if (normalized) {
          setRoadmap(normalized);
          const firstIncomplete = normalized.modules.find((m) => m.status !== 'completed');
          if (firstIncomplete) setExpandedModules([firstIncomplete.id]);
          else if (normalized.modules.length > 0) setExpandedModules([normalized.modules[0].id]);
        } else {
          setError('Roadmap not found');
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.error ?? err.message ?? 'Failed to load roadmap');
          setRoadmap(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id, roadmapId]);

  const toggleModule = (moduleId: number) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 px-4 sm:px-6">
        <PageHeader
          title="Loading…"
          description=""
          breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Roadmaps', href: '/roadmap' }]}
        />
        <div className="flex items-center justify-center py-12 text-gray-500 text-sm sm:text-base">Loading roadmap…</div>
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="space-y-6 px-4 sm:px-6">
        <PageHeader
          title="Roadmap"
          description=""
          breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Roadmaps', href: '/roadmap' }]}
        />
        <Card>
          <CardContent className="p-6 sm:p-8 text-center">
            <p className="text-gray-600 text-sm sm:text-base mb-4">{error ?? 'Roadmap not found.'}</p>
            <Link href="/roadmap" className="inline-block">
              <Button variant="outline" className="w-full sm:w-auto min-h-[44px]">Back to Roadmaps</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedModules = roadmap.modules.filter((m) => m.status === 'completed').length;
  const totalTopics = roadmap.modules.reduce((acc, m) => acc + m.topics.length, 0);
  const currentModule = roadmap.modules.find((m) => m.status === 'in_progress') ?? roadmap.modules.find((m) => m.status !== 'completed');

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-8">
      <PageHeader
        title={roadmap.subject}
        description={roadmap.learningGoal}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Roadmaps', href: '/roadmap' },
          { label: roadmap.subject },
        ]}
        actions={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Link href={`/content?subject=${encodeURIComponent(roadmap.subject)}`} className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto min-h-[44px] touch-manipulation">Browse content</Button>
            </Link>
            <Link href={currentModule ? `#module-${currentModule.id}` : '/content'} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto min-h-[44px] touch-manipulation">Continue Learning</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="sm:col-span-2">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">Overall Progress</h3>
              <Badge variant="primary">{roadmap.progressPercentage}%</Badge>
            </div>
            <Progress value={roadmap.progressPercentage} size="lg" className="mb-3 sm:mb-4" />
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-500">
              <span>{totalTopics} topics across modules</span>
              <span>{completedModules} of {roadmap.modules.length} modules</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-50 rounded-lg shrink-0">
                <Clock className="w-5 h-5 text-teal-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-500">Time Commitment</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900 truncate">{roadmap.hoursPerWeek}h/week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-500">Est. Completion</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900 truncate">{roadmap.estimatedWeeks} weeks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-3">
          <CardTitle className="text-base sm:text-lg">Learning Modules</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Complete each module to progress. Explore content by topic below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
          {roadmap.modules.map((module, index) => {
            const isExpanded = expandedModules.includes(module.id);
            const style = statusStyles[module.status] ?? statusStyles.not_started;
            const StatusIcon = style.icon;
            const moduleName = module.moduleName ?? `Module ${index + 1}`;
            const moduleDesc = module.moduleDescription ?? '';
            const isUnlocked = index === 0 || roadmap.modules[index - 1]?.status === 'completed';
            const sortedVideos = (module.subContents ?? []).slice().sort((a, b) => a.sequenceOrder - b.sequenceOrder);
            const firstVideo = sortedVideos[0];
            const thumbnailUrl = firstVideo?.thumbnailUrl;
            const firstVideoHref = firstVideo
              ? `/content/watch?contentId=${firstVideo.contentId}&fromRoadmap=${roadmap.id}`
              : null;

            return (
              <div
                key={module.id}
                id={`module-${module.id}`}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                <div className="flex items-stretch min-h-[72px] sm:min-h-0">
                  <div
                    className={`relative w-24 sm:w-32 md:w-40 shrink-0 aspect-video bg-gray-100 ${!isUnlocked ? 'opacity-60' : ''}`}
                  >
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center">
                        <Play className="w-8 h-8 sm:w-10 sm:h-10 text-teal-500" />
                      </div>
                    )}
                    {isUnlocked && firstVideoHref ? (
                      <Link
                        href={firstVideoHref}
                        className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 active:bg-black/40 transition-colors group touch-manipulation"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="rounded-full bg-white/95 p-2 sm:p-3 shadow-lg group-hover:scale-110 group-active:scale-105 transition-transform">
                          <Play className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 ml-0.5" />
                        </div>
                      </Link>
                    ) : (
                      !isUnlocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/40">
                          <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                      )
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleModule(module.id)}
                    className="flex-1 p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-4 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left min-w-0 min-h-[44px] touch-manipulation"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className={`p-1.5 sm:p-2 rounded-lg shrink-0 ${style.bg}`}>
                        <StatusIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${style.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <h4 className="font-medium text-gray-900 truncate text-sm sm:text-base">
                            {index + 1}. {moduleName}
                          </h4>
                          <Badge
                            variant={module.status === 'completed' ? 'success' : module.status === 'in_progress' ? 'primary' : 'default'}
                            size="sm"
                          >
                            {module.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        {moduleDesc && <p className="text-xs sm:text-sm text-gray-500 truncate">{moduleDesc}</p>}
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                          {sortedVideos.length} videos
                          {module.estimatedHours > 0 && ` · ~${module.estimatedHours}h`}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400 shrink-0 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400 shrink-0 flex-shrink-0" />
                      )}
                    </div>
                    {!isUnlocked && (
                      <span className="text-xs text-gray-500 shrink-0 hidden sm:inline">
                        Complete previous to unlock
                      </span>
                    )}
                  </button>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 p-3 sm:p-4 bg-gray-50 space-y-3 sm:space-y-4">
                    {module.subContents && module.subContents.length > 0 && (
                      <div>
                        <h5 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Learning content (videos)</h5>
                        <div className="space-y-1.5 sm:space-y-2">
                          {module.subContents
                            .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
                            .map((item) => {
                              const duration =
                                item.durationMinutes != null
                                  ? `${item.durationMinutes} min`
                                  : item.durationSeconds != null
                                    ? `${Math.round(item.durationSeconds / 60)} min`
                                    : ''
                              return (
                                <Link
                                  key={item.contentId}
                                  href={`/content/watch?contentId=${item.contentId}&fromRoadmap=${roadmap.id}`}
                                  className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-white hover:bg-teal-50 active:bg-teal-100 transition-colors group border border-gray-100 min-h-[44px] touch-manipulation"
                                  style={{ WebkitTapHighlightColor: 'transparent' }}
                                >
                                  <div className="p-1.5 sm:p-2 bg-teal-50 rounded-lg group-hover:bg-teal-100 transition-colors shrink-0">
                                    <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-teal-700 truncate">
                                      {item.title}
                                    </p>
                                    {duration && (
                                      <p className="text-[10px] sm:text-xs text-gray-500">{item.type === 'video' ? 'Video' : item.type} · {duration}</p>
                                    )}
                                  </div>
                                  <span className="text-[10px] sm:text-xs text-teal-600 font-medium shrink-0">Watch &rarr;</span>
                                </Link>
                              )
                            })}
                        </div>
                      </div>
                    )}
                    <div>
                      <h5 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Topics (unlock in order)</h5>
                      <div className="space-y-1.5 sm:space-y-2">
                        {module.topics.length === 0 ? (
                          <p className="text-xs sm:text-sm text-gray-500">No topics defined for this module.</p>
                        ) : (
                          module.topics.map((topicName, topicIndex) => {
                            const topicUnlocked = index === 0 && topicIndex === 0;
                            const thumb = (
                              <div
                                className={`relative w-20 sm:w-24 md:w-28 shrink-0 aspect-video rounded-lg overflow-hidden bg-gray-100 ${!topicUnlocked ? 'opacity-60' : ''}`}
                              >
                                <div className="absolute inset-0 bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center">
                                  <Video className="w-6 h-6 sm:w-8 sm:h-8 text-teal-500" />
                                </div>
                                {topicUnlocked && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                                    <div className="rounded-full bg-white/90 p-1.5 sm:p-2">
                                      <Play className="w-3 h-3 sm:w-4 sm:h-4 text-teal-600 ml-0.5" />
                                    </div>
                                  </div>
                                )}
                                {!topicUnlocked && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/40">
                                    <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                  </div>
                                )}
                              </div>
                            );
                            return topicUnlocked ? (
                              <Link
                                key={`${module.id}-${topicIndex}`}
                                href={`/content/topic/${encodeURIComponent(topicName)}`}
                                className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-white border border-gray-100 hover:bg-teal-50 hover:border-teal-200 active:bg-teal-100 transition-colors group min-h-[44px] touch-manipulation"
                                style={{ WebkitTapHighlightColor: 'transparent' }}
                              >
                                {thumb}
                                <span className="flex-1 text-xs sm:text-sm font-medium text-gray-900 group-hover:text-teal-700 truncate min-w-0">
                                  {topicName}
                                </span>
                                <span className="inline-flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-medium text-teal-600 shrink-0 group-hover:text-teal-700 group-hover:translate-x-0.5 transition-all">
                                  <span>Explore</span>
                                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </span>
                              </Link>
                            ) : (
                              <div
                                key={`${module.id}-${topicIndex}`}
                                className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-gray-50 border border-gray-100 opacity-80 min-h-[44px]"
                              >
                                {thumb}
                                <span className="flex-1 text-xs sm:text-sm font-medium text-gray-500 truncate min-w-0">{topicName}</span>
                                <span className="text-[10px] sm:text-xs text-gray-500 shrink-0 hidden sm:inline">Complete previous to unlock</span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
