import { db } from '@rhiz/db';
import { person, claim, goal, graphMetrics, graphInsight } from '@rhiz/db/schema';
import { eq, and, inArray, sql, desc, gte, lt } from 'drizzle-orm';
import { GraphMetricsEngine } from './metrics';

export interface Insight {
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
}

export class GraphInsightAgent {
  /**
   * Generate insights for a workspace
   */
  static async generateInsights(workspaceId: string, ownerId: string): Promise<Insight[]> {
    try {
      // First, compute fresh metrics
      await GraphMetricsEngine.computeAllMetrics(workspaceId, ownerId);

      const insights: Insight[] = [];

      // Generate opportunity gap insights (dormant high-value contacts)
      const opportunityGaps = await this.findOpportunityGaps(workspaceId);
      insights.push(...opportunityGaps);

      // Generate bridge builder insights
      const bridgeBuilders = await this.findBridgeBuilders(workspaceId);
      insights.push(...bridgeBuilders);

      // Generate cluster insights
      const clusterInsights = await this.findClusterInsights(workspaceId);
      insights.push(...clusterInsights);

      // Generate goal alignment gaps
      const goalGaps = await this.findGoalAlignmentGaps(workspaceId);
      insights.push(...goalGaps);

      // Store insights in database
      await this.storeInsights(workspaceId, ownerId, insights);

      return insights;
    } catch (error) {
      console.error('Failed to generate insights:', error);
      throw error;
    }
  }

  /**
   * Find dormant but valuable contacts
   */
  private static async findOpportunityGaps(workspaceId: string): Promise<Insight[]> {
    const insights: Insight[] = [];

    // Get people with high centrality but no recent activity
    const dormantCentral = await db
      .select({
        personId: graphMetrics.personId,
        degreeCentrality: graphMetrics.value,
        edgeFreshness: sql<any>`(
          SELECT value FROM graph_metrics gm2 
          WHERE gm2.person_id = ${graphMetrics.personId} 
          AND gm2.metric = 'edge_freshness'
        )`
      })
      .from(graphMetrics)
      .where(
        and(
          eq(graphMetrics.workspaceId, workspaceId),
          eq(graphMetrics.metric, 'degree_centrality'),
          sql`(${graphMetrics.value}->>'value')::float > 0.7`
        )
      );

    for (const person of dormantCentral) {
      const freshness = person.edgeFreshness;
      if (freshness && freshness.daysSince > 60) {
        const personData = await db
          .select()
          .from(person)
          .where(eq(person.id, person.personId));

        if (personData.length > 0) {
          insights.push({
            type: 'opportunity_gap',
            title: 'Dormant but valuable contact',
            detail: `${personData[0].fullName} (high influence, ${freshness.daysSince} days since last activity). Suggest reactivation.`,
            personId: person.personId,
            score: Math.min(90, 50 + (person.degreeCentrality.value * 40) + (freshness.daysSince / 10)),
            provenance: {
              metric: 'degree_centrality',
              value: person.degreeCentrality,
              reason_generated: `High centrality (${person.degreeCentrality.value}) but dormant for ${freshness.daysSince} days`
            }
          });
        }
      }
    }

    return insights;
  }

  /**
   * Find people who bridge different clusters
   */
  private static async findBridgeBuilders(workspaceId: string): Promise<Insight[]> {
    const insights: Insight[] = [];

    // Get people with high betweenness centrality
    const bridgeNodes = await db
      .select({
        personId: graphMetrics.personId,
        betweennessCentrality: graphMetrics.value
      })
      .from(graphMetrics)
      .where(
        and(
          eq(graphMetrics.workspaceId, workspaceId),
          eq(graphMetrics.metric, 'betweenness_centrality'),
          sql`(${graphMetrics.value}->>'value')::float > 0.5`
        )
      );

    for (const node of bridgeNodes) {
      const personData = await db
        .select()
        .from(person)
        .where(eq(person.id, node.personId));

      if (personData.length > 0) {
        insights.push({
          type: 'bridge_builder',
          title: 'Bridge Builder',
          detail: `${personData[0].fullName} connects different parts of your network. Consider leveraging their connections.`,
          personId: node.personId,
          score: Math.min(85, 60 + (node.betweennessCentrality.value * 25)),
          provenance: {
            metric: 'betweenness_centrality',
            value: node.betweennessCentrality,
            reason_generated: `High betweenness centrality (${node.betweennessCentrality.value}) indicates bridge role`
          }
        });
      }
    }

    return insights;
  }

  /**
   * Find insights about clusters/communities
   */
  private static async findClusterInsights(workspaceId: string): Promise<Insight[]> {
    const insights: Insight[] = [];

    // Get community assignments
    const communities = await db
      .select({
        personId: graphMetrics.personId,
        community: graphMetrics.value
      })
      .from(graphMetrics)
      .where(
        and(
          eq(graphMetrics.workspaceId, workspaceId),
          eq(graphMetrics.metric, 'community_id')
        )
      );

    // Group by community
    const communityGroups = new Map<string, string[]>();
    for (const item of communities) {
      const communityId = item.community.communityId;
      if (!communityGroups.has(communityId)) {
        communityGroups.set(communityId, []);
      }
      communityGroups.get(communityId)!.push(item.personId);
    }

    // Find large communities that might be underutilized
    for (const [communityId, members] of communityGroups) {
      if (members.length >= 5) {
        // Get some member details for context
        const memberDetails = await db
          .select({ fullName: person.fullName })
          .from(person)
          .where(inArray(person.id, members.slice(0, 3)));

        const memberNames = memberDetails.map(p => p.fullName).join(', ');
        
        insights.push({
          type: 'cluster_insight',
          title: 'Large community detected',
          detail: `Community of ${members.length} people including ${memberNames}. Consider group engagement strategies.`,
          score: Math.min(75, 40 + (members.length * 5)),
          provenance: {
            metric: 'community_id',
            value: { communityId, size: members.length },
            reason_generated: `Large community (${members.length} members) detected via Louvain algorithm`
          }
        });
      }
    }

    return insights;
  }

  /**
   * Find people relevant to active goals but not engaged
   */
  private static async findGoalAlignmentGaps(workspaceId: string): Promise<Insight[]> {
    const insights: Insight[] = [];

    // Get active goals
    const activeGoals = await db
      .select()
      .from(goal)
      .where(
        and(
          eq(goal.workspaceId, workspaceId),
          eq(goal.status, 'active')
        )
      );

    for (const goalItem of activeGoals) {
      // Get people with relevant tags/claims but no goal connection
      const relevantPeople = await db
        .select({
          personId: claim.subjectId,
          key: claim.key,
          value: claim.value
        })
        .from(claim)
        .where(
          and(
            eq(claim.workspaceId, workspaceId),
            eq(claim.subjectType, 'person'),
            sql`${claim.key} IN ('expertise', 'company', 'title', 'industry')`
          )
        );

      // Simple keyword matching (in production, use embeddings)
      const goalKeywords = this.extractKeywords(goalItem.title + ' ' + (goalItem.details || ''));
      
      for (const person of relevantPeople) {
        if (this.hasKeywordMatch(person.value, goalKeywords)) {
          // Check if person is already connected to this goal
          const existingConnection = await db
            .select()
            .from(graphMetrics)
            .where(
              and(
                eq(graphMetrics.workspaceId, workspaceId),
                eq(graphMetrics.personId, person.personId),
                sql`${graphMetrics.metric} = 'goal_connection'`
              )
            );

          if (existingConnection.length === 0) {
            const personData = await db
              .select()
              .from(person)
              .where(eq(person.id, person.personId));

            if (personData.length > 0) {
              insights.push({
                type: 'goal_alignment_gap',
                title: 'Goal-relevant contact not engaged',
                detail: `${personData[0].fullName} (${person.value}) appears relevant to goal "${goalItem.title}" but isn't connected.`,
                personId: person.personId,
                goalId: goalItem.id,
                score: 70,
                provenance: {
                  metric: 'goal_alignment',
                  value: { goalId: goalItem.id, relevantClaim: { key: person.key, value: person.value } },
                  reason_generated: `Person has ${person.key}="${person.value}" relevant to goal "${goalItem.title}"`
                }
              });
            }
          }
        }
      }
    }

    return insights;
  }

  /**
   * Extract keywords from text
   */
  private static extractKeywords(text: string): string[] {
    return text.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 10);
  }

  /**
   * Check if person value matches goal keywords
   */
  private static hasKeywordMatch(personValue: string, keywords: string[]): boolean {
    const personLower = personValue.toLowerCase();
    return keywords.some(keyword => personLower.includes(keyword));
  }

  /**
   * Store insights in database
   */
  private static async storeInsights(workspaceId: string, ownerId: string, insights: Insight[]) {
    // Delete existing insights for this workspace
    await db
      .delete(graphInsight)
      .where(eq(graphInsight.workspaceId, workspaceId));

    // Insert new insights
    if (insights.length > 0) {
      const insightValues = insights.map(insight => ({
        workspaceId,
        ownerId,
        type: insight.type,
        title: insight.title,
        detail: insight.detail,
        personId: insight.personId,
        goalId: insight.goalId,
        score: insight.score,
        provenance: insight.provenance,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }));

      await db.insert(graphInsight).values(insightValues);
    }
  }

  /**
   * Get insights for a workspace
   */
  static async getInsights(workspaceId: string, limit: number = 10) {
    return await db
      .select()
      .from(graphInsight)
      .where(
        and(
          eq(graphInsight.workspaceId, workspaceId),
          eq(graphInsight.state, 'active')
        )
      )
      .orderBy(desc(graphInsight.score))
      .limit(limit);
  }

  /**
   * Get insights for a specific person
   */
  static async getPersonInsights(workspaceId: string, personId: string) {
    return await db
      .select()
      .from(graphInsight)
      .where(
        and(
          eq(graphInsight.workspaceId, workspaceId),
          eq(graphInsight.personId, personId),
          eq(graphInsight.state, 'active')
        )
      )
      .orderBy(desc(graphInsight.score));
  }
}
