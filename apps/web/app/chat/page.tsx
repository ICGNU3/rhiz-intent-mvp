'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Sparkles, Network, Target, Zap } from 'lucide-react';
import { useWorkspace } from '@/lib/useWorkspace';
import { useChat } from '@/hooks/useChat';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { LoadingIndicator } from '@/components/chat/LoadingIndicator';
import { QuickAction } from '@/types/chat';

// Quick actions for the sidebar
const QUICK_ACTIONS: QuickAction[] = [
  { 
    icon: Network, 
    label: 'Network Analysis', 
    prompt: 'Analyze my professional network and identify opportunities' 
  },
  { 
    icon: Target, 
    label: 'Goal Progress', 
    prompt: 'Show me progress on my active goals' 
  },
  { 
    icon: MessageSquare, 
    label: 'Recent Insights', 
    prompt: 'What insights can you share from my recent interactions?' 
  },
  { 
    icon: Zap, 
    label: 'Smart Suggestions', 
    prompt: 'What introductions should I make this week?' 
  },
];

export default function ChatPage() {
  const { workspaceId } = useWorkspace();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    input,
    isLoading,
    error,
    setInput,
    sendMessage,
    clearError,
  } = useChat({
    workspaceId,
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle quick action clicks
  const handleQuickAction = useCallback((prompt: string) => {
    setInput(prompt);
    // Small delay to ensure input is set before sending
    setTimeout(() => sendMessage(prompt), 50);
  }, [setInput, sendMessage]);

  // Handle card actions
  const handleAction = useCallback((action: string, data: Record<string, unknown>) => {
    console.log('Action:', action, data);
    // TODO: Implement specific action handlers
    // e.g., open person profile, accept suggestion, etc.
  }, []);

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
            <ChatMessage
              key={message.id}
              message={message}
              onAction={handleAction}
            />
          ))}
          
          {isLoading && <LoadingIndicator />}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={sendMessage}
          disabled={isLoading}
        />
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
            {QUICK_ACTIONS.map((action, idx) => (
              <Button
                key={`${action.label}-${idx}`}
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
              <Badge variant="outline" className="text-xs">GPT-3.5</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Workspace</span>
              <Badge variant="outline" className="text-xs">Active</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Streaming</span>
              <Badge variant="outline" className="text-xs text-green-600">Enabled</Badge>
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
