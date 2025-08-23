import { db } from '@rhiz/db';
import { person, edge, encounter, graphMetrics, personEncounter } from '@rhiz/db/schema';
import { eq, and, inArray, sql, desc, gte } from 'drizzle-orm';

export interface GraphNode {
  id: string;
  connections: string[];
  inDegree: number;
  outDegree: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight: number;
  lastSeen: Date;
}

export interface Community {
  id: string;
  members: string[];
  size: number;
}

export class GraphMetricsEngine {
  /**
   * Compute all metrics for a workspace
   */
  static async computeAllMetrics(workspaceId: string, ownerId: string) {
    try {
      // Get all people and edges for the workspace
      const people = await db
        .select()
        .from(person)
        .where(eq(person.workspaceId, workspaceId));

      const edges = await db
        .select()
        .from(edge)
        .where(eq(edge.workspaceId, workspaceId));

      // Build graph structure
      const graph = this.buildGraph(people.map(p => p.id), edges);
      
      // Compute metrics
      const degreeCentrality = this.computeDegreeCentrality(graph);
      const betweennessCentrality = this.computeBetweennessCentrality(graph);
      const communities = this.detectCommunities(graph);
      const edgeFreshness = await this.computeEdgeFreshness(workspaceId, edges);

      // Store metrics in database
      await this.storeMetrics(workspaceId, ownerId, {
        degreeCentrality,
        betweennessCentrality,
        communities,
        edgeFreshness
      });

      return {
        degreeCentrality,
        betweennessCentrality,
        communities,
        edgeFreshness
      };
    } catch (error) {
      console.error('Failed to compute graph metrics:', error);
      throw error;
    }
  }

  /**
   * Build graph structure from people and edges
   */
  private static buildGraph(personIds: string[], edges: any[]): Map<string, GraphNode> {
    const graph = new Map<string, GraphNode>();

    // Initialize nodes
    for (const personId of personIds) {
      graph.set(personId, {
        id: personId,
        connections: [],
        inDegree: 0,
        outDegree: 0
      });
    }

    // Add edges
    for (const edge of edges) {
      const fromNode = graph.get(edge.fromId);
      const toNode = graph.get(edge.toId);

      if (fromNode && toNode) {
        fromNode.connections.push(edge.toId);
        fromNode.outDegree++;
        toNode.inDegree++;
      }
    }

    return graph;
  }

  /**
   * Compute degree centrality for each node
   */
  private static computeDegreeCentrality(graph: Map<string, GraphNode>): Map<string, number> {
    const centrality = new Map<string, number>();
    const maxDegree = Math.max(...Array.from(graph.values()).map(n => n.connections.length));

    for (const [nodeId, node] of graph) {
      const degree = node.connections.length;
      centrality.set(nodeId, maxDegree > 0 ? degree / maxDegree : 0);
    }

    return centrality;
  }

  /**
   * Compute betweenness centrality using Brandes algorithm
   */
  private static computeBetweennessCentrality(graph: Map<string, GraphNode>): Map<string, number> {
    const centrality = new Map<string, number>();
    const nodes = Array.from(graph.keys());

    // Initialize centrality
    for (const node of nodes) {
      centrality.set(node, 0);
    }

    // Brandes algorithm for betweenness centrality
    for (const source of nodes) {
      const stack: string[] = [];
      const pred = new Map<string, string[]>();
      const sigma = new Map<string, number>();
      const dist = new Map<string, number>();

      // Initialize
      for (const node of nodes) {
        pred.set(node, []);
        sigma.set(node, 0);
        dist.set(node, -1);
      }
      sigma.set(source, 1);
      dist.set(source, 0);

      // BFS
      const queue = [source];
      while (queue.length > 0) {
        const v = queue.shift()!;
        stack.push(v);

        const vNode = graph.get(v);
        if (!vNode) continue;

        for (const w of vNode.connections) {
          if (dist.get(w)! < 0) {
            queue.push(w);
            dist.set(w, dist.get(v)! + 1);
          }
          if (dist.get(w) === dist.get(v)! + 1) {
            sigma.set(w, sigma.get(w)! + sigma.get(v)!);
            pred.get(w)!.push(v);
          }
        }
      }

      // Accumulation
      const delta = new Map<string, number>();
      for (const node of nodes) {
        delta.set(node, 0);
      }

      while (stack.length > 0) {
        const w = stack.pop()!;
        for (const v of pred.get(w)!) {
          delta.set(v, delta.get(v)! + (sigma.get(v)! / sigma.get(w)!) * (1 + delta.get(w)!));
        }
        if (w !== source) {
          centrality.set(w, centrality.get(w)! + delta.get(w)!);
        }
      }
    }

    // Normalize by (n-1)(n-2) for undirected graph
    const n = nodes.length;
    const normalization = (n - 1) * (n - 2);
    
    for (const [node, value] of centrality) {
      centrality.set(node, normalization > 0 ? value / normalization : 0);
    }

    return centrality;
  }

  /**
   * Detect communities using Louvain modularity algorithm (simplified)
   */
  private static detectCommunities(graph: Map<string, GraphNode>): Community[] {
    const communities = new Map<string, string>();
    const nodes = Array.from(graph.keys());

    // Initialize: each node in its own community
    for (const node of nodes) {
      communities.set(node, node);
    }

    let improved = true;
    let iteration = 0;
    const maxIterations = 10;

    while (improved && iteration < maxIterations) {
      improved = false;
      iteration++;

      for (const node of nodes) {
        const currentCommunity = communities.get(node)!;
        const neighbors = graph.get(node)?.connections || [];
        
        // Find best community for this node
        const communityScores = new Map<string, number>();
        
        for (const neighbor of neighbors) {
          const neighborCommunity = communities.get(neighbor)!;
          communityScores.set(
            neighborCommunity,
            (communityScores.get(neighborCommunity) || 0) + 1
          );
        }

        // Move to community with highest score
        let bestCommunity = currentCommunity;
        let bestScore = communityScores.get(currentCommunity) || 0;

        for (const [community, score] of communityScores) {
          if (score > bestScore) {
            bestScore = score;
            bestCommunity = community;
          }
        }

        if (bestCommunity !== currentCommunity) {
          communities.set(node, bestCommunity);
          improved = true;
        }
      }
    }

    // Group nodes by community
    const communityGroups = new Map<string, string[]>();
    for (const [node, community] of communities) {
      if (!communityGroups.has(community)) {
        communityGroups.set(community, []);
      }
      communityGroups.get(community)!.push(node);
    }

    // Convert to Community objects
    const result: Community[] = [];
    for (const [communityId, members] of communityGroups) {
      result.push({
        id: communityId,
        members,
        size: members.length
      });
    }

    return result;
  }

  /**
   * Compute edge freshness (days since last encounter)
   */
  private static async computeEdgeFreshness(workspaceId: string, edges: any[]): Promise<Map<string, number>> {
    const freshness = new Map<string, number>();
    const now = new Date();

    // Get recent encounters for each person
    const personIds = [...new Set(edges.flatMap(e => [e.fromId, e.toId]))];
    
    for (const personId of personIds) {
      const recentEncounter = await db
        .select({ occurredAt: encounter.occurredAt })
        .from(encounter)
        .innerJoin(personEncounter, eq(encounter.id, personEncounter.encounterId))
        .where(
          and(
            eq(encounter.workspaceId, workspaceId),
            eq(personEncounter.personId, personId)
          )
        )
        .orderBy(desc(encounter.occurredAt))
        .limit(1);

      if (recentEncounter.length > 0) {
        const daysSince = Math.floor((now.getTime() - recentEncounter[0].occurredAt.getTime()) / (1000 * 60 * 60 * 24));
        freshness.set(personId, daysSince);
      } else {
        freshness.set(personId, 999); // No encounters found
      }
    }

    return freshness;
  }

  /**
   * Store computed metrics in database
   */
  private static async storeMetrics(
    workspaceId: string, 
    ownerId: string, 
    metrics: {
      degreeCentrality: Map<string, number>;
      betweennessCentrality: Map<string, number>;
      communities: Community[];
      edgeFreshness: Map<string, number>;
    }
  ) {
    const metricValues = [];

    // Store degree centrality
    for (const [personId, value] of metrics.degreeCentrality) {
      metricValues.push({
        workspaceId,
        ownerId,
        personId,
        metric: 'degree_centrality',
        value: { value, normalized: true }
      });
    }

    // Store betweenness centrality
    for (const [personId, value] of metrics.betweennessCentrality) {
      metricValues.push({
        workspaceId,
        ownerId,
        personId,
        metric: 'betweenness_centrality',
        value: { value, normalized: true }
      });
    }

    // Store community assignments
    for (const community of metrics.communities) {
      for (const personId of community.members) {
        metricValues.push({
          workspaceId,
          ownerId,
          personId,
          metric: 'community_id',
          value: { communityId: community.id, communitySize: community.size }
        });
      }
    }

    // Store edge freshness
    for (const [personId, daysSince] of metrics.edgeFreshness) {
      metricValues.push({
        workspaceId,
        ownerId,
        personId,
        metric: 'edge_freshness',
        value: { daysSince, lastSeen: new Date(Date.now() - daysSince * 24 * 60 * 60 * 1000) }
      });
    }

    // Delete existing metrics for this workspace
    await db
      .delete(graphMetrics)
      .where(eq(graphMetrics.workspaceId, workspaceId));

    // Insert new metrics
    if (metricValues.length > 0) {
      await db.insert(graphMetrics).values(metricValues);
    }
  }

  /**
   * Get metrics for a specific person
   */
  static async getPersonMetrics(workspaceId: string, personId: string) {
    const metrics = await db
      .select()
      .from(graphMetrics)
      .where(
        and(
          eq(graphMetrics.workspaceId, workspaceId),
          eq(graphMetrics.personId, personId)
        )
      );

    const result: Record<string, any> = {};
    for (const metric of metrics) {
      result[metric.metric] = metric.value;
    }

    return result;
  }

  /**
   * Get top people by metric
   */
  static async getTopPeopleByMetric(workspaceId: string, metric: string, limit: number = 10) {
    const metrics = await db
      .select({
        personId: graphMetrics.personId,
        value: graphMetrics.value,
        calculatedAt: graphMetrics.calculatedAt
      })
      .from(graphMetrics)
      .where(
        and(
          eq(graphMetrics.workspaceId, workspaceId),
          eq(graphMetrics.metric, metric)
        )
      )
      .orderBy(desc(sql`(${graphMetrics.value}->>'value')::float`))
      .limit(limit);

    return metrics;
  }
}
