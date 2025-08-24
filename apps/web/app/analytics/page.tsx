'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navigation } from '@/app/components/navigation';
import { useWorkspace } from '@/lib/useWorkspace';
import { 
  Users, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  BarChart3,
  Calendar,
  Activity
} from 'lucide-react';

interface AnalyticsData {
  networkGrowth: Array<{ date: string; count: number }>;
  introductionsData: Array<{ 
    date: string; 
    total: number; 
    accepted: number; 
    completed: number; 
  }>;
  goalProgress: Array<{ status: string; count: number }>;
  dormantRelationships: Array<{ date: string; count: number }>;
  metrics: {
    totalContacts: number;
    totalSuggestions: number;
    acceptedSuggestions: number;
    activeGoals: number;
    acceptanceRate: number;
  };
}

export default function AnalyticsPage() {
  const { workspaceId } = useWorkspace();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [period, workspaceId]);

  const fetchAnalytics = async () => {
    if (!workspaceId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?workspaceId=${workspaceId}&period=${period}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading analytics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground">Failed to load analytics</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your workspace performance and growth</p>
        </div>

        {/* Period Selector */}
        <div className="mb-6 flex items-center space-x-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.metrics.totalContacts}</div>
              <p className="text-xs text-muted-foreground">
                Enriched contacts in workspace
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.metrics.activeGoals}</div>
              <p className="text-xs text-muted-foreground">
                Currently active goals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.metrics.acceptanceRate}%</div>
              <p className="text-xs text-muted-foreground">
                {analytics.metrics.acceptedSuggestions} of {analytics.metrics.totalSuggestions} accepted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Network Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.networkGrowth.reduce((sum, item) => sum + item.count, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                New contacts this period
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Network Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Network Growth</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Chart showing contacts enriched over time
                  </p>
                  <div className="mt-4 space-y-2">
                    {analytics.networkGrowth.slice(-5).map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{item.date}</span>
                        <Badge variant="secondary">{item.count} contacts</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Introductions Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Introductions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Chart showing introduction metrics
                  </p>
                  <div className="mt-4 space-y-2">
                    {analytics.introductionsData.slice(-5).map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{item.date}</span>
                        <div className="flex space-x-2">
                          <Badge variant="outline">{item.total} total</Badge>
                          <Badge variant="secondary">{item.accepted} accepted</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Goal Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Goal Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.goalProgress.map((goal, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        goal.status === 'active' ? 'bg-green-500' : 
                        goal.status === 'completed' ? 'bg-blue-500' : 'bg-gray-500'
                      }`} />
                      <span className="capitalize">{goal.status}</span>
                    </div>
                    <Badge variant="secondary">{goal.count} goals</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Dormant Relationships */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Dormant Relationships</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Chart showing reactivated relationships
                  </p>
                  <div className="mt-4 space-y-2">
                    {analytics.dormantRelationships.slice(-5).map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{item.date}</span>
                        <Badge variant="secondary">{item.count} reactivated</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
