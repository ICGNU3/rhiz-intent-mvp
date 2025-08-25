'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, TrendingUp, Network, Users, Target, Zap, BarChart3,
  Clock, Calendar, MapPin, Building, Star, ArrowUpRight, 
  ArrowDownRight, Eye, Filter, Download, Share2, Sparkles,
  CircuitBoard, GitBranch, Layers, Activity, Globe, UserCheck,
  MessageSquare, Coffee, Heart, Briefcase, GraduationCap,
  Award, Lightbulb, AlertCircle, CheckCircle, Info, Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface NetworkCluster {
  id: string;
  name: string;
  size: number;
  connections: number;
  strength: number;
  type: 'industry' | 'location' | 'school' | 'interest';
  color: string;
  members: Array<{
    name: string;
    role: string;
    avatar: string;
  }>;
}

interface Insight {
  id: string;
  type: 'opportunity' | 'warning' | 'success' | 'trend';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  data?: any;
}

const mockClusters: NetworkCluster[] = [
  {
    id: '1',
    name: 'AI/ML Founders',
    size: 23,
    connections: 156,
    strength: 87,
    type: 'industry',
    color: 'from-blue-500 to-cyan-500',
    members: [
      { name: 'Sarah Chen', role: 'CEO @ DeepMind', avatar: 'SC' },
      { name: 'Alex Kumar', role: 'CTO @ OpenAI', avatar: 'AK' },
      { name: 'Maria Rodriguez', role: 'VP @ Google AI', avatar: 'MR' },
    ]
  },
  {
    id: '2', 
    name: 'San Francisco Tech',
    size: 45,
    connections: 289,
    strength: 94,
    type: 'location',
    color: 'from-green-500 to-emerald-500',
    members: [
      { name: 'John Doe', role: 'Partner @ A16Z', avatar: 'JD' },
      { name: 'Lisa Wang', role: 'Founder @ Stripe', avatar: 'LW' },
      { name: 'Mike Johnson', role: 'Director @ Meta', avatar: 'MJ' },
    ]
  },
  {
    id: '3',
    name: 'Stanford Alumni',
    size: 31,
    connections: 198,
    strength: 76,
    type: 'school',
    color: 'from-purple-500 to-pink-500',
    members: [
      { name: 'David Park', role: 'Founder @ Tesla', avatar: 'DP' },
      { name: 'Emma Stone', role: 'VP @ LinkedIn', avatar: 'ES' },
      { name: 'Ryan Chen', role: 'CEO @ Airbnb', avatar: 'RC' },
    ]
  },
  {
    id: '4',
    name: 'Design Leaders',
    size: 18,
    connections: 124,
    strength: 69,
    type: 'interest',
    color: 'from-orange-500 to-red-500',
    members: [
      { name: 'Sophie Kim', role: 'Design @ Figma', avatar: 'SK' },
      { name: 'Tom Wilson', role: 'CDO @ Uber', avatar: 'TW' },
      { name: 'Anna Lee', role: 'Design @ Apple', avatar: 'AL' },
    ]
  }
];

const mockInsights: Insight[] = [
  {
    id: '1',
    type: 'opportunity',
    title: 'Untapped Connection Potential',
    description: 'Your AI/ML and Design clusters have minimal overlap despite shared interests in human-centered AI. 3 strategic introductions could bridge this gap.',
    impact: 'high',
    actionable: true,
    data: { potential_connections: 3, shared_interests: ['human-centered AI', 'UX research'] }
  },
  {
    id: '2',
    type: 'success',
    title: 'Stanford Network Strength',
    description: 'Your Stanford connections have increased 40% this quarter, with particularly strong growth in fintech alumni.',
    impact: 'medium',
    actionable: false,
    data: { growth_rate: 40, quarter: 'Q4 2024' }
  },
  {
    id: '3',
    type: 'warning',
    title: 'Geographic Concentration Risk',
    description: '78% of your network is SF-based. Expanding to NYC and Austin could unlock new opportunities.',
    impact: 'medium',
    actionable: true,
    data: { sf_percentage: 78, suggested_locations: ['NYC', 'Austin', 'Boston'] }
  },
  {
    id: '4',
    type: 'trend',
    title: 'Emerging Pattern: Sustainability Tech',
    description: 'Growing cluster forming around climate tech and sustainability. Early entry could position you advantageously.',
    impact: 'high',
    actionable: true,
    data: { cluster_growth: 145, time_period: '6 months' }
  }
];

export default function InsightsPage() {
  const [clusters] = useState(mockClusters);
  const [insights] = useState(mockInsights);
  const [selectedCluster, setSelectedCluster] = useState<NetworkCluster | null>(null);
  const [viewMode, setViewMode] = useState<'clusters' | 'flow' | 'trends'>('clusters');
  const [timeRange, setTimeRange] = useState('3m');

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return Lightbulb;
      case 'success': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'trend': return TrendingUp;
      default: return Info;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'from-yellow-500 to-orange-500';
      case 'success': return 'from-green-500 to-emerald-500';
      case 'warning': return 'from-red-500 to-rose-500';
      case 'trend': return 'from-blue-500 to-purple-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getClusterIcon = (type: string) => {
    switch (type) {
      case 'industry': return Briefcase;
      case 'location': return MapPin;
      case 'school': return GraduationCap;
      case 'interest': return Star;
      default: return Users;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-600/5 rounded-full blur-2xl" />
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
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-semibold text-lg">Deep Insights</h1>
                  <p className="text-xs text-gray-400 hidden md:block">AI-powered network analysis</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Time Range */}
              <div className="flex items-center bg-white/5 rounded-lg p-1">
                {['1m', '3m', '6m', '1y'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={cn(
                      "px-2 md:px-3 py-1 rounded text-xs md:text-sm transition-all",
                      timeRange === range ? "bg-white/10 text-white" : "text-gray-400"
                    )}
                  >
                    {range}
                  </button>
                ))}
              </div>

              <button className="px-2 md:px-4 py-1.5 md:py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center space-x-1 md:space-x-2">
                <Download className="w-3 md:w-4 h-3 md:h-4" />
                <span className="hidden md:inline">Export</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* View Mode Toggle */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="p-4 md:p-6 border-b border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {[
                { key: 'clusters', label: 'Network Clusters', icon: CircuitBoard },
                { key: 'flow', label: 'Connection Flow', icon: GitBranch },
                { key: 'trends', label: 'Growth Trends', icon: TrendingUp }
              ].map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.key}
                    onClick={() => setViewMode(mode.key as any)}
                    className={cn(
                      "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all text-sm",
                      viewMode === mode.key
                        ? "bg-purple-600/20 text-purple-400 border border-purple-600/30"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{mode.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center space-x-3 text-sm text-gray-400">
              <Activity className="w-4 h-4 text-green-500" />
              <span>Live Analysis</span>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { label: 'Network Clusters', value: clusters.length, change: '+2', icon: Layers, color: 'text-blue-400' },
              { label: 'Connection Strength', value: '85%', change: '+12%', icon: Network, color: 'text-green-400' },
              { label: 'Growth Rate', value: '23%', change: '+5%', icon: TrendingUp, color: 'text-purple-400' },
              { label: 'Opportunities', value: insights.filter(i => i.type === 'opportunity').length, change: '+3', icon: Lightbulb, color: 'text-yellow-400' }
            ].map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <metric.icon className={cn("w-5 h-5", metric.color)} />
                  <div className="flex items-center space-x-1 text-xs text-green-400">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>{metric.change}</span>
                  </div>
                </div>
                <div className="text-2xl font-bold mb-1">{metric.value}</div>
                <div className="text-xs text-gray-400">{metric.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
            {/* Left Column - Clusters or Visualization */}
            <div className="xl:col-span-2 space-y-6">
              <AnimatePresence mode="wait">
                {viewMode === 'clusters' && (
                  <motion.div
                    key="clusters"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold">Network Clusters</h3>
                      <div className="text-sm text-gray-400">
                        {clusters.length} active clusters
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {clusters.map((cluster) => {
                        const ClusterIcon = getClusterIcon(cluster.type);
                        return (
                          <motion.div
                            key={cluster.id}
                            layout
                            onClick={() => setSelectedCluster(cluster)}
                            className={cn(
                              "p-4 rounded-xl border cursor-pointer transition-all group hover:scale-105",
                              selectedCluster?.id === cluster.id
                                ? "border-purple-500 bg-purple-500/10"
                                : "border-white/10 bg-white/5 hover:bg-white/10"
                            )}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center", cluster.color)}>
                                <ClusterIcon className="w-5 h-5 text-white" />
                              </div>
                              <div className="text-right text-sm">
                                <div className="font-semibold">{cluster.size}</div>
                                <div className="text-gray-400">members</div>
                              </div>
                            </div>

                            <h4 className="font-semibold mb-2">{cluster.name}</h4>
                            
                            <div className="flex items-center justify-between text-sm mb-3">
                              <span className="text-gray-400">Strength</span>
                              <span className={cn(
                                "font-medium",
                                cluster.strength > 80 ? "text-green-400" : 
                                cluster.strength > 60 ? "text-yellow-400" : "text-red-400"
                              )}>
                                {cluster.strength}%
                              </span>
                            </div>

                            <div className="w-full bg-white/10 rounded-full h-2 mb-3">
                              <div 
                                className={cn("h-2 rounded-full bg-gradient-to-r", cluster.color)}
                                style={{ width: `${cluster.strength}%` }}
                              />
                            </div>

                            <div className="flex items-center -space-x-2">
                              {cluster.members.slice(0, 3).map((member, index) => (
                                <div key={index} className="w-6 h-6 bg-gray-600 rounded-full border-2 border-black flex items-center justify-center text-xs font-semibold">
                                  {member.avatar}
                                </div>
                              ))}
                              {cluster.members.length > 3 && (
                                <div className="w-6 h-6 bg-white/20 rounded-full border-2 border-black flex items-center justify-center text-xs">
                                  +{cluster.members.length - 3}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {viewMode === 'flow' && (
                  <motion.div
                    key="flow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
                  >
                    <h3 className="text-xl font-semibold mb-6">Connection Flow Analysis</h3>
                    <div className="h-96 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <GitBranch className="w-16 h-16 text-white/30 mx-auto mb-4" />
                        <p className="text-gray-400 mb-2">Interactive flow diagram</p>
                        <p className="text-sm text-gray-500">Visualizes how connections flow between clusters</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {viewMode === 'trends' && (
                  <motion.div
                    key="trends"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
                  >
                    <h3 className="text-xl font-semibold mb-6">Growth Trends</h3>
                    <div className="h-96 bg-gradient-to-br from-green-600/10 to-teal-600/10 rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="w-16 h-16 text-white/30 mx-auto mb-4" />
                        <p className="text-gray-400 mb-2">Trend analysis charts</p>
                        <p className="text-sm text-gray-500">Shows network growth patterns over time</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Selected Cluster Details */}
              <AnimatePresence>
                {selectedCluster && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-purple-500/30"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold">{selectedCluster.name} Details</h4>
                      <button 
                        onClick={() => setSelectedCluster(null)}
                        className="text-gray-400 hover:text-white"
                      >
                        ×
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-2xl font-bold">{selectedCluster.connections}</div>
                        <div className="text-xs text-gray-400">Total Connections</div>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-2xl font-bold text-green-400">{selectedCluster.strength}%</div>
                        <div className="text-xs text-gray-400">Network Strength</div>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-2xl font-bold">{selectedCluster.size}</div>
                        <div className="text-xs text-gray-400">Active Members</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-300">Key Members</h5>
                      {selectedCluster.members.map((member, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">
                            {member.avatar}
                          </div>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-gray-400">{member.role}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column - AI Insights */}
            <div className="space-y-6">
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI Insights</h3>
                    <p className="text-xs text-gray-400">Powered by network analysis</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {insights.map((insight) => {
                    const InsightIcon = getInsightIcon(insight.type);
                    return (
                      <motion.div
                        key={insight.id}
                        layout
                        className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all group"
                      >
                        <div className="flex items-start space-x-3 mb-3">
                          <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center", getInsightColor(insight.type))}>
                            <InsightIcon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-sm">{insight.title}</h4>
                              <span className={cn(
                                "text-xs px-2 py-1 rounded-full",
                                insight.impact === 'high' ? 'bg-red-600/20 text-red-400' :
                                insight.impact === 'medium' ? 'bg-yellow-600/20 text-yellow-400' :
                                'bg-green-600/20 text-green-400'
                              )}>
                                {insight.impact}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed">
                              {insight.description}
                            </p>
                          </div>
                        </div>

                        {insight.actionable && (
                          <button className="w-full mt-3 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg text-xs font-medium text-purple-400 transition-colors">
                            Take Action
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                <Link 
                  href="/opportunities"
                  className="block w-full mt-6 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-center text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  Explore All Opportunities
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}