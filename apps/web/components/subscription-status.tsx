'use client';

import { useState, useEffect } from 'react';
import { Crown, Zap, Settings, Loader2 } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

interface SubscriptionData {
  tier: 'root_alpha' | 'root_beta' | 'free';
  status: string;
  currentPeriodEnd?: string;
}

export function SubscriptionStatus({ workspaceId }: { workspaceId?: string }) {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const { userId } = useAuth();

  useEffect(() => {
    if (userId && workspaceId) {
      fetchSubscription();
    }
  }, [userId, workspaceId]);

  const fetchSubscription = async () => {
    try {
      const response = await fetch(`/api/subscriptions?workspaceId=${workspaceId}`);
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    if (!workspaceId) return;
    
    setPortalLoading(true);
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workspaceId }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        alert('Failed to open billing portal');
      }
    } catch (error) {
      console.error('Portal error:', error);
      alert('Failed to open billing portal');
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-rhiz-muted">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading subscription...</span>
      </div>
    );
  }

  if (!subscription || subscription.status !== 'active') {
    return null;
  }

  const getTierBadge = () => {
    switch (subscription.tier) {
      case 'root_alpha':
        return (
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">Root Alpha</span>
          </div>
        );
      case 'root_beta':
        return (
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">Root Beta</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {getTierBadge()}
      
      {subscription.tier === 'root_beta' && (
        <button
          onClick={openCustomerPortal}
          disabled={portalLoading}
          className="p-2 hover:bg-rhiz-stone/10 rounded-lg transition-colors"
          title="Manage subscription"
        >
          {portalLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-rhiz-muted" />
          ) : (
            <Settings className="w-4 h-4 text-rhiz-muted hover:text-rhiz-secondary" />
          )}
        </button>
      )}
    </div>
  );
}

export function SubscriptionBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check URL params for payment success
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      setShowBanner(true);
      
      // Clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // Hide banner after 5 seconds
      setTimeout(() => setShowBanner(false), 5000);
    }
  }, []);

  if (!showBanner) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl shadow-2xl flex items-center space-x-3">
        <Crown className="w-6 h-6" />
        <div>
          <p className="font-semibold">Welcome to Rhiz!</p>
          <p className="text-sm opacity-90">Your subscription is now active</p>
        </div>
      </div>
    </div>
  );
}