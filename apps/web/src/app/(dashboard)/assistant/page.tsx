'use client';

import * as React from 'react';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Plus,
  MessageSquare,
  Sparkles,
  BookOpen,
  Code,
  HelpCircle,
  MoreHorizontal,
  Trash2,
  Share,
  History,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';
import { Card } from '@/components/ui/card';
import { StaggerContainer, StaggerItem } from '@/components/motion';

// Mock conversation data
const mockConversations = [
  { id: '1', title: 'Neural Network Architecture', updatedAt: 'Today' },
  { id: '2', title: 'React Hooks Explanation', updatedAt: 'Yesterday' },
  { id: '3', title: 'SQL Query Optimization', updatedAt: '2 days ago' },
];

const mockMessages = [
  {
    role: 'user' as const,
    content: 'Can you explain how backpropagation works in neural networks?',
    timestamp: '10:30 AM',
  },
  {
    role: 'assistant' as const,
    content: `Backpropagation is a fundamental algorithm used to train neural networks. Here's how it works:

**1. Forward Pass**
First, input data flows through the network, layer by layer, producing an output prediction.

**2. Calculate Loss**
The output is compared to the expected result using a loss function (e.g., MSE, Cross-Entropy).

**3. Backward Pass**
The algorithm calculates the gradient of the loss with respect to each weight by applying the chain rule of calculus.

**4. Weight Update**
Weights are updated to minimize the loss.

Would you like me to explain any of these steps in more detail?`,
    timestamp: '10:31 AM',
  },
];

const suggestedPrompts = [
  { icon: HelpCircle, text: 'Explain a concept', prompt: 'Can you explain...' },
  { icon: Code, text: 'Debug my code', prompt: 'Help me debug this code...' },
  { icon: BookOpen, text: 'Summarize topic', prompt: 'Summarize the key points of...' },
  { icon: Sparkles, text: 'Study tips', prompt: 'What are the best strategies for learning...' },
];

export default function AssistantPage() {
  const [messages, setMessages] = React.useState(mockMessages);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user' as const,
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage = {
        role: 'assistant' as const,
        content: 'This is a simulated response. In the real app, this would be an AI-generated answer based on your question.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 max-h-[800px]">
       {/* Sidebar - History */}
       <div className="w-80 hidden lg:flex flex-col bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
             <Button className="w-full justify-start bg-gray-900 text-white hover:bg-gray-800 shadow-md transition-all active:scale-95" onClick={() => setMessages([])}>
                 <Plus className="w-4 h-4 mr-2" />
                 New Chat
             </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
             <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <History className="w-3 h-3" />
                Recent
             </div>
             {mockConversations.map((conv) => (
                 <button 
                    key={conv.id}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center gap-3 group border border-transparent hover:border-gray-100"
                 >
                    <MessageSquare className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition-colors" />
                    <span className="truncate flex-1 font-medium">{conv.title}</span>
                 </button>
             ))}
          </div>
          <div className="p-4 border-t border-gray-100 bg-gradient-to-br from-teal-50/50 to-white">
             <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-teal-100 shadow-sm">
                <div className="p-1.5 bg-teal-100 rounded-lg">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                </div>
                <div className="flex-1">
                   <p className="text-sm font-bold text-gray-900">Pro Plan</p>
                   <p className="text-[10px] font-medium text-teal-600">GPT-4 access enabled</p>
                </div>
             </div>
          </div>
       </div>

       {/* Main Chat Area */}
       <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm relative">
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none" />
           
           {/* Header */}
           <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md z-10 sticky top-0">
               <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center border border-teal-100">
                        <Bot className="w-5 h-5 text-teal-600" />
                   </div>
                   <div>
                       <span className="font-bold text-gray-900 block leading-none">AI Tutor</span>
                       <span className="text-[10px] font-medium text-green-600 flex items-center gap-1 mt-1">
                           <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                           Online
                       </span>
                   </div>
               </div>
               <div className="flex items-center gap-1">
                   <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg">
                       <Share className="w-4 h-4" />
                   </Button>
                   <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg">
                       <MoreHorizontal className="w-4 h-4" />
                   </Button>
               </div>
           </div>

           {/* Messages */}
           <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth">
              {messages.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in duration-500 pb-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-teal-500/20 rotate-3 transition-transform hover:rotate-6 duration-300">
                        <Bot className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">How can I help you learn today?</h2>
                    <p className="text-gray-500 max-w-md mb-10 text-lg leading-relaxed">I can explain complex topics, debug code, or help you prepare for exams.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full px-4">
                        {suggestedPrompts.map((p, i) => {
                             const Icon = p.icon;
                             return (
                                <button 
                                    key={i} 
                                    onClick={() => setInput(p.prompt)} 
                                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-200/80 hover:border-teal-200 hover:bg-teal-50/50 transition-all text-left group bg-white shadow-sm hover:shadow-md"
                                >
                                    <div className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-white group-hover:text-teal-600 transition-colors border border-gray-100">
                                        <Icon className="w-5 h-5 text-gray-500 group-hover:text-teal-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 text-sm mb-0.5">{p.text}</p>
                                        <p className="text-xs text-gray-500 truncate font-medium">{p.prompt}</p>
                                    </div>
                                </button>
                             )
                        })}
                    </div>
                 </div>
              ) : (
                 <div className="max-w-3xl mx-auto space-y-8">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center shrink-0 mt-1 shadow-md shadow-teal-900/10">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                            )}
                            <div className={`max-w-[85%] space-y-1.5 ${msg.role === 'user' ? 'items-end flex flex-col' : ''}`}>
                                <div className={`px-6 py-4 rounded-2xl text-sm leading-7 shadow-sm ${
                                    msg.role === 'user' 
                                    ? 'bg-gray-900 text-white rounded-tr-sm' 
                                    : 'bg-white border border-gray-100 text-gray-700 rounded-tl-sm'
                                }`}>
                                    <div className="whitespace-pre-wrap font-medium">{msg.content}</div>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 px-1 uppercase tracking-wide">{msg.timestamp}</span>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center shrink-0 mt-1 shadow-md">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div className="px-6 py-4 rounded-2xl bg-white border border-gray-100 rounded-tl-sm shadow-sm">
                                <div className="flex gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                 </div>
              )}
           </div>

           {/* Input Area */}
           <div className="p-4 sm:p-6 bg-white border-t border-gray-100/80 z-10">
              <div className="max-w-3xl mx-auto relative flex items-end gap-2 p-2 bg-gray-50 border border-gray-200 rounded-2xl focus-within:ring-4 focus-within:ring-teal-500/10 focus-within:border-teal-500 transition-all shadow-sm">
                  <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    placeholder="Ask AI Tutor anything..."
                    className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] py-3 px-3 text-sm font-medium text-gray-900 placeholder:text-gray-400"
                    rows={1}
                  />
                  <div className="flex items-center gap-1 pb-1.5 pr-1">
                     <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-gray-400 hover:text-gray-900 hover:bg-gray-200/50 rounded-xl transition-colors">
                        <Mic className="w-5 h-5" />
                     </Button>
                     <Button 
                        onClick={handleSend} 
                        disabled={!input.trim() || isLoading}
                        size="sm" 
                        className={`h-9 w-9 p-0 rounded-xl transition-all shadow-sm ${
                            input.trim() 
                            ? 'bg-teal-600 text-white hover:bg-teal-700 hover:scale-105 active:scale-95' 
                            : 'bg-gray-200 text-gray-400'
                        }`}
                     >
                        <Send className="w-4 h-4" />
                     </Button>
                  </div>
              </div>
              <p className="text-[10px] text-center text-gray-400 mt-3 font-medium">
                 AI responses are generated by advanced models and may be inaccurate.
              </p>
           </div>
       </div>
    </div>
  );
}
