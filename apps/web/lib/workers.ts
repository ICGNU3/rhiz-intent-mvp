// Local queue implementation for web app
import { Queue } from 'bullmq';
import Redis from 'ioredis';

// Redis connection
const redis = new Redis(process.env.REDIS_URL!);

// Queue names
export const QUEUE_NAMES = {
  EVENTS_INGESTED: 'events.ingested',
  INGEST_CALENDAR: 'ingest.calendar',
  INGEST_VOICE: 'ingest.voice',
  ENRICH: 'enrich',
  MATCH: 'match',
  INTRO: 'intro',
  FOLLOWUP: 'followup',
  GOALS_UPDATED: 'goals.updated',
  SUGGESTIONS_PROPOSED: 'suggestions.proposed',
  N8N_CLEANUP: 'n8n.cleanup',
  EVENTS: 'events',
  // Agent system queues
  AGENT_PRIORITIZE: 'agent.prioritize',
  AGENT_SENSE: 'agent.sense',
  AGENT_OUTREACH: 'agent.outreach',
  SIGNALS_COMPUTE: 'signals.compute',
} as const;

// Create queues
const queues = {
  eventsIngested: new Queue(QUEUE_NAMES.EVENTS_INGESTED, { connection: redis }),
  ingestCalendar: new Queue(QUEUE_NAMES.INGEST_CALENDAR, { connection: redis }),
  ingestVoice: new Queue(QUEUE_NAMES.INGEST_VOICE, { connection: redis }),
  enrich: new Queue(QUEUE_NAMES.ENRICH, { connection: redis }),
  match: new Queue(QUEUE_NAMES.MATCH, { connection: redis }),
  intro: new Queue(QUEUE_NAMES.INTRO, { connection: redis }),
  followup: new Queue(QUEUE_NAMES.FOLLOWUP, { connection: redis }),
  goalsUpdated: new Queue(QUEUE_NAMES.GOALS_UPDATED, { connection: redis }),
  suggestionsProposed: new Queue(QUEUE_NAMES.SUGGESTIONS_PROPOSED, { connection: redis }),
  n8nCleanup: new Queue(QUEUE_NAMES.N8N_CLEANUP, { connection: redis }),
  events: new Queue(QUEUE_NAMES.EVENTS, { connection: redis }),
  // Agent system queues
  agentPrioritize: new Queue(QUEUE_NAMES.AGENT_PRIORITIZE, { connection: redis }),
  agentSense: new Queue(QUEUE_NAMES.AGENT_SENSE, { connection: redis }),
  agentOutreach: new Queue(QUEUE_NAMES.AGENT_OUTREACH, { connection: redis }),
  signalsCompute: new Queue(QUEUE_NAMES.SIGNALS_COMPUTE, { connection: redis }),
};

// Helper function to add job to queue
export async function addJob<T = any>(
  queueName: string,
  data: T,
  options: {
    delay?: number;
    priority?: number;
    attempts?: number;
  } = {}
) {
  const queue = queues[queueName as keyof typeof queues];
  if (!queue) {
    throw new Error(`Queue ${queueName} not found`);
  }

  return await queue.add(
    queueName,
    data,
    {
      delay: options.delay,
      priority: options.priority,
      attempts: options.attempts,
    }
  );
}
