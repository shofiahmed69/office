'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Map,
  Plus,
  Clock,
  Target,
  CheckCircle,
  PlayCircle,
  MoreVertical,
  Calendar,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { StaggerContainer, StaggerItem } from '@/components/motion';
import { roadmapService } from '@/services/roadmap.service';

export interface RoadmapCardItem {
  id: number;
  subject: string;
  learningGoal: string;
  progressPercentage: number;
  status: 'active' | 'paused' | 'completed';
  hoursPerWeek: number;
  estimatedWeeks: number;
  currentModule: string;
  modulesCompleted: number;
  totalModules: number;
  createdAt: string;
  updatedAt: string;
}

function normalizeRoadmap(row: Record<string, unknown>): RoadmapCardItem {
  const subject = (row.subject as string) ?? 'Roadmap';
  const learningGoal = (row.learning_goal as string) ?? (row.learningGoal as string) ?? '';
  const status = ((row.status as string) ?? 'active') as 'active' | 'paused' | 'completed';
  const progressPercentage = Number(row.progress_percentage ?? row.progressPercentage ?? 0);
  const hoursPerWeek = Number(row.hours_per_week ?? row.hoursPerWeek ?? 0);
  const estimatedWeeks = Number(row.estimated_weeks ?? row.estimatedWeeks ?? 0);
  const updatedAt = (row.updated_at as string) ?? (row.updatedAt as string) ?? new Date().toISOString();
  const createdAt = (row.created_at as string) ?? (row.createdAt as string) ?? updatedAt;
  const roadmapData = (row.roadmap_data ?? row.roadmapData) as { modules?: { name?: string; status?: string }[] } | undefined;
  const modules = roadmapData?.modules ?? [];
  const totalModules = modules.length;
  const modulesCompleted = modules.filter((m) => m.status === 'completed').length;
  const nextModule = modules.find((m) => m.status !== 'completed');
  const currentModule = status === 'completed' ? 'Completed' : (nextModule?.name ?? 'Not started');
  return {
    id: Number(row.id),
    subject,
    learningGoal,
    progressPercentage,
    status,
    hoursPerWeek,
    estimatedWeeks,
    currentModule,
    modulesCompleted,
    totalModules,
    createdAt,
    updatedAt,
  };
}

export default function RoadmapPage() {
  const [roadmaps, setRoadmaps] = React.useState<RoadmapCardItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    roadmapService
      .getAll()
      .then((res) => {
        if (cancelled) return;
        const body = res?.data as { data?: { roadmaps?: Record<string, unknown>[] }; roadmaps?: Record<string, unknown>[] } | undefined;
        const list = body?.data?.roadmaps ?? body?.roadmaps ?? [];
        setRoadmaps(Array.isArray(list) ? list.map(normalizeRoadmap) : []);
      })
      .catch(() => {
        if (!cancelled) setRoadmaps([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const activeRoadmaps = roadmaps.filter((r) => r.status === 'active' || r.status === 'paused');
  const completedRoadmaps = roadmaps.filter((r) => r.status === 'completed');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        <p className="text-sm text-gray-500">Loading your roadmaps…</p>
      </div>
    );
  }

  return (
    <StaggerContainer className="space-y-8" staggerDelay={0.1}>
      {/* Header */}
      <StaggerItem className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Learning Roadmap</h1>
          <p className="text-gray-500 font-medium mt-1">Your personalized path to mastery.</p>
        </div>
        <Link href="/roadmap/new">
          <Button className="bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/20 transition-all hover:scale-105 active:scale-95">
            <Plus className="w-4 h-4 mr-2" />
            Create Roadmap
          </Button>
        </Link>
      </StaggerItem>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content: Roadmaps List */}
        <div className="lg:col-span-3 space-y-6">
          <Tabs defaultValue="active" className="w-full">
            <StaggerItem>
              <TabsList className="bg-gray-100/50 border border-gray-200/50 p-1 mb-6 rounded-xl">
                <TabsTrigger value="active" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-teal-700 data-[state=active]:shadow-sm transition-all">
                  Active Paths <Badge variant="secondary" className="ml-2 bg-gray-200 text-gray-600 group-data-[state=active]:bg-teal-50 group-data-[state=active]:text-teal-700">{activeRoadmaps.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="completed" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-teal-700 data-[state=active]:shadow-sm transition-all">
                  Completed <Badge variant="secondary" className="ml-2 bg-gray-200 text-gray-600 group-data-[state=active]:bg-teal-50 group-data-[state=active]:text-teal-700">{completedRoadmaps.length}</Badge>
                </TabsTrigger>
              </TabsList>
            </StaggerItem>

            <TabsContent value="active" className="space-y-4">
              {activeRoadmaps.length === 0 ? (
                <EmptyState
                  icon={<Map className="w-8 h-8" />}
                  title="No active roadmaps"
                  description="Complete an assessment to get a learning roadmap for that subject. Your roadmap will appear here."
                  action={{
                    label: 'Start Assessment',
                    onClick: () => window.location.assign('/assessment/new'),
                  }}
                />
              ) : (
                activeRoadmaps.map((roadmap, i) => (
                  <StaggerItem key={roadmap.id} delay={i * 0.1}>
                    <RoadmapCard roadmap={roadmap} />
                  </StaggerItem>
                ))
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedRoadmaps.length === 0 ? (
                <EmptyState
                  icon={<CheckCircle className="w-8 h-8" />}
                  title="No completed roadmaps yet"
                  description="Keep learning and complete your active paths!"
                />
              ) : (
                completedRoadmaps.map((roadmap, i) => (
                  <StaggerItem key={roadmap.id} delay={i * 0.1}>
                    <RoadmapCard roadmap={roadmap} />
                  </StaggerItem>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar: Summary Stats */}
        <div className="space-y-6">
          <StaggerItem>
            <Card className="border-0 shadow-lg shadow-teal-900/20 bg-gradient-to-br from-teal-900 via-teal-900/95 to-teal-800 text-white overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-base font-bold text-teal-100">Total Progress</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="flex items-end justify-between mb-3">
                  <span className="text-5xl font-bold tracking-tight text-white">
                    {roadmaps.length === 0 ? 0 : Math.round(roadmaps.reduce((s, r) => s + r.progressPercentage, 0) / roadmaps.length)}%
                  </span>
                  <span className="text-sm text-teal-200/80 mb-1.5 font-medium">Avg. completion</span>
                </div>
                <Progress
                  value={roadmaps.length === 0 ? 0 : Math.round(roadmaps.reduce((s, r) => s + r.progressPercentage, 0) / roadmaps.length)}
                  className="h-2 bg-teal-950/50"
                  indicatorClassName="bg-white"
                />
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            <Card className="border border-gray-200/80 shadow-sm hover:shadow-md transition-all group bg-white">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-teal-50 rounded-xl text-teal-600 group-hover:bg-teal-100 transition-colors shrink-0">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 tracking-tight">
                    {roadmaps.reduce((s, r) => s + r.modulesCompleted, 0)}
                  </p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Modules Done</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200/80 shadow-sm hover:shadow-md transition-all group bg-white">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-teal-50 rounded-xl text-teal-600 group-hover:bg-teal-100 transition-colors shrink-0">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 tracking-tight">{completedRoadmaps.length}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Completed</p>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </div>
      </div>
    </StaggerContainer>
  );
}

interface RoadmapCardProps {
  roadmap: RoadmapCardItem;
}

function RoadmapCard({ roadmap }: RoadmapCardProps) {
  return (
    <Card className="border border-gray-200/80 shadow-sm hover:shadow-md hover:border-teal-200/60 transition-all duration-300 group overflow-hidden bg-white">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Main Info */}
          <div className="p-6 flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="space-y-1.5 min-w-0 pr-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className={`text-[10px] font-bold uppercase tracking-wider border-0 ${roadmap.status === 'active' ? 'bg-teal-50 text-teal-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {roadmap.status}
                  </Badge>
                  <span className="text-xs text-gray-300">•</span>
                  <span className="text-xs text-gray-400 font-medium">Updated {new Date(roadmap.updatedAt).toLocaleDateString()}</span>
                </div>
                <Link href={`/roadmap/${roadmap.id}`} className="block">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-teal-700 transition-colors truncate tracking-tight">
                    {roadmap.subject}
                  </h3>
                </Link>
                <p className="text-sm text-gray-500 font-medium line-clamp-1">{roadmap.learningGoal}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900 shrink-0">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-500 font-medium">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                <Target className="w-4 h-4 text-gray-400" />
                <span>{roadmap.modulesCompleted}/{roadmap.totalModules} modules</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{roadmap.hoursPerWeek}h/week</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{roadmap.estimatedWeeks} weeks</span>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="md:w-80 bg-gray-50/50 border-t md:border-t-0 md:border-l border-gray-100 p-6 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-700">Progress</span>
              <span className="text-sm font-bold text-teal-600">{roadmap.progressPercentage}%</span>
            </div>
            <Progress value={roadmap.progressPercentage} className="h-2 mb-5 bg-gray-200" />

            {roadmap.status === 'active' ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-teal-50 text-teal-600 shrink-0">
                    <PlayCircle className="w-3 h-3 fill-current" />
                  </span>
                  <span className="truncate"><span className="font-bold text-gray-900">Next:</span> {roadmap.currentModule}</span>
                </div>
                <Link href={`/roadmap/${roadmap.id}`} className="block">
                  <Button className="w-full bg-teal-600 text-white hover:bg-teal-700 border-0 justify-between group/btn shadow-sm font-bold h-10">
                    Continue Learning
                    <ArrowRight className="w-4 h-4 text-teal-100 group-hover/btn:text-white group-hover/btn:translate-x-0.5 transition-all" />
                  </Button>
                </Link>
              </div>
            ) : (
              <Button variant="outline" className="w-full font-bold bg-gray-50 text-gray-500 border-gray-200 cursor-default hover:bg-gray-50">
                <CheckCircle className="w-4 h-4 mr-2" />
                Completed
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
