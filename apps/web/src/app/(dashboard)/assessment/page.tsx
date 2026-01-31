'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ClipboardCheck,
  Clock,
  TrendingUp,
  ChevronRight,
  BookOpen,
  Award,
  BarChart,
  ArrowUpRight,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/components/ui/empty-state';
import { SUBJECTS, SUBJECT_TOPICS } from '@/types';
import { StaggerContainer, StaggerItem } from '@/components/motion';
import { assessmentService } from '@/services/assessment.service';

export default function AssessmentPage() {
  const [assessments, setAssessments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({
    averageScore: 0,
    totalAssessments: 0,
    growth: 0,
  });

  React.useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      const res = await assessmentService.getHistory();
      
      const raw = res?.data as unknown
      const fromData = raw && typeof raw === 'object' && 'data' in raw ? (raw as { data: { assessments?: unknown[] } }).data?.assessments : null
      const fromAssessments = raw && typeof raw === 'object' && 'assessments' in raw ? (raw as { assessments: unknown[] }).assessments : null
      const fromDataArray = raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data: unknown }).data) ? (raw as { data: unknown[] }).data : null
      const data = Array.isArray(fromData) ? fromData : Array.isArray(fromAssessments) ? fromAssessments : Array.isArray(fromDataArray) ? fromDataArray : []
      setAssessments(data)

      // Calculate stats
      if (data.length > 0) {
        const typed = data as { correctAnswers?: number; questionsAnswered?: number }[]
        const avgScore = Math.round(
          typed.reduce((sum: number, a) => {
            const total = a.questionsAnswered || 1
            const score = ((a.correctAnswers ?? 0) / total) * 100
            return sum + score
          }, 0) / data.length
        )
        let growth = 0
        if (data.length >= 2) {
          const a0 = typed[0]
          const a1 = typed[1]
          const latest = ((a0?.correctAnswers ?? 0) / (a0?.questionsAnswered || 1)) * 100
          const previous = ((a1?.correctAnswers ?? 0) / (a1?.questionsAnswered || 1)) * 100
          growth = Math.round(latest - previous)
        }

        setStats({
          averageScore: avgScore,
          totalAssessments: data.length,
          growth,
        });
      }
    } catch (err) {
      console.error('Failed to load assessments:', err);
      setAssessments([]); // Ensure it's always an array
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <StaggerContainer className="space-y-8" staggerDelay={0.1}>
      {/* Header */}
      <StaggerItem className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Assessments</h1>
          <p className="text-gray-500 font-medium mt-1">Track your progress and identify areas for improvement.</p>
        </div>
        <Link href="/assessment/new">
          <Button className="bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/20 transition-all hover:scale-105 active:scale-95">
            <ClipboardCheck className="w-4 h-4 mr-2" />
            Start New Assessment
          </Button>
        </Link>
      </StaggerItem>

      {!Array.isArray(assessments) || assessments.length === 0 ? (
        <StaggerItem>
          <EmptyState
            icon={<ClipboardCheck className="w-8 h-8" />}
            title="No assessments yet"
            description="Start your first assessment to track your progress and get personalized learning recommendations."
          />
        </StaggerItem>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Stats & Recent */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats Row */}
            <StaggerItem className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Card interactive className="border border-gray-200/80 shadow-sm hover:shadow-md transition-all group overflow-hidden bg-white">
                <CardContent className="p-6 flex items-center justify-between min-w-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-500 mb-1 truncate">Average Score</p>
                    <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{stats.averageScore}%</h3>
                  </div>
                  <div className="p-3 bg-teal-50 text-teal-600 rounded-xl group-hover:bg-teal-100 transition-colors shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>
              <Card interactive className="border border-gray-200/80 shadow-sm hover:shadow-md transition-all group overflow-hidden bg-white">
                <CardContent className="p-6 flex items-center justify-between min-w-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-500 mb-1 truncate">Total Assessments</p>
                    <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{stats.totalAssessments}</h3>
                  </div>
                  <div className="p-3 bg-teal-50 text-teal-600 rounded-xl group-hover:bg-teal-100 transition-colors shrink-0">
                    <ClipboardCheck className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>
              <Card interactive className="border border-gray-200/80 shadow-sm hover:shadow-md transition-all group overflow-hidden bg-white">
                <CardContent className="p-6 flex items-center justify-between min-w-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-500 mb-1 truncate">Growth</p>
                    <div className="flex items-baseline gap-1.5">
                      <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
                        {stats.growth > 0 ? '+' : ''}{stats.growth}%
                      </h3>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl group-hover:bg-teal-100 transition-colors shrink-0 ${
                    stats.growth >= 0 ? 'bg-teal-50 text-teal-600' : 'bg-red-50 text-red-600'
                  }`}>
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>

            {/* Recent Assessments Table */}
            <StaggerItem>
              <Card className="border border-gray-200/80 shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2 px-6 pt-6 border-b border-gray-100">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold text-gray-900">Recent Results</CardTitle>
                    <CardDescription className="text-sm text-gray-500">Your latest assessment performance</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          <th className="py-4 pl-6 pr-4">Subject</th>
                          <th className="py-4 px-4">Score</th>
                          <th className="py-4 px-4 hidden sm:table-cell">Questions</th>
                          <th className="py-4 px-4 hidden sm:table-cell">Date</th>
                          <th className="py-4 pr-6 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {Array.isArray(assessments) && assessments.map((assessment) => {
                          const total = assessment.questionsAnswered || 1;
                          const score = Math.round(((assessment.correctAnswers ?? 0) / total) * 100);
                          const subjectName = assessment.subjectName || assessment.subject_name || 'Assessment';
                          const createdDate = assessment.createdAt || assessment.created_at || new Date().toISOString();
                          const weakPoints = assessment.weak_points ?? assessment.weakPoints ?? [];
                          const conceptsTested = assessment.concepts_tested ?? assessment.conceptsTested ?? [];
                          const hasWeak = Array.isArray(weakPoints) && weakPoints.length > 0;
                          const hasConcepts = Array.isArray(conceptsTested) && conceptsTested.length > 0;
                          return (
                            <tr key={assessment.id} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="py-4 pl-6 pr-4">
                                <div className="font-bold text-gray-900">{subjectName}</div>
                                {hasConcepts && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Concepts: {conceptsTested.slice(0, 3).join(', ')}{conceptsTested.length > 3 ? '…' : ''}
                                  </div>
                                )}
                                {hasWeak && (
                                  <div className="text-xs text-amber-600 mt-0.5">
                                    Weak: {weakPoints.join(', ')}
                                  </div>
                                )}
                                <div className="text-xs text-gray-500 sm:hidden mt-0.5">
                                  {new Date(createdDate).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <Badge
                                  className={`font-mono font-bold shadow-none ${
                                    score >= 90 ? 'bg-teal-50 text-teal-700 hover:bg-teal-100 border-teal-200' :
                                    score >= 70 ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200' :
                                    'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200'
                                  }`}
                                >
                                  {score}%
                                </Badge>
                              </td>
                              <td className="py-4 px-4 text-sm font-medium text-gray-500 hidden sm:table-cell">
                                {assessment.correctAnswers ?? 0}<span className="text-gray-300 mx-1">/</span>{assessment.questionsAnswered ?? 0}
                              </td>
                              <td className="py-4 px-4 text-sm font-medium text-gray-500 hidden sm:table-cell">
                                {new Date(createdDate).toLocaleDateString()}
                              </td>
                              <td className="py-4 pr-6 text-right">
                                <Link href={`/assessment/${assessment.id}`}>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-colors">
                                    <ArrowUpRight className="w-4 h-4" />
                                  </Button>
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          </div>

          {/* Right Column: Subject aggregation + topic-based test */}
          <div className="space-y-8">
            <StaggerItem>
              <Card className="border border-gray-200/80 shadow-sm h-fit">
                <CardHeader className="pb-2 px-6 pt-6 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-gray-400" />
                    <CardTitle className="text-lg font-bold text-gray-900">Subjects & Topics</CardTitle>
                  </div>
                  <CardDescription className="text-sm text-gray-500 mt-1">
                    Select a subject or topic to generate a test
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  {SUBJECTS.slice(0, 8).map((subject) => {
                    const topics = SUBJECT_TOPICS[subject.value]
                    return (
                      <div key={subject.value} className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/assessment/new?subject=${subject.value}`}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50/50 text-sm font-semibold text-gray-800 hover:text-teal-700 transition-colors"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-gray-500" />
                            {subject.label}
                          </Link>
                          <span className="text-xs text-gray-400">(all topics)</span>
                        </div>
                        {topics && topics.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pl-1">
                            {topics.map((topic) => (
                              <Link
                                key={topic.value}
                                href={`/assessment/new?subject=${subject.value}&topic=${encodeURIComponent(topic.value)}`}
                                className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-50 border border-gray-100 text-xs font-medium text-gray-600 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700 transition-colors"
                              >
                                {topic.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  <Link href="/assessment/new" className="block">
                    <Button variant="ghost" className="w-full text-xs font-bold text-gray-500 h-9 mt-2 hover:bg-gray-100">
                      View all subjects
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </StaggerItem>
          </div>
        </div>
      )}
    </StaggerContainer>
  );
}
