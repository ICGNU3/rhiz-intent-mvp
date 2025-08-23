'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { 
  Home, 
  Users, 
  Target, 
  Lightbulb, 
  Menu, 
  User, 
  Settings, 
  LogOut,
  Moon,
  Sun,
  BarChart3,
  Share2,
  Network
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkspaceSwitcher } from '@/components/WorkspaceSwitcher';
import { Notifications } from '@/components/Notifications';
import { GlobalSearch } from '@/components/GlobalSearch';

interface NavigationProps {
  currentWorkspaceId?: string;
  onWorkspaceChange?: (workspaceId: string) => void;
}

export function Navigation({ currentWorkspaceId, onWorkspaceChange }: NavigationProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/people', label: 'People', icon: Users },
    { href: '/goals', label: 'Goals', icon: Target },
    { href: '/suggestions', label: 'Suggestions', icon: Lightbulb },
    { href: '/graph', label: 'Graph', icon: Network },
    { href: '/insights', label: 'Insights', icon: Lightbulb },
    { href: '/referrals', label: 'Referrals', icon: Share2 },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-screen w-64 flex-col fixed left-0 top-0 bg-background border-r">
        <div className="p-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-xl font-bold">Rhiz</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        {/* Global Search */}
        <div className="px-4 py-2">
          <GlobalSearch />
        </div>
        
        <div className="p-4 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarFallback>DU</AvatarFallback>
                </Avatar>
                <span className="text-sm">Demo User</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BarChart3 className="mr-2 h-4 w-4" />
                <span>Analytics</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden border-b bg-background">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Rhiz</SheetTitle>
                  </SheetHeader>
                  <nav className="mt-6 space-y-2">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                            pathname === item.href
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </SheetContent>
              </Sheet>
              <Link href="/" className="text-xl font-bold">
                Rhiz
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              {currentWorkspaceId && (
                <WorkspaceSwitcher 
                  currentWorkspaceId={currentWorkspaceId}
                  onWorkspaceChange={onWorkspaceChange || (() => {})}
                />
              )}
              {currentWorkspaceId && (
                <Notifications workspaceId={currentWorkspaceId} />
              )}
              <Button variant="ghost" size="sm">
                <Sun className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>DU</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Demo User</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
