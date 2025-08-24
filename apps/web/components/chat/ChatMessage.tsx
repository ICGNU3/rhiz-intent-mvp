import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Bot, Clock, Zap } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { ChatCards } from './ChatCards';

interface ChatMessageProps {
  message: ChatMessageType;
  onAction?: (action: string, data: Record<string, unknown>) => void;
}

export function ChatMessage({ message, onAction }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  const renderMetadata = () => {
    if (!message.metadata || isUser) return null;

    return (
      <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
        {typeof message.metadata.confidence === 'number' && (
          <div className="flex items-center space-x-1">
            <Zap className="h-3 w-3" />
            <span>{message.metadata.confidence}% confidence</span>
          </div>
        )}
        {typeof message.metadata.processingTime === 'number' && (
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{message.metadata.processingTime}ms</span>
          </div>
        )}
        {message.metadata.modelUsed && message.metadata.modelUsed !== 'unknown' && (
          <Badge variant="outline" className="text-xs">
            {message.metadata.modelUsed}
          </Badge>
        )}
      </div>
    );
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-2xl ${isUser ? 'order-2' : 'order-1'}`}>
        <div className={`flex items-start space-x-2 ${
          isUser ? 'flex-row-reverse space-x-reverse' : ''
        }`}>
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback>
              {isUser ? (
                <User className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
            </AvatarFallback>
          </Avatar>
          <div className={`rounded-lg px-4 py-2 ${
            isUser 
              ? 'bg-blue-500 text-white' 
              : 'bg-white border border-gray-200'
          }`}>
            <div className="text-sm whitespace-pre-wrap">
              {message.content}
            </div>
            
            {message.data && (
              <ChatCards data={message.data} onAction={onAction} />
            )}
            
            {renderMetadata()}
          </div>
        </div>
      </div>
    </div>
  );
}