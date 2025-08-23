'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Copy, Users, TrendingUp, Gift, Share2 } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ReferralStats {
  totalInvites: number;
  successfulSignups: number;
  earnedRewards: number;
  invitesRemaining: number;
}

interface InviteTreeData {
  level: number;
  inviterId: string;
  inviteeId: string;
  isDirectInvitee: boolean;
}

interface InviteTreeStats {
  level: number;
  count: number;
}

export default function ReferralsPage() {
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralLink, setReferralLink] = useState<string>('');
  const [stats, setStats] = useState<ReferralStats>({
    totalInvites: 0,
    successfulSignups: 0,
    earnedRewards: 0,
    invitesRemaining: 10,
  });
  const [treeData, setTreeData] = useState<InviteTreeData[]>([]);
  const [treeStats, setTreeStats] = useState<InviteTreeStats[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Mock user data - in real app, get from auth context
  const currentUserId = 'current-user-id';
  const userTier = 'root_alpha'; // 'free', 'pro', 'root_alpha', 'power'

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      setLoading(true);
      
      // Create referral code if user doesn't have one
      const createResponse = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          rewardType: userTier === 'free' ? 'upgrade' : 'invite',
          rewardValue: userTier === 'free' ? 30 : 1, // 30 days Pro trial or 1 invite
        }),
      });

      if (createResponse.ok) {
        const { referralCode: newCode } = await createResponse.json();
        setReferralCode(newCode.code);
        setReferralLink(`${window.location.origin}/signup?ref=${newCode.code}`);
      }

      // Load invite tree
      const treeResponse = await fetch(`/api/referrals/tree?userId=${currentUserId}&depth=3`);
      if (treeResponse.ok) {
        const { data } = await treeResponse.json();
        setTreeData(data.tree);
        setTreeStats(data.stats);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalInvites: data.totals.totalInvitees,
          successfulSignups: data.totals.totalInvitees, // Simplified for demo
        }));
      }
    } catch (error) {
      console.error('Error loading referral data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load referral data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast({
        title: 'Copied!',
        description: 'Referral link copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy link',
        variant: 'destructive',
      });
    }
  };

  const shareReferralLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on Rhiz',
          text: 'I\'m using Rhiz to build better relationships. Join me with this referral link!',
          url: referralLink,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      copyReferralLink();
    }
  };

  // Prepare data for charts
  const radialData = [
    { name: 'Direct Invites', value: treeStats.find(s => s.level === 1)?.count || 0, fill: '#3b82f6' },
    { name: 'Level 2', value: treeStats.find(s => s.level === 2)?.count || 0, fill: '#8b5cf6' },
    { name: 'Level 3', value: treeStats.find(s => s.level === 3)?.count || 0, fill: '#ec4899' },
  ];

  const pieData = [
    { name: 'Successful', value: stats.successfulSignups, fill: '#10b981' },
    { name: 'Pending', value: stats.totalInvites - stats.successfulSignups, fill: '#f59e0b' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Referrals & Invites
        </h1>
        <p className="text-lg text-muted-foreground">
          Grow your network and earn rewards by inviting others to Rhiz
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading referral data...</div>
        </div>
      ) : (
        <>
          {/* Referral Link Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Your Referral Link
              </CardTitle>
              <CardDescription>
                Share this link with friends and colleagues to earn rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={referralLink}
                  readOnly
                  className="flex-1"
                  placeholder="Generating referral link..."
                />
                <Button onClick={copyReferralLink} variant="outline">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button onClick={shareReferralLink}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
              
              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Badge variant="secondary">Code: {referralCode}</Badge>
                </div>
                {userTier === 'free' && (
                  <div className="flex items-center gap-1">
                    <Gift className="h-4 w-4" />
                    <span>Earn 1 month Pro for each successful invite</span>
                  </div>
                )}
                {userTier === 'root_alpha' && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{stats.invitesRemaining} invites remaining</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invites</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalInvites}</div>
                <p className="text-xs text-muted-foreground">
                  People you've invited
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Successful Signups</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.successfulSignups}</div>
                <p className="text-xs text-muted-foreground">
                  Who joined with your link
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Earned Rewards</CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.earnedRewards}</div>
                <p className="text-xs text-muted-foreground">
                  Rewards earned
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalInvites > 0 
                    ? Math.round((stats.successfulSignups / stats.totalInvites) * 100)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Signup success rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Invite Tree Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Your Invite Tree</CardTitle>
                <CardDescription>
                  Visual representation of your network growth
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart data={radialData} innerRadius="20%" outerRadius="100%">
                      <RadialBar dataKey="value" cornerRadius={10} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {treeStats.map((stat) => (
                    <div key={stat.level} className="flex justify-between text-sm">
                      <span>Level {stat.level} Invites:</span>
                      <span className="font-medium">{stat.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Signup Distribution</CardTitle>
                <CardDescription>
                  Breakdown of successful vs pending signups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.fill }}
                        />
                        {item.name}:
                      </span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest invites and signups from your network
              </CardDescription>
            </CardHeader>
            <CardContent>
              {treeData.length > 0 ? (
                <div className="space-y-4">
                  {treeData.slice(0, 5).map((edge, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {edge.isDirectInvitee ? 'Direct Invite' : `Level ${edge.level} Invite`}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            User ID: {edge.inviteeId.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                      <Badge variant={edge.isDirectInvitee ? 'default' : 'secondary'}>
                        {edge.isDirectInvitee ? 'Direct' : `Level ${edge.level}`}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No invites yet. Share your referral link to get started!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
