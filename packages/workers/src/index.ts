import { startAgent, addJob, QUEUE_NAMES } from './queue';
import { intentRouterHandler } from './agents/intent-router';
import { captureHandler } from './agents/capture';
import { enrichmentHandler } from './agents/enrichment';
import { matchingHandler } from './agents/matching';
import { introWriterHandler } from './agents/intro-writer';
import { followUpHandler } from './agents/followup';
// New agent system imports
import { processAgentPrioritize } from './agents/agent-prioritizer';
import { processAgentSense } from './agents/agent-sensemaker';
import { processAgentOutreach } from './agents/agent-outreacher';
import { processSignalsCompute } from './agents/signals-computer';

// Export queue functions for use in other packages
export { addJob, QUEUE_NAMES };

// Agent roles
const ROLES = {
  ROUTER: 'router',
  CAPTURE: 'capture',
  ENRICHMENT: 'enrichment',
  MATCHING: 'matching',
  INTRO: 'intro',
  FOLLOWUP: 'followup',
  // New agent system roles
  AGENT_SYSTEM: 'agent-system',
  SIGNALS: 'signals',
} as const;

type Role = typeof ROLES[keyof typeof ROLES];

// Get role from environment
const role = (process.env.ROLE || 'router') as Role;

console.log(`🚀 Starting Rhiz worker with role: ${role}`);

// Start agents based on role
switch (role) {
  case ROLES.ROUTER:
    console.log('Starting IntentRouter agent...');
    startAgent('events.ingested', intentRouterHandler, {
      concurrency: 2,
      maxAttempts: 3,
    });
    break;
    
  case ROLES.CAPTURE:
    console.log('Starting CaptureAgent...');
    startAgent('ingest.calendar', captureHandler, {
      concurrency: 3,
      maxAttempts: 3,
    });
    startAgent('ingest.voice', captureHandler, {
      concurrency: 2,
      maxAttempts: 3,
    });
    break;
    
  case ROLES.ENRICHMENT:
    console.log('Starting EnrichmentAgent...');
    startAgent('enrich', enrichmentHandler, {
      concurrency: 2,
      maxAttempts: 3,
    });
    break;
    
  case ROLES.MATCHING:
    console.log('Starting MatchingAgent...');
    startAgent('goals.updated', matchingHandler, {
      concurrency: 1,
      maxAttempts: 3,
    });
    break;
    
  case ROLES.INTRO:
    console.log('Starting IntroWriter agent...');
    startAgent('intro', introWriterHandler, {
      concurrency: 1,
      maxAttempts: 3,
    });
    break;
    
  case ROLES.FOLLOWUP:
    console.log('Starting FollowUp agent...');
    startAgent('followup', followUpHandler, {
      concurrency: 1,
      maxAttempts: 3,
    });
    break;
    
  case ROLES.AGENT_SYSTEM:
    console.log('Starting Agent System workers...');
    startAgent('agent.prioritize', processAgentPrioritize, {
      concurrency: 2,
      maxAttempts: 3,
    });
    startAgent('agent.sense', processAgentSense, {
      concurrency: 2,
      maxAttempts: 3,
    });
    startAgent('agent.outreach', processAgentOutreach, {
      concurrency: 1,
      maxAttempts: 3,
    });
    break;
    
  case ROLES.SIGNALS:
    console.log('Starting Signals Computer worker...');
    startAgent('signals.compute', processSignalsCompute, {
      concurrency: 1,
      maxAttempts: 3,
    });
    break;
    
  default:
    console.error(`Unknown role: ${role}`);
    process.exit(1);
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

// Keep the process alive
console.log(`✅ [${role.toUpperCase()}] agent online`);
console.log('Press Ctrl+C to stop');
