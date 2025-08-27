'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Mic, Square, Upload, AlertCircle, CheckCircle, Volume2 } from 'lucide-react'

interface AudioMetadata {
  duration: number;
  quality: 'high' | 'medium' | 'low';
  backgroundNoise: boolean;
  sampleRate: number;
}

interface VoiceRecorderProps {
  onRecordingComplete?: (transcript: string) => Promise<void>;
}

export function VoiceRecorder({ onRecordingComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [transcript, setTranscript] = useState<string>('')
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const [audioMetadata, setAudioMetadata] = useState<AudioMetadata | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startTimeRef = useRef<number>(0)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioLevelIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current)
      if (audioLevelIntervalRef.current) clearInterval(audioLevelIntervalRef.current)
    }
  }, [])

  const startRecording = async () => {
    try {
      setError(null)
      setSuccess(false)
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      })
      
      // Set up audio analysis
      audioContextRef.current = new AudioContext()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      source.connect(analyserRef.current)
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      startTimeRef.current = Date.now()
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        
        // Calculate audio metadata
        const duration = (Date.now() - startTimeRef.current) / 1000
        const quality = duration > 30 ? 'high' : duration > 10 ? 'medium' : 'low'
        const backgroundNoise = audioLevel > 0.8 // High audio levels might indicate noise
        
        setAudioMetadata({
          duration,
          quality,
          backgroundNoise,
          sampleRate: audioContextRef.current?.sampleRate || 44100
        })
        
        stream.getTracks().forEach(track => track.stop())
        
        // Clean up audio context
        if (audioContextRef.current) {
          audioContextRef.current.close()
          audioContextRef.current = null
        }
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingDuration(0)
      
      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)
      
      // Start audio level monitoring
      audioLevelIntervalRef.current = setInterval(() => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length
          setAudioLevel(average / 255)
        }
      }, 100)
      
    } catch (error) {
      console.error('Error starting recording:', error)
      setError('Error accessing microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      // Clear intervals
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
        durationIntervalRef.current = null
      }
      if (audioLevelIntervalRef.current) {
        clearInterval(audioLevelIntervalRef.current)
        audioLevelIntervalRef.current = null
      }
    }
  }

  const uploadAudio = async () => {
    if (!audioBlob) return

    setIsUploading(true)
    setError(null)
    
    try {
      if (onRecordingComplete) {
        // Use callback for onboarding flow
        const mockTranscript = "I'm looking to raise a Series A round for my AI startup. I need introductions to VCs who invest in AI and have experience with B2B SaaS companies. I'm also looking for potential advisors who can help with go-to-market strategy."
        await onRecordingComplete(mockTranscript)
        setTranscript(mockTranscript)
        setAudioBlob(null)
        setSuccess(true)
      } else {
        // Original upload flow
        const formData = new FormData()
        formData.append('audio', audioBlob, 'voice-note.webm')
        formData.append('workspaceId', '550e8400-e29b-41d4-a716-446655440001') // Demo workspace
        
        if (audioMetadata) {
          formData.append('metadata', JSON.stringify(audioMetadata))
        }

        const response = await fetch('/api/ingest/voice', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const result = await response.json()
          setTranscript(result.transcript || 'Processing complete')
          setAudioBlob(null)
          setSuccess(true)
          
          // Auto-clear success message after 3 seconds
          setTimeout(() => setSuccess(false), 3000)
        } else {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Upload failed')
        }
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Error uploading voice note. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Voice Note Capture</h3>
            {audioMetadata && (
              <Badge variant={audioMetadata.quality === 'high' ? 'default' : 'secondary'}>
                {audioMetadata.quality} quality
              </Badge>
            )}
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">Voice note processed successfully!</span>
            </div>
          )}

          {/* Recording Interface */}
          <div className="space-y-4">
            {/* Audio Level Visualization */}
            {isRecording && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  <span className="text-sm text-gray-600">Audio Level</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-100"
                    style={{ width: `${audioLevel * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Duration Display */}
            {isRecording && (
              <div className="text-center">
                <div className="text-2xl font-mono font-bold text-blue-600">
                  {formatDuration(recordingDuration)}
                </div>
                <div className="text-sm text-gray-500">Recording...</div>
              </div>
            )}

            {/* Recording Controls */}
            <div className="flex gap-3">
              {!isRecording ? (
                <Button 
                  onClick={startRecording}
                  className="flex-1"
                  disabled={isUploading}
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Start Recording
                </Button>
              ) : (
                <Button 
                  onClick={stopRecording}
                  variant="destructive"
                  className="flex-1"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop Recording
                </Button>
              )}
            </div>

            {/* Upload Button */}
            {audioBlob && !isRecording && (
              <Button 
                onClick={uploadAudio}
                className="w-full"
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Processing...' : 'Process Voice Note'}
              </Button>
            )}
          </div>

          {/* Transcript Display */}
          {transcript && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Transcript</h4>
              <div className="p-3 bg-gray-50 rounded-lg text-sm">
                {transcript}
              </div>
            </div>
          )}

          {/* Audio Quality Tips */}
          {!isRecording && !audioBlob && (
            <div className="text-xs text-gray-500 space-y-1">
              <p>💡 Tips for better quality:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Speak clearly and at a normal pace</li>
                <li>Record in a quiet environment</li>
                <li>Keep the microphone close to your mouth</li>
                <li>Aim for 30+ seconds for best results</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
