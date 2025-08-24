import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Mic } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ 
  value, 
  onChange, 
  onSubmit, 
  disabled = false,
  placeholder = "Ask about your network, goals, or connections..." 
}: ChatInputProps) {
  const [isRecording, setIsRecording] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSubmit(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceInput = async () => {
    if (!isRecording) {
      setIsRecording(true);
      // TODO: Implement actual voice recording
      // For now, simulate with timeout
      setTimeout(() => {
        onChange('Tell me about my recent network activity');
        setIsRecording(false);
      }, 2000);
    } else {
      setIsRecording(false);
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleVoiceInput}
          disabled={disabled}
          className={`flex-shrink-0 ${isRecording ? 'bg-red-500 text-white hover:bg-red-600' : ''}`}
          aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
        >
          <Mic className="h-4 w-4" />
        </Button>
        
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1"
          maxLength={1000}
        />
        
        <Button 
          type="submit" 
          disabled={disabled || !value.trim()}
          className="flex-shrink-0"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}