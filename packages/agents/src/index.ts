// Main exports for the Rhiz Agents package
// Four-agent system for relationship intelligence and automation

export { runAgent } from './orchestrator';
export type { Agent } from './orchestrator';

export { 
  prioritizeRelationships, 
  discoverConnections,
  type MapperInput 
} from './mapper';

export { 
  analyzeRelationshipHealth, 
  detectCapacityIssues, 
  identifyReactivationOpportunities,
  type SensemakerInput 
} from './sensemaker';

export { 
  planOutreach, 
  optimizeTiming, 
  sequenceInteractions,
  type StrategistInput 
} from './strategist';

export { 
  craftMessage, 
  adaptMessageTone, 
  createFollowUpSequence,
  type StoryweaverInput 
} from './storyweaver';

export {
  RhizActionSchema,
  type RhizAction,
  type RelationshipPrioritization,
  type GraphUpdate,
  type FeedbackDigest,
  type Reactivation,
  type OutreachPlan
} from './schema';

export { callOpenAI } from './runtime';