'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Share2, MessageSquare, Bell, Settings, Plus, 
  Crown, UserCheck, UserPlus, Sparkles, Target, Zap,
  TrendingUp, Lightbulb, Award, Star, CheckCircle,
  ArrowRight, Filter, Search, MoreHorizontal
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  avatar: string;
  status: 'active' | 'invited' | 'inactive';
  joinedAt: string;
  lastActive: string;
  contributions: {
    insights: number;
    introductions: number;
    goals: number;
  };
}

interface SharedInsight {
  id: string;
  title: string;
  description: string;
  sharedBy: string;
  sharedAt: string;
  type: 'opportunity' | 'trend' | 'warning' | 'success';
  score: number;
  reactions: {
    likes: number;
    comments: number;
  };
}

interface CollectiveGoal {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  progress: number;
  contributors: string[];
  deadline: string;
  impact: 'high' | 'medium' | 'low';
}

export function CollaborationHub() {
  const [activeTab, setActiveTab] = useState<'team' | 'insights' | 'goals'>('team');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      email: 'sarah@techcorp.com',
      role: 'admin',
      avatar: 'SC',
      status: 'active',
      joinedAt: '2024-01-01',
      lastActive: '2 hours ago',
      contributions: { insights: 12, introductions: 8, goals: 3 }
    },
    {
      id: '2',
      name: 'Mike Rodriguez',
      email: 'mike@startuphub.io',
      role: 'member',
      avatar: 'MR',
      status: 'active',
      joinedAt: '2024-01-05',
      lastActive: '1 day ago',
      contributions: { insights: 8, introductions: 5, goals: 2 }
    },
    {
      id: '3',
      name: 'David Kim',
      email: 'david@stripe.com',
      role: 'member',
      avatar: 'DK',
      status: 'active',
      joinedAt: '2024-01-10',
      lastActive: '3 hours ago',
      contributions: { insights: 15, introductions: 12, goals: 4 }
    }
  ];

  const sharedInsights: SharedInsight[] = [
    {
      id: '1',
      title: 'High-Value Network Gap Detected',
      description: 'Our team network shows a significant gap in connections to Series A investors. Consider reaching out to existing VC connections.',
      sharedBy: 'Sarah Chen',
      sharedAt: '2 hours ago',
      type: 'opportunity',
      score: 85,
      reactions: { likes: 3, comments: 2 }
    },
    {
      id: '2',
      title: 'Growing Interest in Fintech Connections',
      description: 'Recent interactions show increased engagement with fintech professionals. Consider focusing networking efforts in this direction.',
      sharedBy: 'Mike Rodriguez',
      sharedAt: '1 day ago',
      type: 'trend',
      score: 78,
      reactions: { likes: 2, comments: 1 }
    }
  ];

  const collectiveGoals: CollectiveGoal[] = [
    {
      id: '1',
      title: 'Raise Series A Funding',
      description: 'Collective goal to raise $5M Series A funding by Q2 2024',
      status: 'active',
      progress: 35,
      contributors: ['Sarah Chen', 'Mike Rodriguez', 'David Kim'],
      deadline: '2024-06-30',
      impact: 'high'
    },
    {
      id: '2',
      title: 'Build Advisory Board',
      description: 'Assemble a diverse advisory board with industry experts',
      status: 'active',
      progress: 60,
      contributors: ['Sarah Chen', 'David Kim'],
      deadline: '2024-04-15',
      impact: 'medium'
    }
  ];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Crown;
      case 'member': return UserCheck;
      default: return Users;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'invited': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'from-yellow-500 to-orange-500';
      case 'trend': return 'from-blue-500 to-purple-500';
      case 'warning': return 'from-red-500 to-rose-500';
      case 'success': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="bg-black/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Collaboration Hub</h2>
            <p className="text-sm text-gray-400">Team insights and shared goals</p>
          </div>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-white/5 rounded-xl p-1">
        {[
          { id: 'team', label: 'Team', icon: Users },
          { id: 'insights', label: 'Insights', icon: Lightbulb },
          { id: 'goals', label: 'Goals', icon: Target }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search team members, insights, or goals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50"
        />
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'team' && (
            <div className="space-y-4">
              {teamMembers.map((member) => {
                const RoleIcon = getRoleIcon(member.role);
                return (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-semibold">
                        {member.avatar}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-white font-medium">{member.name}</h3>
                          <RoleIcon className="w-4 h-4 text-blue-400" />
                        </div>
                        <p className="text-sm text-gray-400">{member.email}</p>
                        <p className={`text-xs ${getStatusColor(member.status)}`}>
                          {member.status} • Last active {member.lastActive}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>{member.contributions.insights} insights</span>
                        <span>{member.contributions.introductions} intros</span>
                        <span>{member.contributions.goals} goals</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-4">
              {sharedInsights.map((insight) => (
                <div key={insight.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 bg-gradient-to-r ${getInsightColor(insight.type)} rounded-lg flex items-center justify-center`}>
                        <Lightbulb className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{insight.title}</h3>
                        <p className="text-sm text-gray-400">Shared by {insight.sharedBy} • {insight.sharedAt}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Score: {insight.score}</div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{insight.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <button className="flex items-center space-x-1 hover:text-white transition-colors">
                        <Star className="w-4 h-4" />
                        <span>{insight.reactions.likes}</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-white transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        <span>{insight.reactions.comments}</span>
                      </button>
                    </div>
                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="space-y-4">
              {collectiveGoals.map((goal) => (
                <div key={goal.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-medium">{goal.title}</h3>
                      <p className="text-sm text-gray-400">{goal.description}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm px-2 py-1 rounded-full ${
                        goal.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                        goal.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {goal.impact} impact
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-400">
                      Contributors: {goal.contributors.join(', ')}
                    </div>
                    <div className="text-gray-400">
                      Due: {goal.deadline}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
