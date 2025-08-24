// Simple test script for Agent class
const { Agent } = require('./lib/agent.ts');

async function testAgent() {
  console.log('🧪 Testing Agent class...\n');
  
  const agent = new Agent();
  
  // Test 1: Basic text processing
  console.log('Test 1: Basic text processing');
  try {
    const text = "I met Sarah Chen who is a CTO at Stripe. I want to raise a seed round.";
    const context = { userId: 'test-user' };
    
    const response = await agent.process(text, context);
    
    console.log('✅ Response received:', {
      text: response.text.substring(0, 100) + '...',
      hasCards: !!response.cards,
      confidence: response.metadata?.confidence,
      processingTime: response.metadata?.processingTime
    });
  } catch (error) {
    console.log('❌ Test 1 failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: People extraction
  console.log('Test 2: People extraction');
  try {
    const text = "I spoke with Alice Johnson and Bob Smith from Tech Corp";
    const context = { userId: 'test-user' };
    
    const response = await agent.process(text, context);
    
    console.log('✅ People extracted:', {
      peopleCount: response.cards?.people?.length || 0,
      people: response.cards?.people?.map(p => p.name) || []
    });
  } catch (error) {
    console.log('❌ Test 2 failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: Goal identification
  console.log('Test 3: Goal identification');
  try {
    const text = "I need to hire a React engineer and raise a seed round";
    const context = { userId: 'test-user' };
    
    const response = await agent.process(text, context);
    
    console.log('✅ Goals identified:', {
      goalsCount: response.cards?.goals?.length || 0,
      goals: response.cards?.goals?.map(g => g.title) || []
    });
  } catch (error) {
    console.log('❌ Test 3 failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 4: Streaming
  console.log('Test 4: Streaming response');
  try {
    const text = "Who should I introduce to John Doe?";
    const context = { userId: 'test-user' };
    let chunks = [];
    
    const response = await agent.streamProcess(text, context, (chunk) => {
      chunks.push(chunk);
      process.stdout.write(chunk);
    });
    
    console.log('\n✅ Streaming completed:', {
      chunksReceived: chunks.length,
      finalText: response.text.substring(0, 100) + '...'
    });
  } catch (error) {
    console.log('❌ Test 4 failed:', error.message);
  }
  
  console.log('\n🎉 Agent testing completed!');
}

// Run the test
testAgent().catch(console.error);
