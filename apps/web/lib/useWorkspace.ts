import { useState, useEffect } from 'react';
import { useUser } from './useUser';

interface Workspace {
  id: string;
  name: string;
  ownerId: string;
}

export function useWorkspace() {
  const { user } = useUser();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWorkspace() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Try to fetch user's workspace
        const response = await fetch('/api/workspaces?userId=' + user.id);
        if (response.ok) {
          const data = await response.json();
          if (data.workspaces && data.workspaces.length > 0) {
            setWorkspace(data.workspaces[0]);
          } else {
            // Create a default workspace for the user
            const createResponse = await fetch('/api/workspaces', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: `${user.fullName || 'User'}'s Workspace`,
                ownerId: user.id,
              }),
            });
            
            if (createResponse.ok) {
              const newWorkspace = await createResponse.json();
              setWorkspace(newWorkspace.workspace);
            } else {
              // Fallback to demo workspace
              setWorkspace({
                id: '550e8400-e29b-41d4-a716-446655440001',
                name: 'Demo Workspace',
                ownerId: user.id,
              });
            }
          }
        } else {
          // Fallback to demo workspace
          setWorkspace({
            id: '550e8400-e29b-41d4-a716-446655440001',
            name: 'Demo Workspace',
            ownerId: user.id,
          });
        }
      } catch (error) {
        console.error('Failed to fetch workspace:', error);
        // Fallback to demo workspace
        setWorkspace({
          id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Demo Workspace',
          ownerId: user?.id || 'demo-user',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchWorkspace();
  }, [user]);

  return {
    workspace,
    workspaceId: workspace?.id,
    loading,
    isDemo: workspace?.id === '550e8400-e29b-41d4-a716-446655440001',
  };
}