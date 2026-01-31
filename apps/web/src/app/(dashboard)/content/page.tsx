'use client';

import * as React from 'react';
import Link from 'next/link';
import { BookOpen, Map, PlayCircle, Clock, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StaggerContainer, StaggerItem } from '@/components/motion';
import { roadmapService } from '@/services/roadmap.service';
import { Badge } from '@/components/ui/badge';

interface RoadmapCourse {
  id: number;
  subject: string;
  learningGoal: string;
  modulesCount: number;
  totalVideos: number;
  progressPercentage: number;
}

export default function ContentPage() {
  const [roadmapCourses, setRoadmapCourses] = React.useState<RoadmapCourse[]>([]);
  const [roadmapLoading, setRoadmapLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    roadmapService
      .getAll()
      .then((res) => {
        if (cancelled) return;
        const body = res?.data as Record<string, unknown> | undefined;
        const list = (body?.data as Record<string, unknown>)?.roadmaps ?? body?.roadmaps ?? [];
        const courses: RoadmapCourse[] = (list as Record<string, unknown>[]).map((row) => {
          const roadmapData = (row.roadmap_data ?? row.roadmapData) as { modules?: { subContents?: unknown[] }[] } | undefined;
          const modules = roadmapData?.modules ?? [];
          const totalVideos = modules.reduce((s, m) => s + (m.subContents?.length ?? 0), 0);
          return {
            id: Number(row.id),
            subject: (row.subject as string) ?? 'Course',
            learningGoal: (row.learning_goal as string) ?? (row.learningGoal as string) ?? '',
            modulesCount: modules.length,
            totalVideos,
            progressPercentage: Number(row.progress_percentage ?? row.progressPercentage ?? 0),
          };
        });
        setRoadmapCourses(courses);
      })
      .catch(() => setRoadmapCourses([]))
      .finally(() => {
        if (!cancelled) setRoadmapLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <StaggerContainer className="space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" staggerDelay={0.1}>
      {/* Header Section */}
      <StaggerItem className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Content <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">Library</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
            Expand your knowledge with curated courses and AI-powered video discovery.
          </p>
        </div>
      </StaggerItem>

      {/* My Courses Section (course topics only) */}
      <StaggerItem className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-teal-100 p-2 rounded-lg">
            <Map className="w-6 h-6 text-teal-700" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Learning Path</h2>
            <p className="text-gray-500">Continue where you left off</p>
          </div>
        </div>

        {roadmapLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-xl bg-teal-50/80 animate-pulse border border-teal-100" />
            ))}
          </div>
        ) : roadmapCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roadmapCourses.map((course, i) => (
              <StaggerItem key={course.id} delay={i * 0.05}>
                <Link href={`/content/course/roadmap/${course.id}`} className="block h-full group">
                  <Card className="h-full overflow-hidden border border-teal-100 bg-white hover:border-teal-300 hover:shadow-lg hover:shadow-teal-500/10 transition-all duration-300 flex flex-col">
                    {/* Card Header (Visual) - teal & white */}
                    <div className="relative h-32 bg-gradient-to-br from-teal-50 via-white to-cyan-50 p-6 flex flex-col justify-between overflow-hidden border-b border-teal-100">
                      <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(20,184,166,0.06)_50%,transparent_60%)] bg-[length:200%_200%] group-hover:animate-shine pointer-events-none" />
                      <div className="absolute top-0 right-0 p-4 opacity-20">
                        <Trophy className="w-24 h-24 text-teal-400 transform rotate-12" />
                      </div>

                      <div className="relative z-10 flex justify-between items-start">
                        <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-200/80 border-0 font-medium">
                          Course
                        </Badge>
                        <div className="bg-teal-500 p-2 rounded-full text-white transform group-hover:scale-110 transition-transform shadow-sm">
                          <PlayCircle className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-6 flex-1 flex flex-col gap-4 bg-white">
                      <div className="flex-1 space-y-2">
                        <h3 className="font-bold text-xl text-gray-900 group-hover:text-teal-700 transition-colors line-clamp-1">
                          {course.subject}
                        </h3>
                        {course.learningGoal && (
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                            {course.learningGoal}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3 pt-4 border-t border-teal-50">
                        <div className="flex items-center justify-between text-xs font-medium text-gray-600">
                          <div className="flex items-center gap-1.5 text-teal-600">
                            <BookOpen className="w-3.5 h-3.5" />
                            {course.modulesCount} Modules
                          </div>
                          <div className="flex items-center gap-1.5 text-teal-600">
                            <Clock className="w-3.5 h-3.5" />
                            {course.totalVideos} Videos
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-teal-700">{course.progressPercentage}% Complete</span>
                          </div>
                          <div className="h-2 w-full bg-teal-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full transition-all duration-500"
                              style={{ width: `${course.progressPercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </StaggerItem>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-2">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No courses yet</h3>
              <p className="text-gray-500 max-w-sm">
                Complete an assessment to generate your personalized learning roadmap. It will appear here as a structured course.
              </p>
              <Button asChild variant="outline" className="mt-4 border-teal-200 text-teal-700 hover:text-teal-800 hover:bg-teal-50">
                <Link href="/assessment">
                  Take Assessment
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </StaggerItem>
    </StaggerContainer>
  );
}
