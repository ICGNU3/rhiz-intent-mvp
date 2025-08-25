// Rhiz Theoretical Framework Implementation
// Progressive enhancement of existing relationship data

export interface DunbarLayer {
  layer: 1 | 2 | 3 | 4 | 5;
  name: 'intimate' | 'close' | 'meaningful' | 'stable' | 'extended';
  maxSize: number;
  description: string;
  interactionFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
}

export const DUNBAR_LAYERS: DunbarLayer[] = [
  {
    layer: 1,
    name: 'intimate',
    maxSize: 5,
    description: 'Intimate bonds - closest relationships',
    interactionFrequency: 'daily'
  },
  {
    layer: 2, 
    name: 'close',
    maxSize: 15,
    description: 'Close friends and family',
    interactionFrequency: 'weekly'
  },
  {
    layer: 3,
    name: 'meaningful', 
    maxSize: 50,
    description: 'Meaningful connections',
    interactionFrequency: 'monthly'
  },
  {
    layer: 4,
    name: 'stable',
    maxSize: 150, 
    description: 'Stable social network',
    interactionFrequency: 'quarterly'
  },
  {
    layer: 5,
    name: 'extended',
    maxSize: 1500,
    description: 'Extended network',
    interactionFrequency: 'annual'
  }
];

export interface RelationshipMetrics {
  strength: number; // 1-10 scale
  dunbarLayer: DunbarLayer;
  lastInteraction: Date;
  interactionFrequency: number; // interactions per month
  emotionalConnection: number; // 1-10 scale
  contextualRelevance: number; // 1-10 scale
  mutualEngagement: number; // 1-10 scale
}

export interface RhizomaticConnection {
  type: 'temporal' | 'contextual' | 'intellectual' | 'experiential' | 'emotional';
  strength: number;
  description: string;
  sharedAttributes: string[];
}

export interface CyberneticFeedback {
  relationshipHealth: number; // 1-10 scale
  maintenanceNeeded: boolean;
  suggestedActions: string[];
  energyLevel: 'high' | 'medium' | 'low';
  adaptiveRecommendations: string[];
}

// Enhanced relationship strength calculation using theoretical framework
export function calculateRelationshipMetrics(
  interactionCount: number,
  daysSinceLastInteraction: number,
  conversationQuality: number = 5,
  contextualRelevance: number = 5,
  mutualEngagement: number = 5
): RelationshipMetrics {
  // Base relationship strength calculation
  const recencyFactor = Math.max(0, 1 - daysSinceLastInteraction / 365);
  const frequencyFactor = Math.min(1, interactionCount / 12); // normalize to monthly
  const qualityFactor = conversationQuality / 10;
  
  const strength = Math.round(
    (recencyFactor * 0.3 + frequencyFactor * 0.4 + qualityFactor * 0.3) * 10
  );

  // Determine Dunbar layer based on strength and frequency
  const dunbarLayer = determineDunbarLayer(strength, interactionCount / 12);
  
  return {
    strength: Math.max(1, Math.min(10, strength)),
    dunbarLayer,
    lastInteraction: new Date(Date.now() - daysSinceLastInteraction * 24 * 60 * 60 * 1000),
    interactionFrequency: interactionCount / 12,
    emotionalConnection: conversationQuality,
    contextualRelevance,
    mutualEngagement
  };
}

function determineDunbarLayer(strength: number, monthlyFrequency: number): DunbarLayer {
  // Layer 1: High strength + very frequent contact
  if (strength >= 8 && monthlyFrequency >= 8) {
    return DUNBAR_LAYERS[0]; // intimate
  }
  
  // Layer 2: Good strength + frequent contact  
  if (strength >= 7 && monthlyFrequency >= 2) {
    return DUNBAR_LAYERS[1]; // close
  }
  
  // Layer 3: Moderate strength + regular contact
  if (strength >= 5 && monthlyFrequency >= 0.5) {
    return DUNBAR_LAYERS[2]; // meaningful
  }
  
  // Layer 4: Some strength + occasional contact
  if (strength >= 3 && monthlyFrequency >= 0.1) {
    return DUNBAR_LAYERS[3]; // stable
  }
  
  // Layer 5: Weak connection or infrequent contact
  return DUNBAR_LAYERS[4]; // extended
}

// Rhizomatic connection discovery
export function findRhizomaticConnections(
  person: any,
  allPeople: any[]
): RhizomaticConnection[] {
  const connections: RhizomaticConnection[] = [];
  
  allPeople.forEach(otherPerson => {
    if (person.id === otherPerson.id) return;
    
    // Temporal connections (same time periods)
    if (person.location === otherPerson.location) {
      connections.push({
        type: 'temporal',
        strength: 0.6,
        description: `Both in ${person.location}`,
        sharedAttributes: ['location']
      });
    }
    
    // Contextual connections (shared interests/expertise)
    const sharedInterests = findSharedAttributes(
      person.claims?.filter((c: any) => c.key === 'interests') || [],
      otherPerson.claims?.filter((c: any) => c.key === 'interests') || []
    );
    
    if (sharedInterests.length > 0) {
      connections.push({
        type: 'contextual', 
        strength: 0.7,
        description: `Shared interests: ${sharedInterests.join(', ')}`,
        sharedAttributes: sharedInterests
      });
    }
    
    // Intellectual connections (complementary expertise)
    const complementarySkills = findComplementaryAttributes(
      person.claims?.filter((c: any) => c.key === 'expertise') || [],
      otherPerson.claims?.filter((c: any) => c.key === 'expertise') || []
    );
    
    if (complementarySkills.length > 0) {
      connections.push({
        type: 'intellectual',
        strength: 0.8,
        description: `Complementary expertise: ${person.fullName} (${complementarySkills[0]}) + ${otherPerson.fullName} (${complementarySkills[1]})`,
        sharedAttributes: complementarySkills
      });
    }
  });
  
  return connections.sort((a, b) => b.strength - a.strength);
}

function findSharedAttributes(attrs1: any[], attrs2: any[]): string[] {
  const values1 = attrs1.flatMap(a => a.value.split(',').map((v: string) => v.trim().toLowerCase()));
  const values2 = attrs2.flatMap(a => a.value.split(',').map((v: string) => v.trim().toLowerCase()));
  
  return values1.filter(v => values2.includes(v));
}

function findComplementaryAttributes(attrs1: any[], attrs2: any[]): string[] {
  // Simple implementation - in reality this would use more sophisticated matching
  if (attrs1.length > 0 && attrs2.length > 0) {
    return [attrs1[0].value, attrs2[0].value];
  }
  return [];
}

// Cybernetic feedback system
export function generateCyberneticFeedback(
  metrics: RelationshipMetrics,
  recentInteractions: any[] = []
): CyberneticFeedback {
  const daysSinceLastInteraction = Math.floor(
    (Date.now() - metrics.lastInteraction.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Calculate relationship health
  const healthFactors = [
    metrics.strength / 10,
    Math.max(0, 1 - daysSinceLastInteraction / 30), // recency factor
    metrics.interactionFrequency / 2, // frequency factor (normalized)
    metrics.emotionalConnection / 10,
    metrics.mutualEngagement / 10
  ];
  
  const relationshipHealth = Math.round(
    healthFactors.reduce((sum, factor) => sum + factor, 0) / healthFactors.length * 10
  );
  
  // Determine if maintenance is needed
  const expectedFrequency = getExpectedFrequency(metrics.dunbarLayer);
  const maintenanceNeeded = daysSinceLastInteraction > expectedFrequency;
  
  // Generate suggestions
  const suggestedActions = generateSuggestions(metrics, daysSinceLastInteraction, maintenanceNeeded);
  
  // Determine energy level
  const energyLevel = relationshipHealth >= 7 ? 'high' : 
                      relationshipHealth >= 4 ? 'medium' : 'low';
  
  // Generate adaptive recommendations
  const adaptiveRecommendations = generateAdaptiveRecommendations(metrics, recentInteractions);
  
  return {
    relationshipHealth,
    maintenanceNeeded,
    suggestedActions,
    energyLevel,
    adaptiveRecommendations
  };
}

function getExpectedFrequency(layer: DunbarLayer): number {
  switch (layer.interactionFrequency) {
    case 'daily': return 1;
    case 'weekly': return 7; 
    case 'monthly': return 30;
    case 'quarterly': return 90;
    case 'annual': return 365;
    default: return 30;
  }
}

function generateSuggestions(
  metrics: RelationshipMetrics,
  daysSinceLastInteraction: number,
  maintenanceNeeded: boolean
): string[] {
  const suggestions = [];
  
  if (maintenanceNeeded) {
    suggestions.push(`Reach out to maintain your ${metrics.dunbarLayer.name} connection`);
  }
  
  if (metrics.emotionalConnection < 5) {
    suggestions.push('Consider a more personal conversation to deepen the relationship');
  }
  
  if (metrics.contextualRelevance < 5) {
    suggestions.push('Find current shared interests or projects to discuss');
  }
  
  if (daysSinceLastInteraction > 90) {
    suggestions.push('Share a life update or ask about recent changes');
  }
  
  return suggestions;
}

function generateAdaptiveRecommendations(
  metrics: RelationshipMetrics,
  recentInteractions: any[]
): string[] {
  const recommendations = [];
  
  // Adapt based on interaction patterns
  if (recentInteractions.length === 0) {
    recommendations.push('Start with a light, non-committal message');
  } else {
    recommendations.push('Continue the conversation thread from your last interaction');
  }
  
  // Adapt based on relationship layer
  switch (metrics.dunbarLayer.name) {
    case 'intimate':
      recommendations.push('Share something personal or ask for advice');
      break;
    case 'close':
      recommendations.push('Check in on their current projects or challenges');
      break;
    case 'meaningful':
      recommendations.push('Suggest a coffee/call to catch up properly');
      break;
    case 'stable':
      recommendations.push('Send an article or resource they might find interesting');
      break;
    case 'extended':
      recommendations.push('Congratulate on recent achievements or life updates');
      break;
  }
  
  return recommendations;
}