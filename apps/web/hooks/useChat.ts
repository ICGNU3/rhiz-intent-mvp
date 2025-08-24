import { useState, useCallback, useRef } from 'react';
import { 
  ChatMessage, 
  ChatApiRequest, 
  StreamResponse, 
  ChatError, 
  StreamError 
} from '@/types/chat';

interface UseChatOptions {
  initialMessages?: ChatMessage[];
  workspaceId?: string;
  onError?: (error: Error) => void;
  onStreamChunk?: (chunk: string) => void;
}

interface UseChatReturn {
  messages: ChatMessage[];
  input: string;
  isLoading: boolean;
  error: string | null;
  setInput: (input: string) => void;
  sendMessage: (content: string) => Promise<void>;
  clearError: () => void;
  clearMessages: () => void;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: `👋 Hi! I'm Rhiz AI, your relationship intelligence assistant.\n\nI can help you:\n• Analyze your professional network\n• Find valuable connections\n• Generate insights from conversations\n• Track goals and relationships\n\nWhat would you like to know?`,
  timestamp: new Date(),
};

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const {
    initialMessages = [INITIAL_MESSAGE],
    workspaceId,
    onError,
    onStreamChunk,
  } = options;

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const generateMessageId = useCallback(() => {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const updateMessage = useCallback((id: string, updates: Partial<ChatMessage>) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, ...updates } : msg
    ));
  }, []);

  const removeMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  const handleStreamResponse = useCallback(async (
    response: Response,
    assistantMessageId: string
  ) => {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new StreamError('No response body available');
    }

    const decoder = new TextDecoder();
    let accumulatedContent = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: StreamResponse = JSON.parse(line.slice(6));
              
              if (data.error) {
                throw new ChatError(data.error);
              }
              
              if (data.chunk) {
                accumulatedContent += data.chunk;
                updateMessage(assistantMessageId, { content: accumulatedContent });
                onStreamChunk?.(data.chunk);
              }
              
              if (data.done && data.response) {
                updateMessage(assistantMessageId, {
                  content: data.response.text,
                  data: data.response.cards,
                  metadata: data.response.metadata,
                });
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError);
              // Continue processing other chunks
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }, [updateMessage, onStreamChunk]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) {
      return;
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    setError(null);

    const userMessage: ChatMessage = {
      id: generateMessageId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    const assistantMessageId = generateMessageId();
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    try {
      // Add user message and placeholder assistant message
      addMessage(userMessage);
      addMessage(assistantMessage);

      const requestBody: ChatApiRequest = {
        messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
        stream: true,
        workspaceId,
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ChatError(
          `HTTP ${response.status}: ${errorText}`,
          'HTTP_ERROR',
          response.status
        );
      }

      await handleStreamResponse(response, assistantMessageId);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was cancelled, don't show error
        return;
      }

      setError(errorMessage);
      removeMessage(assistantMessageId);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [
    isLoading,
    messages,
    workspaceId,
    generateMessageId,
    addMessage,
    handleStreamResponse,
    removeMessage,
    onError,
  ]);

  return {
    messages,
    input,
    isLoading,
    error,
    setInput,
    sendMessage,
    clearError,
    clearMessages,
  };
}