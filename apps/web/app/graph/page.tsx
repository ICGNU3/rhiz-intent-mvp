'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

// Dynamically import react-force-graph to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-96">Loading graph...</div>
});

interface GraphNode {
  id: string;
  label: string;
  tags: string[];
  location?: string;
  email?: string;
}

interface GraphEdge {
  from: string;
  to: string;
  type: string;
  strength: number;
  metadata?: any;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface PersonProfile {
  id: string;
  fullName: string;
  location?: string;
  email?: string;
  tags: string[];
  connections: number;
}

export default function GraphPage() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<PersonProfile | null>(null);
  const [filters, setFilters] = useState({
    goal: 'all',
    tag: 'all',
    timeWindow: 'all',
    depth: '1'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const graphRef = useRef<any>();

  // Fetch graph data
  const fetchGraphData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.goal && filters.goal !== 'all') params.append('goal', filters.goal);
      if (filters.tag && filters.tag !== 'all') params.append('tag', filters.tag);
      if (filters.timeWindow && filters.timeWindow !== 'all') params.append('timeWindow', filters.timeWindow);
      if (filters.depth) params.append('depth', filters.depth);

      const response = await fetch(`/api/graph/people?${params}`);
      if (response.ok) {
        const data = await response.json();
        setGraphData(data);
      }
    } catch (error) {
      console.error('Failed to fetch graph data:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  // Handle node click
  const handleNodeClick = useCallback((node: any) => {
    const personData = graphData.nodes.find(n => n.id === node.id);
    if (personData) {
      setSelectedNode({
        id: personData.id,
        fullName: personData.label,
        location: personData.location,
        email: personData.email,
        tags: personData.tags,
        connections: graphData.edges.filter(e => e.from === personData.id || e.to === personData.id).length
      });
    }
  }, [graphData]);

  // Handle edge click
  const handleEdgeClick = useCallback((edge: any) => {
    console.log('Edge clicked:', edge);
  }, []);

  // Graph controls
  const zoomIn = () => graphRef.current?.zoomIn();
  const zoomOut = () => graphRef.current?.zoomOut();
  const resetView = () => graphRef.current?.zoomToFit(400);

  // Node color based on tags
  const getNodeColor = (node: any) => {
    if (node.tags?.includes('investor')) return '#ef4444'; // red
    if (node.tags?.includes('engineer')) return '#3b82f6'; // blue
    if (node.tags?.includes('advisor')) return '#10b981'; // green
    return '#6b7280'; // gray
  };

  // Edge color based on type
  const getEdgeColor = (edge: any) => {
    switch (edge.type) {
      case 'encounter': return '#3b82f6';
      case 'intro': return '#10b981';
      case 'goal_link': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  // Transform data for ForceGraph2D
  const forceGraphData = {
    nodes: graphData.nodes,
    links: graphData.edges.map(edge => ({
      source: edge.from,
      target: edge.to,
      type: edge.type,
      strength: edge.strength,
      metadata: edge.metadata
    }))
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Network Graph</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={resetView}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="goal">Goal</Label>
              <Select value={filters.goal} onValueChange={(value) => setFilters(prev => ({ ...prev, goal: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All goals" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All goals</SelectItem>
                  <SelectItem value="hire_engineer">Hire Engineer</SelectItem>
                  <SelectItem value="raise_seed">Raise Seed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tag">Tag</Label>
              <Select value={filters.tag} onValueChange={(value) => setFilters(prev => ({ ...prev, tag: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tags</SelectItem>
                  <SelectItem value="investor">Investor</SelectItem>
                  <SelectItem value="engineer">Engineer</SelectItem>
                  <SelectItem value="advisor">Advisor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="timeWindow">Time Window</Label>
              <Select value={filters.timeWindow} onValueChange={(value) => setFilters(prev => ({ ...prev, timeWindow: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="depth">Depth</Label>
              <Select value={filters.depth} onValueChange={(value) => setFilters(prev => ({ ...prev, depth: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Direct connections</SelectItem>
                  <SelectItem value="2">2nd degree</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Graph Visualization */}
      <Card className="mb-6">
        <CardContent className="p-0">
          <div className="h-[600px] relative">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-lg">Loading network graph...</div>
              </div>
            ) : (
              <ForceGraph2D
                ref={graphRef}
                graphData={forceGraphData}
                nodeLabel="label"
                nodeColor={getNodeColor}
                nodeRelSize={6}
                linkColor={getEdgeColor}
                linkWidth={2}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={0.005}
                onNodeClick={handleNodeClick}
                onLinkClick={handleEdgeClick}
                cooldownTicks={100}
                nodeCanvasObject={(node: any, ctx, globalScale) => {
                  const label = node.label;
                  const fontSize = 12/globalScale;
                  ctx.font = `${fontSize}px Sans-Serif`;
                  const textWidth = ctx.measureText(label).width;
                  const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

                  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                  ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);

                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.fillStyle = node.color;
                  ctx.fillText(label, node.x, node.y);

                  node.bckgDimensions = bckgDimensions;
                }}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span>Investors</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span>Engineers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span>Advisors</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-500"></div>
              <span>Others</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-blue-500"></div>
              <span>Encounters</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-green-500"></div>
              <span>Intros</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-yellow-500"></div>
              <span>Goal Links</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Person Profile Drawer */}
      <Drawer open={!!selectedNode} onOpenChange={() => setSelectedNode(null)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{selectedNode?.fullName}</DrawerTitle>
          </DrawerHeader>
          <div className="p-6">
            {selectedNode && (
              <div className="space-y-4">
                <div>
                  <Label>Location</Label>
                  <p className="text-sm text-gray-600">{selectedNode.location || 'Not specified'}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-sm text-gray-600">{selectedNode.email || 'Not specified'}</p>
                </div>
                <div>
                  <Label>Tags</Label>
                  <div className="flex gap-2 mt-1">
                    {selectedNode.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Connections</Label>
                  <p className="text-sm text-gray-600">{selectedNode.connections} connections</p>
                </div>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
