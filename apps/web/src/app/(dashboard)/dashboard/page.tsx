'use client'

import Link from 'next/link'
import {
  Users,
  ChevronRight,
  Plus,
  Clock,
  BookOpen,
  Trophy,
  Flame,
  ArrowUpRight,
  BrainCircuit,
  Atom,
  Network
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  StaggerContainer, 
  StaggerItem, 
  AnimatedCounter, 
  FadeInUp 
} from '@/components/motion'

// Data — unified teal/gray palette
const stats = [
  { label: 'Hours Learned', value: 24.5, suffix: 'h', trend: '+12%', trendUp: true, icon: Clock, chartData: [40, 30, 60, 50, 80, 65, 90] },
  { label: 'Courses Active', value: 3, suffix: '', trend: '1 done', trendUp: true, icon: BookOpen, chartData: [20, 40, 30, 50, 40, 60, 50] },
  { label: 'Day Streak', value: 7, suffix: '', trend: 'Best!', trendUp: true, icon: Flame, chartData: [10, 20, 30, 40, 50, 60, 70] },
  { label: 'Achievements', value: 12, suffix: '', trend: '+2 new', trendUp: true, icon: Trophy, chartData: [30, 30, 40, 40, 50, 60, 60] },
]

const courses = [
  { id: 1, title: 'Machine Learning Fundamentals', chapter: 'Chapter 5: Neural Networks', progress: 65, lessons: '16/24 lessons', image: 'bg-gradient-to-br from-teal-600 to-teal-800', imageIcon: <BrainCircuit className="w-10 h-10 text-white/90" /> },
  { id: 2, title: 'Advanced React Patterns', chapter: 'Chapter 3: Custom Hooks', progress: 42, lessons: '8/18 lessons', image: 'bg-gradient-to-br from-teal-500 to-emerald-700', imageIcon: <Atom className="w-10 h-10 text-white/90" /> },
  { id: 3, title: 'Data Structures & Algorithms', chapter: 'Chapter 8: Trees & Graphs', progress: 78, lessons: '25/32 lessons', image: 'bg-gradient-to-br from-emerald-600 to-teal-800', imageIcon: <Network className="w-10 h-10 text-white/90" /> },
]

const sessions = [
  { id: 1, title: 'ML Study Group', time: '5:00 PM', date: 'Today', members: 4, live: true },
  { id: 2, title: 'Code Review', time: '2:00 PM', date: 'Tomorrow', members: 2, live: false },
]

const activities = [
  { id: 1, action: 'Completed', item: 'Neural Networks Quiz', time: '2h ago', icon: '✓', color: 'bg-teal-100 text-teal-700' },
  { id: 2, action: 'Started', item: 'React Hooks Module', time: '5h ago', icon: '▶', color: 'bg-gray-200 text-gray-700' },
  { id: 3, action: 'Earned', item: 'Quick Learner Badge', time: '1d ago', icon: '🏆', color: 'bg-teal-100 text-teal-700' },
]

const TEAL_SPARKLINE = '#0d9488'

const Sparkline = ({ data }: { data: number[] }) => {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - ((d - min) / range) * 100
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox="0 0 100 100" className="w-full h-12 overflow-hidden" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkline-teal" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={TEAL_SPARKLINE} stopOpacity="0.2" />
          <stop offset="100%" stopColor={TEAL_SPARKLINE} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`M0,100 L0,${100 - ((data[0] - min) / range) * 100} ${data.map((d, i) => `L${(i / (data.length - 1)) * 100},${100 - ((d - min) / range) * 100}`).join(' ')} L100,100 Z`}
        fill="url(#sparkline-teal)"
      />
      <polyline
        fill="none"
        stroke={TEAL_SPARKLINE}
        strokeWidth="3"
        points={points}
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function DashboardPage() {
  return (
    <StaggerContainer className="space-y-8" staggerDelay={0.1}>
      {/* Header */}
      <StaggerItem className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 font-medium mt-1">Welcome back to your learning journey.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/roadmap/new">
            <Button className="bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/20 transition-all hover:scale-105 active:scale-95 btn-glow">
              <Plus className="w-4 h-4 mr-2" />
              New Course
            </Button>
          </Link>
        </div>
      </StaggerItem>

      {/* Stats Grid — unified teal/gray */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <StaggerItem key={stat.label}>
              <Card interactive className="border border-gray-200/80 bg-white shadow-sm hover:shadow-md hover:border-teal-200/60 transition-all duration-300 relative overflow-hidden group h-full">
                <CardContent className="p-6 relative z-10 min-w-0 overflow-hidden">
                  <div className="flex items-center justify-between gap-2 mb-4 min-w-0">
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-100 transition-colors duration-300 shrink-0 flex-shrink-0">
                      <Icon className="w-5 h-5" aria-hidden />
                    </div>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600 font-medium border-0 flex items-center gap-1 min-w-0 max-w-full overflow-hidden shrink-0">
                      {stat.trendUp && <ArrowUpRight className="w-3 h-3 text-teal-600 shrink-0" />}
                      <span className="truncate">{stat.trend}</span>
                    </Badge>
                  </div>
                  <div className="mb-4 min-w-0">
                    <p className="text-3xl font-bold text-gray-900 flex items-baseline gap-1.5 tracking-tight">
                      <AnimatedCounter value={stat.value} />
                      <span className="text-base text-gray-400 font-medium">{stat.suffix}</span>
                    </p>
                    <p className="text-sm text-gray-500 font-medium mt-1 truncate">{stat.label}</p>
                  </div>
                  <div className="h-12 w-full min-h-0 overflow-hidden opacity-70 group-hover:opacity-100 transition-opacity">
                    <Sparkline data={stat.chartData} />
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <StaggerItem className="lg:col-span-2 space-y-8">
          {/* Active Courses — teal accent, formatted */}
          <Card className="border border-gray-200/80 bg-white shadow-sm overflow-visible">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-6 pt-6 border-b border-gray-100">
              <CardTitle className="text-xl font-bold text-gray-900">Continue Learning</CardTitle>
              <Link href="/roadmap" className="text-sm text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1 rounded-lg py-1.5 px-2.5 hover:bg-teal-50 transition-colors">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-4 pt-5 px-6 pb-6">
              {courses.map((course, i) => (
                <FadeInUp key={course.id} delay={i * 0.1}>
                  <Link href={`/roadmap/${course.id}`}>
                    <div className="group flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-gray-200/80 bg-gray-50/50 hover:border-teal-200 hover:bg-white hover:shadow-sm transition-all cursor-pointer">
                      <div className={`w-full sm:w-24 h-24 sm:h-24 rounded-lg ${course.image} shrink-0 flex items-center justify-center shadow-sm`}>
                        {course.imageIcon}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 text-base line-clamp-1 group-hover:text-teal-700 transition-colors">
                            {course.title}
                          </h3>
                          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md shrink-0">
                            {course.progress}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">{course.chapter}</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: `${course.progress}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 flex items-center gap-1 shrink-0">
                            <BookOpen className="w-3.5 h-3.5" /> {course.lessons}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 self-center shrink-0 hidden sm:block" />
                    </div>
                  </Link>
                </FadeInUp>
              ))}
            </CardContent>
          </Card>

          {/* Recommended paths — formatted cards */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 px-0.5">Recommended for you</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card interactive className="bg-gradient-to-br from-gray-900 via-teal-900/95 to-teal-800 text-white border-0 shadow-lg shadow-teal-900/20 group relative overflow-hidden min-h-[220px] flex flex-col">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <CardContent className="relative z-10 flex flex-col flex-1 !pt-6 !px-6 !pb-6">
                  <div className="mb-4">
                    <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-teal-300/90 mb-3">
                      Recommended
                    </span>
                    <h3 className="text-xl font-bold text-white tracking-tight">System Design</h3>
                  </div>
                  <p className="text-sm text-teal-100/80 leading-relaxed flex-1 mb-6">
                    Master distributed systems and ace your tech interviews.
                  </p>
                  <Button className="w-full !bg-white !text-teal-900 hover:!bg-teal-50 border-0 font-semibold text-sm h-10 rounded-lg shadow-md transition-all group-hover:shadow-lg">
                    Start Path
                  </Button>
                </CardContent>
              </Card>
              <Card interactive className="bg-gradient-to-br from-teal-900 via-emerald-900/95 to-teal-800 text-white border-0 shadow-lg shadow-teal-900/20 group relative overflow-hidden min-h-[220px] flex flex-col">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                <CardContent className="relative z-10 flex flex-col flex-1 !pt-6 !px-6 !pb-6">
                  <div className="mb-4">
                    <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-teal-300/90 mb-3">
                      New
                    </span>
                    <h3 className="text-xl font-bold text-white tracking-tight">Web3 Basics</h3>
                  </div>
                  <p className="text-sm text-teal-100/80 leading-relaxed flex-1 mb-6">
                    Learn blockchain basics, smart contracts and dApps.
                  </p>
                  <Button className="w-full !bg-white !text-teal-900 hover:!bg-teal-50 border-0 font-semibold text-sm h-10 rounded-lg shadow-md transition-all group-hover:shadow-lg">
                    Explore
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </StaggerItem>

        {/* Sidebar Widgets */}
        <StaggerItem className="space-y-8">
          {/* Upcoming Sessions */}
          <Card className="border-gray-200/60 shadow-sm h-fit">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-6 pt-6">
              <CardTitle className="text-lg font-bold text-gray-900">Upcoming Sessions</CardTitle>
              <Link href="/sessions/new">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-900 transition-colors">
                  <Plus className="w-5 h-5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-2 px-6 pb-6 space-y-5">
              {sessions.map((session, i) => (
                <FadeInUp key={session.id} delay={i * 0.1}>
                  <div className="flex items-start gap-4 pb-5 border-b border-gray-100 last:border-0 last:pb-0 group">
                    <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 shrink-0 group-hover:scale-105 transition-transform group-hover:bg-teal-100 border border-teal-100/50">
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{session.date === 'Today' ? 'TOD' : 'TOM'}</span>
                      <span className="text-lg font-bold leading-none mt-0.5">{session.time.split(' ')[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h4 className="font-bold text-gray-900 text-sm truncate group-hover:text-teal-700 transition-colors">{session.title}</h4>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-gray-500 flex items-center font-medium">
                          <Users className="w-3.5 h-3.5 mr-1" /> {session.members}
                        </span>
                        {session.live && (
                          <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-red-100 text-red-600 border-red-200 animate-pulse font-bold">
                            LIVE
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 text-xs font-bold border-gray-200 hover:border-teal-200 hover:text-teal-700 hover:bg-teal-50 self-center">
                      Join
                    </Button>
                  </div>
                </FadeInUp>
              ))}
              <Link href="/sessions">
                <Button variant="ghost" className="w-full text-xs font-bold text-gray-500 mt-2 h-9 hover:text-teal-700 hover:bg-teal-50">
                  View All Sessions
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card className="border-gray-200/60 shadow-sm h-fit">
            <CardHeader className="pb-2 px-6 pt-6">
              <CardTitle className="text-lg font-bold text-gray-900">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 px-6 pb-6">
              <div className="space-y-6 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-px before:bg-gray-100/80">
                {activities.map((activity, i) => (
                  <FadeInUp key={activity.id} delay={i * 0.1}>
                    <div className="relative flex items-start gap-4 pl-2 group cursor-default">
                      <div className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${activity.color} ring-4 ring-white group-hover:scale-110 transition-transform shadow-sm`}>
                        {activity.icon}
                      </div>
                      <div className="min-w-0 pl-8 pt-1">
                        <p className="text-sm text-gray-900 leading-snug">
                          <span className="font-bold">{activity.action}</span>{' '}
                          <span className="text-gray-600 font-medium">{activity.item}</span>
                        </p>
                        <span className="text-xs text-gray-400 font-medium mt-1 block">{activity.time}</span>
                      </div>
                    </div>
                  </FadeInUp>
                ))}
              </div>
            </CardContent>
          </Card>
        </StaggerItem>
      </div>
    </StaggerContainer>
  )
}
