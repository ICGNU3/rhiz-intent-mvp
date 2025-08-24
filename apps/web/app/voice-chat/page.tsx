'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX, Settings, MessageSquare } from 'lucide-react';
import { useVoiceStream } from '@/lib/voice-streaming';
import { logger } from '@/lib/logger';

interface ConversationMessage {
  id: string;
  type: 'user' | 'ai';
  text: string;
  timestamp: Date;
  audioUrl?: string;
}

export default function VoiceChatPage() {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [voicePreset, setVoicePreset] = useState<'professional' | 'friendly' | 'enthusiastic' | 'calm'>('professional');
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize voice streaming
  const wsUrl = process.env.NODE_ENV === 'development' 
    ? 'ws://localhost:3000/api/voice/stream'
    : `wss://${window.location.host}/api/voice/stream`;

  const {
    isStreaming,
    connectionStatus,
    transcription,
    aiResponse,
    startStreaming,
    stopStreaming
  } = useVoiceStream(wsUrl);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle transcription updates
  useEffect(() => {
    if (transcription && transcription.trim()) {
      addMessage('user', transcription);
    }
  }, [transcription]);

  // Handle AI response updates
  useEffect(() => {
    if (aiResponse && aiResponse.trim()) {
      addMessage('ai', aiResponse);
    }
  }, [aiResponse]);

  // Handle connection status changes
  useEffect(() => {
    setIsConnected(connectionStatus === 'connected');
    if (connectionStatus === 'disconnected' && isStreaming) {
      setError('Connection lost. Please try reconnecting.');
    }
  }, [connectionStatus, isStreaming]);

  const addMessage = (type: 'user' | 'ai', text: string, audioUrl?: string) => {
    const newMessage: ConversationMessage = {
      id: crypto.randomUUID(),
      type,
      text,
      timestamp: new Date(),
      audioUrl
    };

    setMessages(prev => [...prev, newMessage]);
  };

  const handleStartConversation = async () => {
    try {
      setError(null);
      await startStreaming();
      
      // Add welcome message
      addMessage('ai', "Hello! I'm your AI networking assistant. I'm here to help you build meaningful connections. What would you like to discuss?");
      
      logger.info('Voice conversation started', { component: 'voice-chat' });
    } catch (error) {
      setError('Failed to start conversation. Please check your microphone permissions.');
      logger.error('Failed to start voice conversation', error, { component: 'voice-chat' });
    }
  };

  const handleStopConversation = () => {
    stopStreaming();
    addMessage('ai', "Conversation ended. I've saved our discussion and any insights we discovered. Feel free to start a new conversation anytime!");
    
    logger.info('Voice conversation ended', { component: 'voice-chat' });
  };

  const playAudio = async (audioData: string) => {
    try {
      // Initialize audio context if needed
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Convert base64 to audio buffer
      const binaryString = atob(audioData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: 'audio/mpeg' });
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      
      // Create and play audio source
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start(0);
    } catch (error) {
      logger.error('Failed to play audio', error, { component: 'voice-chat' });
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      default: return 'bg-red-500';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      default: return 'Disconnected';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Voice Chat</h1>
            <p className="text-gray-600">Real-time AI-powered networking conversations</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getConnectionStatusColor()}`} />
              <span className="text-sm text-gray-600">{getConnectionStatusText()}</span>
            </div>
            
            {/* Voice Preset */}
            <Badge variant="outline" className="text-xs">
              {voicePreset.charAt(0).toUpperCase() + voicePreset.slice(1)}
            </Badge>
            
            {/* Settings Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Voice Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Voice Personality</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {(['professional', 'friendly', 'enthusiastic', 'calm'] as const).map((preset) => (
                    <Button
                      key={preset}
                      variant={voicePreset === preset ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setVoicePreset(preset)}
                    >
                      {preset.charAt(0).toUpperCase() + preset.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-700">
                <span className="text-sm">{error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                >
                  ×
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Conversation Area */}
        <Card className="flex-1 min-h-[500px]">
          <CardContent className="p-6">
            <div className="space-y-4 h-[500px] overflow-y-auto">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No messages yet. Start a conversation to begin!</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.type === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>

        {/* Control Panel */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-4">
              {!isStreaming ? (
                <Button
                  onClick={handleStartConversation}
                  disabled={!isConnected}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Start Conversation
                </Button>
              ) : (
                <Button
                  onClick={handleStopConversation}
                  variant="destructive"
                  className="px-8 py-3 rounded-full"
                >
                  <MicOff className="w-5 h-5 mr-2" />
                  End Conversation
                </Button>
              )}
            </div>
            
            {/* Status Indicators */}
            <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
                <span>{isStreaming ? 'Recording' : 'Not Recording'}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4" />
                <span>AI Voice: {voicePreset}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span>Messages: {messages.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-medium text-blue-900 mb-2">How to use Voice Chat:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Click "Start Conversation" to begin talking with your AI assistant</li>
              <li>• Speak naturally about your networking goals, people you've met, or opportunities</li>
              <li>• The AI will transcribe your speech and respond with helpful insights</li>
              <li>• All conversations are automatically saved and analyzed for networking insights</li>
              <li>• Use the voice settings to change the AI's personality and tone</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
