'use client';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  // Navigation completely removed - all pages are full-screen
  return <>{children}</>;
}
