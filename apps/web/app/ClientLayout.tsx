'use client';

import { useState } from 'react';
import { Navigation } from '@/app/components/navigation';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState("550e8400-e29b-41d4-a716-446655440001");

  const handleWorkspaceChange = (workspaceId: string) => {
    setCurrentWorkspaceId(workspaceId);
    console.log('Workspace changed to:', workspaceId);
  };

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
