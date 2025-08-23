'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Users, Share2, Target, BarChart3 } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

interface GrowthData {
  period: string;
  startDate: string;
  endDate: string;
  funnel: Record<string, { count: number; uniqueUsers: number }>;
  conversionRates: {
    inviteToSignup: string;
    signupToRedeem: string;
  };
  viralCoefficient: {
    kFactor: string;
    avgInvitesPerUser: number;
    usersWhoInvited: number;
    totalInvites: number;
  };
  wau: Array<{
    week: string;
    activeUsers: number;
    prevWeekUsers: number;
    growth: string;
  }>;
  cohorts: Array<{
    cohortWeek: string;
    cohortSize: number;
    avgEventsPerUser: number;
  }>;
  topReferrers: Array<{
    userId: string;
    inviteCount: number;
    uniqueCodes: number;
  }>;
  summary: {
    totalEvents: number;
    totalUsers: number;
    viralStatus: string;
  };
}

export default function GrowthDashboardPage() {
  const [growthData, setGrowthData] = useState<GrowthData | null>(null);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGrowthData();
  }, [period]);

  const loadGrowthData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/growth?period=${period}`);
      if (response.ok) {
        const { data } = await response.json();
        setGrowthData(data);
      }
    } catch (error) {
      console.error('Error loading growth data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading growth analytics...</div>
        </div>
      </div>
    );
  }

  if (!growthData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-lg text-muted-foreground">No growth data available</div>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const funnelData = [
    { name: 'Invites Sent', value: growthData.funnel.invite_sent?.count || 0, fill: '#3b82f6' },
    { name: 'Signups', value: growthData.funnel.signup?.count || 0, fill: '#10b981' },
    { name: 'Invites Redeemed', value: growthData.funnel.invite_redeemed?.count || 0, fill: '#f59e0b' },
  ];

  const wauData = growthData.wau.map(item => ({
    week: new Date(item.week).toLocaleDateString(),
    activeUsers: item.activeUsers,
    growth: parseFloat(item.growth),
  }));

  const cohortData = growthData.cohorts.map(item => ({
    cohort: new Date(item.cohortWeek).toLocaleDateString(),
    size: item.cohortSize,
    avgEvents: item.avgEventsPerUser,
  }));

  const topReferrersData = growthData.topReferrers.slice(0, 10).map(item => ({
    user: item.userId.slice(0, 8) + '...',
    invites: item.inviteCount,
    codes: item.uniqueCodes,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Growth Analytics
        </h1>
        <p className="text-lg text-muted-foreground">
          Track viral growth, user acquisition, and referral performance
        </p>
      </div>

      {/* Period Selector */}
      <div className="mb-6">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{growthData.summary.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              All growth events tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{growthData.summary.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Unique users in period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Viral Coefficient</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{growthData.viralCoefficient.kFactor}</div>
            <p className="text-xs text-muted-foreground">
              Average invites per user
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Viral Status</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge 
                variant={
                  growthData.summary.viralStatus === 'viral' ? 'default' :
                  growthData.summary.viralStatus === 'growing' ? 'secondary' : 'destructive'
                }
              >
                {growthData.summary.viralStatus}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Growth performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Acquisition Funnel</CardTitle>
          <CardDescription>
            User journey from invite to signup to activation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Conversion Rates</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Invite → Signup:</span>
                    <span className="font-medium">{growthData.conversionRates.inviteToSignup}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Signup → Redeem:</span>
                    <span className="font-medium">{growthData.conversionRates.signupToRedeem}%</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Viral Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Users who invited:</span>
                    <span className="font-medium">{growthData.viralCoefficient.usersWhoInvited}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total invites:</span>
                    <span className="font-medium">{growthData.viralCoefficient.totalInvites}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Active Users */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Weekly Active Users</CardTitle>
          <CardDescription>
            User activity trends over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={wauData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="activeUsers" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Cohort Analysis */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Cohort Analysis</CardTitle>
          <CardDescription>
            User retention and engagement by signup week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cohortData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cohort" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="size" fill="#10b981" name="Cohort Size" />
                <Bar dataKey="avgEvents" fill="#f59e0b" name="Avg Events/User" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Referrers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Referrers</CardTitle>
          <CardDescription>
            Users generating the most invites
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topReferrersData.map((referrer, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium">{referrer.user}</div>
                    <div className="text-sm text-muted-foreground">
                      {referrer.codes} unique codes
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{referrer.invites}</div>
                  <div className="text-sm text-muted-foreground">invites</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
