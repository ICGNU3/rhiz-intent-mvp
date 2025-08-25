'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Plus,
  ChevronRight,
  Calendar,
  TrendingUp,
  Users,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Edit,
  Trash2,
  Share2,
  BarChart3,
  Sparkles,
  Brain,
  Flag,
  Rocket,
  Trophy,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for goals
const mockGoals = [
  {
    id: '1',
    title: 'Raise $2M Series A',
    description: 'Secure Series A funding to scale product development and expand team',
    status: 'in_progress',
    priority: 'high',
    progress: 67,
    dueDate: '2024-03-31',
    category: 'Fundraising',
    color: 'from-blue-500 to-purple-600',
    metrics: {
      connections: 24,
      introductions: 8,
      meetings: 5,
      proposals: 2
    },
    suggestions: 12,
    insights: [
      'Sarah Chen from Sequoia is highly aligned with your vision',
      '3 warm intros available through your network',
      'Your pitch deck engagement rate is 85% above average'
    ],
    nextActions: [
      'Follow up with Mike Ross about intro to a16z',
      'Schedule demo with potential lead investor',
      'Update financial projections for Q2'
    ]
  },
  {
    id: '2',
    title: 'Hire 5 Senior Engineers',
    description: 'Build out engineering team with senior talent in AI/ML and backend',
    status: 'in_progress',
    priority: 'high',
    progress: 40,
    dueDate: '2024-02-29',
    category: 'Recruiting',
    color: 'from-green-500 to-teal-600',
    metrics: {
      connections: 18,
      introductions: 6,
      meetings: 4,
      proposals: 1
    },
    suggestions: 8,
    insights: [
      'Emily Zhang at Meta could be a perfect engineering lead',
      'Your network includes 12 senior engineers open to opportunities',
      'Consider reaching out to MIT alumni network'
    ],
    nextActions: [
      'Review candidates from last week',
      'Post job openings on AngelList',
      'Set up technical interview panel'
    ]
  },
  {
    id: '3',
    title: 'Launch Product Hunt Campaign',
    description: 'Achieve #1 Product of the Day to drive awareness and signups',
    status: 'planned',
    priority: 'medium',
    progress: 20,
    dueDate: '2024-04-15',
    category: 'Marketing',
    color: 'from-orange-500 to-red-600',
    metrics: {
      connections: 15,
      introductions: 3,
      meetings: 2,
      proposals: 0
    },
    suggestions: 6,
    insights: [
      'Your network includes 8 top hunters on Product Hunt',
      'Best launch day based on data: Tuesday',
      'Similar products averaged 850 upvotes'
    ],
    nextActions: [
      'Prepare launch assets',
      'Reach out to top hunters',
      'Create teaser campaign'
    ]
  },
  {
    id: '4',
    title: 'Strategic Partnership with OpenAI',
    description: 'Establish partnership for API access and co-marketing opportunities',
    status: 'completed',
    priority: 'high',
    progress: 100,
    dueDate: '2024-01-15',
    category: 'Partnerships',
    color: 'from-purple-500 to-pink-600',
    metrics: {
      connections: 10,
      introductions: 4,
      meetings: 6,
      proposals: 1
    },
    suggestions: 0,
    insights: [
      'Partnership resulted in 40% cost reduction',
      'Access to GPT-4 fine-tuning capabilities',
      'Co-marketing reached 100K developers'
    ],
    nextActions: []
  }
];

const categories = [
  { id: 'all', label: 'All Goals', count: 12 },
  { id: 'fundraising', label: 'Fundraising', count: 3 },
  { id: 'recruiting', label: 'Recruiting', count: 4 },
  { id: 'marketing', label: 'Marketing', count: 2 },
  { id: 'partnerships', label: 'Partnerships', count: 3 }
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'text-red-500 bg-red-500/10';
    case 'medium': return 'text-yellow-500 bg-yellow-500/10';
    case 'low': return 'text-green-500 bg-green-500/10';
    default: return 'text-gray-500 bg-gray-500/10';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return CheckCircle;
    case 'in_progress': return Clock;
    case 'planned': return Calendar;
    default: return AlertCircle;
  }
};

export default function GoalsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [showAICoach, setShowAICoach] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Premium gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-20">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Goals</h1>
                  <p className="text-sm text-gray-400">Track and achieve your objectives</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* AI Coach */}
                <button
                  onClick={() => setShowAICoach(!showAICoach)}
                  className={cn(
                    "px-4 py-2 rounded-lg transition-all flex items-center space-x-2",
                    showAICoach ? "bg-blue-600 text-white" : "bg-white/10 hover:bg-white/20"
                  )}
                >
                  <Brain className="w-4 h-4" />
                  <span className="text-sm">AI Coach</span>
                </button>

                {/* Analytics */}
                <button className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm">Analytics</span>
                </button>

                {/* Create Goal */}
                <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:opacity-90 transition-all flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Create Goal</span>
                </button>
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex items-center space-x-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm transition-all",
                    selectedCategory === category.id
                      ? "bg-blue-600 text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  )}
                >
                  {category.label}
                  <span className="ml-1.5 text-xs opacity-70">({category.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Coach Panel */}
        <AnimatePresence>
          {showAICoach && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-white/10 bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold">AI Goal Coach</h3>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center space-x-2 mb-2">
                      <Rocket className="w-4 h-4 text-green-500" />
                      <p className="text-sm font-medium">Top Opportunity</p>
                    </div>
                    <p className="text-sm text-gray-300">Your Series A goal is 67% complete. Focus on closing 2 more investor meetings this week.</p>
                    <button className="mt-3 text-xs text-blue-400 hover:text-blue-300">View Action Plan →</button>
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                      <p className="text-sm font-medium">At Risk</p>
                    </div>
                    <p className="text-sm text-gray-300">Engineering hiring is behind schedule. Consider leveraging your MIT network for referrals.</p>
                    <button className="mt-3 text-xs text-blue-400 hover:text-blue-300">Get Suggestions →</button>
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center space-x-2 mb-2">
                      <Trophy className="w-4 h-4 text-purple-500" />
                      <p className="text-sm font-medium">Quick Win</p>
                    </div>
                    <p className="text-sm text-gray-300">3 warm intros are ready for your Product Hunt launch. Activate them 2 weeks before launch.</p>
                    <button className="mt-3 text-xs text-blue-400 hover:text-blue-300">Prepare Launch →</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Goals Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockGoals.map((goal, index) => {
              const StatusIcon = getStatusIcon(goal.status);
              
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden hover:bg-gray-900/70 transition-all group"
                >
                  {/* Goal Header */}
                  <div className={cn("h-2 bg-gradient-to-r", goal.color)} />
                  
                  <div className="p-6">
                    {/* Title and Status */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{goal.title}</h3>
                          <span className={cn("px-2 py-0.5 rounded-full text-xs", getPriorityColor(goal.priority))}>
                            {goal.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">{goal.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <StatusIcon className={cn(
                          "w-5 h-5",
                          goal.status === 'completed' ? 'text-green-500' :
                          goal.status === 'in_progress' ? 'text-blue-500' :
                          'text-gray-500'
                        )} />
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded">
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-gray-300 font-medium">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${goal.progress}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className={cn("h-full rounded-full bg-gradient-to-r", goal.color)}
                        />
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      <div className="text-center p-2 bg-white/5 rounded-lg">
                        <Users className="w-4 h-4 mx-auto mb-1 text-gray-400" />
                        <p className="text-xs text-gray-400">Connections</p>
                        <p className="text-sm font-medium">{goal.metrics.connections}</p>
                      </div>
                      <div className="text-center p-2 bg-white/5 rounded-lg">
                        <Share2 className="w-4 h-4 mx-auto mb-1 text-gray-400" />
                        <p className="text-xs text-gray-400">Intros</p>
                        <p className="text-sm font-medium">{goal.metrics.introductions}</p>
                      </div>
                      <div className="text-center p-2 bg-white/5 rounded-lg">
                        <Calendar className="w-4 h-4 mx-auto mb-1 text-gray-400" />
                        <p className="text-xs text-gray-400">Meetings</p>
                        <p className="text-sm font-medium">{goal.metrics.meetings}</p>
                      </div>
                      <div className="text-center p-2 bg-white/5 rounded-lg">
                        <Flag className="w-4 h-4 mx-auto mb-1 text-gray-400" />
                        <p className="text-xs text-gray-400">Proposals</p>
                        <p className="text-sm font-medium">{goal.metrics.proposals}</p>
                      </div>
                    </div>

                    {/* AI Insights */}
                    {goal.insights.length > 0 && (
                      <div className="mb-4 p-3 bg-blue-600/10 rounded-lg border border-blue-600/20">
                        <div className="flex items-center space-x-2 mb-2">
                          <Brain className="w-4 h-4 text-blue-500" />
                          <span className="text-xs font-medium text-blue-400">AI Insights</span>
                        </div>
                        <p className="text-xs text-gray-300">{goal.insights[0]}</p>
                      </div>
                    )}

                    {/* Next Actions */}
                    {goal.nextActions.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-400 mb-2">Next Actions</p>
                        <div className="space-y-1">
                          {goal.nextActions.slice(0, 2).map((action, i) => (
                            <div key={i} className="flex items-center space-x-2 text-xs text-gray-300">
                              <ChevronRight className="w-3 h-3 text-gray-500" />
                              <span>{action}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center space-x-3 text-xs text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Due {goal.dueDate}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Zap className="w-3 h-3" />
                          <span>{goal.suggestions} suggestions</span>
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-all text-xs font-medium">
                        View Details
                      </button>
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
