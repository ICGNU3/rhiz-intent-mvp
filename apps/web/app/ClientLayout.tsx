'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Navigation } from '@/app/components/navigation';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState("550e8400-e29b-41d4-a716-446655440001");
  const pathname = usePathname();
  
  // Don't show navigation for dashboard, connections, goals, opportunities pages (they have their own full-screen layouts)
  const fullScreenPages = ['/dashboard', '/connections', '/goals', '/opportunities'];
  const showNavigation = !fullScreenPages.includes(pathname);

  const handleWorkspaceChange = (workspaceId: string) => {
    setCurrentWorkspaceId(workspaceId);
    console.log('Workspace changed to:', workspaceId);
  };

  if (!showNavigation) {
    return <>{children}</>;
  }

  return (
    <>
      <Navigation 
        currentWorkspaceId={currentWorkspaceId}
        onWorkspaceChange={handleWorkspaceChange}
      />
      <div className="lg:ml-64">
        <main className="min-h-screen bg-background p-6">
          {children}
        </main>
      </div>
    </>
  );
}
