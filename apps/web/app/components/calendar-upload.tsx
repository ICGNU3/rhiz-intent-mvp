'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Upload, FileText } from 'lucide-react'

interface CalendarUploadProps {
  onUpload?: (file: File) => Promise<void>;
}

export function CalendarUpload({ onUpload }: CalendarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && (file.name.endsWith('.ics') || file.type === 'text/calendar')) {
      setUploadedFile(file)
    } else {
      alert('Please select a valid ICS file')
    }
  }

  const uploadCalendar = async () => {
    if (!uploadedFile) return

    setIsUploading(true)
    try {
      if (onUpload) {
        await onUpload(uploadedFile)
      } else {
        const formData = new FormData()
        formData.append('calendar', uploadedFile)

        const response = await fetch('/api/ingest/calendar', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const result = await response.json()
          alert(`Calendar uploaded successfully! Processed ${result.events} events.`)
          setUploadedFile(null)
        } else {
          throw new Error('Upload failed')
        }
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Error uploading calendar. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Upload Calendar</h3>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Upload an ICS file from your calendar to extract meeting attendees and events.
          </p>
          
          <div className="space-y-2">
            <input
              type="file"
              accept=".ics,text/calendar"
              onChange={handleFileSelect}
              className="hidden"
              id="calendar-upload"
            />
            <label htmlFor="calendar-upload">
              <Button variant="outline" className="w-full" asChild>
                <span className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Select ICS File</span>
                </span>
              </Button>
            </label>
            
            {uploadedFile && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Selected: {uploadedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  Size: {(uploadedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            )}
            
            {uploadedFile && (
              <Button 
                onClick={uploadCalendar}
                disabled={isUploading}
                className="w-full flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>{isUploading ? 'Processing...' : 'Upload Calendar'}</span>
              </Button>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p>Supported formats: ICS files from Google Calendar, Outlook, or other calendar applications.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
