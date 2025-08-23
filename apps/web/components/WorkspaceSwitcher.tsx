'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Building2, Plus } from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  role: string;
}

interface WorkspaceSwitcherProps {
  currentWorkspaceId?: string;
  onWorkspaceChange: (workspaceId: string) => void;
}

export function WorkspaceSwitcher({ currentWorkspaceId, onWorkspaceChange }: WorkspaceSwitcherProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (currentWorkspaceId && workspaces.length > 0) {
      const workspace = workspaces.find(w => w.id === currentWorkspaceId);
      setCurrentWorkspace(workspace || workspaces[0]);
    }
  }, [currentWorkspaceId, workspaces]);

  const fetchWorkspaces = async () => {
    try {
      const response = await fetch('/api/workspaces');
      const data = await response.json();
      
      if (data.workspaces) {
        setWorkspaces(data.workspaces);
        if (!currentWorkspaceId && data.workspaces.length > 0) {
          onWorkspaceChange(data.workspaces[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkspaceSelect = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
    onWorkspaceChange(workspace.id);
  };

  if (loading) {
    return (
      <Button variant="ghost" disabled>
        <Building2 className="h-4 w-4 mr-2" />
        Loading...
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2">
          <Building2 className="h-4 w-4" />
          <span className="font-medium">
            {currentWorkspace?.name || 'Select Workspace'}
          </span>
          {currentWorkspace?.role === 'admin' && (
            <Badge variant="secondary" className="text-xs">
              Admin
            </Badge>
          )}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => handleWorkspaceSelect(workspace)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>{workspace.name}</span>
            </div>
            {workspace.role === 'admin' && (
              <Badge variant="outline" className="text-xs">
                Admin
              </Badge>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Plus className="h-4 w-4 mr-2" />
          Create Workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
