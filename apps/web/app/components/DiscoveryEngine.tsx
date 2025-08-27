'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, MapPin, Building, Users, Target, Zap,
  TrendingUp, Lightbulb, Star, ArrowRight, Clock, Calendar,
  MessageSquare, Phone, Mail, Linkedin, Globe, Award,
  BarChart3, PieChart, Network, GitBranch, Layers, Activity,
  Eye, EyeOff, Share2, Bookmark, MoreHorizontal, Sparkles
} from 'lucide-react';

interface NetworkOpportunity {
  id: string;
  title: string;
  description: string;
  type: 'introduction' | 'reconnection' | 'collaboration' | 'investment' | 'mentorship';
  score: number;
  people: Array<{
    id: string;
    name: string;
    role: string;
    company: string;
    avatar: string;
    strength: number;
  }>;
  mutualConnections: number;
  lastContact: string;
  potentialValue: number;
  actionItems: string[];
}

interface NetworkCluster {
  id: string;
  name: string;
  type: 'industry' | 'location' | 'school' | 'interest' | 'company';
  size: number;
  strength: number;
  growth: number;
  members: Array<{
    id: string;
    name: string;
    role: string;
    avatar: string;
    centrality: number;
  }>;
  opportunities: number;
  insights: string[];
}

interface TrendAnalysis {
  id: string;
  title: string;
  description: string;
  trend: 'rising' | 'falling' | 'stable';
  change: number;
  timeframe: string;
  impact: 'high' | 'medium' | 'low';
  recommendations: string[];
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'connection' | 'goal' | 'insight' | 'action';
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  estimatedImpact: number;
  timeToAct: string;
}

export function DiscoveryEngine() {
  const [activeTab, setActiveTab] = useState<'opportunities' | 'clusters' | 'trends' | 'recommendations'>('opportunities');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const networkOpportunities: NetworkOpportunity[] = [
    {
      id: '1',
      title: 'AI/ML Investment Network',
      description: 'High-potential introduction between AI startup founders and Series A investors',
      type: 'introduction',
      score: 94,
      people: [
        {
          id: '1',
          name: 'Sarah Chen',
          role: 'Partner',
          company: 'Sequoia Capital',
          avatar: 'SC',
          strength: 95
        },
        {
          id: '2',
          name: 'Mike Rodriguez',
          role: 'Founder & CEO',
          company: 'AIStartup',
          avatar: 'MR',
          strength: 87
        }
      ],
      mutualConnections: 12,
      lastContact: '2 days ago',
      potentialValue: 85,
      actionItems: ['Schedule intro call', 'Prepare pitch deck', 'Follow up within 48h']
    },
    {
      id: '2',
      title: 'Fintech Collaboration Opportunity',
      description: 'Reconnect with former colleague now at Stripe for potential partnership',
      type: 'reconnection',
      score: 88,
      people: [
        {
          id: '3',
          name: 'David Kim',
          role: 'VP Engineering',
          company: 'Stripe',
          avatar: 'DK',
          strength: 82
        }
      ],
      mutualConnections: 8,
      lastContact: '3 weeks ago',
      potentialValue: 72,
      actionItems: ['Send congratulatory message', 'Schedule coffee meeting', 'Explore collaboration']
    }
  ];

  const networkClusters: NetworkCluster[] = [
    {
      id: '1',
      name: 'AI/ML Professionals',
      type: 'industry',
      size: 45,
      strength: 87,
      growth: 23,
      members: [
        { id: '1', name: 'Sarah Chen', role: 'Partner @ Sequoia', avatar: 'SC', centrality: 95 },
        { id: '2', name: 'Mike Rodriguez', role: 'Founder @ AIStartup', avatar: 'MR', centrality: 87 },
        { id: '3', name: 'Alex Park', role: 'Research Lead @ OpenAI', avatar: 'AP', centrality: 82 }
      ],
      opportunities: 8,
      insights: ['Growing investment interest', 'High collaboration potential', 'Strong technical expertise']
    },
    {
      id: '2',
      name: 'San Francisco Network',
      type: 'location',
      size: 78,
      strength: 76,
      growth: 15,
      members: [
        { id: '4', name: 'Lisa Wang', role: 'Founder @ Stripe', avatar: 'LW', centrality: 89 },
        { id: '5', name: 'David Kim', role: 'VP @ Stripe', avatar: 'DK', centrality: 82 },
        { id: '6', name: 'Emma Stone', role: 'VP @ LinkedIn', avatar: 'ES', centrality: 78 }
      ],
      opportunities: 12,
      insights: ['Geographic concentration', 'Strong local connections', 'Regular meetups']
    }
  ];

  const trendAnalysis: TrendAnalysis[] = [
    {
      id: '1',
      title: 'Growing Interest in Climate Tech',
      description: 'Your network shows increasing engagement with sustainability and climate technology professionals',
      trend: 'rising',
      change: 145,
      timeframe: '6 months',
      impact: 'high',
      recommendations: ['Focus networking efforts in climate tech', 'Attend sustainability conferences', 'Connect with climate VCs']
    },
    {
      id: '2',
      title: 'Declining Engagement with Traditional Finance',
      description: 'Interactions with traditional banking professionals have decreased significantly',
      trend: 'falling',
      change: -32,
      timeframe: '3 months',
      impact: 'medium',
      recommendations: ['Reconnect with key finance contacts', 'Explore fintech opportunities', 'Diversify financial network']
    }
  ];

  const recommendations: Recommendation[] = [
    {
      id: '1',
      title: 'Reconnect with Sarah Chen',
      description: 'Sarah was recently promoted to Partner at Sequoia. Perfect timing for congratulations and exploring AI investment opportunities.',
      type: 'connection',
      priority: 'high',
      confidence: 92,
      estimatedImpact: 85,
      timeToAct: 'Within 48 hours'
    },
    {
      id: '2',
      title: 'Expand to European Market',
      description: 'Your network analysis shows strong potential for European expansion with existing connections in London and Berlin.',
      type: 'goal',
      priority: 'medium',
      confidence: 78,
      estimatedImpact: 65,
      timeToAct: 'Within 1 week'
    },
    {
      id: '3',
      title: 'Join Climate Tech Community',
      description: 'Based on growing trends, consider joining climate tech communities and attending related events.',
      type: 'action',
      priority: 'high',
      confidence: 85,
      estimatedImpact: 70,
      timeToAct: 'Within 1 week'
    }
  ];

  const getOpportunityIcon = (type: string) => {
    switch (type) {
      case 'introduction': return Users;
      case 'reconnection': return MessageSquare;
      case 'collaboration': return GitBranch;
      case 'investment': return TrendingUp;
      case 'mentorship': return Award;
      default: return Zap;
    }
  };

  const getClusterIcon = (type: string) => {
    switch (type) {
      case 'industry': return Building;
      case 'location': return MapPin;
      case 'school': return Award;
      case 'interest': return Star;
      case 'company': return Building;
      default: return Users;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return TrendingUp;
      case 'falling': return TrendingUp;
      case 'stable': return BarChart3;
      default: return BarChart3;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'rising': return 'text-green-400';
      case 'falling': return 'text-red-400';
      case 'stable': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-black/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Search className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Discovery Engine</h2>
            <p className="text-sm text-gray-400">Uncover hidden opportunities and insights</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
            title={viewMode === 'list' ? 'Switch to grid view' : 'Switch to list view'}
          >
            {viewMode === 'list' ? <BarChart3 className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search opportunities, clusters, or trends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <button 
          className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"
          title="Filter options"
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-white/5 rounded-xl p-1">
        {[
          { id: 'opportunities', label: 'Opportunities', icon: Zap },
          { id: 'clusters', label: 'Clusters', icon: Network },
          { id: 'trends', label: 'Trends', icon: TrendingUp },
          { id: 'recommendations', label: 'Recommendations', icon: Lightbulb }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
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

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'opportunities' && (
            <div className="space-y-4">
              {networkOpportunities.map((opportunity) => {
                const OpportunityIcon = getOpportunityIcon(opportunity.type);
                return (
                  <div key={opportunity.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                          <OpportunityIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{opportunity.title}</h3>
                          <p className="text-sm text-gray-400">{opportunity.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{opportunity.score}</div>
                        <div className="text-sm text-gray-400">score</div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm text-gray-400">People involved:</span>
                        <div className="flex -space-x-2">
                          {opportunity.people.map((person) => (
                            <div key={person.id} className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-black">
                              {person.avatar}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>{opportunity.mutualConnections} mutual connections</span>
                        <span>Last contact: {opportunity.lastContact}</span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                        <span>Potential Value</span>
                        <span>{opportunity.potentialValue}/100</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${opportunity.potentialValue}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {opportunity.actionItems.slice(0, 2).map((action, index) => (
                          <span key={index} className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full">
                            {action}
                          </span>
                        ))}
                      </div>
                      <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'clusters' && (
            <div className="space-y-4">
              {networkClusters.map((cluster) => {
                const ClusterIcon = getClusterIcon(cluster.type);
                return (
                  <div key={cluster.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                          <ClusterIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{cluster.name}</h3>
                          <p className="text-sm text-gray-400 capitalize">{cluster.type} cluster</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{cluster.size}</div>
                        <div className="text-sm text-gray-400">members</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-white">{cluster.strength}</div>
                        <div className="text-xs text-gray-400">strength</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-400">+{cluster.growth}%</div>
                        <div className="text-xs text-gray-400">growth</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-400">{cluster.opportunities}</div>
                        <div className="text-xs text-gray-400">opportunities</div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm text-gray-400">Key members:</span>
                        <div className="flex -space-x-2">
                          {cluster.members.slice(0, 3).map((member) => (
                            <div key={member.id} className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold border border-black">
                              {member.avatar}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {cluster.insights.slice(0, 2).map((insight, index) => (
                          <span key={index} className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full">
                            {insight}
                          </span>
                        ))}
                      </div>
                      <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                        Explore Cluster
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="space-y-4">
              {trendAnalysis.map((trend) => {
                const TrendIcon = getTrendIcon(trend.trend);
                return (
                  <div key={trend.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 bg-gradient-to-r ${trend.trend === 'rising' ? 'from-green-500 to-blue-500' : 'from-red-500 to-orange-500'} rounded-xl flex items-center justify-center`}>
                          <TrendIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{trend.title}</h3>
                          <p className="text-sm text-gray-400">{trend.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getTrendColor(trend.trend)}`}>
                          {trend.trend === 'rising' ? '+' : ''}{trend.change}%
                        </div>
                        <div className="text-sm text-gray-400">{trend.timeframe}</div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className={`text-sm px-2 py-1 rounded-full inline-block ${
                        trend.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                        trend.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {trend.impact} impact
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {trend.recommendations.slice(0, 2).map((rec, index) => (
                          <span key={index} className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full">
                            {rec}
                          </span>
                        ))}
                      </div>
                      <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                        View Analysis
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div key={rec.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                        <Lightbulb className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{rec.title}</h3>
                        <p className="text-sm text-gray-400">{rec.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">{rec.confidence}%</div>
                      <div className="text-sm text-gray-400">confidence</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="text-center">
                      <div className={`text-sm font-semibold ${getPriorityColor(rec.priority)}`}>
                        {rec.priority}
                      </div>
                      <div className="text-xs text-gray-400">priority</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-blue-400">
                        {rec.estimatedImpact}
                      </div>
                      <div className="text-xs text-gray-400">impact</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-green-400">
                        {rec.timeToAct}
                      </div>
                      <div className="text-xs text-gray-400">time to act</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full capitalize">
                      {rec.type}
                    </span>
                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                      Take Action
                    </button>
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
