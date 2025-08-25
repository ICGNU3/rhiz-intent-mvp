'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Play, Pause, Settings, Plus, Clock, CheckCircle, 
  AlertTriangle, Brain, MessageSquare, Calendar, Mail, 
  Users, Target, BarChart3, Filter, Search, MoreHorizontal,
  ArrowRight, Sparkles, RefreshCw, Power, Edit, Copy, Trash2,
  Timer, Bell, Send, UserPlus, FileText, Database, Star, ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { PageNavigation } from '@/app/components/PageNavigation';

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: string;
    label: string;
    icon: any;
    color: string;
  };
  actions: Array<{
    type: string;
    label: string;
    icon: any;
    color: string;
  }>;
  status: 'active' | 'paused' | 'draft';
  runsToday: number;
  successRate: number;
  lastRun?: Date;
  tags: string[];
}

const mockAutomations: Automation[] = [
  {
    id: '1',
    name: 'Smart Follow-up Sequence',
    description: 'Automatically send personalized follow-ups after meeting new connections',
    trigger: { type: 'new_connection', label: 'New Connection Added', icon: UserPlus, color: 'from-blue-500 to-cyan-500' },
    actions: [
      { type: 'wait', label: 'Wait 24 hours', icon: Clock, color: 'from-gray-500 to-gray-600' },
      { type: 'ai_message', label: 'Generate personalized message', icon: Brain, color: 'from-purple-500 to-pink-500' },
      { type: 'send_email', label: 'Send follow-up email', icon: Mail, color: 'from-green-500 to-emerald-500' }
    ],
    status: 'active',
    runsToday: 12,
    successRate: 94,
    lastRun: new Date(Date.now() - 1000 * 60 * 30),
    tags: ['Follow-up', 'AI-Powered']
  },
  {
    id: '2',
    name: 'Weekly Network Digest',
    description: 'Compile and send weekly insights about network growth and opportunities',
    trigger: { type: 'schedule', label: 'Every Monday 9 AM', icon: Calendar, color: 'from-orange-500 to-red-500' },
    actions: [
      { type: 'analyze_network', label: 'Analyze network changes', icon: BarChart3, color: 'from-blue-500 to-purple-500' },
      { type: 'generate_insights', label: 'Generate AI insights', icon: Sparkles, color: 'from-yellow-500 to-orange-500' },
      { type: 'send_digest', label: 'Send digest email', icon: FileText, color: 'from-indigo-500 to-purple-500' }
    ],
    status: 'active',
    runsToday: 1,
    successRate: 100,
    lastRun: new Date(Date.now() - 1000 * 60 * 60 * 24),
    tags: ['Weekly', 'Insights']
  },
  {
    id: '3',
    name: 'Goal Progress Tracker',
    description: 'Monitor networking goals and send progress updates with action suggestions',
    trigger: { type: 'goal_update', label: 'Goal Progress Updated', icon: Target, color: 'from-green-500 to-teal-500' },
    actions: [
      { type: 'check_progress', label: 'Analyze goal progress', icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
      { type: 'suggest_actions', label: 'Suggest next actions', icon: Brain, color: 'from-purple-500 to-pink-500' },
      { type: 'notify_user', label: 'Send notification', icon: Bell, color: 'from-blue-500 to-cyan-500' }
    ],
    status: 'paused',
    runsToday: 0,
    successRate: 87,
    tags: ['Goals', 'Progress']
  }
];

const automationTemplates = [
  {
    name: 'LinkedIn Connection Follow-up',
    description: 'Automatically follow up with new LinkedIn connections',
    category: 'Follow-up',
    complexity: 'Simple',
    estimatedTime: '5 min setup'
  },
  {
    name: 'Event Networking Sequence',
    description: 'Multi-step follow-up for people met at events',
    category: 'Events',
    complexity: 'Medium',
    estimatedTime: '15 min setup'
  },
  {
    name: 'Opportunity Alert System',
    description: 'Get notified when mutual connections can be introduced',
    category: 'Opportunities',
    complexity: 'Advanced',
    estimatedTime: '30 min setup'
  }
];

export default function AutomationsPage() {
  const [automations, setAutomations] = useState(mockAutomations);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  const filteredAutomations = automations.filter(automation => {
    const matchesFilter = filter === 'all' || automation.status === filter;
    const matchesSearch = searchQuery === '' || 
      automation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      automation.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const toggleAutomation = (id: string) => {
    setAutomations(prev => prev.map(automation => 
      automation.id === id 
        ? { ...automation, status: automation.status === 'active' ? 'paused' : 'active' }
        : automation
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'paused': return Pause;
      default: return Edit;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'paused': return 'text-yellow-500';
      default: return 'text-gray-500';
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
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="border-b border-white/10 backdrop-blur-xl bg-black/50"
        >
          <div className="px-4 md:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3 md:space-x-6">
              {/* Back to Dashboard */}
              <Link href="/dashboard" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group">
                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-white/10 transition-all">
                  <ChevronLeft className="w-4 h-4" />
                </div>
                <span className="text-sm hidden md:inline">Dashboard</span>
              </Link>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-semibold text-lg">Automations</h1>
                  <p className="text-xs text-gray-400 hidden md:block">AI-powered networking workflows</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4">
              <button 
                onClick={() => setShowTemplates(!showTemplates)}
                className="px-2 md:px-4 py-1.5 md:py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center space-x-1 md:space-x-2"
              >
                <Star className="w-3 md:w-4 h-3 md:h-4" />
                <span className="hidden md:inline">Templates</span>
              </button>
              <button className="px-2 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg text-xs md:text-sm font-medium hover:from-orange-700 hover:to-red-700 transition-all flex items-center space-x-1 md:space-x-2">
                <Plus className="w-3 md:w-4 h-3 md:h-4" />
                <span className="hidden md:inline">New Automation</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="p-4 md:p-6 border-b border-white/10"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { label: 'Active Automations', value: automations.filter(a => a.status === 'active').length, icon: Power, color: 'text-green-400' },
              { label: 'Runs Today', value: automations.reduce((sum, a) => sum + a.runsToday, 0), icon: RefreshCw, color: 'text-blue-400' },
              { label: 'Success Rate', value: `${Math.round(automations.reduce((sum, a) => sum + a.successRate, 0) / automations.length)}%`, icon: CheckCircle, color: 'text-emerald-400' },
              { label: 'Time Saved', value: '12.5h', icon: Timer, color: 'text-purple-400' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10"
              >
                <div className="flex items-center space-x-3">
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                  <div>
                    <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="p-4 md:p-6">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search automations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-sm"
              />
            </div>

            <div className="flex items-center space-x-2">
              {['all', 'active', 'paused', 'draft'].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={cn(
                    "px-3 py-2 text-sm rounded-lg transition-all capitalize",
                    filter === filterOption 
                      ? "bg-orange-600/20 text-orange-400 border border-orange-600/30" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {filterOption}
                </button>
              ))}
            </div>
          </div>

          {/* Templates Panel */}
          <AnimatePresence>
            {showTemplates && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 bg-gradient-to-br from-orange-600/10 to-red-600/10 backdrop-blur-xl rounded-xl p-6 border border-orange-600/20"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Star className="w-5 h-5 text-orange-400" />
                  <h3 className="text-lg font-semibold">Automation Templates</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {automationTemplates.map((template) => (
                    <div key={template.name} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h4 className="font-semibold mb-2">{template.name}</h4>
                      <p className="text-sm text-gray-400 mb-3">{template.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="bg-orange-600/20 text-orange-400 px-2 py-1 rounded-full">
                          {template.category}
                        </span>
                        <span className="text-gray-500">{template.estimatedTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Automations List */}
          <div className="space-y-4">
            {filteredAutomations.map((automation, index) => {
              const StatusIcon = getStatusIcon(automation.status);
              
              return (
                <motion.div
                  key={automation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br",
                        automation.trigger.color
                      )}>
                        <automation.trigger.icon className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{automation.name}</h3>
                          <StatusIcon className={cn("w-4 h-4", getStatusColor(automation.status))} />
                        </div>
                        <p className="text-sm text-gray-400 mb-3">{automation.description}</p>
                        
                        {/* Automation Flow */}
                        <div className="flex items-center space-x-2 mb-4 overflow-x-auto">
                          <div className="flex items-center space-x-1 bg-white/10 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap">
                            <automation.trigger.icon className="w-3 h-3" />
                            <span>{automation.trigger.label}</span>
                          </div>
                          
                          {automation.actions.map((action, actionIndex) => (
                            <div key={actionIndex} className="flex items-center space-x-1">
                              <ArrowRight className="w-3 h-3 text-gray-500" />
                              <div className="flex items-center space-x-1 bg-white/10 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap">
                                <action.icon className="w-3 h-3" />
                                <span>{action.label}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Tags */}
                        <div className="flex items-center space-x-2">
                          {automation.tags.map((tag) => (
                            <span key={tag} className="text-xs bg-white/10 text-gray-400 px-2 py-1 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleAutomation(automation.id)}
                        className={cn(
                          "w-10 h-6 rounded-full transition-all duration-200 relative",
                          automation.status === 'active' ? "bg-green-600" : "bg-white/20"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-200",
                          automation.status === 'active' ? "translate-x-4" : "translate-x-0.5"
                        )} />
                      </button>

                      <button className="p-2 text-gray-400 hover:text-white transition-colors">
                        <Settings className="w-4 h-4" />
                      </button>

                      <button className="p-2 text-gray-400 hover:text-white transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                    <div className="text-center">
                      <div className="text-lg font-bold">{automation.runsToday}</div>
                      <div className="text-xs text-gray-400">Runs Today</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">{automation.successRate}%</div>
                      <div className="text-xs text-gray-400">Success Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-300">
                        {automation.lastRun ? formatTime(automation.lastRun) : 'Never'}
                      </div>
                      <div className="text-xs text-gray-400">Last Run</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}