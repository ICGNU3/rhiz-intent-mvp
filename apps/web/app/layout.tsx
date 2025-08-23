import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PostHogProvider } from './providers/posthog'
import { Navigation } from './components/navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Rhiz - Intent-First Relationship Intelligence',
  description: 'Capture high-signal relationship data and generate smart introductions with AI-powered insights.',
  keywords: ['networking', 'relationships', 'introductions', 'AI', 'productivity'],
  authors: [{ name: 'Rhiz Team' }],
  openGraph: {
    title: 'Rhiz - Intent-First Relationship Intelligence',
    description: 'Capture high-signal relationship data and generate smart introductions with AI-powered insights.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PostHogProvider>
          <Navigation />
          <div className="lg:ml-64">
            <main className="min-h-screen bg-background p-6">
              {children}
            </main>
          </div>
        </PostHogProvider>
      </body>
    </html>
  )
}
