'use client';

import * as React from 'react';
import {
  Video,
  Plus,
  Calendar,
  Clock,
  Users,
  Mic,
  Bot,
  Search,
  Filter,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StaggerContainer, StaggerItem } from '@/components/motion';

// Mock data
const upcomingSessions = [
  {
    id: 1,
    name: 'ML Study Group',
    subject: 'Neural Networks',
    scheduledTime: '2024-01-16T17:00:00',
    duration: 60,
    host: { name: 'John Doe', avatar: null },
    participants: [
      { name: 'Alice Johnson', avatar: null },
      { name: 'Bob Smith', avatar: null },
    ],
    isAIEnabled: true,
    status: 'scheduled',
  },
  {
    id: 2,
    name: 'Code Review Session',
    subject: 'React Best Practices',
    scheduledTime: '2024-01-17T14:00:00',
    duration: 45,
    host: { name: 'John Doe', avatar: null },
    participants: [
      { name: 'Charlie Wilson', avatar: null },
    ],
    isAIEnabled: false,
    status: 'scheduled',
  },
];

const pastSessions = [
  {
    id: 3,
    name: 'Python Basics Review',
    subject: 'Python Programming',
    scheduledTime: '2024-01-14T15:00:00',
    actualDuration: 58,
    host: { name: 'Alice Johnson', avatar: null },
    participants: [
      { name: 'John Doe', avatar: null },
    ],
    isAIEnabled: true,
    status: 'completed',
    hasTranscript: true,
  },
  {
    id: 4,
    name: 'Algorithm Practice',
    subject: 'Data Structures',
    scheduledTime: '2024-01-12T10:00:00',
    actualDuration: 45,
    host: { name: 'John Doe', avatar: null },
    participants: [
      { name: 'Bob Smith', avatar: null },
      { name: 'Diana Martinez', avatar: null },
    ],
    isAIEnabled: true,
    status: 'completed',
    hasTranscript: true,
  },
];

const statusStyles = {
  scheduled: { bg: 'bg-teal-50 text-teal-700 border-teal-100', label: 'Scheduled' },
  active: { bg: 'bg-green-50 text-green-700 border-green-100', label: 'In Progress' },
  completed: { bg: 'bg-gray-50 text-gray-700 border-gray-100', label: 'Completed' },
  cancelled: { bg: 'bg-red-50 text-red-700 border-red-100', label: 'Cancelled' },
};

export default function SessionsPage() {
  const [showCreateModal, setShowCreateModal] = React.useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <StaggerContainer className="space-y-8" staggerDelay={0.1}>
      <StaggerItem className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Study Sessions</h1>
          <p className="text-gray-500 font-medium mt-1">Collaborate with peers in real-time video sessions.</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/20 transition-all hover:scale-105 active:scale-95">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Session
        </Button>
      </StaggerItem>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <StaggerItem className="lg:col-span-3">
          <Card className="border border-gray-200/80 shadow-sm overflow-hidden bg-white min-h-[500px] flex flex-col">
            <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-gray-100 bg-gray-50/50 p-4">
              <div className="relative flex-1 w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search sessions..." className="pl-9 bg-white border-gray-200 focus:border-teal-500 focus:ring-teal-500/20" />
              </div>
              <Button variant="outline" size="sm" className="hidden sm:flex border-gray-200 hover:bg-white hover:text-teal-600">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <Tabs defaultValue="upcoming" className="w-full h-full flex flex-col">
                <div className="px-6 border-b border-gray-100">
                  <TabsList className="bg-transparent p-0 h-auto gap-8">
                    <TabsTrigger
                      value="upcoming"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-4 text-sm font-bold text-gray-500 data-[state=active]:text-teal-600 transition-colors"
                    >
                      Upcoming ({upcomingSessions.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="past"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-4 text-sm font-bold text-gray-500 data-[state=active]:text-teal-600 transition-colors"
                    >
                      Past Sessions ({pastSessions.length})
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="upcoming" className="p-6 m-0 space-y-4 flex-1">
                  {upcomingSessions.length === 0 ? (
                    <EmptyState
                      icon={<Calendar className="w-12 h-12 text-gray-200" />}
                      title="No upcoming sessions"
                      description="Schedule a study session with your buddies"
                      action={{
                        label: 'Schedule Session',
                        onClick: () => setShowCreateModal(true),
                      }}
                    />
                  ) : (
                    upcomingSessions.map((session) => (
                      <div key={session.id} className="group flex flex-col sm:flex-row gap-5 p-5 rounded-2xl border border-gray-200/60 bg-white hover:border-teal-200 hover:shadow-md transition-all">
                        <div className="flex sm:flex-col items-center justify-center sm:justify-start gap-2 sm:gap-0 sm:w-20 sm:text-center shrink-0">
                          <div className="text-xs font-bold text-teal-600 uppercase tracking-widest">{formatDate(session.scheduledTime).split(',')[0]}</div>
                          <div className="text-3xl font-bold text-gray-900 tracking-tighter">{new Date(session.scheduledTime).getDate()}</div>
                          <div className="text-xs font-medium text-gray-400">{formatTime(session.scheduledTime)}</div>
                        </div>

                        <div className="hidden sm:block w-px bg-gray-100 self-stretch" />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg group-hover:text-teal-600 transition-colors tracking-tight">{session.name}</h3>
                              <p className="text-sm text-gray-500 font-medium">{session.subject}</p>
                            </div>
                            <Badge variant="outline" className={`${statusStyles.scheduled.bg} border font-bold tracking-wide text-[10px] uppercase`}>
                              {statusStyles.scheduled.label}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mb-5 font-medium">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span>{session.duration} min</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span>{session.participants.length + 1} participants</span>
                            </div>
                            {session.isAIEnabled && (
                              <div className="flex items-center gap-1.5 text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded-full text-xs">
                                <Sparkles className="w-3 h-3" />
                                <span>AI Enabled</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <div className="flex -space-x-2">
                              {[session.host, ...session.participants].map((p, i) => (
                                <Avatar key={i} size="sm" fallback={p.name} className="border-2 border-white ring-1 ring-gray-100 w-8 h-8" />
                              ))}
                            </div>
                            <div className="flex items-center gap-3">
                              <Button size="sm" className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold shadow-sm">
                                Details
                              </Button>
                              <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-900/10 font-bold transition-all hover:scale-105 active:scale-95">
                                <Video className="w-4 h-4 mr-2" />
                                Join Session
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="past" className="p-6 m-0 space-y-4 flex-1">
                  {pastSessions.map((session) => (
                    <div key={session.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/30 hover:bg-white hover:border-gray-200 transition-colors">
                      <div className="flex sm:flex-col items-center justify-center sm:justify-start gap-2 sm:gap-0 sm:w-20 sm:text-center shrink-0 opacity-60">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">{formatDate(session.scheduledTime).split(',')[0]}</div>
                        <div className="text-2xl font-bold text-gray-600">{new Date(session.scheduledTime).getDate()}</div>
                      </div>

                      <div className="hidden sm:block w-px bg-gray-200 self-stretch opacity-50" />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-gray-700">{session.name}</h3>
                          {session.hasTranscript && (
                            <Badge variant="secondary" className="bg-white border border-gray-200 text-gray-500 font-medium">
                              <Mic className="w-3 h-3 mr-1" /> Transcript
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3 font-medium">
                          <span>{session.subject}</span>
                          <span className="text-gray-300">•</span>
                          <span>{session.actualDuration} min</span>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 text-xs font-bold bg-white border-gray-200 hover:border-teal-200 hover:text-teal-600">
                          View Summary
                        </Button>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <StaggerItem>
            <Card className="border-0 shadow-lg shadow-teal-900/20 bg-gradient-to-br from-teal-900 to-teal-800 text-white overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                    <Bot className="w-5 h-5 text-teal-200" />
                  </div>
                  <h3 className="font-bold text-lg tracking-tight">AI Assistant</h3>
                </div>
                <p className="text-sm text-teal-50/90 mb-6 leading-relaxed font-medium">
                  Your AI study buddy attends sessions to take notes and answer questions in real-time.
                </p>
                <div className="flex items-center justify-between text-xs font-bold text-teal-200 pt-4 border-t border-white/10 uppercase tracking-wider">
                  <span>8 Sessions</span>
                  <span>4.5 hrs saved</span>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="border border-gray-200/80 shadow-sm">
              <CardHeader className="pb-2 border-b border-gray-100">
                <CardTitle className="text-sm font-bold text-gray-900 uppercase tracking-wider">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Total Time</span>
                  <span className="font-bold text-gray-900">12.5 hrs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Sessions</span>
                  <span className="font-bold text-gray-900">{pastSessions.length + upcomingSessions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Buddies Met</span>
                  <span className="font-bold text-gray-900">5</span>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </div>
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Schedule Study Session"
        description="Set up a new video study session with your buddies"
        size="lg"
      >
        <div className="space-y-4">
          <Input label="Session Name" placeholder="e.g., ML Study Group" />
          <Input label="Subject/Topic" placeholder="e.g., Neural Networks" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="date" />
            <Input label="Time" type="time" />
          </div>
          <Select
            label="Duration"
            options={[
              { value: '30', label: '30 minutes' },
              { value: '45', label: '45 minutes' },
              { value: '60', label: '1 hour' },
              { value: '90', label: '1.5 hours' },
            ]}
            placeholder="Select duration..."
          />
          <div className="flex items-center gap-3 p-4 bg-teal-50/50 rounded-xl border border-teal-100 transition-colors hover:bg-teal-50">
            <input type="checkbox" id="ai-enabled" className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-gray-300" defaultChecked />
            <div className="flex-1">
              <label htmlFor="ai-enabled" className="text-sm font-bold text-gray-900 block mb-0.5">
                Enable AI Assistant
              </label>
              <span className="text-xs text-gray-500 font-medium">
                Get real-time transcription, summary, and Q&A support.
              </span>
            </div>
            <Bot className="w-5 h-5 text-teal-600" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
            <Button variant="outline" onClick={() => setShowCreateModal(false)} className="font-bold border-gray-200">Cancel</Button>
            <Button className="bg-teal-600 text-white hover:bg-teal-700 font-bold shadow-md" onClick={() => setShowCreateModal(false)}>Schedule Session</Button>
          </div>
        </div>
      </Modal>
    </StaggerContainer>
  );
}
