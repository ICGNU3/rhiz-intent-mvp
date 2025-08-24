import { NextRequest, NextResponse } from 'next/server';

// Mock auth middleware for development
export function middleware(request: NextRequest) {
  // For now, just pass through all requests
  // In production, this would handle authentication
  return NextResponse.next();
}

export const config = { 
  matcher: ["/((?!_next|api/health|public).*)"] 
};
