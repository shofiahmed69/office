'use client';

import * as React from 'react';
import {
  BarChart3,
  Clock,
  Target,
  Flame,
  BookOpen,
  Award,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select } from '@/components/ui/select';
import { StaggerContainer, StaggerItem, AnimatedCounter, FadeInUp } from '@/components/motion';

// Mock data
const stats = [
  { label: 'Total Study Time', value: 45.5, suffix: 'h', trend: '12%', trendUp: true, icon: Clock },
  { label: 'Current Streak', value: 12, suffix: ' Days', trend: 'Best: 15', trendUp: true, icon: Flame },
  { label: 'Content Completed', value: 34, suffix: '', trend: '5 new', trendUp: true, icon: BookOpen },
  { label: 'Average Score', value: 85, suffix: '%', trend: '2%', trendUp: false, icon: Target },
];

const weeklyProgress = [
  { day: 'Mon', hours: 2.5, target: 2 },
  { day: 'Tue', hours: 1.5, target: 2 },
  { day: 'Wed', hours: 3, target: 2 },
  { day: 'Thu', hours: 2, target: 2 },
  { day: 'Fri', hours: 1, target: 2 },
  { day: 'Sat', hours: 4, target: 3 },
  { day: 'Sun', hours: 2.5, target: 3 },
];

const subjectProgress = [
  { subject: 'Machine Learning', progress: 65, hoursSpent: 18, modules: '5/8' },
  { subject: 'Web Development', progress: 40, hoursSpent: 12, modules: '4/10' },
  { subject: 'Data Structures', progress: 85, hoursSpent: 10, modules: '6/7' },
  { subject: 'Python Programming', progress: 100, hoursSpent: 8, modules: '8/8' },
];

const achievements = [
  { id: 1, name: 'First Steps', description: 'Complete your first assessment', earned: true, date: '2024-01-02' },
  { id: 2, name: 'Week Warrior', description: 'Study for 7 consecutive days', earned: true, date: '2024-01-10' },
  { id: 3, name: 'Knowledge Seeker', description: 'Complete 10 content items', earned: true, date: '2024-01-12' },
  { id: 4, name: 'Study Buddy', description: 'Complete 5 sessions with a buddy', earned: false, progress: 3, total: 5 },
  { id: 5, name: 'Master Learner', description: 'Complete a full roadmap', earned: false, progress: 65, total: 100 },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = React.useState('week');
  const maxHours = Math.max(...weeklyProgress.map(d => Math.max(d.hours, d.target)));

  return (
    <StaggerContainer className="space-y-8" staggerDelay={0.1}>
      {/* Header */}
      <StaggerItem className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Analytics</h1>
          <p className="text-gray-500 font-medium mt-1">Deep dive into your learning habits and performance.</p>
        </div>
        <div className="w-full sm:w-48">
           <Select
            options={[
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' },
              { value: 'year', label: 'This Year' },
            ]}
            value={timeRange}
            onChange={setTimeRange}
            className="w-full"
          />
        </div>
      </StaggerItem>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <StaggerItem key={stat.label}>
              <Card interactive className="border border-gray-200/80 bg-white shadow-sm hover:shadow-md hover:border-teal-200/60 transition-all duration-300 group h-full relative overflow-hidden">
                <CardContent className="p-6 relative z-10 min-w-0 overflow-hidden">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-100 transition-colors duration-300 shrink-0">
                      <Icon className="w-5 h-5 shrink-0" />
                    </div>
                    <Badge 
                      variant="default" 
                      className={`font-medium border-0 flex items-center gap-1 min-w-0 max-w-full overflow-hidden shrink-0 ${
                        stat.trendUp ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {stat.trendUp ? <ArrowUpRight className="w-3 h-3 shrink-0" /> : <ArrowDownRight className="w-3 h-3 shrink-0" />}
                      <span className="truncate">{stat.trend}</span>
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 flex items-baseline gap-1.5 tracking-tight flex-wrap">
                      <AnimatedCounter value={stat.value} />
                      <span className="text-base text-gray-400 font-medium mb-1">{stat.suffix}</span>
                    </h3>
                    <p className="text-sm text-gray-500 font-medium mt-1 truncate">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Study Chart */}
        <StaggerItem className="lg:col-span-2">
          <Card className="border border-gray-200/80 shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-6 pt-6 border-b border-gray-100">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold text-gray-900">Weekly Study Activity</CardTitle>
                <CardDescription className="text-sm text-gray-500">Time spent learning per day vs daily goal</CardDescription>
              </div>
              <Calendar className="w-5 h-5 text-gray-400" />
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-end justify-between gap-3 h-64 mt-2">
                {weeklyProgress.map((day, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center group cursor-pointer h-full justify-end">
                    <div className="w-full flex flex-col items-center gap-1 flex-1 justify-end relative">
                      {/* Tooltip */}
                      <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-xl mb-2 whitespace-nowrap z-20 font-medium pointer-events-none transform translate-y-2 group-hover:translate-y-0 duration-200">
                        {day.hours}h <span className="text-gray-400 mx-1">/</span> Target: {day.target}h
                        <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                      </div>
                      
                      {/* Target Marker Line */}
                      <div 
                        className="w-full absolute border-t-2 border-dashed border-gray-200 z-0 group-hover:border-gray-300 transition-colors" 
                        style={{ bottom: `${(day.target / maxHours) * 100}%` }}
                      />

                      {/* Bar */}
                      <div
                        className={`w-full max-w-[48px] rounded-t-lg transition-all relative z-10 ${
                          day.hours >= day.target 
                            ? 'bg-teal-500 hover:bg-teal-600 shadow-[0_4px_20px_-4px_rgba(20,184,166,0.3)]' 
                            : 'bg-teal-200 hover:bg-teal-300'
                        }`}
                        style={{ height: `${(day.hours / maxHours) * 100}%` }}
                      />
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-xs font-bold text-gray-500 group-hover:text-teal-700 transition-colors">{day.day}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-teal-500 rounded-full shadow-sm" />
                  <span className="text-xs font-medium text-gray-600">Goal Met</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-teal-200 rounded-full" />
                  <span className="text-xs font-medium text-gray-600">Goal Missed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-gray-300 border-t border-dashed" />
                  <span className="text-xs font-medium text-gray-600">Daily Target</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Subject Breakdown */}
        <StaggerItem>
          <Card className="border border-gray-200/80 shadow-sm h-full">
             <CardHeader className="flex flex-row items-center justify-between pb-2 px-6 pt-6 border-b border-gray-100">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold text-gray-900">Subject Mastery</CardTitle>
                <CardDescription className="text-sm text-gray-500">Progress by topic</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {subjectProgress.map((subject, index) => (
                <div key={index} className="space-y-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-gray-800">{subject.subject}</span>
                    <span className="font-mono text-teal-600 font-bold text-xs bg-teal-50 px-2 py-0.5 rounded-md">{subject.progress}%</span>
                  </div>
                  <Progress
                    value={subject.progress}
                    className="h-2 bg-gray-100"
                    // Color logic handled by Progress component or inline style override if needed, 
                    // but default teal is perfect.
                  />
                  <div className="flex justify-between text-xs font-medium text-gray-400">
                    <span>{subject.modules} modules</span>
                    <span>{subject.hoursSpent}h spent</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </StaggerItem>
      </div>

       {/* Achievements Grid */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StaggerItem>
            <Card className="border border-gray-200/80 shadow-sm h-full">
              <CardHeader className="pb-2 px-6 pt-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-teal-600" />
                  <CardTitle className="text-lg font-bold text-gray-900">Recent Achievements</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {achievements.filter(a => a.earned).map((achievement) => (
                    <div key={achievement.id} className="flex items-start gap-4 p-4 rounded-xl border border-teal-100 bg-teal-50/30 transition-all hover:bg-teal-50 hover:border-teal-200">
                      <div className="p-2.5 bg-white text-teal-600 rounded-xl shadow-sm border border-teal-100 shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-gray-900 text-sm truncate">{achievement.name}</h4>
                          <Badge variant="default" className="bg-teal-100 text-teal-700 border-0 text-[10px] font-bold uppercase tracking-wider">Earned</Badge>
                        </div>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">{achievement.description}</p>
                        <p className="text-[10px] text-gray-400 mt-2 font-medium">Unlocked on {achievement.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </StaggerItem>

           <StaggerItem>
            <Card className="border border-gray-200/80 shadow-sm h-full">
              <CardHeader className="pb-2 px-6 pt-6 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-gray-400" />
                  <CardTitle className="text-lg font-bold text-gray-900">In Progress</CardTitle>
                </div>
              </CardHeader>
               <CardContent className="p-6">
                <div className="space-y-4">
                  {achievements.filter(a => !a.earned).map((achievement) => (
                    <div key={achievement.id} className="p-4 rounded-xl border border-gray-100 bg-white hover:border-gray-200 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-50 text-gray-400 rounded-lg shrink-0">
                              <Zap className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-800 text-sm">{achievement.name}</h4>
                              <p className="text-xs text-gray-500 font-medium">{achievement.description}</p>
                            </div>
                         </div>
                         <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">{achievement.progress}/{achievement.total}</span>
                      </div>
                      <Progress value={(achievement.progress! / achievement.total!) * 100} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
       </div>
    </StaggerContainer>
  );
}
