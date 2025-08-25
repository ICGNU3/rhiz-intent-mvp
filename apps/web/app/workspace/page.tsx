'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Users, Plus, Settings, Crown, Shield, Eye,
  MoreHorizontal, Search, Filter, Calendar, BarChart3,
  Globe, Lock, Mail, Bell, Star, Archive, Trash2,
  UserPlus, UserMinus, Edit, Copy, ExternalLink,
  Sparkles, Target, Zap, MessageSquare, Activity,
  CheckCircle, AlertCircle, Clock, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Workspace {
  id: string;
  name: string;
  description: string;
  avatar: string;
  memberCount: number;
  role: 'owner' | 'admin' | 'member';
  plan: 'free' | 'pro' | 'enterprise';
  isActive: boolean;
  createdAt: Date;
  stats: {
    connections: number;
    goals: number;
    opportunities: number;
    activities: number;
  };
  members: Array<{
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: 'owner' | 'admin' | 'member';
    status: 'active' | 'invited' | 'inactive';
    joinedAt: Date;
  }>;
}

const mockWorkspaces: Workspace[] = [
  {
    id: '1',
    name: 'Personal Network',
    description: 'Your main networking workspace for building professional relationships',
    avatar: '👤',
    memberCount: 1,
    role: 'owner',
    plan: 'pro',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    stats: { connections: 127, goals: 3, opportunities: 12, activities: 34 },
    members: [
      {
        id: '1',
        name: 'Alex Johnson',
        email: 'alex@example.com',
        avatar: 'AJ',
        role: 'owner',
        status: 'active',
        joinedAt: new Date('2024-01-15')
      }
    ]
  },
  {
    id: '2',
    name: 'TechCorp Team',
    description: 'Collaborative networking workspace for the TechCorp engineering team',
    avatar: '🏢',
    memberCount: 8,
    role: 'admin',
    plan: 'enterprise',
    isActive: false,
    createdAt: new Date('2024-02-20'),
    stats: { connections: 456, goals: 15, opportunities: 28, activities: 89 },
    members: [
      {
        id: '2',
        name: 'Sarah Chen',
        email: 'sarah@techcorp.com',
        avatar: 'SC',
        role: 'owner',
        status: 'active',
        joinedAt: new Date('2024-02-20')
      },
      {
        id: '3',
        name: 'Alex Johnson',
        email: 'alex@techcorp.com',
        avatar: 'AJ',
        role: 'admin',
        status: 'active',
        joinedAt: new Date('2024-02-22')
      },
      {
        id: '4',
        name: 'Mike Rodriguez',
        email: 'mike@techcorp.com',
        avatar: 'MR',
        role: 'member',
        status: 'invited',
        joinedAt: new Date('2024-03-01')
      }
    ]
  },
  {
    id: '3',
    name: 'Startup Founders',
    description: 'Exclusive community workspace for Y Combinator batch founders',
    avatar: '🚀',
    memberCount: 25,
    role: 'member',
    plan: 'pro',
    isActive: false,
    createdAt: new Date('2024-03-10'),
    stats: { connections: 234, goals: 8, opportunities: 19, activities: 56 },
    members: [
      {
        id: '5',
        name: 'Lisa Wang',
        email: 'lisa@ycombinator.com',
        avatar: 'LW',
        role: 'owner',
        status: 'active',
        joinedAt: new Date('2024-03-10')
      },
      {
        id: '6',
        name: 'David Park',
        email: 'david@startup.com',
        avatar: 'DP',
        role: 'admin',
        status: 'active',
        joinedAt: new Date('2024-03-12')
      }
    ]
  }
];

export default function WorkspacePage() {
  const [workspaces] = useState(mockWorkspaces);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(workspaces[0]);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'settings'>('overview');
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);

  const switchWorkspace = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    // Here you would typically update the global workspace context
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'enterprise': return Crown;
      case 'pro': return Star;
      default: return Users;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'text-purple-400';
      case 'pro': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return Crown;
      case 'admin': return Shield;
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex h-screen">
        {/* Workspace Sidebar */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-80 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col"
        >
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">Workspaces</h1>
                  <p className="text-sm text-gray-400">Manage your networks</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateWorkspace(true)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search workspaces..."
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-2">
              {workspaces.map((workspace) => {
                const PlanIcon = getPlanIcon(workspace.plan);
                const isSelected = selectedWorkspace?.id === workspace.id;
                
                return (
                  <motion.div
                    key={workspace.id}
                    layout
                    onClick={() => switchWorkspace(workspace)}
                    className={cn(
                      "p-4 rounded-xl cursor-pointer transition-all group border",
                      isSelected 
                        ? "bg-blue-600/20 border-blue-600/30" 
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{workspace.avatar}</div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold truncate">{workspace.name}</h3>
                          <PlanIcon className={cn("w-3 h-3", getPlanColor(workspace.plan))} />
                          {workspace.isActive && (
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                          {workspace.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">
                            {workspace.memberCount} member{workspace.memberCount !== 1 ? 's' : ''}
                          </span>
                          <span className={cn(
                            "capitalize",
                            workspace.role === 'owner' ? 'text-purple-400' :
                            workspace.role === 'admin' ? 'text-blue-400' : 'text-gray-400'
                          )}>
                            {workspace.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

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
          {selectedWorkspace ? (
            <>
              {/* Workspace Header */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="border-b border-white/10 bg-white/5 backdrop-blur-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">{selectedWorkspace.avatar}</div>
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h2 className="text-2xl font-bold">{selectedWorkspace.name}</h2>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium capitalize",
                          selectedWorkspace.plan === 'enterprise' ? 'bg-purple-600/20 text-purple-400 border border-purple-600/30' :
                          selectedWorkspace.plan === 'pro' ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30' :
                          'bg-gray-600/20 text-gray-400 border border-gray-600/30'
                        )}>
                          {selectedWorkspace.plan}
                        </span>
                      </div>
                      <p className="text-gray-400">{selectedWorkspace.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {selectedWorkspace.role === 'owner' && (
                      <button className="p-2 text-gray-400 hover:text-white transition-colors">
                        <Settings className="w-5 h-5" />
                      </button>
                    )}
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2">
                      <UserPlus className="w-4 h-4" />
                      <span>Invite Members</span>
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-6">
                  {[
                    { label: 'Connections', value: selectedWorkspace.stats.connections, icon: Users, color: 'text-blue-400' },
                    { label: 'Active Goals', value: selectedWorkspace.stats.goals, icon: Target, color: 'text-green-400' },
                    { label: 'Opportunities', value: selectedWorkspace.stats.opportunities, icon: Zap, color: 'text-orange-400' },
                    { label: 'Activities', value: selectedWorkspace.stats.activities, icon: Activity, color: 'text-purple-400' }
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <stat.icon className={cn("w-5 h-5", stat.color)} />
                      </div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm text-gray-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Tabs */}
              <div className="border-b border-white/10 px-6">
                <div className="flex space-x-6">
                  {[
                    { key: 'overview', label: 'Overview', icon: BarChart3 },
                    { key: 'members', label: 'Members', icon: Users },
                    { key: 'settings', label: 'Settings', icon: Settings }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        className={cn(
                          "flex items-center space-x-2 px-4 py-3 border-b-2 transition-all",
                          activeTab === tab.key
                            ? "border-blue-500 text-blue-400"
                            : "border-transparent text-gray-400 hover:text-white"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-auto p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'overview' && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                          <div className="space-y-3">
                            {[
                              { type: 'connection', message: 'Sarah connected with Mike Rodriguez', time: '2 hours ago', icon: Users },
                              { type: 'goal', message: 'Team completed "Meet 5 investors" goal', time: '1 day ago', icon: Target },
                              { type: 'opportunity', message: 'New introduction opportunity identified', time: '2 days ago', icon: Zap }
                            ].map((activity, index) => (
                              <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                                <activity.icon className="w-4 h-4 text-gray-400" />
                                <div className="flex-1">
                                  <p className="text-sm">{activity.message}</p>
                                  <p className="text-xs text-gray-500">{activity.time}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { label: 'View Analytics', icon: BarChart3, href: '/analytics' },
                              { label: 'Manage Goals', icon: Target, href: '/goals' },
                              { label: 'Find Opportunities', icon: Zap, href: '/opportunities' },
                              { label: 'Team Connections', icon: Users, href: '/connections' }
                            ].map((action) => (
                              <Link
                                key={action.label}
                                href={action.href}
                                className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-center transition-all group"
                              >
                                <action.icon className="w-5 h-5 text-gray-400 group-hover:text-white mx-auto mb-2" />
                                <p className="text-xs">{action.label}</p>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'members' && (
                    <motion.div
                      key="members"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-6"
                    >
                      <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold">
                            Team Members ({selectedWorkspace.members.length})
                          </h3>
                          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
                            Invite Member
                          </button>
                        </div>

                        <div className="space-y-3">
                          {selectedWorkspace.members.map((member) => {
                            const RoleIcon = getRoleIcon(member.role);
                            return (
                              <div key={member.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">
                                    {member.avatar}
                                  </div>
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium">{member.name}</span>
                                      <RoleIcon className="w-3 h-3 text-gray-400" />
                                    </div>
                                    <div className="text-sm text-gray-400">{member.email}</div>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                  <span className={cn("text-sm capitalize", getStatusColor(member.status))}>
                                    {member.status}
                                  </span>
                                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'settings' && (
                    <motion.div
                      key="settings"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-6"
                    >
                      <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                        <h3 className="text-lg font-semibold mb-6">Workspace Settings</h3>
                        
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium mb-2">Workspace Name</label>
                            <input
                              type="text"
                              defaultValue={selectedWorkspace.name}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                              rows={3}
                              defaultValue={selectedWorkspace.description}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                            />
                          </div>

                          <div className="flex items-center justify-between p-4 bg-red-600/10 rounded-lg border border-red-600/20">
                            <div>
                              <h4 className="font-medium text-red-300">Delete Workspace</h4>
                              <p className="text-sm text-gray-400">This action cannot be undone</p>
                            </div>
                            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors">
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Select a Workspace</h3>
                <p className="text-gray-400">Choose a workspace to manage your team&apos;s network</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}