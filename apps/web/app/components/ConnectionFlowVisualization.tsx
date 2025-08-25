'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Maximize2, Minimize2, ZoomIn, ZoomOut, RefreshCw, 
  Filter, Download, Share2, Info, Settings, GitBranch,
  Users, Target, Brain, Sparkles, TrendingUp, Network
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlowNode {
  id: string;
  name: string;
  type: 'person' | 'cluster' | 'hub';
  x?: number;
  y?: number;
  size: number;
  connections: number;
  cluster?: string;
  influence: number;
  metadata?: {
    role?: string;
    company?: string;
    strength?: number;
  };
}

interface FlowEdge {
  source: string;
  target: string;
  value: number;
  type: 'strong' | 'moderate' | 'weak' | 'potential';
  direction: 'bidirectional' | 'unidirectional';
}

interface FlowCluster {
  id: string;
  name: string;
  type: 'industry' | 'location' | 'interest' | 'company' | 'school';
  size: number;
  density: number;
  centralNodes: string[];
  color: string;
}

interface ConnectionFlowData {
  nodes: FlowNode[];
  edges: FlowEdge[];
  clusters: FlowCluster[];
  metrics: {
    totalNodes: number;
    totalEdges: number;
    averageDegree: number;
    clusteringCoefficient: number;
    networkDensity: number;
    centralityScore: number;
    bridgeNodes: string[];
    influencers: string[];
  };
  patterns: Array<{
    type: string;
    strength: number;
    description: string;
    recommendations: string[];
  }>;
  insights: string[];
}

interface ConnectionFlowVisualizationProps {
  userId?: string;
  onNodeClick?: (node: FlowNode) => void;
  onInsightClick?: (insight: string) => void;
}

export function ConnectionFlowVisualization({ 
  userId = 'default-user',
  onNodeClick,
  onInsightClick 
}: ConnectionFlowVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [flowData, setFlowData] = useState<ConnectionFlowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [viewMode, setViewMode] = useState<'flow' | 'force' | 'cluster'>('flow');
  const [showMetrics, setShowMetrics] = useState(true);
  const [showInsights, setShowInsights] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch flow data
  useEffect(() => {
    fetchFlowData();
  }, [userId]);

  const fetchFlowData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/insights/connection-flow?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch flow data');
      
      const data = await response.json();
      setFlowData(data);
    } catch (err) {
      console.error('Error fetching flow data:', err);
      setError('Failed to load connection flow data');
    } finally {
      setLoading(false);
    }
  };

  // Simplified D3-free visualization using SVG
  useEffect(() => {
    if (!flowData || !svgRef.current || !containerRef.current) return;

    const svg = svgRef.current;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Clear previous content
    svg.innerHTML = '';

    // Set SVG dimensions
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', width.toString());
    svg.setAttribute('height', height.toString());

    // Simple circular layout for nodes
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.3;

    // Position nodes in a circular layout
    flowData.nodes.forEach((node, index) => {
      const angle = (index / flowData.nodes.length) * 2 * Math.PI;
      node.x = centerX + radius * Math.cos(angle);
      node.y = centerY + radius * Math.sin(angle);
    });

    // Create SVG elements
    const svgElement = svg;

    // Draw edges
    flowData.edges.forEach((edge) => {
      const sourceNode = flowData.nodes.find(n => n.id === edge.source);
      const targetNode = flowData.nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', sourceNode.x!.toString());
        line.setAttribute('y1', sourceNode.y!.toString());
        line.setAttribute('x2', targetNode.x!.toString());
        line.setAttribute('y2', targetNode.y!.toString());
        line.setAttribute('stroke', getEdgeColor(edge.type));
        line.setAttribute('stroke-width', Math.sqrt(edge.value).toString());
        line.setAttribute('opacity', getEdgeOpacity(edge.type).toString());
        if (edge.type === 'potential') {
          line.setAttribute('stroke-dasharray', '5,5');
        }
        svgElement.appendChild(line);
      }
    });

    // Draw nodes
    flowData.nodes.forEach((node) => {
      // Node circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', node.x!.toString());
      circle.setAttribute('cy', node.y!.toString());
      circle.setAttribute('r', (node.size * 3).toString());
      circle.setAttribute('fill', getNodeColor(node));
      circle.setAttribute('stroke', '#fff');
      circle.setAttribute('stroke-width', '2');
      circle.setAttribute('opacity', '0.9');
      circle.style.cursor = 'pointer';
      
      circle.addEventListener('click', () => {
        setSelectedNode(node);
        onNodeClick?.(node);
      });
      
      circle.addEventListener('mouseenter', () => {
        circle.setAttribute('r', (node.size * 4).toString());
      });
      
      circle.addEventListener('mouseleave', () => {
        circle.setAttribute('r', (node.size * 3).toString());
      });
      
      svgElement.appendChild(circle);

      // Node label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', node.x!.toString());
      text.setAttribute('y', (node.y! + node.size * 3 + 15).toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#fff');
      text.setAttribute('font-size', '12px');
      text.setAttribute('font-weight', '500');
      text.style.pointerEvents = 'none';
      text.textContent = node.name;
      svgElement.appendChild(text);
    });

  }, [flowData, viewMode, onNodeClick]);

  const getNodeColor = (node: FlowNode): string => {
    if (node.type === 'hub') return '#f59e0b';
    if (node.influence > 8) return '#8b5cf6';
    if (node.connections > 10) return '#3b82f6';
    if (node.connections > 5) return '#10b981';
    return '#6b7280';
  };

  const getEdgeColor = (type: string): string => {
    switch(type) {
      case 'strong': return '#3b82f6';
      case 'moderate': return '#10b981';
      case 'weak': return '#6b7280';
      case 'potential': return '#9ca3af';
      default: return '#6b7280';
    }
  };

  const getEdgeOpacity = (type: string): number => {
    switch(type) {
      case 'strong': return 0.8;
      case 'moderate': return 0.6;
      case 'weak': return 0.4;
      case 'potential': return 0.3;
      default: return 0.5;
    }
  };

  const handleExport = () => {
    if (!svgRef.current) return;
    
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'connection-flow.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-gray-400">Analyzing connection flow...</span>
        </div>
      </div>
    );
  }

  if (error || !flowData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <GitBranch className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">{error || 'No flow data available'}</p>
          <button
            onClick={fetchFlowData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col" ref={containerRef}>
      {/* Controls */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-start justify-between pointer-events-none">
        <div className="flex flex-col space-y-2 pointer-events-auto">
          {/* View Mode Selector */}
          <div className="bg-gray-900/90 backdrop-blur-xl rounded-lg p-1 flex space-x-1">
            <button
              onClick={() => setViewMode('flow')}
              className={cn(
                "px-3 py-1.5 rounded text-sm font-medium transition-all",
                viewMode === 'flow' 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              )}
            >
              Flow
            </button>
            <button
              onClick={() => setViewMode('force')}
              className={cn(
                "px-3 py-1.5 rounded text-sm font-medium transition-all",
                viewMode === 'force' 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              )}
            >
              Force
            </button>
            <button
              onClick={() => setViewMode('cluster')}
              className={cn(
                "px-3 py-1.5 rounded text-sm font-medium transition-all",
                viewMode === 'cluster' 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              )}
            >
              Cluster
            </button>
          </div>
        </div>

        <div className="flex space-x-2 pointer-events-auto">
          <button
            onClick={() => setShowMetrics(!showMetrics)}
            className={cn(
              "p-2 bg-gray-900/90 backdrop-blur-xl rounded-lg transition-colors",
              showMetrics ? "text-blue-400" : "text-gray-400"
            )}
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowInsights(!showInsights)}
            className={cn(
              "p-2 bg-gray-900/90 backdrop-blur-xl rounded-lg transition-colors",
              showInsights ? "text-purple-400" : "text-gray-400"
            )}
          >
            <Brain className="w-4 h-4" />
          </button>
          <button
            onClick={handleExport}
            className="p-2 bg-gray-900/90 backdrop-blur-xl rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-gray-900/90 backdrop-blur-xl rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Visualization */}
      <div className="flex-1 relative">
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{ background: 'radial-gradient(circle at center, #1a1a2e 0%, #0a0a0f 100%)' }}
        />
      </div>

      {/* Metrics Panel */}
      <AnimatePresence>
        {showMetrics && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-xl rounded-lg p-4 max-w-xs"
          >
            <h3 className="text-sm font-semibold mb-3 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>Network Metrics</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Nodes</span>
                <span className="font-medium">{flowData.metrics.totalNodes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Edges</span>
                <span className="font-medium">{flowData.metrics.totalEdges}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Avg Degree</span>
                <span className="font-medium">{flowData.metrics.averageDegree.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Clustering</span>
                <span className="font-medium">{(flowData.metrics.clusteringCoefficient * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Density</span>
                <span className="font-medium">{(flowData.metrics.networkDensity * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Centrality</span>
                <span className="font-medium">{flowData.metrics.centralityScore.toFixed(2)}</span>
              </div>
            </div>

            {flowData.patterns.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <h4 className="text-xs font-medium mb-2">Detected Patterns</h4>
                {flowData.patterns.map((pattern, i) => (
                  <div key={i} className="mb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{pattern.type.replace(/_/g, ' ')}</span>
                      <span className="text-xs text-green-400">{(pattern.strength * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Insights Panel */}
      <AnimatePresence>
        {showInsights && flowData.insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute bottom-4 right-4 bg-gray-900/90 backdrop-blur-xl rounded-lg p-4 max-w-sm max-h-64 overflow-y-auto"
          >
            <h3 className="text-sm font-semibold mb-3 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>AI Insights</span>
            </h3>
            <div className="space-y-2">
              {flowData.insights.map((insight, i) => (
                <div
                  key={i}
                  className="text-xs text-gray-300 p-2 bg-white/5 rounded hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => onInsightClick?.(insight)}
                >
                  {insight}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Node Details */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-20 left-4 bg-gray-900/90 backdrop-blur-xl rounded-lg p-4 max-w-xs"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold">{selectedNode.name}</h3>
                {selectedNode.metadata?.role && (
                  <p className="text-xs text-gray-400">{selectedNode.metadata.role}</p>
                )}
                {selectedNode.metadata?.company && (
                  <p className="text-xs text-gray-400">{selectedNode.metadata.company}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Connections</span>
                <span className="font-medium">{selectedNode.connections}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Influence</span>
                <span className="font-medium">{selectedNode.influence.toFixed(1)}</span>
              </div>
              {selectedNode.cluster && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Cluster</span>
                  <span className="font-medium">{selectedNode.cluster}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}