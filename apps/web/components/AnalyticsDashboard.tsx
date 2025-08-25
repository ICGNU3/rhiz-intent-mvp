'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Target, 
  MessageSquare, 
  Calendar,
  Activity,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface AnalyticsData {
  metrics: {
    totalPeople: number;
    totalGoals: number;
    totalSuggestions: number;
    totalEncounters: number;
    activeGoals: number;
    completedGoals: number;
    peopleGrowth: number;
    suggestionsGrowth: number;
  };
  insights: {
    topOpportunities: Array<{
      id: string;
      title: string;
      score: number;
      type: string;
    }>;
    recentActivity: Array<{
      id: string;
      type: string;
      description: string;
      timestamp: string;
    }>;
    networkHealth: {
      score: number;
      connections: number;
      density: number;
    };
  };
  trends: {
    peopleAdded: Array<{ date: string; count: number }>;
    goalsCreated: Array<{ date: string; count: number }>;
    suggestionsGenerated: Array<{ date: string; count: number }>;
  };
}

interface AnalyticsDashboardProps {
  workspaceId: string;
}

export function AnalyticsDashboard({ workspaceId }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [workspaceId, timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would call your analytics API
      // For now, we'll use mock data
      const mockData: AnalyticsData = {
        metrics: {
          totalPeople: 23,
          totalGoals: 8,
          totalSuggestions: 15,
          totalEncounters: 42,
          activeGoals: 6,
          completedGoals: 2,
          peopleGrowth: 12,
          suggestionsGrowth: 8,
        },
        insights: {
          topOpportunities: [
            { id: '1', title: 'Sarah Chen - Mike Rodriguez', score: 92, type: 'introduction' },
            { id: '2', title: 'David Kim - Emily Johnson', score: 88, type: 'introduction' },
            { id: '3', title: 'Lisa Wang - Alex Thompson', score: 85, type: 'introduction' },
          ],
          recentActivity: [
            { id: '1', type: 'voice_note', description: 'Voice note processed - 3 people identified', timestamp: '2 hours ago' },
            { id: '2', type: 'goal_created', description: 'New goal created: "Find Technical Co-founder"', timestamp: '4 hours ago' },
            { id: '3', type: 'suggestion_accepted', description: 'Introduction accepted: Sarah Chen → Mike Rodriguez', timestamp: '1 day ago' },
            { id: '4', type: 'person_added', description: 'New person added: Emily Johnson', timestamp: '2 days ago' },
          ],
          networkHealth: {
            score: 78,
            connections: 45,
            density: 0.65,
          },
        },
        trends: {
          peopleAdded: [
            { date: '2024-01-20', count: 3 },
            { date: '2024-01-21', count: 2 },
            { date: '2024-01-22', count: 4 },
            { date: '2024-01-23', count: 1 },
            { date: '2024-01-24', count: 5 },
            { date: '2024-01-25', count: 2 },
            { date: '2024-01-26', count: 3 },
          ],
          goalsCreated: [
            { date: '2024-01-20', count: 1 },
            { date: '2024-01-21', count: 0 },
            { date: '2024-01-22', count: 2 },
            { date: '2024-01-23', count: 1 },
            { date: '2024-01-24', count: 0 },
            { date: '2024-01-25', count: 1 },
            { date: '2024-01-26', count: 1 },
          ],
          suggestionsGenerated: [
            { date: '2024-01-20', count: 2 },
            { date: '2024-01-21', count: 1 },
            { date: '2024-01-22', count: 3 },
            { date: '2024-01-23', count: 2 },
            { date: '2024-01-24', count: 4 },
            { date: '2024-01-25', count: 1 },
            { date: '2024-01-26', count: 2 },
          ],
        },
      };
      
      setData(mockData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'voice_note':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'goal_created':
        return <Target className="h-4 w-4 text-green-500" />;
      case 'suggestion_accepted':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'person_added':
        return <Users className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <div className="flex space-x-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeRange === range
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total People</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.totalPeople}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              +{data.metrics.peopleGrowth}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.activeGoals}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Progress value={(data.metrics.activeGoals / data.metrics.totalGoals) * 100} className="w-16 mr-2" />
              {Math.round((data.metrics.activeGoals / data.metrics.totalGoals) * 100)}% active
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suggestions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.totalSuggestions}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              +{data.metrics.suggestionsGrowth}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Health</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.insights.networkHealth.score}/100</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Progress value={data.insights.networkHealth.score} className="w-16 mr-2" />
              {data.insights.networkHealth.connections} connections
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.insights.topOpportunities.map((opportunity) => (
                <div key={opportunity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{opportunity.title}</p>
                    <p className="text-xs text-gray-500 capitalize">{opportunity.type}</p>
                  </div>
                  <Badge variant="secondary">{opportunity.score}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.insights.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Network Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{data.insights.networkHealth.score}</div>
              <p className="text-sm text-gray-600">Network Health Score</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{data.insights.networkHealth.connections}</div>
              <p className="text-sm text-gray-600">Total Connections</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{Math.round(data.insights.networkHealth.density * 100)}%</div>
              <p className="text-sm text-gray-600">Network Density</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
