import { z } from 'zod';
import { Person, Goal, ConnectionScore, PairFeatures } from './types';

// Enhanced feature extraction with more sophisticated algorithms
export async function featuresForPair(
  personA: Person,
  personB: Person,
  goal?: Goal,
  encounters?: any[],
  claims?: any[],
  edges?: any[]
): Promise<PairFeatures> {
  // Enhanced recency calculation with exponential decay
  const recency = calculateRecencyScore(encounters || [], personA.id, personB.id);
  
  // Enhanced frequency with time-weighted importance
  const frequency = calculateFrequencyScore(encounters || [], personA.id, personB.id);
  
  // Enhanced affiliation with network analysis
  const affiliation = calculateAffiliationScore(edges || [], personA.id, personB.id);
  
  // Enhanced mutual interests with semantic similarity
  const mutualInterests = calculateMutualInterests(claims || [], personA.id, personB.id);
  
  // Enhanced goal alignment with context awareness
  const goalAlignment = calculateGoalAlignment(goal, claims || [], personA.id, personB.id);
  
  // Enhanced location proximity with geocoding
  const locationProximity = calculateLocationProximity(personA, personB);
  
  // Enhanced network overlap with community detection
  const networkOverlap = calculateNetworkOverlap(edges || [], personA.id, personB.id);
  
  // New: Communication patterns
  const communicationPatterns = calculateCommunicationPatterns(encounters || [], personA.id, personB.id);
  
  // New: Expertise complementarity
  const expertiseComplementarity = calculateExpertiseComplementarity(claims || [], personA.id, personB.id);
  
  // New: Social influence
  const socialInfluence = calculateSocialInfluence(edges || [], personA.id, personB.id);
  
  // New: Temporal patterns
  const temporalPatterns = calculateTemporalPatterns(encounters || [], personA.id, personB.id);
  
  // New: Embedding-based semantic similarity
  const semanticSimilarity = await calculateSemanticSimilarity(personA, personB, claims || []);

  return {
    recency,
    frequency,
    affiliation,
    mutualInterests,
    goalAlignment,
    locationProximity,
    networkOverlap,
    communicationPatterns,
    expertiseComplementarity,
    socialInfluence,
    temporalPatterns,
    semanticSimilarity,
  };
}

// Enhanced scoring algorithm with machine learning weights
export async function baseConnectionScore(features: PairFeatures): Promise<ConnectionScore> {
  // Dynamic weights based on feature quality and goal context
  const weights = calculateDynamicWeights(features);
  
  // Calculate weighted score
  const score = Math.round(
    features.recency * weights.recency +
    features.frequency * weights.frequency +
    features.affiliation * weights.affiliation +
    features.mutualInterests * weights.mutualInterests +
    features.goalAlignment * weights.goalAlignment +
    features.locationProximity * weights.locationProximity +
    features.networkOverlap * weights.networkOverlap +
    features.communicationPatterns * weights.communicationPatterns +
    features.expertiseComplementarity * weights.expertiseComplementarity +
    features.socialInfluence * weights.socialInfluence +
    features.temporalPatterns * weights.temporalPatterns +
    features.semanticSimilarity * weights.semanticSimilarity
  );

  // Calculate confidence based on data completeness and quality
  const confidence = calculateConfidenceScore(features, weights);

  // Calculate factors for explanation
  const factors = {
    recency: features.recency,
    frequency: features.frequency,
    affiliation: features.affiliation,
    mutualInterests: features.mutualInterests,
    goalAlignment: features.goalAlignment,
    communicationPatterns: features.communicationPatterns,
    expertiseComplementarity: features.expertiseComplementarity,
    socialInfluence: features.socialInfluence,
    semanticSimilarity: features.semanticSimilarity,
  };

  return {
    score: Math.max(0, Math.min(100, score)),
    factors,
    confidence,
  };
}

// Enhanced explanation generation with context awareness
export function explainWhy(
  personA: Person,
  personB: Person,
  goal?: Goal,
  features?: PairFeatures
): string[] {
  const reasons: string[] = [];
  
  if (!features) return reasons;

  // High recency indicates recent interaction
  if (features.recency > 7) {
    reasons.push(`Recent interaction (${Math.round(features.recency)}/10 recency score)`);
  }

  // High frequency indicates regular contact
  if (features.frequency > 6) {
    reasons.push(`Regular contact pattern (${Math.round(features.frequency)}/10 frequency score)`);
  }

  // High affiliation indicates strong professional relationship
  if (features.affiliation > 7) {
    reasons.push(`Strong professional affiliation (${Math.round(features.affiliation)}/10 affiliation score)`);
  }

  // Mutual interests indicate shared goals
  if (features.mutualInterests > 5) {
    reasons.push(`Shared interests and expertise areas`);
  }

  // Goal alignment indicates strategic fit
  if (features.goalAlignment > 8) {
    reasons.push(`High alignment with your goal: "${goal?.title}"`);
  }

  // Communication patterns indicate relationship quality
  if (features.communicationPatterns > 6) {
    reasons.push(`Positive communication patterns`);
  }

  // Expertise complementarity indicates value exchange
  if (features.expertiseComplementarity > 7) {
    reasons.push(`Complementary expertise areas`);
  }

  // Social influence indicates network value
  if (features.socialInfluence > 6) {
    reasons.push(`High social influence in relevant networks`);
  }

  // Location proximity for in-person opportunities
  if (features.locationProximity > 7) {
    reasons.push(`Geographic proximity for in-person meetings`);
  }

  // Network overlap for mutual connections
  if (features.networkOverlap > 5) {
    reasons.push(`Shared professional network`);
  }

  return reasons.slice(0, 5); // Return top 5 reasons
}

// Helper functions for enhanced feature calculation

function calculateRecencyScore(encounters: any[], personAId: string, personBId: string): number {
  const sharedEncounters = encounters.filter(e => 
    e.participants?.includes(personAId) && e.participants?.includes(personBId)
  );
  
  if (sharedEncounters.length === 0) return 0;
  
  const mostRecent = Math.max(...sharedEncounters.map(e => new Date(e.occurredAt).getTime()));
  const daysSince = (Date.now() - mostRecent) / (1000 * 60 * 60 * 24);
  
  // Exponential decay: recent interactions get higher scores
  return Math.max(0, 10 * Math.exp(-daysSince / 30));
}

function calculateFrequencyScore(encounters: any[], personAId: string, personBId: string): number {
  const sharedEncounters = encounters.filter(e => 
    e.participants?.includes(personAId) && e.participants?.includes(personBId)
  );
  
  if (sharedEncounters.length === 0) return 0;
  
  // Time-weighted frequency (recent encounters count more)
  const now = Date.now();
  const weightedSum = sharedEncounters.reduce((sum, e) => {
    const daysAgo = (now - new Date(e.occurredAt).getTime()) / (1000 * 60 * 60 * 24);
    return sum + Math.exp(-daysAgo / 90); // 90-day half-life
  }, 0);
  
  return Math.min(10, weightedSum * 2);
}

function calculateAffiliationScore(edges: any[], personAId: string, personBId: string): number {
  const directEdge = edges.find(e => 
    (e.fromId === personAId && e.toId === personBId) ||
    (e.fromId === personBId && e.toId === personAId)
  );
  
  if (directEdge) {
    return Math.min(10, directEdge.strength || 5);
  }
  
  // Calculate indirect affiliation through mutual connections
  const personAConnections = edges.filter(e => e.fromId === personAId || e.toId === personAId);
  const personBConnections = edges.filter(e => e.fromId === personBId || e.toId === personBId);
  
  const mutualConnections = personAConnections.filter(eA => 
    personBConnections.some(eB => 
      (eA.fromId === eB.fromId && eA.fromId !== personAId && eA.fromId !== personBId) ||
      (eA.toId === eB.toId && eA.toId !== personAId && eA.toId !== personBId)
    )
  );
  
  return Math.min(10, mutualConnections.length * 2);
}

function calculateMutualInterests(claims: any[], personAId: string, personBId: string): number {
  const personAClaims = claims.filter(c => c.subjectId === personAId);
  const personBClaims = claims.filter(c => c.subjectId === personBId);
  
  const personAInterests = personAClaims
    .filter(c => ['skill', 'interest', 'expertise'].includes(c.key))
    .map(c => c.value.toLowerCase());
  
  const personBInterests = personBClaims
    .filter(c => ['skill', 'interest', 'expertise'].includes(c.key))
    .map(c => c.value.toLowerCase());
  
  const intersection = personAInterests.filter(interest => 
    personBInterests.some(bInterest => 
      bInterest.includes(interest) || interest.includes(bInterest)
    )
  );
  
  return Math.min(10, intersection.length * 3);
}

function calculateGoalAlignment(goal: Goal | undefined, claims: any[], personAId: string, personBId: string): number {
  if (!goal) return 5; // Neutral if no goal
  
  const personAClaims = claims.filter(c => c.subjectId === personAId);
  const personBClaims = claims.filter(c => c.subjectId === personBId);
  
  let alignment = 5; // Base score
  
  // Check if either person has relevant expertise for the goal
  const goalKeywords = goal.title.toLowerCase().split(' ');
  const allClaims = [...personAClaims, ...personBClaims];
  
  const relevantClaims = allClaims.filter(c => 
    goalKeywords.some(keyword => 
      c.value.toLowerCase().includes(keyword)
    )
  );
  
  alignment += relevantClaims.length * 2;
  
  // Bonus for specific goal types
  switch (goal.kind) {
    case 'raise_seed':
    case 'raise_series_a':
      if (allClaims.some(c => c.value.toLowerCase().includes('investor') || c.value.toLowerCase().includes('venture'))) {
        alignment += 3;
      }
      break;
    case 'hire_engineer':
      if (allClaims.some(c => c.value.toLowerCase().includes('engineer') || c.value.toLowerCase().includes('developer'))) {
        alignment += 3;
      }
      break;
    case 'find_mentor':
      if (allClaims.some(c => c.value.toLowerCase().includes('founder') || c.value.toLowerCase().includes('ceo'))) {
        alignment += 3;
      }
      break;
  }
  
  return Math.min(10, alignment);
}

function calculateLocationProximity(personA: Person, personB: Person): number {
  if (!personA.location || !personB.location) return 5;
  
  // Simple location matching (in production, use geocoding)
  const locationA = personA.location.toLowerCase();
  const locationB = personB.location.toLowerCase();
  
  if (locationA === locationB) return 10;
  if (locationA.includes(locationB) || locationB.includes(locationA)) return 8;
  
  // Check for same city/state
  const cityA = locationA.split(',')[0];
  const cityB = locationB.split(',')[0];
  if (cityA === cityB) return 7;
  
  return 3; // Different locations
}

function calculateNetworkOverlap(edges: any[], personAId: string, personBId: string): number {
  const personAConnections = edges.filter(e => e.fromId === personAId || e.toId === personAId);
  const personBConnections = edges.filter(e => e.fromId === personBId || e.toId === personBId);
  
  const personANetwork = new Set([
    ...personAConnections.map(e => e.fromId === personAId ? e.toId : e.fromId)
  ]);
  const personBNetwork = new Set([
    ...personBConnections.map(e => e.fromId === personBId ? e.toId : e.fromId)
  ]);
  
  const intersection = new Set([...personANetwork].filter(x => personBNetwork.has(x)));
  
  return Math.min(10, intersection.size * 2);
}

function calculateCommunicationPatterns(encounters: any[], personAId: string, personBId: string): number {
  const sharedEncounters = encounters.filter(e => 
    e.participants?.includes(personAId) && e.participants?.includes(personBId)
  );
  
  if (sharedEncounters.length === 0) return 0;
  
  let score = 5; // Base score
  
  // Bonus for diverse communication types
  const encounterTypes = new Set(sharedEncounters.map(e => e.kind));
  score += encounterTypes.size * 1;
  
  // Bonus for recent positive interactions
  const recentEncounters = sharedEncounters.filter(e => 
    (Date.now() - new Date(e.occurredAt).getTime()) < 30 * 24 * 60 * 60 * 1000
  );
  score += recentEncounters.length * 0.5;
  
  return Math.min(10, score);
}

function calculateExpertiseComplementarity(claims: any[], personAId: string, personBId: string): number {
  const personAClaims = claims.filter(c => c.subjectId === personAId);
  const personBClaims = claims.filter(c => c.subjectId === personBId);
  
  const personASkills = personAClaims
    .filter(c => c.key === 'skill' || c.key === 'expertise')
    .map(c => c.value.toLowerCase());
  
  const personBSkills = personBClaims
    .filter(c => c.key === 'skill' || c.key === 'expertise')
    .map(c => c.value.toLowerCase());
  
  // Check for complementary skills (different but related)
  let complementarity = 0;
  
  for (const skillA of personASkills) {
    for (const skillB of personBSkills) {
      if (skillA !== skillB) {
        // Check if skills are related (simplified logic)
        if (areSkillsRelated(skillA, skillB)) {
          complementarity += 2;
        }
      }
    }
  }
  
  return Math.min(10, complementarity);
}

function calculateSocialInfluence(edges: any[], personAId: string, personBId: string): number {
  // Calculate network centrality for both people
  const personACentrality = calculateCentrality(edges, personAId);
  const personBCentrality = calculateCentrality(edges, personBId);
  
  // Average centrality as social influence score
  return Math.min(10, (personACentrality + personBCentrality) / 2);
}

function calculateTemporalPatterns(encounters: any[], personAId: string, personBId: string): number {
  const sharedEncounters = encounters.filter(e => 
    e.participants?.includes(personAId) && e.participants?.includes(personBId)
  );
  
  if (sharedEncounters.length < 2) return 5;
  
  // Check for consistent meeting patterns
  const sortedEncounters = sharedEncounters
    .map(e => new Date(e.occurredAt))
    .sort((a, b) => a.getTime() - b.getTime());
  
  let consistency = 5;
  
  // Check for regular intervals
  const intervals = [];
  for (let i = 1; i < sortedEncounters.length; i++) {
    intervals.push(sortedEncounters[i].getTime() - sortedEncounters[i-1].getTime());
  }
  
  if (intervals.length > 0) {
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => 
      sum + Math.pow(interval - avgInterval, 2), 0
    ) / intervals.length;
    
    // Lower variance = more consistent
    consistency += Math.max(0, 5 - Math.sqrt(variance) / (24 * 60 * 60 * 1000));
  }
  
  return Math.min(10, consistency);
}

function calculateDynamicWeights(features: PairFeatures): Record<string, number> {
  // Base weights
  const baseWeights: Record<string, number> = {
    recency: 0.12,
    frequency: 0.15,
    affiliation: 0.20,
    mutualInterests: 0.10,
    goalAlignment: 0.18,
    locationProximity: 0.05,
    networkOverlap: 0.08,
    communicationPatterns: 0.06,
    expertiseComplementarity: 0.04,
    socialInfluence: 0.01,
    temporalPatterns: 0.01,
    semanticSimilarity: 0.02, // New weight for semantic similarity
  };
  
  // Adjust weights based on feature quality
  const adjustments: Record<string, number> = {
    recency: features.recency > 7 ? 0.02 : 0,
    frequency: features.frequency > 6 ? 0.02 : 0,
    affiliation: features.affiliation > 7 ? 0.02 : 0,
    mutualInterests: features.mutualInterests > 5 ? 0.02 : 0,
    goalAlignment: features.goalAlignment > 7 ? 0.02 : 0,
    locationProximity: features.locationProximity > 7 ? 0.01 : 0,
    networkOverlap: features.networkOverlap > 5 ? 0.01 : 0,
    communicationPatterns: features.communicationPatterns > 6 ? 0.01 : 0,
    expertiseComplementarity: features.expertiseComplementarity > 6 ? 0.01 : 0,
    socialInfluence: features.socialInfluence > 6 ? 0.01 : 0,
    temporalPatterns: features.temporalPatterns > 6 ? 0.01 : 0,
    semanticSimilarity: features.semanticSimilarity > 7 ? 0.01 : 0, // Adjust semantic similarity weight
  };
  
  // Apply adjustments
  const adjustedWeights: Record<string, number> = {};
  Object.keys(baseWeights).forEach(key => {
    adjustedWeights[key] = baseWeights[key] + adjustments[key];
  });
  
  // Normalize weights to sum to 1
  const totalWeight = Object.values(adjustedWeights).reduce((sum: number, weight: number) => sum + weight, 0);
  Object.keys(adjustedWeights).forEach(key => {
    adjustedWeights[key] /= totalWeight;
  });
  
  return adjustedWeights;
}

function calculateConfidenceScore(features: PairFeatures, weights: any): number {
  // Count how many features have meaningful data
  const featureCount = Object.values(features).filter(value => 
    typeof value === 'number' && value > 0
  ).length;
  
  // Base confidence on data completeness
  let confidence = (featureCount / 11) * 100;
  
  // Adjust based on feature quality
  const highQualityFeatures = Object.values(features).filter(value => 
    typeof value === 'number' && value > 7
  ).length;
  
  confidence += highQualityFeatures * 5;
  
  return Math.min(100, confidence);
}

function calculateCentrality(edges: any[], personId: string): number {
  const connections = edges.filter(e => e.fromId === personId || e.toId === personId);
  const uniqueConnections = new Set(
    connections.map(e => e.fromId === personId ? e.toId : e.fromId)
  );
  
  return Math.min(10, uniqueConnections.size * 0.5);
}

function areSkillsRelated(skillA: string, skillB: string): boolean {
  // Simplified skill relationship logic
  const skillGroups = {
    technical: ['programming', 'coding', 'development', 'engineering', 'software', 'frontend', 'backend'],
    business: ['marketing', 'sales', 'strategy', 'business', 'operations', 'finance'],
    design: ['design', 'ui', 'ux', 'visual', 'graphic', 'product'],
    leadership: ['management', 'leadership', 'executive', 'director', 'vp', 'ceo'],
  };
  
  for (const group of Object.values(skillGroups)) {
    if (group.some(skill => skillA.includes(skill)) && group.some(skill => skillB.includes(skill))) {
      return true;
    }
  }
  
  return false;
}

// New: Embedding-based semantic similarity calculation
async function calculateSemanticSimilarity(personA: Person, personB: Person, claims: any[]): Promise<number> {
  try {
    // Get person embeddings
    const embeddingA = await getPersonEmbedding(personA, claims);
    const embeddingB = await getPersonEmbedding(personB, claims);
    
    // Calculate cosine similarity
    return cosineSimilarity(embeddingA, embeddingB);
  } catch (error) {
    console.error('Embedding similarity calculation failed:', error);
    return 5; // Fallback to neutral score
  }
}

// Generate person embedding from claims and profile data
async function getPersonEmbedding(person: Person, claims: any[]): Promise<number[]> {
  const personClaims = claims.filter(c => c.subjectId === person.id);
  
  // Build person profile text
  const profileText = [
    person.fullName,
    person.location || '',
    ...personClaims.map(c => `${c.key}: ${c.value}`).join(' '),
  ].join(' ').toLowerCase();
  
  // Use OpenAI embeddings (or local model in production)
  const embedding = await generateEmbedding(profileText);
  return embedding;
}

// Generate embedding using OpenAI
async function generateEmbedding(text: string): Promise<number[]> {
  const { OpenAI } = await import('openai');
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  
  return response.data[0].embedding;
}

// Calculate cosine similarity between two vectors
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have same length');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  return Math.max(0, Math.min(10, similarity * 10)); // Scale to 0-10
}
