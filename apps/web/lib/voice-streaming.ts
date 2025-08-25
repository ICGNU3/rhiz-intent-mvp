import { logger } from './logger';
import { useState, useEffect, useRef } from 'react';

export interface VoiceStreamConfig {
  sampleRate: number;
  channels: number;
  bitDepth: number;
  chunkSize: number;
}

export interface VoiceStreamEvent {
  type: 'start' | 'data' | 'stop' | 'error';
  data?: any;
  timestamp: number;
}

export class VoiceStreamManager {
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private ws: WebSocket | null = null;
  private isRecording = false;
  private chunks: Blob[] = [];
  
  private config: VoiceStreamConfig = {
    sampleRate: 16000,
    channels: 1,
    bitDepth: 16,
    chunkSize: 1024
  };

  constructor(private wsUrl: string, config?: Partial<VoiceStreamConfig>) {
    this.config = { ...this.config, ...config };
  }

  async startStreaming(): Promise<void> {
    try {
      logger.info('Starting real-time voice streaming', { component: 'voice-streaming' });
      
      // Get microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.config.sampleRate,
          channelCount: this.config.channels,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Create WebSocket connection
      this.ws = new WebSocket(this.wsUrl);
      this.setupWebSocketHandlers();

      // Create MediaRecorder for chunked audio
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 16000
      });

      this.setupMediaRecorderHandlers();
      
      // Start recording
      this.mediaRecorder.start(100); // 100ms chunks for low latency
      this.isRecording = true;

      logger.info('Voice streaming started successfully', { component: 'voice-streaming' });
    } catch (error) {
      logger.error('Failed to start voice streaming', error as Error, { component: 'voice-streaming' });
      throw error;
    }
  }

  private setupWebSocketHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      logger.info('WebSocket connection established', { component: 'voice-streaming' });
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleServerMessage(data);
      } catch (error) {
        logger.error('Failed to parse WebSocket message', error as Error, { component: 'voice-streaming' });
      }
    };

    this.ws.onerror = (error) => {
      logger.error('WebSocket error', error as unknown as Error, { component: 'voice-streaming' });
    };

    this.ws.onclose = () => {
      logger.info('WebSocket connection closed', { component: 'voice-streaming' });
    };
  }

  private setupMediaRecorderHandlers(): void {
    if (!this.mediaRecorder) return;

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
        this.sendAudioChunk(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      logger.info('MediaRecorder stopped', { component: 'voice-streaming' });
    };

    this.mediaRecorder.onerror = (error) => {
      logger.error('MediaRecorder error', error as unknown as Error, { component: 'voice-streaming' });
    };
  }

  private async sendAudioChunk(chunk: Blob): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    try {
      // Convert blob to base64 for WebSocket transmission
      const arrayBuffer = await chunk.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      this.ws.send(JSON.stringify({
        type: 'audio_chunk',
        data: base64,
        timestamp: Date.now(),
        format: 'webm'
      }));
    } catch (error) {
      logger.error('Failed to send audio chunk', error as Error, { component: 'voice-streaming' });
    }
  }

  private handleServerMessage(data: any): void {
    switch (data.type) {
      case 'transcription':
        this.emit('transcription', data);
        break;
      case 'ai_response':
        this.emit('ai_response', data);
        break;
      case 'audio_response':
        this.playAudioResponse(data.audio);
        break;
      case 'error':
        logger.error('Server error', data.error as Error, { component: 'voice-streaming' });
        break;
      default:
        logger.warn('Unknown message type', { component: 'voice-streaming', type: data.type });
    }
  }

  private async playAudioResponse(audioData: string): Promise<void> {
    try {
      // Convert base64 to audio buffer
      const binaryString = atob(audioData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      
      const audio = new Audio(url);
      await audio.play();
      
      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      logger.error('Failed to play audio response', error as Error, { component: 'voice-streaming' });
    }
  }

  stopStreaming(): void {
    logger.info('Stopping voice streaming', { component: 'voice-streaming' });
    
    this.isRecording = false;
    
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder = null;
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.chunks = [];
  }

  private emit(event: string, data: any): void {
    // Dispatch custom event for React components to listen to
    window.dispatchEvent(new CustomEvent(`voice-stream:${event}`, { detail: data }));
  }

  isStreaming(): boolean {
    return this.isRecording;
  }

  getConnectionStatus(): 'disconnected' | 'connecting' | 'connected' {
    if (!this.ws) return 'disconnected';
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      default: return 'disconnected';
    }
  }
}

// Hook for React components
export function useVoiceStream(wsUrl: string) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [transcription, setTranscription] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  
  const streamManager = useRef<VoiceStreamManager | null>(null);

  useEffect(() => {
    streamManager.current = new VoiceStreamManager(wsUrl);
    
    // Listen for events
    const handleTranscription = (event: CustomEvent) => {
      setTranscription(event.detail.text);
    };
    
    const handleAiResponse = (event: CustomEvent) => {
      setAiResponse(event.detail.text);
    };

    window.addEventListener('voice-stream:transcription', handleTranscription as EventListener);
    window.addEventListener('voice-stream:ai_response', handleAiResponse as EventListener);

    return () => {
      window.removeEventListener('voice-stream:transcription', handleTranscription as EventListener);
      window.removeEventListener('voice-stream:ai_response', handleAiResponse as EventListener);
      streamManager.current?.stopStreaming();
    };
  }, [wsUrl]);

  const startStreaming = async () => {
    try {
      await streamManager.current?.startStreaming();
      setIsStreaming(true);
    } catch (error) {
      console.error('Failed to start streaming:', error);
    }
  };

  const stopStreaming = () => {
    streamManager.current?.stopStreaming();
    setIsStreaming(false);
  };

  return {
    isStreaming,
    connectionStatus,
    transcription,
    aiResponse,
    startStreaming,
    stopStreaming
  };
}
