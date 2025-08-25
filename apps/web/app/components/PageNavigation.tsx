'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Users, 
  Target, 
  Zap,
  ChevronLeft,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/connections', label: 'Connections', icon: Users },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/opportunities', label: 'Opportunities', icon: Zap },
];

export function PageNavigation() {
  const pathname = usePathname();

  return (
    <div className="fixed top-4 left-4 z-30 flex items-center space-x-2">
      {/* Back to Dashboard (if not on dashboard) */}
      {pathname !== '/dashboard' && (
        <Link
          href="/dashboard"
          className="p-2 bg-black/50 backdrop-blur-xl rounded-lg border border-white/10 hover:bg-black/70 transition-all text-gray-300 hover:text-white"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
      )}

      {/* Page Navigation Pills */}
      <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-xl rounded-lg border border-white/10 p-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm transition-all",
                isActive
                  ? "bg-white/20 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              )}
              title={item.label}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:block">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}