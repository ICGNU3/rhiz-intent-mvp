import { Job } from 'bullmq';
import { N8nManagerAgent, N8nIntegrationRequest } from './n8n-manager';

export async function n8nHandler(job: Job<N8nIntegrationRequest>) {
  const n8nManager = new N8nManagerAgent();
  
  try {
    console.log(`Processing n8n job: ${job.id}`, job.data);
    
    const result = await n8nManager.handleRequest(job.data);
    
    console.log(`n8n job ${job.id} completed:`, result);
    
    return result;
  } catch (error) {
    console.error(`n8n job ${job.id} failed:`, error);
    throw error;
  }
}

// Cleanup handler for periodic cleanup jobs
export async function n8nCleanupHandler(job: Job<{ olderThanDays?: number }>) {
  const n8nManager = new N8nManagerAgent();
  
  try {
    console.log(`Processing n8n cleanup job: ${job.id}`);
    
    const result = await n8nManager.cleanupOldWorkflows(job.data.olderThanDays);
    
    console.log(`n8n cleanup job ${job.id} completed:`, result);
    
    return result;
  } catch (error) {
    console.error(`n8n cleanup job ${job.id} failed:`, error);
    throw error;
  }
}
