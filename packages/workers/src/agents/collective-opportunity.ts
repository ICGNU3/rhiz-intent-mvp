import { db } from '@rhiz/db';
import { person, claim, graphMetrics, collectiveOpportunity, workspace } from '@rhiz/db/schema';
import { eq, and, inArray, sql, desc } from 'drizzle-orm';
import { GraphMetricsEngine } from '@rhiz/core/graph/metrics';

export interface CollectiveOpportunity {
  title: string;
  description: string;
  type: 'investor_founder_match' | 'skill_exchange' | 'resource_sharing' | 'market_expansion';
  workspaces: string[];
  clusters: Array<{
    workspaceId: string;
    clusterId: string;
    size: number;
    description: string;
    tags: string[];
  }>;
  score: number;
}

export class CollectiveOpportunityAgent {
  /**
   * Scan for collective opportunities across all workspaces
   */
  static async scanOpportunities() {
    try {
      console.log('Starting collective opportunity scan...');

      // Get all workspaces
      const workspaces = await db
        .select()
        .from(workspace);

      const opportunities: CollectiveOpportunity[] = [];

      // For each workspace, compute metrics if needed
      for (const workspaceItem of workspaces) {
        await GraphMetricsEngine.computeAllMetrics(workspaceItem.id, workspaceItem.ownerId);
      }

      // Find investor-founder matches
      const investorFounderMatches = await this.findInvestorFounderMatches(workspaces);
      opportunities.push(...investorFounderMatches);

      // Find skill exchange opportunities
      const skillExchanges = await this.findSkillExchanges(workspaces);
      opportunities.push(...skillExchanges);

      // Find resource sharing opportunities
      const resourceSharing = await this.findResourceSharing(workspaces);
      opportunities.push(...resourceSharing);

      // Store opportunities in database
      await this.storeOpportunities(opportunities);

      console.log(`Found ${opportunities.length} collective opportunities`);
      return opportunities;
    } catch (error) {
      console.error('Failed to scan opportunities:', error);
      throw error;
    }
  }

  /**
   * Find investor-founder matching opportunities
   */
  private static async findInvestorFounderMatches(workspaces: any[]): Promise<CollectiveOpportunity[]> {
    const opportunities: CollectiveOpportunity[] = [];

    // Find workspaces with investor clusters
    const investorClusters = await this.findClustersByTag(workspaces, ['investor', 'vc', 'angel']);
    const founderClusters = await this.findClustersByTag(workspaces, ['founder', 'entrepreneur', 'startup']);

    // Match investors with founders
    for (const investorCluster of investorClusters) {
      for (const founderCluster of founderClusters) {
        if (investorCluster.workspaceId !== founderCluster.workspaceId) {
          // Check for complementary interests
          const hasMatchingInterests = this.hasMatchingInterests(
            investorCluster.tags,
            founderCluster.tags
          );

          if (hasMatchingInterests) {
            opportunities.push({
              title: 'Investor-Founder Match Opportunity',
              description: `Match ${investorCluster.size} investors from ${investorCluster.description} with ${founderCluster.size} founders from ${founderCluster.description}`,
              type: 'investor_founder_match',
              workspaces: [investorCluster.workspaceId, founderCluster.workspaceId],
              clusters: [investorCluster, founderCluster],
              score: Math.min(85, 60 + (investorCluster.size + founderCluster.size) * 2)
            });
          }
        }
      }
    }

    return opportunities;
  }

  /**
   * Find skill exchange opportunities
   */
  private static async findSkillExchanges(workspaces: any[]): Promise<CollectiveOpportunity[]> {
    const opportunities: CollectiveOpportunity[] = [];

    // Find clusters with different skill sets
    const engineeringClusters = await this.findClustersByTag(workspaces, ['engineer', 'developer', 'technical']);
    const businessClusters = await this.findClustersByTag(workspaces, ['business', 'sales', 'marketing']);
    const designClusters = await this.findClustersByTag(workspaces, ['design', 'ux', 'product']);

    // Create skill exchange opportunities
    const skillPairs = [
      { a: engineeringClusters, b: businessClusters, name: 'Technical-Business' },
      { a: engineeringClusters, b: designClusters, name: 'Technical-Design' },
      { a: businessClusters, b: designClusters, name: 'Business-Design' }
    ];

    for (const pair of skillPairs) {
      for (const clusterA of pair.a) {
        for (const clusterB of pair.b) {
          if (clusterA.workspaceId !== clusterB.workspaceId) {
            opportunities.push({
              title: `${pair.name} Skill Exchange`,
              description: `Facilitate skill sharing between ${clusterA.size} ${clusterA.description} and ${clusterB.size} ${clusterB.description}`,
              type: 'skill_exchange',
              workspaces: [clusterA.workspaceId, clusterB.workspaceId],
              clusters: [clusterA, clusterB],
              score: Math.min(75, 50 + (clusterA.size + clusterB.size) * 1.5)
            });
          }
        }
      }
    }

    return opportunities;
  }

  /**
   * Find resource sharing opportunities
   */
  private static async findResourceSharing(workspaces: any[]): Promise<CollectiveOpportunity[]> {
    const opportunities: CollectiveOpportunity[] = [];

    // Find clusters that might benefit from resource sharing
    const startupClusters = await this.findClustersByTag(workspaces, ['startup', 'early_stage']);
    const enterpriseClusters = await this.findClustersByTag(workspaces, ['enterprise', 'corporate']);

    for (const startupCluster of startupClusters) {
      for (const enterpriseCluster of enterpriseClusters) {
        if (startupCluster.workspaceId !== enterpriseCluster.workspaceId) {
          opportunities.push({
            title: 'Startup-Enterprise Resource Sharing',
            description: `Connect ${startupCluster.size} startups with ${enterpriseCluster.size} enterprise contacts for resource sharing`,
            type: 'resource_sharing',
            workspaces: [startupCluster.workspaceId, enterpriseCluster.workspaceId],
            clusters: [startupCluster, enterpriseCluster],
            score: Math.min(70, 45 + (startupCluster.size + enterpriseCluster.size) * 1.2)
          });
        }
      }
    }

    return opportunities;
  }

  /**
   * Find clusters by tag across workspaces
   */
  private static async findClustersByTag(workspaces: any[], tags: string[]): Promise<any[]> {
    const clusters: any[] = [];

    for (const workspaceItem of workspaces) {
      // Get community assignments for this workspace
      const communities = await db
        .select({
          personId: graphMetrics.personId,
          community: graphMetrics.value
        })
        .from(graphMetrics)
        .where(
          and(
            eq(graphMetrics.workspaceId, workspaceItem.id),
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

      // Check each community for relevant tags
      for (const [communityId, members] of communityGroups) {
        if (members.length >= 3) { // Only consider communities with 3+ members
          const communityTags = await this.getCommunityTags(workspaceItem.id, members);
          
          const hasRelevantTag = tags.some(tag => 
            communityTags.some(communityTag => 
              communityTag.toLowerCase().includes(tag.toLowerCase())
            )
          );

          if (hasRelevantTag) {
            // Get some member details for description
            const memberDetails = await db
              .select({ fullName: person.fullName })
              .from(person)
              .where(inArray(person.id, members.slice(0, 3)));

            const memberNames = memberDetails.map(p => p.fullName).join(', ');
            
            clusters.push({
              workspaceId: workspaceItem.id,
              clusterId: communityId,
              size: members.length,
              description: `${memberNames} and ${members.length - 3} others`,
              tags: communityTags
            });
          }
        }
      }
    }

    return clusters;
  }

  /**
   * Get tags for a community
   */
  private static async getCommunityTags(workspaceId: string, memberIds: string[]): Promise<string[]> {
    const claims = await db
      .select({ value: claim.value })
      .from(claim)
      .where(
        and(
          eq(claim.workspaceId, workspaceId),
          eq(claim.subjectType, 'person'),
          inArray(claim.subjectId, memberIds),
          eq(claim.key, 'tag')
        )
      );

    return claims.map(c => c.value);
  }

  /**
   * Check if two sets of tags have matching interests
   */
  private static hasMatchingInterests(tags1: string[], tags2: string[]): boolean {
    const interests = ['climate', 'fintech', 'health', 'ai', 'saas', 'ecommerce', 'mobile'];
    
    for (const interest of interests) {
      const hasInterest1 = tags1.some(tag => tag.toLowerCase().includes(interest));
      const hasInterest2 = tags2.some(tag => tag.toLowerCase().includes(interest));
      
      if (hasInterest1 && hasInterest2) {
        return true;
      }
    }

    return false;
  }

  /**
   * Store opportunities in database
   */
  private static async storeOpportunities(opportunities: CollectiveOpportunity[]) {
    // Delete existing opportunities
    await db.delete(collectiveOpportunity);

    if (opportunities.length > 0) {
      const opportunityValues = opportunities.map(opp => ({
        title: opp.title,
        description: opp.description,
        type: opp.type,
        workspaces: opp.workspaces,
        clusters: opp.clusters,
        score: opp.score,
        status: 'proposed',
        createdBy: 'system',
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
      }));

      await db.insert(collectiveOpportunity).values(opportunityValues);
    }
  }

  /**
   * Get opportunities for a specific workspace
   */
  static async getWorkspaceOpportunities(workspaceId: string) {
    return await db
      .select()
      .from(collectiveOpportunity)
      .where(
        sql`${collectiveOpportunity.workspaces} @> ${JSON.stringify([workspaceId])}`
      )
      .orderBy(desc(collectiveOpportunity.score));
  }

  /**
   * Get all opportunities
   */
  static async getAllOpportunities() {
    return await db
      .select()
      .from(collectiveOpportunity)
      .where(eq(collectiveOpportunity.status, 'proposed'))
      .orderBy(desc(collectiveOpportunity.score));
  }
}
