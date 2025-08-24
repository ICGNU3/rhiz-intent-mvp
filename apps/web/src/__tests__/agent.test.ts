import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Agent } from '@/lib/agent';

// Mock the AI SDK
vi.mock('ai', () => ({
  generateText: vi.fn(),
  generateObject: vi.fn(),
  streamText: vi.fn(),
}));

// Mock the models
vi.mock('@/lib/ai', () => ({
  models: {
    default: 'mock-model'
  },
  extractionSchemas: {}
}));

describe('Agent', () => {
  let agent: Agent;

  beforeEach(() => {
    agent = new Agent();
  });

  it('should process text and return structured response', async () => {
    const text = "I met Sarah Chen who is a CTO at Stripe. I want to raise a seed round.";
    const context = { userId: 'test-user' };

    const response = await agent.process(text, context);

    expect(response).toBeDefined();
    expect(response.text).toBeDefined();
    expect(response.metadata).toBeDefined();
    expect(response.metadata?.confidence).toBeGreaterThan(0);
    expect(response.metadata?.processingTime).toBeGreaterThan(0);
  });

  it('should handle streaming responses', async () => {
    const text = "Who should I introduce to John Doe?";
    const context = { userId: 'test-user' };
    const onChunk = vi.fn();

    const response = await agent.streamProcess(text, context, onChunk);

    expect(response).toBeDefined();
    expect(response.text).toBeDefined();
    expect(response.metadata).toBeDefined();
  });

  it('should extract people from text', async () => {
    const text = "I spoke with Alice Johnson and Bob Smith from Tech Corp";
    const context = { userId: 'test-user' };

    const response = await agent.process(text, context);

    expect(response.cards?.people).toBeDefined();
    if (response.cards?.people) {
      expect(response.cards.people.length).toBeGreaterThan(0);
    }
  });

  it('should identify goals in text', async () => {
    const text = "I need to hire a React engineer and raise a seed round";
    const context = { userId: 'test-user' };

    const response = await agent.process(text, context);

    expect(response.cards?.goals).toBeDefined();
    if (response.cards?.goals) {
      expect(response.cards.goals.length).toBeGreaterThan(0);
    }
  });

  it('should handle errors gracefully', async () => {
    const text = "Invalid input";
    const context = { userId: 'test-user' };

    // Mock a failure
    vi.mocked(require('ai').generateObject).mockRejectedValue(new Error('AI Error'));

    const response = await agent.process(text, context);

    expect(response.text).toContain('encountered an issue');
    expect(response.metadata?.confidence).toBe(0);
  });
});
