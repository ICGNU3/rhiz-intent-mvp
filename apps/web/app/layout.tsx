import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PostHogProvider } from './providers/posthog'
import { ClientLayout } from './ClientLayout'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Rhiz - Intent-First Relationship Intelligence',
  description: 'Capture high-signal relationship data and generate smart introductions with AI-powered insights.',
  keywords: ['networking', 'relationships', 'introductions', 'AI', 'productivity'],
  authors: [{ name: 'Rhiz Team' }],
  openGraph: {
    title: 'Rhiz - Intent-First Relationship Intelligence',
    description: 'Capture high-signal relationship data and generate smart introductions with AI-powered insights.',
    type: 'website',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: 'Rhiz',
  },
  twitter: {
    card: 'summary',
    title: 'Rhiz - Intent-First Relationship Intelligence',
    description: 'Capture high-signal relationship data and generate smart introductions with AI-powered insights.',
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
        <ErrorBoundary>
          <PostHogProvider>
            <ClientLayout>
              {children}
            </ClientLayout>
          </PostHogProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
