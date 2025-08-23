import { Suspense } from 'react'
import { IntentCards } from './components/intent-cards'
import { VoiceRecorder } from './components/voice-recorder'
import { CalendarUpload } from './components/calendar-upload'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Welcome to Rhiz
        </h1>
        <p className="text-lg text-muted-foreground">
          Your intent-first relationship intelligence platform
        </p>
      </div>

      {/* Data Capture Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Capture Voice Notes</h2>
          <VoiceRecorder />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Upload Calendar</h2>
          <CalendarUpload />
        </div>
      </div>

      {/* Intent Cards Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Your Intent Cards</h2>
        <Suspense fallback={<div>Loading intent cards...</div>}>
          <IntentCards workspaceId="550e8400-e29b-41d4-a716-446655440001" />
        </Suspense>
      </div>
    </div>
  )
}
