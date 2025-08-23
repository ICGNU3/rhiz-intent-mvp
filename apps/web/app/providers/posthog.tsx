'use client'

import posthog from 'posthog-js'
import { PostHogProvider as Provider } from 'posthog-js/react'
import { useEffect } from 'react'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    capture_pageview: false,
  })
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Track pageviews
    const handleRouteChange = () => posthog.capture('$pageview')
    window.addEventListener('popstate', handleRouteChange)
    
    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [])

  return <Provider client={posthog}>{children}</Provider>
}
