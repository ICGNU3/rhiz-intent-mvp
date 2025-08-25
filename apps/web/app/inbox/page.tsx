'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Inbox as InboxIcon, MessageSquare, Calendar, User, Clock, 
  CheckCircle, Circle, Star, Archive, Trash2, Filter, Search,
  Send, Reply, Forward, MoreHorizontal, Sparkles, Brain,
  AlertCircle, Users, Target, Zap, ArrowRight, Plus,
  Mail, Phone, Video, Coffee, Heart, Briefcase, ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { PageNavigation } from '@/app/components/PageNavigation';

interface Message {
  id: string;
  type: 'message' | 'reminder' | 'opportunity' | 'insight';
  from: {
    name: string;
    avatar: string;
    title?: string;
  };
  subject: string;
  preview: string;
  timestamp: Date;
  isRead: boolean;
  isStarred: boolean;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  relatedGoal?: string;
}

const mockMessages: Message[] = [
  {
    id: '1',
    type: 'opportunity',
    from: { name: 'AI Insights', avatar: '🤖', title: 'Network Analyzer' },
    subject: 'Perfect Introduction Opportunity: Sarah Chen → Mike Rodriguez',
    preview: 'Both are fintech founders in SF. Sarah just raised Series A, Mike is looking for co-investors...',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    isRead: false,
    isStarred: true,
    priority: 'high',
    tags: ['AI-Generated', 'Introduction'],
    relatedGoal: 'Connect fintech founders'
  },
  {
    id: '2',
    type: 'message',
    from: { name: 'Sarah Chen', avatar: 'SC', title: 'Founder @ FinanceFlow' },
    subject: 'Thanks for the intro - Coffee next week?',
    preview: 'Hi Alex! Thank you so much for introducing me to Mike. We had a great conversation and I\'d love to...',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    isRead: false,
    isStarred: false,
    priority: 'medium',
    tags: ['Follow-up', 'Meeting Request']
  },
  {
    id: '3',
    type: 'reminder',
    from: { name: 'Rhiz Assistant', avatar: '✨', title: 'Your AI Assistant' },
    subject: 'Follow up with 3 connections from TechCrunch Disrupt',
    preview: 'It\'s been 5 days since you met John, Lisa, and David. Send follow-up messages to maintain momentum...',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    isRead: true,
    isStarred: false,
    priority: 'medium',
    tags: ['Follow-up', 'Event'],
    relatedGoal: 'Meet 20 people at Disrupt'
  },
  {
    id: '4',
    type: 'insight',
    from: { name: 'Network Analytics', avatar: '📊', title: 'Insight Engine' },
    subject: 'Your network grew 23% this month - here\'s what\'s working',
    preview: 'Your strategic focus on design-tech connections is paying off. Top performing activities...',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    isRead: true,
    isStarred: true,
    priority: 'low',
    tags: ['Analytics', 'Growth']
  }
];

export default function InboxPage() {
  const [messages, setMessages] = useState(mockMessages);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');

  const filteredMessages = messages.filter(message => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !message.isRead) ||
      (filter === 'starred' && message.isStarred) ||
      (filter === message.type);
    
    const matchesSearch = searchQuery === '' || 
      message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.from.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const toggleRead = (id: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, isRead: !msg.isRead } : msg
    ));
  };

  const toggleStar = (id: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, isStarred: !msg.isStarred } : msg
    ));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return Zap;
      case 'reminder': return Clock;
      case 'insight': return Brain;
      default: return MessageSquare;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'text-orange-400';
      case 'reminder': return 'text-blue-400';
      case 'insight': return 'text-purple-400';
      default: return 'text-green-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      default: return 'border-l-green-500';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 1000 * 60 * 60) {
      return `${Math.floor(diff / (1000 * 60))}m ago`;
    } else if (diff < 1000 * 60 * 60 * 24) {
      return `${Math.floor(diff / (1000 * 60 * 60))}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <PageNavigation />
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-80 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            {/* Back to Dashboard */}
            <Link href="/dashboard" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-6 group">
              <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-white/10 transition-all">
                <ChevronLeft className="w-4 h-4" />
              </div>
              <span className="text-sm">Back to Dashboard</span>
            </Link>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <InboxIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Inbox</h1>
                <p className="text-sm text-gray-400">All your networking communications</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-white/10">
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'all', label: 'All', count: messages.length },
                { key: 'unread', label: 'Unread', count: messages.filter(m => !m.isRead).length },
                { key: 'starred', label: 'Starred', count: messages.filter(m => m.isStarred).length },
                { key: 'opportunity', label: 'Opportunities', count: messages.filter(m => m.type === 'opportunity').length }
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key)}
                  className={cn(
                    "px-3 py-2 text-sm rounded-lg transition-all flex items-center justify-between",
                    filter === filterOption.key 
                      ? "bg-blue-600/20 text-blue-400 border border-blue-600/30" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <span>{filterOption.label}</span>
                  <span className="text-xs bg-white/10 px-2 py-1 rounded-full">
                    {filterOption.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-auto">
            <div className="space-y-1 p-2">
              {filteredMessages.map((message) => {
                const TypeIcon = getTypeIcon(message.type);
                const isSelected = selectedMessage?.id === message.id;
                
                return (
                  <motion.div
                    key={message.id}
                    layout
                    onClick={() => setSelectedMessage(message)}
                    className={cn(
                      "p-4 rounded-lg cursor-pointer transition-all border-l-2 group",
                      getPriorityColor(message.priority),
                      isSelected 
                        ? "bg-white/10 border-r-2 border-r-blue-500" 
                        : "bg-white/5 hover:bg-white/10",
                      !message.isRead && "border-r-2 border-r-blue-400"
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {message.from.avatar}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={cn(
                            "text-sm font-medium truncate",
                            !message.isRead ? "text-white" : "text-gray-300"
                          )}>
                            {message.from.name}
                          </span>
                          <div className="flex items-center space-x-2">
                            <TypeIcon className={cn("w-3 h-3", getTypeColor(message.type))} />
                            <span className="text-xs text-gray-500">
                              {formatTime(message.timestamp)}
                            </span>
                          </div>
                        </div>
                        
                        <h4 className={cn(
                          "text-sm font-medium mb-1 line-clamp-1",
                          !message.isRead ? "text-white" : "text-gray-400"
                        )}>
                          {message.subject}
                        </h4>
                        
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {message.preview}
                        </p>

                        {message.tags.length > 0 && (
                          <div className="flex items-center space-x-1 mt-2">
                            {message.tags.slice(0, 2).map((tag) => (
                              <span key={tag} className="text-xs bg-white/10 text-gray-400 px-2 py-1 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end space-y-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(message.id);
                          }}
                          className={cn(
                            "p-1 rounded transition-colors",
                            message.isStarred ? "text-yellow-400" : "text-gray-500 hover:text-yellow-400"
                          )}
                        >
                          <Star className="w-3 h-3" fill={message.isStarred ? "currentColor" : "none"} />
                        </button>
                        
                        {!message.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-t border-white/10">
            <Link 
              href="/dashboard"
              className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {selectedMessage ? (
            <>
              {/* Message Header */}
              <div className="p-6 border-b border-white/10 bg-white/5 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center text-lg font-semibold">
                      {selectedMessage.from.avatar}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">{selectedMessage.from.name}</h2>
                      {selectedMessage.from.title && (
                        <p className="text-sm text-gray-400">{selectedMessage.from.title}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleRead(selectedMessage.id)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      {selectedMessage.isRead ? <Circle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => toggleStar(selectedMessage.id)}
                      className={cn(
                        "p-2 transition-colors",
                        selectedMessage.isStarred ? "text-yellow-400" : "text-gray-400 hover:text-yellow-400"
                      )}
                    >
                      <Star className="w-5 h-5" fill={selectedMessage.isStarred ? "currentColor" : "none"} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                      <Archive className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-2">{selectedMessage.subject}</h3>
                
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>{formatTime(selectedMessage.timestamp)}</span>
                  <div className="flex items-center space-x-2">
                    {selectedMessage.tags.map((tag) => (
                      <span key={tag} className="bg-white/10 px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 p-6 overflow-auto">
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed">
                    {selectedMessage.preview}
                  </p>
                  
                  {selectedMessage.type === 'opportunity' && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-orange-600/10 to-yellow-600/10 rounded-xl border border-orange-600/20">
                      <div className="flex items-center space-x-3 mb-3">
                        <Zap className="w-5 h-5 text-orange-400" />
                        <h4 className="font-semibold text-orange-300">AI-Suggested Action</h4>
                      </div>
                      <p className="text-sm text-gray-300 mb-4">
                        Draft an introduction email connecting Sarah and Mike based on their shared interests in fintech innovation and sustainable investing.
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm font-medium transition-colors">
                          Draft Introduction
                        </button>
                        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                          Schedule Later
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedMessage.relatedGoal && (
                    <div className="mt-4 p-3 bg-blue-600/10 rounded-lg border border-blue-600/20">
                      <div className="flex items-center space-x-2 text-sm">
                        <Target className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-300">Related to goal:</span>
                        <span className="font-medium">{selectedMessage.relatedGoal}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Reply Section */}
              <div className="p-6 border-t border-white/10 bg-white/5 backdrop-blur-xl">
                <div className="flex items-center space-x-4 mb-4">
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2">
                    <Reply className="w-4 h-4" />
                    <span>Reply</span>
                  </button>
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2">
                    <Forward className="w-4 h-4" />
                    <span>Forward</span>
                  </button>
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Schedule Meeting</span>
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                  />
                  <button className="absolute bottom-3 right-3 p-2 text-gray-400 hover:text-blue-400 transition-colors">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <InboxIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Select a message</h3>
                <p className="text-gray-400 max-w-md">
                  Choose a message from your inbox to read, reply, and take action on your networking opportunities.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}