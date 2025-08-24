// Test script for Interview Agent
import { InterviewAgent } from './lib/interview-agent.js';

async function testInterview() {
  console.log('🎤 Testing Interview Agent...\n');
  
  const agent = new InterviewAgent();
  
  // Simulate a conversation
  const inputs = [
    "I just had lunch with Sarah Chen from TechCorp",
    "She's the VP of Engineering there",
    "We worked together at my previous startup",
    "I'm trying to raise a seed round for my new AI company",
    "Sarah mentioned she knows some angel investors",
    "She also said her CTO Mike Johnson might be interested",
    "We're looking to raise about 2 million",
    "Yeah, I should follow up with both of them next week"
  ];
  
  console.log('Starting interview simulation...\n');
  console.log('-----------------------------------\n');
  
  for (const input of inputs) {
    console.log(`👤 User: "${input}"`);
    
    const response = await agent.processUserInput(input);
    
    console.log(`🤖 Agent: "${response.response}"`);
    if (response.nextQuestion) {
      console.log(`❓ Next: "${response.nextQuestion}"`);
    }
    
    // Show extracted entities
    if (response.entities.people.size > 0) {
      console.log(`\n📊 People detected: ${Array.from(response.entities.people.keys()).join(', ')}`);
    }
    if (response.entities.goals.length > 0) {
      console.log(`🎯 Goals detected: ${response.entities.goals.map(g => g.description).join(', ')}`);
    }
    
    console.log('-----------------------------------\n');
    
    if (response.shouldEndInterview) {
      console.log('✅ Interview complete!\n');
      break;
    }
    
    // Small delay to simulate conversation
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Get final summary
  const summary = await agent.getSummary();
  console.log('📋 INTERVIEW SUMMARY:\n');
  console.log(summary);
  
  // Show what would be sent to n8n
  const context = agent.getContext();
  console.log('\n🔄 Data ready for n8n enrichment:');
  console.log(`- People: ${context.entities.people.size}`);
  console.log(`- Organizations: ${context.entities.organizations.size}`);
  console.log(`- Goals: ${context.entities.goals.length}`);
  console.log(`- Transcript lines: ${context.transcript.length}`);
  
  console.log('\n✨ Interview Agent test complete!');
}

// Run the test
testInterview().catch(console.error);