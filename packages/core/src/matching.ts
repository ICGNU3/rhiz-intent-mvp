import { ConnectionScore, Suggestion } from './types';

export interface Person {
  id: string;
  fullName: string;
  primaryEmail?: string;
  location?: string;
  claims: Array<{
    key: string;
    value: string;
    confidence: number;
    source: string;
  }>;
  encounters: Array<{
    occurredAt: Date;
    kind: string;
    summary?: string;
  }>;
}

export interface Goal {
  id: string;
  kind: string;
  title: string;
  details?: string;
}

export interface PairFeatures {
  recency: number; // Days since last interaction
  frequency: number; // Interactions per month
  affiliation: number; // Company/school overlap
  mutualInterests: number; // Shared interests/topics
  goalAlignment: number; // How well they match the goal
  locationProximity: number; // Geographic closeness
  networkOverlap: number; // Common connections
}

export function featuresForPair(
  personA: Person,
  personB: Person,
  goal?: Goal
): PairFeatures {
  const now = new Date();
  
  // Calculate recency (days since last interaction)
  const lastInteraction = personA.encounters
    .filter(e => e.summary?.toLowerCase().includes(personB.fullName.toLowerCase()))
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())[0];
  
  const recency = lastInteraction 
    ? Math.max(0, (now.getTime() - lastInteraction.occurredAt.getTime()) / (1000 * 60 * 60 * 24))
    : 365; // Default to 1 year if no interaction

  // Calculate frequency (interactions per month)
  const interactions = personA.encounters.filter(e => 
    e.summary?.toLowerCase().includes(personB.fullName.toLowerCase())
  );
  const frequency = interactions.length / 12; // Assuming 12 months of data

  // Calculate affiliation overlap
  const aCompanies = personA.claims
    .filter(c => c.key === 'company')
    .map(c => c.value.toLowerCase());
  const bCompanies = personB.claims
    .filter(c => c.key === 'company')
    .map(c => c.value.toLowerCase());
  const affiliation = aCompanies.some(company => bCompanies.includes(company)) ? 100 : 0;

  // Calculate mutual interests
  const aInterests = personA.claims
    .filter(c => ['expertise', 'skills', 'interests'].includes(c.key))
    .map(c => c.value.toLowerCase());
  const bInterests = personB.claims
    .filter(c => ['expertise', 'skills', 'interests'].includes(c.key))
    .map(c => c.value.toLowerCase());
  const mutualInterests = aInterests.length > 0 && bInterests.length > 0
    ? (aInterests.filter(interest => bInterests.includes(interest)).length / Math.max(aInterests.length, bInterests.length)) * 100
    : 0;

  // Calculate goal alignment
  let goalAlignment = 50; // Default neutral alignment
  if (goal) {
    const aTitle = personA.claims.find(c => c.key === 'title')?.value.toLowerCase() || '';
    const bTitle = personB.claims.find(c => c.key === 'title')?.value.toLowerCase() || '';
    
    switch (goal.kind) {
      case 'raise_seed':
      case 'raise_series_a':
        if (bTitle.includes('partner') || bTitle.includes('investor') || bTitle.includes('vc')) {
          goalAlignment = 90;
        } else if (bTitle.includes('founder') || bTitle.includes('ceo')) {
          goalAlignment = 70; // Other founders might have investor connections
        }
        break;
      case 'hire_engineer':
        if (bTitle.includes('engineer') || bTitle.includes('developer') || bTitle.includes('cto')) {
          goalAlignment = 85;
        }
        break;
      case 'hire_designer':
        if (bTitle.includes('designer') || bTitle.includes('ux') || bTitle.includes('ui')) {
          goalAlignment = 85;
        }
        break;
      case 'hire_sales':
        if (bTitle.includes('sales') || bTitle.includes('revenue') || bTitle.includes('business development')) {
          goalAlignment = 85;
        }
        break;
      case 'find_mentor':
        if (bTitle.includes('founder') || bTitle.includes('ceo') || bTitle.includes('partner')) {
          goalAlignment = 80;
        }
        break;
    }
  }

  // Calculate location proximity
  const aLocation = personA.location?.toLowerCase() || '';
  const bLocation = personB.location?.toLowerCase() || '';
  const locationProximity = aLocation && bLocation && aLocation === bLocation ? 100 : 0;

  // Calculate network overlap (simplified)
  const networkOverlap = affiliation > 0 ? 60 : 0;

  return {
    recency: Math.max(0, 100 - (recency / 365) * 100), // Convert to 0-100 scale
    frequency: Math.min(100, frequency * 10), // Scale frequency
    affiliation,
    mutualInterests,
    goalAlignment,
    locationProximity,
    networkOverlap,
  };
}

export function baseConnectionScore(features: PairFeatures): ConnectionScore {
  // Weighted scoring algorithm
  const weights = {
    recency: 0.15,
    frequency: 0.20,
    affiliation: 0.25,
    mutualInterests: 0.15,
    goalAlignment: 0.20,
    locationProximity: 0.05,
  };

  const score = Math.round(
    features.recency * weights.recency +
    features.frequency * weights.frequency +
    features.affiliation * weights.affiliation +
    features.mutualInterests * weights.mutualInterests +
    features.goalAlignment * weights.goalAlignment +
    features.locationProximity * weights.locationProximity
  );

  // Calculate confidence based on data completeness
  const dataPoints = [
    features.recency > 0,
    features.frequency > 0,
    features.affiliation > 0,
    features.mutualInterests > 0,
    features.goalAlignment > 0,
  ].filter(Boolean).length;

  const confidence = Math.round((dataPoints / 5) * 100);

  return {
    score: Math.max(0, Math.min(100, score)),
    factors: {
      recency: features.recency,
      frequency: features.frequency,
      affiliation: features.affiliation,
      mutualInterests: features.mutualInterests,
      goalAlignment: features.goalAlignment,
    },
    confidence,
  };
}

export function explainWhy(
  personA: Person,
  personB: Person,
  goal?: Goal,
  features?: PairFeatures
): string[] {
  const reasons: string[] = [];
  
  if (!features) {
    features = featuresForPair(personA, personB, goal);
  }

  // Add reasons based on features
  if (features.affiliation > 0) {
    const aCompany = personA.claims.find(c => c.key === 'company')?.value;
    const bCompany = personB.claims.find(c => c.key === 'company')?.value;
    if (aCompany && bCompany) {
      reasons.push(`Both work at ${aCompany}, creating natural opportunities for collaboration`);
    }
  }

  if (features.mutualInterests > 50) {
    const aInterests = personA.claims
      .filter(c => ['expertise', 'skills', 'interests'].includes(c.key))
      .map(c => c.value);
    const bInterests = personB.claims
      .filter(c => ['expertise', 'skills', 'interests'].includes(c.key))
      .map(c => c.value);
    const shared = aInterests.filter(interest => bInterests.includes(interest));
    if (shared.length > 0) {
      reasons.push(`Shared expertise in ${shared.slice(0, 2).join(' and ')}`);
    }
  }

  if (features.goalAlignment > 70) {
    const aTitle = personA.claims.find(c => c.key === 'title')?.value;
    const bTitle = personB.claims.find(c => c.key === 'title')?.value;
    if (goal) {
      switch (goal.kind) {
        case 'raise_seed':
        case 'raise_series_a':
          if (bTitle?.toLowerCase().includes('partner') || bTitle?.toLowerCase().includes('investor')) {
            reasons.push(`${personB.fullName} is an investor who could help with ${goal.kind.replace('_', ' ')}`);
          }
          break;
        case 'hire_engineer':
          if (bTitle?.toLowerCase().includes('engineer') || bTitle?.toLowerCase().includes('developer')) {
            reasons.push(`${personB.fullName} has engineering experience that could help with hiring`);
          }
          break;
        case 'find_mentor':
          if (bTitle?.toLowerCase().includes('founder') || bTitle?.toLowerCase().includes('ceo')) {
            reasons.push(`${personB.fullName} has leadership experience that could provide valuable mentorship`);
          }
          break;
      }
    }
  }

  if (features.locationProximity > 0) {
    reasons.push(`Both located in ${personA.location}, making in-person meetings convenient`);
  }

  // Add default reason if none found
  if (reasons.length === 0) {
    reasons.push(`Both are in the tech ecosystem and could benefit from connecting`);
  }

  // Return top 3 reasons
  return reasons.slice(0, 3);
}
