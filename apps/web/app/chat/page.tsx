'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, User, Bot, MessageSquare, Sparkles, Mic, Network, Target, Clock, Zap } from 'lucide-react';
import { useWorkspace } from '@/lib/useWorkspace';

interface Message {
  id: string;
  conversationId: string;
  senderType: 'user' | 'contact' | 'agent' | 'system';
  senderId: string | null;
  text: string;
  data: any;
  metadata?: {
    confidence?: number;
    processingTime?: number;
    modelUsed?: string;
  };
  createdAt: Date;
}

interface PersonCard {
  id: string;
  name: string;
  role?: string;
  company?: string;
  lastEncounter?: string;
  actions: Array<{
    label: string;
    action: string;
    data: any;
  }>;
}

interface SuggestionCard {
  id: string;
  score: number;
  why: string[];
  actions: Array<{
    label: string;
    action: string;
    data: any;
  }>;
}

interface GoalCard {
  id: string;
  kind: string;
  title: string;
  status: string;
}

export default function ChatPage() {
  const { workspaceId } = useWorkspace();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  // Custom chat state management
  const [messages, setMessages] = useState<Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    data?: any;
    metadata?: {
      confidence?: number;
      processingTime?: number;
      modelUsed?: string;
    };
  }>>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 Hi! I'm Rhiz AI, your relationship intelligence assistant.\n\nI can help you:\n• Analyze your professional network\n• Find valuable connections\n• Generate insights from conversations\n• Track goals and relationships\n\nWhat would you like to know?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    // Create assistant message placeholder for streaming
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage = {
      id: assistantMessageId,
      role: 'assistant' as const,
      content: '',
      data: undefined,
      metadata: undefined
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          stream: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.chunk) {
                accumulatedContent += data.chunk;
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: accumulatedContent }
                    : msg
                ));
              }
              
              if (data.done && data.response) {
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { 
                        ...msg, 
                        content: data.response.text,
                        data: data.response.cards,
                        metadata: data.response.metadata
                      }
                    : msg
                ));
              }
              
              if (data.error) {
                throw new Error(data.error);
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError);
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      // Remove the failed assistant message
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
    } finally {
      setIsLoading(false);
    }
  };

  // Quick action prompts
  const quickActions = [
    { icon: Network, label: 'Network Analysis', prompt: 'Analyze my professional network and identify opportunities' },
    { icon: Target, label: 'Goal Progress', prompt: 'Show me progress on my active goals' },
    { icon: MessageSquare, label: 'Recent Insights', prompt: 'What insights can you share from my recent interactions?' },
    { icon: Zap, label: 'Smart Suggestions', prompt: 'What introductions should I make this week?' },
  ];
  
  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => handleSubmit(new Event('submit') as any), 100);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleVoiceInput = async () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate voice recording (in production, implement actual recording)
      setTimeout(() => {
        setInput('Tell me about my recent network activity');
        setIsRecording(false);
      }, 2000);
    } else {
      setIsRecording(false);
    }
  };

  const handleAction = (action: string, data: any) => {
    console.log('Action:', action, data);
    // Handle different actions (open person, accept suggestion, etc.)
  };

  const renderCards = (data: any) => {
    if (!data) return null;

    return (
      <div className="space-y-4 mt-4">
        {data.people && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">People</h4>
            {data.people.map((person: PersonCard) => (
              <Card key={person.id} className="p-3">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{person.name}</div>
                        <div className="text-sm text-gray-500">
                          {person.role} {person.company && `at ${person.company}`}
                        </div>
                        {person.lastEncounter && (
                          <div className="text-xs text-gray-400">
                            Last: {person.lastEncounter}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      {person.actions.map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(action.action, action.data)}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {data.suggestions && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Suggestions</h4>
            {data.suggestions.map((suggestion: SuggestionCard) => (
              <Card key={suggestion.id} className="p-3">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{suggestion.score}% match</Badge>
                  </div>
                  <div className="mb-3">
                    <ul className="text-sm text-gray-600 space-y-1">
                      {suggestion.why.map((reason, index) => (
                        <li key={index}>• {reason}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex space-x-1">
                    {suggestion.actions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(action.action, action.data)}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {data.goals && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Goals</h4>
            {data.goals.map((goal: GoalCard) => (
              <Card key={goal.id} className="p-3">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{goal.title}</div>
                      <div className="text-sm text-gray-500">{goal.kind}</div>
                    </div>
                    <Badge variant={goal.status === 'active' ? 'default' : 'secondary'}>
                      {goal.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderMetadata = (metadata: any) => {
    if (!metadata) return null;

    return (
      <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
        {metadata.confidence && (
          <div className="flex items-center space-x-1">
            <Zap className="h-3 w-3" />
            <span>{metadata.confidence}% confidence</span>
          </div>
        )}
        {metadata.processingTime && (
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{metadata.processingTime}ms</span>
          </div>
        )}
        {metadata.modelUsed && metadata.modelUsed !== 'unknown' && (
          <Badge variant="outline" size="sm">{metadata.modelUsed}</Badge>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Conversations */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <div className="flex items-center space-x-2 mb-4">
          <MessageSquare className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Conversations</h2>
        </div>
        
        <div className="space-y-2">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="font-medium text-sm">Chat with Rhiz</div>
            <div className="text-xs text-gray-500">Active conversation</div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>R</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-lg font-semibold">Chat with Rhiz</h1>
              <p className="text-sm text-gray-500">Your AI networking assistant</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-2xl ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`flex items-start space-x-2 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`rounded-lg px-4 py-2 ${
                    message.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white border border-gray-200'
                  }`}>
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    {renderCards((message as any).data)}
                    {message.role === 'assistant' && renderMetadata((message as any).metadata)}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-2xl">
                <div className="flex items-start space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleVoiceInput}
              className={isRecording ? 'bg-red-500 text-white' : ''}
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about your network, goals, or connections..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Right Sidebar - Quick Actions & AI Status */}
      <div className="w-80 bg-white border-l border-gray-200 p-4">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              AI Powered
            </Badge>
          </div>
          <div className="space-y-2">
            {quickActions.map((action, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="w-full justify-start"
                size="sm"
                onClick={() => handleQuickAction(action.prompt)}
                disabled={isLoading}
              >
                <action.icon className="h-4 w-4 mr-2" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">AI Status</h4>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Model</span>
              <Badge variant="outline" size="sm">GPT-3.5</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Workspace</span>
              <Badge variant="outline" size="sm">Active</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Streaming</span>
              <Badge variant="outline" size="sm" className="text-green-600">Enabled</Badge>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  );
}
