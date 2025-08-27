'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Target, TrendingUp, Calendar, Bell, Star, 
  Award, Zap, Sparkles, CheckCircle, Clock, Users,
  Lightbulb, BarChart3, ArrowUpRight, ArrowDownRight,
  Gift, Crown, Medal, Fire, Heart, Rocket, Gem
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: 'network' | 'goals' | 'engagement' | 'collaboration';
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
  reward?: string;
}

interface Streak {
  type: 'daily' | 'weekly' | 'monthly';
  current: number;
  best: number;
  lastActivity: string;
  nextMilestone: number;
}

interface PersonalizedInsight {
  id: string;
  title: string;
  description: string;
  type: 'opportunity' | 'progress' | 'milestone' | 'suggestion';
  priority: 'high' | 'medium' | 'low';
  actionRequired: boolean;
  estimatedImpact: number;
}

interface ProgressMetric {
  name: string;
  current: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

export function RetentionEngine() {
  const [activeTab, setActiveTab] = useState<'achievements' | 'streaks' | 'insights' | 'progress'>('achievements');
  const [showCelebration, setShowCelebration] = useState(false);

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Network Pioneer',
      description: 'Add your first 10 connections',
      icon: Users,
      category: 'network',
      progress: 8,
      maxProgress: 10,
      unlocked: false
    },
    {
      id: '2',
      title: 'Goal Crusher',
      description: 'Complete 3 goals',
      icon: Target,
      category: 'goals',
      progress: 2,
      maxProgress: 3,
      unlocked: false
    },
    {
      id: '3',
      title: 'Insight Master',
      description: 'Generate 20 insights',
      icon: Lightbulb,
      category: 'engagement',
      progress: 15,
      maxProgress: 20,
      unlocked: false
    },
    {
      id: '4',
      title: 'Team Player',
      description: 'Share 5 insights with your team',
      icon: Users,
      category: 'collaboration',
      progress: 3,
      maxProgress: 5,
      unlocked: false
    },
    {
      id: '5',
      title: 'Consistency King',
      description: 'Use Rhiz for 7 consecutive days',
      icon: Calendar,
      category: 'engagement',
      progress: 5,
      maxProgress: 7,
      unlocked: false
    },
    {
      id: '6',
      title: 'Introduction Pro',
      description: 'Make 10 successful introductions',
      icon: Zap,
      category: 'network',
      progress: 7,
      maxProgress: 10,
      unlocked: false
    }
  ];

  const streaks: Streak[] = [
    {
      type: 'daily',
      current: 5,
      best: 12,
      lastActivity: '2 hours ago',
      nextMilestone: 7
    },
    {
      type: 'weekly',
      current: 3,
      best: 8,
      lastActivity: '2 days ago',
      nextMilestone: 5
    },
    {
      type: 'monthly',
      current: 2,
      best: 4,
      lastActivity: '1 week ago',
      nextMilestone: 3
    }
  ];

  const personalizedInsights: PersonalizedInsight[] = [
    {
      id: '1',
      title: 'You\'re 2 connections away from Network Pioneer!',
      description: 'Add 2 more connections to unlock your first achievement and boost your network score.',
      type: 'milestone',
      priority: 'high',
      actionRequired: true,
      estimatedImpact: 15
    },
    {
      id: '2',
      title: 'Your network strength increased 23% this week',
      description: 'Great progress! Your consistent engagement is paying off. Keep up the momentum.',
      type: 'progress',
      priority: 'medium',
      actionRequired: false,
      estimatedImpact: 8
    },
    {
      id: '3',
      title: 'High-value opportunity: Reconnect with Sarah Chen',
      description: 'Sarah was recently promoted to VP at Stripe. Perfect time to congratulate and explore collaboration.',
      type: 'opportunity',
      priority: 'high',
      actionRequired: true,
      estimatedImpact: 25
    },
    {
      id: '4',
      title: 'Your daily streak is at risk',
      description: 'You haven\'t logged in today. Don\'t break your 5-day streak!',
      type: 'suggestion',
      priority: 'medium',
      actionRequired: true,
      estimatedImpact: 5
    }
  ];

  const progressMetrics: ProgressMetric[] = [
    {
      name: 'Network Connections',
      current: 127,
      target: 200,
      unit: 'connections',
      trend: 'up',
      change: 12
    },
    {
      name: 'Goals Completed',
      current: 8,
      target: 15,
      unit: 'goals',
      trend: 'up',
      change: 2
    },
    {
      name: 'Insights Generated',
      current: 45,
      target: 100,
      unit: 'insights',
      trend: 'up',
      change: 8
    },
    {
      name: 'Introductions Made',
      current: 23,
      target: 50,
      unit: 'intros',
      trend: 'stable',
      change: 0
    }
  ];

  const getAchievementIcon = (achievement: Achievement) => {
    const Icon = achievement.icon;
    if (achievement.unlocked) {
      return <Trophy className="w-6 h-6 text-yellow-400" />;
    }
    return <Icon className="w-6 h-6 text-gray-400" />;
  };

  const getStreakIcon = (type: string) => {
    switch (type) {
      case 'daily': return Calendar;
      case 'weekly': return Calendar;
      case 'monthly': return Calendar;
      default: return Calendar;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return Zap;
      case 'progress': return TrendingUp;
      case 'milestone': return Trophy;
      case 'suggestion': return Lightbulb;
      default: return Info;
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return ArrowUpRight;
      case 'down': return ArrowDownRight;
      default: return TrendingUp;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-black/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Your Progress</h2>
            <p className="text-sm text-gray-400">Track achievements and stay motivated</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-yellow-400">
            <Star className="w-4 h-4" />
            <span className="text-sm font-medium">1,247</span>
          </div>
          <span className="text-gray-400 text-sm">points</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-white/5 rounded-xl p-1">
        {[
          { id: 'achievements', label: 'Achievements', icon: Trophy },
          { id: 'streaks', label: 'Streaks', icon: Fire },
          { id: 'insights', label: 'Insights', icon: Lightbulb },
          { id: 'progress', label: 'Progress', icon: BarChart3 }
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
          {activeTab === 'achievements' && (
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getAchievementIcon(achievement)}
                      <div>
                        <h3 className="text-white font-medium">{achievement.title}</h3>
                        <p className="text-sm text-gray-400">{achievement.description}</p>
                      </div>
                    </div>
                    {achievement.unlocked && (
                      <div className="flex items-center space-x-1 text-yellow-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Unlocked</span>
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{achievement.progress}/{achievement.maxProgress}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          achievement.unlocked 
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
                            : 'bg-gradient-to-r from-blue-500 to-purple-500'
                        }`}
                        style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                      />
                    </div>
                  </div>
                  {achievement.reward && (
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Gift className="w-4 h-4" />
                      <span>Reward: {achievement.reward}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'streaks' && (
            <div className="space-y-4">
              {streaks.map((streak) => {
                const StreakIcon = getStreakIcon(streak.type);
                return (
                  <div key={streak.type} className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                          <StreakIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium capitalize">{streak.type} Streak</h3>
                          <p className="text-sm text-gray-400">Last activity: {streak.lastActivity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{streak.current}</div>
                        <div className="text-sm text-gray-400">current</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-gray-400">
                        Best: {streak.best} days
                      </div>
                      <div className="text-blue-400">
                        Next milestone: {streak.nextMilestone} days
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-4">
              {personalizedInsights.map((insight) => {
                const InsightIcon = getInsightIcon(insight.type);
                return (
                  <div key={insight.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <InsightIcon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{insight.title}</h3>
                          <p className="text-sm text-gray-400">{insight.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm px-2 py-1 rounded-full ${getPriorityColor(insight.priority)}`}>
                          {insight.priority} priority
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-400">
                        Impact: +{insight.estimatedImpact} points
                      </div>
                      {insight.actionRequired && (
                        <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                          Take Action
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-4">
              {progressMetrics.map((metric) => {
                const TrendIcon = getTrendIcon(metric.trend);
                return (
                  <div key={metric.name} className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-white font-medium">{metric.name}</h3>
                        <p className="text-sm text-gray-400">
                          {metric.current} / {metric.target} {metric.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{metric.current}</div>
                        <div className="flex items-center space-x-1 text-sm">
                          <TrendIcon className={`w-4 h-4 ${getTrendColor(metric.trend)}`} />
                          <span className={getTrendColor(metric.trend)}>+{metric.change}</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${(metric.current / metric.target) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
