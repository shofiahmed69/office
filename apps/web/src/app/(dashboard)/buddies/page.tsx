'use client';

import * as React from 'react';
import {
  Users,
  UserPlus,
  MessageSquare,
  Video,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dropdown, DropdownItem, DropdownDivider } from '@/components/ui/dropdown';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { StaggerContainer, StaggerItem } from '@/components/motion';

// Mock data
const myBuddies = [
  {
    id: 1,
    name: 'Alice Johnson',
    username: 'alicej',
    avatar: null,
    subjects: ['Machine Learning', 'Python'],
    status: 'online',
    lastActive: 'Just now',
    sessionsCompleted: 12,
  },
  {
    id: 2,
    name: 'Bob Smith',
    username: 'bobsmith',
    avatar: null,
    subjects: ['Web Development', 'React'],
    status: 'offline',
    lastActive: '2 hours ago',
    sessionsCompleted: 8,
  },
  {
    id: 3,
    name: 'Charlie Wilson',
    username: 'charliew',
    avatar: null,
    subjects: ['Data Structures', 'Algorithms'],
    status: 'online',
    lastActive: 'Just now',
    sessionsCompleted: 5,
  },
];

const pendingRequests = [
  {
    id: 1,
    name: 'Diana Martinez',
    username: 'dianam',
    avatar: null,
    subjects: ['Cloud Computing', 'AWS'],
    message: "Hi! I'd love to study cloud computing together.",
    sentAt: '2024-01-14',
  },
];

const suggestedMatches = [
  {
    id: 1,
    name: 'Eva Chen',
    username: 'evachen',
    avatar: null,
    subjects: ['Machine Learning', 'Deep Learning', 'Python'],
    matchScore: 95,
    matchReason: 'Similar learning goals in ML',
    availability: ['Weekday evenings', 'Weekend mornings'],
  },
  {
    id: 2,
    name: 'Frank Lee',
    username: 'frankl',
    avatar: null,
    subjects: ['Web Development', 'TypeScript', 'Node.js'],
    matchScore: 88,
    matchReason: 'Both learning full-stack development',
    availability: ['Weekday mornings', 'Weekends'],
  },
  {
    id: 3,
    name: 'Grace Park',
    username: 'gracep',
    avatar: null,
    subjects: ['Data Science', 'Python', 'SQL'],
    matchScore: 82,
    matchReason: 'Complementary skills in data analysis',
    availability: ['Evenings', 'Weekends'],
  },
];

export default function BuddiesPage() {
  const [showRequestModal, setShowRequestModal] = React.useState(false);
  const [selectedMatch, setSelectedMatch] = React.useState<typeof suggestedMatches[0] | null>(null);

  const handleSendRequest = (match: typeof suggestedMatches[0]) => {
    setSelectedMatch(match);
    setShowRequestModal(true);
  };

  return (
    <StaggerContainer className="space-y-8" staggerDelay={0.1}>
      <StaggerItem className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Study Buddies</h1>
          <p className="text-gray-500 font-medium mt-1">Connect, collaborate, and learn together.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Find buddies..." className="pl-9 bg-white border-gray-200 focus:border-teal-500 focus:ring-teal-500/20 w-64" />
            </div>
            <Button className="bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/20 transition-all hover:scale-105 active:scale-95">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Buddy
            </Button>
        </div>
      </StaggerItem>

      <Tabs defaultValue="buddies" className="space-y-6">
        <StaggerItem>
          <div className="bg-gray-100/50 border border-gray-200/50 rounded-xl p-1 inline-flex">
            <TabsTrigger value="buddies" className="px-5 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-teal-700 data-[state=active]:shadow-sm font-bold transition-all">My Buddies</TabsTrigger>
            <TabsTrigger value="requests" className="px-5 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-teal-700 data-[state=active]:shadow-sm font-bold transition-all">
              Requests
              {pendingRequests.length > 0 && (
                <Badge variant="danger" className="ml-2 px-1.5 py-0.5 h-auto text-[10px] bg-red-500 text-white border-0">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="discover" className="px-5 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-teal-700 data-[state=active]:shadow-sm font-bold transition-all">Discover</TabsTrigger>
          </div>
        </StaggerItem>

        <TabsContent value="buddies" className="mt-0">
            {myBuddies.length === 0 ? (
                <EmptyState
                    icon={<Users className="w-8 h-8" />}
                    title="No study buddies yet"
                    description="Find peers who share your interests and start learning together"
                    action={{ label: 'Find Study Buddy', onClick: () => {} }}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myBuddies.map((buddy, i) => (
                        <StaggerItem key={buddy.id} delay={i * 0.1}>
                          <Card className="border border-gray-200/80 shadow-sm hover:border-teal-200/60 hover:shadow-md transition-all group bg-white">
                              <CardContent className="p-6">
                                  <div className="flex justify-between items-start mb-5">
                                      <div className="flex items-center gap-4">
                                          <div className="relative">
                                              <Avatar size="lg" fallback={buddy.name} className="border-2 border-white shadow-sm w-12 h-12" />
                                              <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${buddy.status === 'online' ? 'bg-teal-500' : 'bg-gray-300'}`} />
                                          </div>
                                          <div>
                                              <h3 className="font-bold text-gray-900 text-lg tracking-tight">{buddy.name}</h3>
                                              <p className="text-sm text-gray-500 font-medium">@{buddy.username}</p>
                                          </div>
                                      </div>
                                      <Dropdown
                                          trigger={
                                              <button className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-50 rounded-lg transition-colors">
                                                  <MoreVertical className="w-5 h-5" />
                                              </button>
                                          }
                                      >
                                          <DropdownItem>View Profile</DropdownItem>
                                          <DropdownItem>Message</DropdownItem>
                                          <DropdownDivider />
                                          <DropdownItem destructive>Remove</DropdownItem>
                                      </Dropdown>
                                  </div>
                                  
                                  <div className="space-y-5">
                                      <div className="flex flex-wrap gap-1.5">
                                          {buddy.subjects.map((subject, i) => (
                                              <Badge key={i} variant="default" className="bg-gray-50 text-gray-600 border border-gray-200 font-medium hover:bg-gray-100">
                                                  {subject}
                                              </Badge>
                                          ))}
                                      </div>
                                      
                                      <div className="flex items-center justify-between text-xs font-medium text-gray-500 pt-5 border-t border-gray-100">
                                          <span className="flex items-center gap-1.5">
                                            <Video className="w-3.5 h-3.5 text-gray-400" />
                                            {buddy.sessionsCompleted} sessions
                                          </span>
                                          <span>{buddy.lastActive}</span>
                                      </div>

                                      <div className="grid grid-cols-2 gap-3">
                                          <Button variant="outline" size="sm" className="w-full font-bold border-gray-200 hover:bg-gray-50 hover:text-gray-900">
                                              <MessageSquare className="w-4 h-4 mr-2" /> Message
                                          </Button>
                                          <Button size="sm" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-sm">
                                              <Video className="w-4 h-4 mr-2" /> Study
                                          </Button>
                                      </div>
                                  </div>
                              </CardContent>
                          </Card>
                        </StaggerItem>
                    ))}
                </div>
            )}
        </TabsContent>

        <TabsContent value="requests" className="mt-0">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {pendingRequests.map((request, i) => (
                     <StaggerItem key={request.id} delay={i * 0.1}>
                       <Card className="border border-gray-200/80 shadow-sm bg-white hover:border-teal-200/50 transition-colors">
                           <CardContent className="p-6">
                               <div className="flex items-start gap-5">
                                   <Avatar size="lg" fallback={request.name} className="w-12 h-12 border border-gray-100" />
                                   <div className="flex-1 min-w-0">
                                       <div className="flex justify-between items-start mb-1">
                                           <div>
                                               <h3 className="font-bold text-gray-900 text-lg tracking-tight">{request.name}</h3>
                                               <p className="text-sm text-gray-500 font-medium">@{request.username}</p>
                                           </div>
                                           <span className="text-xs font-medium text-gray-400">{request.sentAt}</span>
                                       </div>
                                       <div className="text-sm text-gray-600 mt-3 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100 italic relative">
                                           <div className="absolute -top-1.5 left-4 w-3 h-3 bg-gray-50 border-t border-l border-gray-100 transform rotate-45"></div>
                                           &quot;{request.message}&quot;
                                       </div>
                                       <div className="flex gap-3">
                                           <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white flex-1 font-bold shadow-sm">
                                               Accept
                                           </Button>
                                           <Button variant="outline" size="sm" className="flex-1 font-bold border-gray-200 hover:bg-gray-50">
                                               Decline
                                           </Button>
                                       </div>
                                   </div>
                               </div>
                           </CardContent>
                       </Card>
                     </StaggerItem>
                 ))}
             </div>
        </TabsContent>

        <TabsContent value="discover" className="mt-0">
            <StaggerItem>
              <div className="mb-8 p-6 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100/50 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm border border-teal-100">
                          <Sparkles className="w-6 h-6 text-teal-600" />
                      </div>
                      <div>
                          <h3 className="font-bold text-gray-900 text-lg">AI Matchmaking</h3>
                          <p className="text-sm text-gray-600 font-medium">We found these study partners based on your learning goals.</p>
                      </div>
                  </div>
                  <Button variant="outline" size="sm" className="bg-white hover:bg-teal-50 text-teal-700 border-teal-200 font-bold shadow-sm">
                      Refresh Matches
                  </Button>
              </div>
            </StaggerItem>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {suggestedMatches.map((match, i) => (
                    <StaggerItem key={match.id} delay={i * 0.1}>
                      <Card className="border border-gray-200/80 shadow-sm relative overflow-hidden group hover:shadow-md transition-all bg-white h-full flex flex-col">
                          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-400 to-emerald-500" />
                          <CardContent className="p-6 flex flex-col flex-1">
                              <div className="flex justify-between items-start mb-4">
                                  <Avatar size="lg" fallback={match.name} className="w-12 h-12 border border-gray-100" />
                                  <div className="text-right">
                                      <div className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-teal-100 shadow-sm">
                                          {match.matchScore}% Match
                                      </div>
                                  </div>
                              </div>
                              
                              <h3 className="font-bold text-gray-900 text-lg tracking-tight">{match.name}</h3>
                              <p className="text-sm text-gray-500 mb-5 font-medium">@{match.username}</p>
                              
                              <div className="space-y-4 mb-6 flex-1">
                                  <div className="text-sm bg-gray-50 p-3 rounded-xl border border-gray-100">
                                      <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1">Why matched</span>
                                      <span className="text-gray-700 font-medium leading-snug block">{match.matchReason}</span>
                                  </div>
                                  <div className="text-xs">
                                      <span className="text-gray-400 font-bold uppercase tracking-wider block mb-1">Available</span>
                                      <span className="text-gray-600 font-medium">{match.availability.join(', ')}</span>
                                  </div>
                              </div>

                              <Button className="w-full bg-gray-900 text-white hover:bg-gray-800 font-bold shadow-md transition-transform active:scale-95" onClick={() => handleSendRequest(match)}>
                                  <UserPlus className="w-4 h-4 mr-2" /> Connect
                              </Button>
                          </CardContent>
                      </Card>
                    </StaggerItem>
                ))}
            </div>
        </TabsContent>
      </Tabs>

      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title="Send Buddy Request"
        description={`Connect with ${selectedMatch?.name} to study together`}
      >
        <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <Avatar fallback={selectedMatch?.name || ''} className="w-12 h-12 bg-white border border-gray-200" />
                <div>
                    <p className="font-bold text-gray-900 text-lg">{selectedMatch?.name}</p>
                    <p className="text-sm text-gray-500 font-medium">@{selectedMatch?.username}</p>
                </div>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                <textarea
                    className="w-full p-4 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[120px] bg-white transition-all"
                    placeholder="Hi! I noticed we're both studying Machine Learning..."
                />
            </div>
            <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setShowRequestModal(false)} className="font-bold border-gray-200">Cancel</Button>
                <Button className="bg-teal-600 text-white hover:bg-teal-700 font-bold shadow-md" onClick={() => setShowRequestModal(false)}>Send Request</Button>
            </div>
        </div>
      </Modal>
    </StaggerContainer>
  );
}
