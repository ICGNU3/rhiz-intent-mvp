import { NextRequest, NextResponse } from 'next/server';
import { db, person, edge, encounter, goal, eq, and, desc, sql } from '@rhiz/db';
import { or, asc, gte, lte } from 'drizzle-orm';
import { logger } from '@/lib/logger';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

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
  metadata?: {
    sharedConnections?: number;
    lastInteraction?: Date;
    commonGoals?: string[];
  };
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

interface FlowMetrics {
  totalNodes: number;
  totalEdges: number;
  averageDegree: number;
  clusteringCoefficient: number;
  networkDensity: number;
  centralityScore: number;
  bridgeNodes: string[];
  influencers: string[];
}

interface FlowPattern {
  type: 'hub_and_spoke' | 'mesh' | 'hierarchical' | 'community' | 'small_world';
  strength: number;
  description: string;
  recommendations: string[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default-user';
    const depth = parseInt(searchParams.get('depth') || '2');
    const minStrength = parseInt(searchParams.get('minStrength') || '3');
    
    logger.info('Analyzing connection flow', { userId, depth, minStrength });

    // Fetch all people and relationships
    const [allPeople, allRelationships] = await Promise.all([
      db.select({
        id: person.id,
        name: person.fullName,
        email: person.primaryEmail,
        location: person.location,
        createdAt: person.createdAt,
        updatedAt: person.updatedAt,
      })
      .from(person)
      .where(eq(person.ownerId, userId))
      .limit(500),
      
      db.select({
        id: edge.id,
        personId: edge.fromId,
        relatedPersonId: edge.toId,
        relationshipType: edge.type,
        strength: edge.strength,
        metadata: edge.metadata,
        createdAt: edge.createdAt,
      })
      .from(edge)
      .where(eq(edge.ownerId, userId))
      .limit(1000),
    ]);

    // Build nodes from people
    const nodes: FlowNode[] = allPeople.map(person => ({
      id: person.id,
      name: person.name,
      type: 'person' as const,
      size: 5,
      connections: 0,
      influence: calculateInfluence(person, allRelationships),
      cluster: detectCluster(person),
      metadata: {
        email: person.email || undefined,
        location: person.location || undefined,
        strength: 5,
      }
    }));

    // Build edges from relationships
    const edges: FlowEdge[] = [];
    const connectionCount: Record<string, number> = {};

    allRelationships.forEach(rel => {
      if (rel.strength >= minStrength) {
        // Count connections for each node
        connectionCount[rel.personId] = (connectionCount[rel.personId] || 0) + 1;
        connectionCount[rel.relatedPersonId] = (connectionCount[rel.relatedPersonId] || 0) + 1;

        edges.push({
          source: rel.personId,
          target: rel.relatedPersonId,
          value: rel.strength,
          type: getEdgeType(rel.strength),
          direction: 'bidirectional',
          metadata: {
            lastInteraction: rel.createdAt,
          }
        });
      }
    });

    // Update connection counts in nodes
    nodes.forEach(node => {
      node.connections = connectionCount[node.id] || 0;
    });

    // Detect clusters using community detection algorithm
    const clusters = detectCommunities(nodes, edges);

    // Calculate flow metrics
    const metrics = calculateFlowMetrics(nodes, edges);

    // Detect network patterns
    const patterns = detectNetworkPatterns(nodes, edges, metrics);

    // Find bridge nodes (connectors between clusters)
    const bridgeNodes = findBridgeNodes(nodes, edges, clusters);

    // Find influencers (high centrality nodes)
    const influencers = findInfluencers(nodes, edges);

    // Generate insights
    const insights = generateFlowInsights(nodes, edges, clusters, metrics, patterns);

    // Apply force-directed layout for visualization
    const layoutData = applyForceLayout(nodes, edges);

    return NextResponse.json({
      nodes: layoutData.nodes,
      edges,
      clusters,
      metrics: {
        ...metrics,
        bridgeNodes,
        influencers,
      },
      patterns,
      insights,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Failed to analyze connection flow', error as Error);
    return NextResponse.json(
      { error: 'Failed to analyze connection flow' },
      { status: 500 }
    );
  }
}

// Helper functions

function calculateInfluence(person: any, relationships: any[]): number {
  const directConnections = relationships.filter(
    r => r.personId === person.id || r.relatedPersonId === person.id
  ).length;
  
  const strengthScore = 5;
  const recencyScore = person.updatedAt 
    ? Math.max(0, 10 - (Date.now() - new Date(person.updatedAt).getTime()) / (1000 * 60 * 60 * 24 * 30))
    : 5;
  
  return (directConnections * 2 + strengthScore + recencyScore) / 4;
}

function detectCluster(person: any): string {
  if (person.location) return person.location;
  if (person.email) {
    const domain = person.email.split('@')[1];
    if (domain) return domain;
  }
  return 'general';
}

function getEdgeType(strength: number): 'strong' | 'moderate' | 'weak' | 'potential' {
  if (strength >= 8) return 'strong';
  if (strength >= 5) return 'moderate';
  if (strength >= 3) return 'weak';
  return 'potential';
}

function detectCommunities(nodes: FlowNode[], edges: FlowEdge[]): FlowCluster[] {
  // Simple community detection based on shared connections
  const clusters: Map<string, Set<string>> = new Map();
  
  // Group nodes by their cluster attribute
  nodes.forEach(node => {
    const clusterKey = node.cluster || 'general';
    if (!clusters.has(clusterKey)) {
      clusters.set(clusterKey, new Set());
    }
    clusters.get(clusterKey)!.add(node.id);
  });

  // Convert to FlowCluster format
  return Array.from(clusters.entries()).map(([name, nodeIds], index) => {
    const clusterNodes = nodes.filter(n => nodeIds.has(n.id));
    const clusterEdges = edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));
    
    return {
      id: `cluster-${index}`,
      name,
      type: detectClusterType(name),
      size: nodeIds.size,
      density: calculateDensity(clusterNodes, clusterEdges),
      centralNodes: findCentralNodes(clusterNodes, edges),
      color: getClusterColor(index),
    };
  });
}

function detectClusterType(name: string): FlowCluster['type'] {
  if (name.includes('Inc') || name.includes('LLC') || name.includes('Corp')) return 'company';
  if (name.includes('University') || name.includes('College')) return 'school';
  if (name.includes(',')) return 'location';
  return 'interest';
}

function calculateDensity(nodes: FlowNode[], edges: FlowEdge[]): number {
  if (nodes.length < 2) return 0;
  const maxEdges = (nodes.length * (nodes.length - 1)) / 2;
  return edges.length / maxEdges;
}

function findCentralNodes(nodes: FlowNode[], allEdges: FlowEdge[]): string[] {
  return nodes
    .sort((a, b) => b.influence - a.influence)
    .slice(0, 3)
    .map(n => n.id);
}

function getClusterColor(index: number): string {
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ];
  return colors[index % colors.length];
}

function calculateFlowMetrics(nodes: FlowNode[], edges: FlowEdge[]): FlowMetrics {
  const totalNodes = nodes.length;
  const totalEdges = edges.length;
  const averageDegree = totalNodes > 0 ? (totalEdges * 2) / totalNodes : 0;
  
  // Calculate network density
  const maxPossibleEdges = (totalNodes * (totalNodes - 1)) / 2;
  const networkDensity = maxPossibleEdges > 0 ? totalEdges / maxPossibleEdges : 0;
  
  // Calculate clustering coefficient (simplified)
  const clusteringCoefficient = calculateClusteringCoefficient(nodes, edges);
  
  // Calculate centrality score
  const centralityScore = calculateCentralityScore(nodes, edges);
  
  return {
    totalNodes,
    totalEdges,
    averageDegree,
    clusteringCoefficient,
    networkDensity,
    centralityScore,
    bridgeNodes: [],
    influencers: [],
  };
}

function calculateClusteringCoefficient(nodes: FlowNode[], edges: FlowEdge[]): number {
  // Simplified clustering coefficient calculation
  let totalCoefficient = 0;
  let validNodes = 0;
  
  nodes.forEach(node => {
    const neighbors = edges
      .filter(e => e.source === node.id || e.target === node.id)
      .map(e => e.source === node.id ? e.target : e.source);
    
    if (neighbors.length >= 2) {
      const possibleConnections = (neighbors.length * (neighbors.length - 1)) / 2;
      const actualConnections = edges.filter(e => 
        neighbors.includes(e.source) && neighbors.includes(e.target)
      ).length;
      
      totalCoefficient += actualConnections / possibleConnections;
      validNodes++;
    }
  });
  
  return validNodes > 0 ? totalCoefficient / validNodes : 0;
}

function calculateCentralityScore(nodes: FlowNode[], edges: FlowEdge[]): number {
  // Average influence score as a proxy for network centrality
  const totalInfluence = nodes.reduce((sum, node) => sum + node.influence, 0);
  return nodes.length > 0 ? totalInfluence / nodes.length : 0;
}

function detectNetworkPatterns(
  nodes: FlowNode[], 
  edges: FlowEdge[], 
  metrics: FlowMetrics
): FlowPattern[] {
  const patterns: FlowPattern[] = [];
  
  // Hub and Spoke detection
  const maxConnections = Math.max(...nodes.map(n => n.connections));
  const avgConnections = metrics.averageDegree;
  if (maxConnections > avgConnections * 3) {
    patterns.push({
      type: 'hub_and_spoke',
      strength: (maxConnections - avgConnections) / avgConnections,
      description: 'Your network has central hubs with many connections',
      recommendations: [
        'Leverage hub connections for introductions',
        'Build direct relationships to reduce dependency on hubs',
      ],
    });
  }
  
  // Small World detection
  if (metrics.clusteringCoefficient > 0.3 && metrics.averageDegree > 4) {
    patterns.push({
      type: 'small_world',
      strength: metrics.clusteringCoefficient,
      description: 'Your network exhibits small-world properties with tight clusters',
      recommendations: [
        'Use cluster bridges for rapid information spread',
        'Identify and strengthen weak ties between clusters',
      ],
    });
  }
  
  // Community structure detection
  if (metrics.networkDensity < 0.3 && metrics.clusteringCoefficient > 0.4) {
    patterns.push({
      type: 'community',
      strength: metrics.clusteringCoefficient / (1 - metrics.networkDensity),
      description: 'Your network has distinct community structures',
      recommendations: [
        'Foster cross-community connections',
        'Identify community leaders for targeted engagement',
      ],
    });
  }
  
  return patterns;
}

function findBridgeNodes(
  nodes: FlowNode[], 
  edges: FlowEdge[], 
  clusters: FlowCluster[]
): string[] {
  const bridgeNodes: Set<string> = new Set();
  
  edges.forEach(edge => {
    const sourceCluster = nodes.find(n => n.id === edge.source)?.cluster;
    const targetCluster = nodes.find(n => n.id === edge.target)?.cluster;
    
    if (sourceCluster !== targetCluster) {
      bridgeNodes.add(edge.source);
      bridgeNodes.add(edge.target);
    }
  });
  
  return Array.from(bridgeNodes);
}

function findInfluencers(nodes: FlowNode[], edges: FlowEdge[]): string[] {
  return nodes
    .sort((a, b) => b.influence - a.influence)
    .slice(0, 5)
    .map(n => n.id);
}

function generateFlowInsights(
  nodes: FlowNode[],
  edges: FlowEdge[],
  clusters: FlowCluster[],
  metrics: FlowMetrics,
  patterns: FlowPattern[]
): string[] {
  const insights: string[] = [];
  
  // Network size insight
  if (nodes.length > 100) {
    insights.push(`Your network of ${nodes.length} connections is large and diverse. Focus on quality over quantity.`);
  } else if (nodes.length < 30) {
    insights.push(`With ${nodes.length} connections, you have room to expand. Target strategic connections in your field.`);
  }
  
  // Density insight
  if (metrics.networkDensity > 0.5) {
    insights.push('Your network is highly interconnected. This creates strong trust and information flow.');
  } else if (metrics.networkDensity < 0.1) {
    insights.push('Your network has low density. Consider introducing connections to each other.');
  }
  
  // Clustering insight
  if (metrics.clusteringCoefficient > 0.5) {
    insights.push('High clustering indicates tight-knit groups. Leverage these for deep collaboration.');
  }
  
  // Pattern-based insights
  patterns.forEach(pattern => {
    if (pattern.type === 'hub_and_spoke' && pattern.strength > 2) {
      insights.push('You have super-connectors in your network. They can accelerate introductions.');
    }
    if (pattern.type === 'community' && pattern.strength > 1.5) {
      insights.push('Strong community structures detected. Bridge these communities for unique opportunities.');
    }
  });
  
  // Cluster insights
  if (clusters.length > 5) {
    insights.push(`Your network spans ${clusters.length} distinct clusters. This diversity is valuable for innovation.`);
  }
  
  return insights;
}

function applyForceLayout(nodes: FlowNode[], edges: FlowEdge[]) {
  // Simple force-directed layout simulation
  const width = 800;
  const height = 600;
  const center = { x: width / 2, y: height / 2 };
  
  // Initialize random positions
  nodes.forEach(node => {
    node.x = center.x + (Math.random() - 0.5) * width * 0.8;
    node.y = center.y + (Math.random() - 0.5) * height * 0.8;
  });
  
  // Run simulation iterations
  for (let i = 0; i < 50; i++) {
    // Apply forces
    nodes.forEach((node, idx) => {
      let fx = 0;
      let fy = 0;
      
      // Repulsion between all nodes
      nodes.forEach((other, otherIdx) => {
        if (idx !== otherIdx) {
          const dx = node.x! - other.x!;
          const dy = node.y! - other.y!;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > 0 && distance < 100) {
            const force = 100 / (distance * distance);
            fx += (dx / distance) * force;
            fy += (dy / distance) * force;
          }
        }
      });
      
      // Attraction along edges
      edges.forEach(edge => {
        let other: FlowNode | undefined;
        if (edge.source === node.id) {
          other = nodes.find(n => n.id === edge.target);
        } else if (edge.target === node.id) {
          other = nodes.find(n => n.id === edge.source);
        }
        
        if (other) {
          const dx = other.x! - node.x!;
          const dy = other.y! - node.y!;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > 0) {
            const force = distance * 0.01 * edge.value;
            fx += (dx / distance) * force;
            fy += (dy / distance) * force;
          }
        }
      });
      
      // Apply forces with damping
      node.x! += fx * 0.1;
      node.y! += fy * 0.1;
      
      // Keep within bounds
      node.x = Math.max(50, Math.min(width - 50, node.x!));
      node.y = Math.max(50, Math.min(height - 50, node.y!));
    });
  }
  
  return { nodes, edges };
}