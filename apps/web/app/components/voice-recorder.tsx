'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mic, Square, Upload } from 'lucide-react'

export function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [transcript, setTranscript] = useState<string>('')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Error accessing microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const uploadAudio = async () => {
    if (!audioBlob) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'voice-note.webm')

      const response = await fetch('/api/ingest/voice', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        setTranscript(result.transcript)
        setAudioBlob(null)
        alert('Voice note processed successfully!')
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Error uploading voice note. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Mic className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Record Voice Note</h3>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Record a voice note about your goals, meetings, or people you want to connect with.
          </p>
          
          <div className="flex space-x-2">
            {!isRecording ? (
              <Button 
                onClick={startRecording}
                disabled={isUploading}
                className="flex items-center space-x-2"
              >
                <Mic className="h-4 w-4" />
                <span>Start Recording</span>
              </Button>
            ) : (
              <Button 
                onClick={stopRecording}
                variant="destructive"
                className="flex items-center space-x-2"
              >
                <Square className="h-4 w-4" />
                <span>Stop Recording</span>
              </Button>
            )}
            
            {audioBlob && (
              <Button 
                onClick={uploadAudio}
                disabled={isUploading}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>{isUploading ? 'Processing...' : 'Upload'}</span>
              </Button>
            )}
          </div>
          
          {isRecording && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>Recording...</span>
            </div>
          )}
          
          {transcript && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <h4 className="font-medium text-sm mb-2">Transcript:</h4>
              <p className="text-sm">{transcript}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
