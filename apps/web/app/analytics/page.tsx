'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, Users, Target, Zap, TrendingUp, TrendingDown, 
  Activity, Calendar, Filter, Download, Sparkles, Brain,
  Network, MessageCircle, Clock, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface AnalyticsData {
  networkGrowth: number;
  connectionRate: number;
  goalCompletion: number;
  opportunityConversion: number;
  activeConversations: number;
  weeklyMeetings: number;
  timeSpentNetworking: number;
  topPerformingGoals: string[];
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeFrame, setTimeFrame] = useState('week');
  const [showInsights, setShowInsights] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      setAnalyticsData({
        networkGrowth: 23,
        connectionRate: 87,
        goalCompletion: 65,
        opportunityConversion: 34,
        activeConversations: 12,
        weeklyMeetings: 8,
        timeSpentNetworking: 4.2,
        topPerformingGoals: ['50 investors', 'Designers', 'Co-founder']
      });
    };
    fetchData();
  }, [timeFrame]);

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg animate-pulse" />
          <span className="text-white font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      title: 'Network Growth',
      value: `+${analyticsData.networkGrowth}`,
      subtitle: 'new connections',
      icon: Users,
      trend: 'up',
      change: '+12%',
      color: 'from-blue-500 to-purple-600'
    },
    {
      title: 'Connection Rate',
      value: `${analyticsData.connectionRate}%`,
      subtitle: 'success rate',
      icon: Network,
      trend: 'up',
      change: '+5%',
      color: 'from-green-500 to-teal-600'
    },
    {
      title: 'Goal Progress',
      value: `${analyticsData.goalCompletion}%`,
      subtitle: 'completion rate',
      icon: Target,
      trend: 'up',
      change: '+8%',
      color: 'from-orange-500 to-red-600'
    },
    {
      title: 'Opportunities',
      value: `${analyticsData.opportunityConversion}%`,
      subtitle: 'conversion rate',
      icon: Zap,
      trend: 'down',
      change: '-2%',
      color: 'from-purple-500 to-pink-600'
    }
  ];

  const activityMetrics = [
    {
      title: 'Active Conversations',
      value: analyticsData.activeConversations,
      icon: MessageCircle,
      color: 'text-blue-400'
    },
    {
      title: 'Weekly Meetings',
      value: analyticsData.weeklyMeetings,
      icon: Calendar,
      color: 'text-green-400'
    },
    {
      title: 'Hours Networking',
      value: analyticsData.timeSpentNetworking,
      suffix: 'h',
      icon: Clock,
      color: 'text-purple-400'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
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
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-semibold text-lg">Analytics</h1>
                  <p className="text-xs text-gray-400 hidden md:block">Network performance insights</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Time Frame Toggle */}
              <div className="flex items-center bg-white/5 rounded-lg p-1">
                {['week', 'month', 'quarter'].map((frame) => (
                  <button
                    key={frame}
                    onClick={() => setTimeFrame(frame)}
                    className={cn(
                      "px-2 md:px-3 py-1 rounded text-xs md:text-sm transition-all capitalize",
                      timeFrame === frame ? "bg-white/10 text-white" : "text-gray-400"
                    )}
                  >
                    {frame}
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

        {/* Main Metrics Grid */}
        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.title}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-xl rounded-xl p-4 md:p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-3 md:mb-4">
                  <div className={cn("w-10 md:w-12 h-10 md:h-12 bg-gradient-to-br rounded-lg flex items-center justify-center", metric.color)}>
                    <metric.icon className="w-5 md:w-6 h-5 md:h-6 text-white" />
                  </div>
                  <div className={cn("flex items-center space-x-1 text-xs", 
                    metric.trend === 'up' ? 'text-green-400' : 'text-red-400'
                  )}>
                    {metric.trend === 'up' ? 
                      <ArrowUpRight className="w-3 h-3" /> : 
                      <ArrowDownRight className="w-3 h-3" />
                    }
                    <span>{metric.change}</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-2xl md:text-3xl font-bold mb-1">{metric.value}</div>
                  <div className="text-sm text-gray-400">{metric.subtitle}</div>
                  <div className="text-xs font-medium text-gray-300 mt-1">{metric.title}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Activity Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-6 md:mb-8">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-xl p-4 md:p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-semibold">Network Activity</h3>
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 md:w-5 h-4 md:h-5 text-gray-400" />
                  <span className="text-sm text-gray-400">Live data</span>
                </div>
              </div>
              
              {/* Mock Chart Area */}
              <div className="h-32 md:h-48 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <BarChart3 className="w-8 md:w-12 h-8 md:h-12 text-white/50 mx-auto mb-2" />
                  <p className="text-xs md:text-sm text-gray-400">Interactive chart coming soon</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {activityMetrics.map((metric) => (
                  <div key={metric.title} className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <metric.icon className={cn("w-4 md:w-5 h-4 md:h-5", metric.color)} />
                    </div>
                    <div className="text-xl md:text-2xl font-bold">
                      {metric.value}{metric.suffix}
                    </div>
                    <div className="text-xs text-gray-400">{metric.title}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* AI Insights Panel */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white/5 backdrop-blur-xl rounded-xl p-4 md:p-6 border border-white/10"
            >
              <div className="flex items-center space-x-3 mb-4 md:mb-6">
                <div className="w-8 md:w-10 h-8 md:h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-4 md:w-5 h-4 md:h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Insights</h3>
                  <p className="text-xs text-gray-400">Personalized recommendations</p>
                </div>
              </div>

              <div className="space-y-3 md:space-y-4">
                <div className="p-3 bg-blue-600/10 rounded-lg border border-blue-600/20">
                  <div className="flex items-start space-x-2">
                    <Sparkles className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-300">Peak Activity</p>
                      <p className="text-xs text-gray-300 mt-1">
                        Your best connection time is Tuesday 2-4 PM. Schedule more outreach then.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-green-600/10 rounded-lg border border-green-600/20">
                  <div className="flex items-start space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-300">Growth Opportunity</p>
                      <p className="text-xs text-gray-300 mt-1">
                        You&apos;re 23% more likely to connect with designers. Focus your next campaign.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-purple-600/10 rounded-lg border border-purple-600/20">
                  <div className="flex items-start space-x-2">
                    <Target className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-purple-300">Goal Focus</p>
                      <p className="text-xs text-gray-300 mt-1">
                        Your &ldquo;Find co-founder&rdquo; goal is 78% complete. Push for the final stretch!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Link 
                href="/opportunities" 
                className="block w-full mt-4 md:mt-6 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-center text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                View All Opportunities
              </Link>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
          >
            <Link href="/dashboard" className="group">
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 md:p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-3">
                  <Network className="w-5 md:w-6 h-5 md:h-6 text-blue-400" />
                  <h3 className="font-semibold">Network View</h3>
                </div>
                <p className="text-sm text-gray-400">Visualize your connections and discover new opportunities</p>
              </div>
            </Link>

            <Link href="/goals" className="group">
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 md:p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-3">
                  <Target className="w-5 md:w-6 h-5 md:h-6 text-green-400" />
                  <h3 className="font-semibold">Goals</h3>
                </div>
                <p className="text-sm text-gray-400">Track progress and get AI-powered recommendations</p>
              </div>
            </Link>

            <Link href="/connections" className="group">
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 md:p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-3">
                  <Users className="w-5 md:w-6 h-5 md:h-6 text-purple-400" />
                  <h3 className="font-semibold">Connections</h3>
                </div>
                <p className="text-sm text-gray-400">Manage relationships and reach out to new contacts</p>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}