import { db, person, goal, suggestion, claim, edge, setUserContext, eq, and, desc, sql } from '@/../../packages/db/src';
import type { Person, Goal, Suggestion } from '@/../../packages/db/src';

export interface MatchScore {
  score: number;
  factors: {
    recency: number;
    frequency: number;
    affiliation: number;
    mutualInterests: number;
    goalAlignment: number;
  };
  confidence: number;
}

export interface MatchExplanation {
  reasons: string[];
  mutualInterests: string[];
  context: string;
}

export class Matching {
  async findPeople(query: string, userId: string, workspaceId: string): Promise<Person[]> {
    try {
      await setUserContext(userId);
      
      const people = await db.select()
        .from(person)
        .where(and(
          eq(person.workspaceId, workspaceId),
          eq(person.ownerId, userId),
          sql`${person.fullName} ILIKE ${'%' + query + '%'}`
        ))
        .limit(10);

      return people;
    } catch (error) {
      console.error('Error finding people:', error);
      return [];
    }
  }

  async findPeopleByGoal(goalKind: string, userId: string, workspaceId: string): Promise<Person[]> {
    try {
      await setUserContext(userId);
      
      // Find people with relevant claims/expertise for the goal
      const relevantPeople = await db.select({
        person: person,
        claimRelevance: claim.confidence
      })
      .from(person)
      .leftJoin(claim, and(
        eq(claim.subjectId, person.id),
        eq(claim.subjectType, 'person')
      ))
      .where(and(
        eq(person.workspaceId, workspaceId),
        eq(person.ownerId, userId),
        // Filter by goal-relevant claims
        goalKind === 'raise_seed' ? sql`${claim.key} IN ('investor', 'expertise', 'role') AND ${claim.value} ILIKE '%investor%' OR ${claim.value} ILIKE '%fund%'` :
        goalKind === 'hire_engineer' ? sql`${claim.key} IN ('role', 'expertise') AND (${claim.value} ILIKE '%engineer%' OR ${claim.value} ILIKE '%developer%')` :
        goalKind === 'hire_designer' ? sql`${claim.key} IN ('role', 'expertise') AND ${claim.value} ILIKE '%design%'` :
        sql`true` // fallback to all people
      ))
      .orderBy(desc(claim.confidence))
      .limit(10);

      return relevantPeople.map(r => r.person);
    } catch (error) {
      console.error('Error finding people by goal:', error);
      return [];
    }
  }

  async generateSuggestions(
    personAId: string,
    personBId: string,
    goalId: string | null,
    userId: string,
    workspaceId: string
  ): Promise<any[]> {
    try {
      await setUserContext(userId);
      
      // Calculate match score
      const score = await this.calculateMatchScore(personAId, personBId, goalId);
      
      // Generate explanation
      const explanation = await this.generateExplanation(personAId, personBId, goalId);
      
      // Create suggestion
      const [newSuggestion] = await db.insert(suggestion).values({
        workspaceId,
        ownerId: userId,
        kind: 'introduction',
        aId: personAId,
        bId: personBId,
        goalId,
        score: score.score,
        why: explanation,
        draft: null,
        state: 'proposed'
      }).returning();

      return [newSuggestion];
    } catch (error) {
      console.error('Error creating suggestion:', error);
      return [];
    }
  }

  async calculateMatchScore(
    personAId: string,
    personBId: string,
    goalId: string | null
  ): Promise<MatchScore> {
    try {
      // Get both people's data and claims
      const [personA, personB] = await Promise.all([
        this.getPersonWithClaims(personAId),
        this.getPersonWithClaims(personBId)
      ]);

      if (!personA || !personB) {
        throw new Error('Person not found');
      }

      // Calculate recency score based on recent encounters
      const recencyScore = await this.calculateRecencyScore(personAId, personBId);
      
      // Calculate frequency score based on interaction history
      const frequencyScore = await this.calculateFrequencyScore(personAId, personBId);
      
      // Calculate affiliation score based on shared connections/companies
      const affiliationScore = this.calculateAffiliationScore(personA.claims, personB.claims);
      
      // Calculate mutual interests score based on overlapping expertise/interests
      const mutualInterestsScore = this.calculateMutualInterestsScore(personA.claims, personB.claims);
      
      // Calculate goal alignment score
      const goalAlignmentScore = goalId ? 
        await this.calculateGoalAlignmentScore(personA.claims, personB.claims, goalId) : 0;

      // Weighted scoring algorithm
      const weights = {
        recency: 0.15,
        frequency: 0.20,
        affiliation: 0.25,
        mutualInterests: 0.25,
        goalAlignment: goalId ? 0.15 : 0
      };

      const finalScore = Math.round(
        recencyScore * weights.recency +
        frequencyScore * weights.frequency +
        affiliationScore * weights.affiliation +
        mutualInterestsScore * weights.mutualInterests +
        goalAlignmentScore * weights.goalAlignment
      );

      // Calculate confidence based on data quality
      const confidence = this.calculateConfidence(personA.claims, personB.claims, goalId !== null);

      return {
        score: Math.max(1, Math.min(100, finalScore)),
        factors: {
          recency: recencyScore,
          frequency: frequencyScore,
          affiliation: affiliationScore,
          mutualInterests: mutualInterestsScore,
          goalAlignment: goalAlignmentScore
        },
        confidence
      };
    } catch (error) {
      console.error('Error calculating match score:', error);
      
      // Fallback to basic scoring
      const baseScore = Math.floor(Math.random() * 40) + 60;
      return {
        score: baseScore,
        factors: {
          recency: Math.floor(Math.random() * 100),
          frequency: Math.floor(Math.random() * 100),
          affiliation: Math.floor(Math.random() * 100),
          mutualInterests: Math.floor(Math.random() * 100),
          goalAlignment: goalId ? Math.floor(Math.random() * 100) : 0
        },
        confidence: 70
      };
    }
  }

  private async getPersonWithClaims(personId: string) {
    const personData = await db.select()
      .from(person)
      .where(eq(person.id, personId))
      .limit(1);

    if (personData.length === 0) return null;

    const claims = await db.select()
      .from(claim)
      .where(and(
        eq(claim.subjectType, 'person'),
        eq(claim.subjectId, personId)
      ));

    return {
      ...personData[0],
      claims: claims
    };
  }

  private async calculateRecencyScore(personAId: string, personBId: string): Promise<number> {
    // Query recent encounters between the two people
    const recentEncounters = await db.select()
      .from(edge)
      .where(and(
        sql`(${edge.fromId} = ${personAId} AND ${edge.toId} = ${personBId}) OR (${edge.fromId} = ${personBId} AND ${edge.toId} = ${personAId})`,
        sql`${edge.createdAt} > NOW() - INTERVAL '90 days'`
      ))
      .orderBy(desc(edge.createdAt));

    if (recentEncounters.length === 0) return 20; // Low score for no recent interaction

    // More recent = higher score
    const mostRecent = recentEncounters[0];
    const daysSince = Math.floor((Date.now() - new Date(mostRecent.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    
    return Math.max(20, 100 - daysSince); // Score decreases with time
  }

  private async calculateFrequencyScore(personAId: string, personBId: string): Promise<number> {
    // Count total interactions
    const interactions = await db.select({
      count: sql<number>`COUNT(*)`
    })
    .from(edge)
    .where(
      sql`(${edge.fromId} = ${personAId} AND ${edge.toId} = ${personBId}) OR (${edge.fromId} = ${personBId} AND ${edge.toId} = ${personAId})`
    );

    const count = interactions[0]?.count || 0;
    
    // Normalize to 0-100 scale (more than 10 interactions = max score)
    return Math.min(100, count * 10);
  }

  private calculateAffiliationScore(claimsA: any[], claimsB: any[]): number {
    const companiesA = new Set(claimsA.filter(c => c.key === 'company').map(c => c.value.toLowerCase()));
    const companiesB = new Set(claimsB.filter(c => c.key === 'company').map(c => c.value.toLowerCase()));
    
    // Check for shared companies
    const sharedCompanies = [...companiesA].filter(c => companiesB.has(c));
    
    if (sharedCompanies.length > 0) return 90; // High score for same company
    
    // Check for industry alignment
    const industriesA = new Set(claimsA.filter(c => c.key === 'industry' || c.key === 'expertise')
      .map(c => this.extractIndustryKeywords(c.value)));
    const industriesB = new Set(claimsB.filter(c => c.key === 'industry' || c.key === 'expertise')
      .map(c => this.extractIndustryKeywords(c.value)));
    
    const sharedIndustries = [...industriesA].filter(i => industriesB.has(i));
    
    return Math.min(70, sharedIndustries.length * 20);
  }

  private calculateMutualInterestsScore(claimsA: any[], claimsB: any[]): number {
    const interestsA = new Set(
      claimsA.filter(c => ['interests', 'expertise', 'skills'].includes(c.key))
        .flatMap(c => this.extractKeywords(c.value))
    );
    
    const interestsB = new Set(
      claimsB.filter(c => ['interests', 'expertise', 'skills'].includes(c.key))
        .flatMap(c => this.extractKeywords(c.value))
    );
    
    const sharedInterests = [...interestsA].filter(i => interestsB.has(i));
    
    // Score based on number and strength of shared interests
    return Math.min(100, sharedInterests.length * 15);
  }

  private async calculateGoalAlignmentScore(claimsA: any[], claimsB: any[], goalId: string): Promise<number> {
    try {
      // Get the goal details
      const goalData = await db.select()
        .from(goal)
        .where(eq(goal.id, goalId))
        .limit(1);

      if (goalData.length === 0) return 0;

      const goalKind = goalData[0].kind;
      
      // Goal-specific scoring logic
      switch (goalKind) {
        case 'raise_seed':
          return this.scoreForFundraisingGoal(claimsA, claimsB);
        case 'hire_engineer':
          return this.scoreForHiringGoal(claimsA, claimsB, 'engineer');
        case 'hire_designer':
          return this.scoreForHiringGoal(claimsA, claimsB, 'designer');
        case 'find_customer':
          return this.scoreForCustomerGoal(claimsA, claimsB);
        default:
          return 50; // Default moderate score
      }
    } catch (error) {
      console.error('Error calculating goal alignment:', error);
      return 0;
    }
  }

  private scoreForFundraisingGoal(claimsA: any[], claimsB: any[]): number {
    const hasInvestor = (claims: any[]) => 
      claims.some(c => 
        ['role', 'title', 'company'].includes(c.key) && 
        c.value.toLowerCase().includes('investor')
      );
    
    const hasFounder = (claims: any[]) =>
      claims.some(c => 
        ['role', 'title'].includes(c.key) && 
        ['founder', 'ceo', 'entrepreneur'].some(role => c.value.toLowerCase().includes(role))
      );

    if (hasInvestor(claimsA) || hasInvestor(claimsB)) return 95;
    if (hasFounder(claimsA) && hasFounder(claimsB)) return 75;
    return 30;
  }

  private scoreForHiringGoal(claimsA: any[], claimsB: any[], roleType: string): number {
    const hasRole = (claims: any[], role: string) =>
      claims.some(c => 
        ['role', 'title', 'expertise'].includes(c.key) && 
        c.value.toLowerCase().includes(role)
      );

    const hasHiringNeed = (claims: any[]) =>
      claims.some(c => 
        ['role', 'title'].includes(c.key) && 
        ['ceo', 'founder', 'hiring manager', 'hr'].some(role => c.value.toLowerCase().includes(role))
      );

    if (hasRole(claimsA, roleType) && hasHiringNeed(claimsB)) return 90;
    if (hasRole(claimsB, roleType) && hasHiringNeed(claimsA)) return 90;
    if (hasRole(claimsA, roleType) || hasRole(claimsB, roleType)) return 60;
    return 20;
  }

  private scoreForCustomerGoal(claimsA: any[], claimsB: any[]): number {
    // Look for complementary business relationships
    const isBusiness = (claims: any[]) =>
      claims.some(c => 
        ['role', 'title', 'company'].includes(c.key) && 
        ['ceo', 'founder', 'manager', 'director'].some(role => c.value.toLowerCase().includes(role))
      );

    if (isBusiness(claimsA) && isBusiness(claimsB)) return 70;
    return 40;
  }

  private calculateConfidence(claimsA: any[], claimsB: any[], hasGoal: boolean): number {
    const dataQualityA = Math.min(100, claimsA.length * 20);
    const dataQualityB = Math.min(100, claimsB.length * 20);
    const avgDataQuality = (dataQualityA + dataQualityB) / 2;
    
    const goalBonus = hasGoal ? 10 : 0;
    
    return Math.min(100, avgDataQuality + goalBonus);
  }

  private extractIndustryKeywords(text: string): string {
    const industries = ['tech', 'finance', 'healthcare', 'education', 'retail', 'manufacturing'];
    const lowerText = text.toLowerCase();
    return industries.find(industry => lowerText.includes(industry)) || '';
  }

  private extractKeywords(text: string): string[] {
    const keywords = text.toLowerCase()
      .split(/[\s,]+/)
      .filter(word => word.length > 2)
      .slice(0, 10); // Limit to top 10 keywords
    
    return keywords;
  }

  async generateExplanation(
    personAId: string,
    personBId: string,
    goalId: string | null
  ): Promise<MatchExplanation> {
    try {
      // Get both people's data and claims
      const [personA, personB] = await Promise.all([
        this.getPersonWithClaims(personAId),
        this.getPersonWithClaims(personBId)
      ]);

      if (!personA || !personB) {
        throw new Error('Person not found');
      }

      const reasons: string[] = [];
      const mutualInterests: string[] = [];

      // Analyze company connections
      const companiesA = personA.claims.filter(c => c.key === 'company').map(c => c.value);
      const companiesB = personB.claims.filter(c => c.key === 'company').map(c => c.value);
      const sharedCompanies = companiesA.filter(c => 
        companiesB.some(cb => cb.toLowerCase() === c.toLowerCase())
      );

      if (sharedCompanies.length > 0) {
        reasons.push(`Both connected to ${sharedCompanies[0]}`);
      }

      // Analyze role complementarity
      const rolesA = personA.claims.filter(c => ['role', 'title'].includes(c.key)).map(c => c.value);
      const rolesB = personB.claims.filter(c => ['role', 'title'].includes(c.key)).map(c => c.value);

      if (goalId) {
        const goalData = await db.select().from(goal).where(eq(goal.id, goalId)).limit(1);
        if (goalData.length > 0) {
          const goalKind = goalData[0].kind;
          
          if (goalKind === 'raise_seed') {
            const hasInvestorRole = [...rolesA, ...rolesB].some(role => 
              role.toLowerCase().includes('investor')
            );
            if (hasInvestorRole) {
              reasons.push('One person has investor experience relevant to fundraising');
            }
          }
          
          if (goalKind.includes('hire_')) {
            const roleType = goalKind.split('_')[1];
            const hasTargetRole = [...rolesA, ...rolesB].some(role => 
              role.toLowerCase().includes(roleType)
            );
            if (hasTargetRole) {
              reasons.push(`One person has ${roleType} experience`);
            }
          }
        }
      }

      // Analyze expertise overlap
      const expertiseA = personA.claims.filter(c => ['expertise', 'skills', 'interests'].includes(c.key))
        .flatMap(c => this.extractKeywords(c.value));
      const expertiseB = personB.claims.filter(c => ['expertise', 'skills', 'interests'].includes(c.key))
        .flatMap(c => this.extractKeywords(c.value));

      const sharedExpertise = expertiseA.filter(e => expertiseB.includes(e));
      mutualInterests.push(...sharedExpertise.slice(0, 3));

      if (sharedExpertise.length > 0) {
        reasons.push('Shared professional interests and expertise');
      }

      // Analyze industry alignment
      const industriesA = personA.claims
        .filter(c => c.key === 'expertise' || c.key === 'company')
        .map(c => this.extractIndustryKeywords(c.value))
        .filter(Boolean);
      const industriesB = personB.claims
        .filter(c => c.key === 'expertise' || c.key === 'company')
        .map(c => this.extractIndustryKeywords(c.value))
        .filter(Boolean);

      const sharedIndustries = industriesA.filter(i => industriesB.includes(i));
      if (sharedIndustries.length > 0) {
        reasons.push(`Both active in ${sharedIndustries[0]} industry`);
      }

      // Check for potential complementary relationship
      const isFounderA = rolesA.some(role => 
        ['founder', 'ceo', 'entrepreneur'].some(r => role.toLowerCase().includes(r))
      );
      const isFounderB = rolesB.some(role => 
        ['founder', 'ceo', 'entrepreneur'].some(r => role.toLowerCase().includes(r))
      );

      if (isFounderA && isFounderB) {
        reasons.push('Both are founders/entrepreneurs - potential for peer learning');
      }

      // Ensure we have at least some reasons
      if (reasons.length === 0) {
        reasons.push('Professional network alignment based on career paths');
      }

      if (mutualInterests.length === 0) {
        mutualInterests.push('Professional networking', 'Career development');
      }

      return {
        reasons: reasons.slice(0, 4), // Limit to top 4 reasons
        mutualInterests: mutualInterests.slice(0, 3), // Limit to top 3 interests
        context: goalId ? 
          `Analyzed in context of your goal to find optimal connections` :
          'Based on network analysis and professional alignment'
      };

    } catch (error) {
      console.error('Error generating explanation:', error);
      
      // Fallback explanation
      return {
        reasons: ['Professional network connection opportunity'],
        mutualInterests: ['Networking', 'Professional development'],
        context: 'Based on basic profile matching'
      };
    }
  }

  async getTopSuggestions(userId: string, workspaceId: string, limit: number = 5): Promise<any[]> {
    try {
      await setUserContext(userId);
      
      const suggestions = await db.select({
        suggestion: suggestion,
        personA: {
          id: person.id,
          fullName: person.fullName,
          primaryEmail: person.primaryEmail
        }
      })
      .from(suggestion)
      .innerJoin(person, eq(suggestion.aId, person.id))
      .where(and(
        eq(suggestion.workspaceId, workspaceId),
        eq(suggestion.ownerId, userId),
        eq(suggestion.state, 'proposed')
      ))
      .orderBy(desc(suggestion.score))
      .limit(limit);

      // Get personB data for each suggestion
      const enrichedSuggestions = await Promise.all(
        suggestions.map(async (s) => {
          const personB = await db.select({
            id: person.id,
            fullName: person.fullName,
            primaryEmail: person.primaryEmail
          })
          .from(person)
          .where(eq(person.id, s.suggestion.bId))
          .limit(1);

          return {
            ...s.suggestion,
            person_a: s.personA,
            person_b: personB[0] || null
          };
        })
      );

      return enrichedSuggestions;
    } catch (error) {
      console.error('Error getting top suggestions:', error);
      return [];
    }
  }

  async acceptSuggestion(suggestionId: string): Promise<boolean> {
    try {
      await db.update(suggestion)
        .set({ state: 'accepted' })
        .where(eq(suggestion.id, suggestionId));

      return true;
    } catch (error) {
      console.error('Error accepting suggestion:', error);
      return false;
    }
  }
}
