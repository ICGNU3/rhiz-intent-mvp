'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navigation } from '@/components/navigation';
import { 
  Lightbulb, 
  Share2, 
  Users, 
  Target, 
  TrendingUp,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface Insight {
  id: string;
  type: 'opportunity_gap' | 'bridge_builder' | 'cluster_insight' | 'goal_alignment_gap';
  title: string;
  detail: string;
  personId?: string;
  goalId?: string;
  score: number;
  provenance: {
    metric: string;
    value: any;
    reason_generated: string;
  };
  createdAt: string;
}

interface SharedInsight {
  id: string;
  insight: Insight;
  sharedBy: string;
  sharedWith: string;
  visibility: string;
  createdAt: string;
}

interface Overlap {
  id: string;
  person: string;
  workspaces: string[];
  overlapType: string;
  confidence: number;
  detectedAt: string;
  state: string;
}

interface Opportunity {
  id: string;
  title: string;
  description: string;
  type: string;
  workspaces: string[];
  clusters: any[];
  score: number;
  status: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [sharedInsights, setSharedInsights] = useState<SharedInsight[]>([]);
  const [overlaps, setOverlaps] = useState<Overlap[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('insights');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load insights
      const insightsResponse = await fetch('/api/graph/insights');
      if (insightsResponse.ok) {
        const insightsData = await insightsResponse.json();
        setInsights(insightsData.insights);
      }

      // Load shared insights
      const sharedResponse = await fetch('/api/insights/shared');
      if (sharedResponse.ok) {
        const sharedData = await sharedResponse.json();
        setSharedInsights(sharedData.sharedInsights);
      }

      // Load overlaps
      const overlapsResponse = await fetch('/api/insights/overlaps');
      if (overlapsResponse.ok) {
        const overlapsData = await overlapsResponse.json();
        setOverlaps(overlapsData.overlaps);
      }

      // Load opportunities
      const opportunitiesResponse = await fetch('/api/insights/opportunities');
      if (opportunitiesResponse.ok) {
        const opportunitiesData = await opportunitiesResponse.json();
        setOpportunities(opportunitiesData.opportunities);
      }
    } catch (error) {
      console.error('Failed to load insights data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async () => {
    try {
      const response = await fetch('/api/graph/insights', { method: 'POST' });
      if (response.ok) {
        await loadData(); // Reload data
      }
    } catch (error) {
      console.error('Failed to generate insights:', error);
    }
  };

  const shareInsight = async (insightId: string) => {
    try {
      const response = await fetch('/api/insights/shared', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          insightId,
          sharedWith: 'workspace',
          visibility: 'workspace'
        })
      });
      
      if (response.ok) {
        await loadData(); // Reload shared insights
      }
    } catch (error) {
      console.error('Failed to share insight:', error);
    }
  };

  const activateOpportunity = async (opportunityId: string) => {
    try {
      const response = await fetch('/api/insights/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId,
          action: 'activate'
        })
      });
      
      if (response.ok) {
        await loadData(); // Reload opportunities
      }
    } catch (error) {
      console.error('Failed to activate opportunity:', error);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity_gap':
        return <Target className="h-4 w-4" />;
      case 'bridge_builder':
        return <Users className="h-4 w-4" />;
      case 'cluster_insight':
        return <TrendingUp className="h-4 w-4" />;
      case 'goal_alignment_gap':
        return <Target className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity_gap':
        return 'bg-orange-100 text-orange-800';
      case 'bridge_builder':
        return 'bg-blue-100 text-blue-800';
      case 'cluster_insight':
        return 'bg-green-100 text-green-800';
      case 'goal_alignment_gap':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
              <p className="text-muted-foreground">Loading insights...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Graph Insights</h1>
            <p className="text-muted-foreground">
              AI-generated insights about your network and opportunities
            </p>
          </div>
          <Button onClick={generateInsights} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Generate Insights
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="insights">My Insights</TabsTrigger>
            <TabsTrigger value="shared">Shared Insights</TabsTrigger>
            <TabsTrigger value="overlaps">Overlaps</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="mt-6">
            <div className="grid gap-6">
              {insights.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No insights available yet.</p>
                      <Button onClick={generateInsights} className="mt-4">
                        Generate Insights
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                insights.map((insight) => (
                  <Card key={insight.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getInsightIcon(insight.type)}
                          <div>
                            <CardTitle className="text-lg">{insight.title}</CardTitle>
                            <Badge className={getInsightColor(insight.type)}>
                              {insight.type.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Score: {insight.score}</Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => shareInsight(insight.id)}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base mb-4">
                        {insight.detail}
                      </CardDescription>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          <p>Generated from: {insight.provenance.metric}</p>
                          <p>Reason: {insight.provenance.reason_generated}</p>
                        </div>
                        <Button>
                          Take Action
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="shared" className="mt-6">
            <div className="grid gap-6">
              {sharedInsights.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <Share2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No shared insights yet.</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                sharedInsights.map((shared) => (
                  <Card key={shared.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getInsightIcon(shared.insight.type)}
                          <div>
                            <CardTitle className="text-lg">{shared.insight.title}</CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge className={getInsightColor(shared.insight.type)}>
                                {shared.insight.type.replace('_', ' ')}
                              </Badge>
                              <Badge variant="outline">Shared by {shared.sharedBy}</Badge>
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary">Score: {shared.insight.score}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base mb-4">
                        {shared.insight.detail}
                      </CardDescription>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          <p>Visibility: {shared.visibility}</p>
                          <p>Shared: {new Date(shared.createdAt).toLocaleDateString()}</p>
                        </div>
                        <Button>
                          View Details
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="overlaps" className="mt-6">
            <div className="grid gap-6">
              {overlaps.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No cross-workspace overlaps found.</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                overlaps.map((overlap) => (
                  <Card key={overlap.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Cross-Workspace Overlap
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="font-medium">{overlap.person}</p>
                          <p className="text-sm text-muted-foreground">
                            Appears in {overlap.workspaces.length} workspaces
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{overlap.overlapType}</Badge>
                          <Badge variant="secondary">Confidence: {overlap.confidence}%</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Detected: {new Date(overlap.detectedAt).toLocaleDateString()}
                        </p>
                        <Button>
                          Sync Notes
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="opportunities" className="mt-6">
            <div className="grid gap-6">
              {opportunities.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No collective opportunities found.</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                opportunities.map((opportunity) => (
                  <Card key={opportunity.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="h-5 w-5" />
                          <div>
                            <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                            <Badge variant="outline">{opportunity.type.replace('_', ' ')}</Badge>
                          </div>
                        </div>
                        <Badge variant="secondary">Score: {opportunity.score}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base mb-4">
                        {opportunity.description}
                      </CardDescription>
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">
                          <p>Workspaces: {opportunity.workspaces.length}</p>
                          <p>Clusters: {opportunity.clusters.length}</p>
                          <p>Created: {new Date(opportunity.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button onClick={() => activateOpportunity(opportunity.id)}>
                            Add to Goal
                          </Button>
                          <Button variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
