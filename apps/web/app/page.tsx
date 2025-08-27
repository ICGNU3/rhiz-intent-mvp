'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowRight, Sparkles, Target, Brain, 
  Users, Shield, Award, Lock,
  TrendingUp, Zap, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [loadingTier, setLoadingTier] = useState<'root_alpha' | 'root_beta' | null>(null);
  const { isSignedIn, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleCheckout = async (tier: 'root_alpha' | 'root_beta') => {
    if (!isSignedIn) {
      // Redirect to sign-in with redirect back to this page
      router.push('/sign-in?redirect_url=/');
      return;
    }

    setLoadingTier(tier);
    
    try {
      // Get or create workspace for the user
      const workspaceResponse = await fetch('/api/workspaces', {
        method: 'GET',
      });
      
      let workspaceId;
      if (workspaceResponse.ok) {
        const workspaces = await workspaceResponse.json();
        if (workspaces.length > 0) {
          workspaceId = workspaces[0].id;
        } else {
          // Create a new workspace
          const createResponse = await fetch('/api/workspaces', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'My Workspace' }),
          });
          const newWorkspace = await createResponse.json();
          workspaceId = newWorkspace.id;
        }
      }

      // Create Stripe checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier,
          workspaceId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      
      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="w-full min-h-screen bg-rhiz-charcoal text-rhiz-cream relative overflow-x-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-rhiz-charcoal via-rhiz-charcoal/95 to-rhiz-charcoal">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        
        {/* Dynamic floating elements */}
        <div 
          className="absolute w-96 h-96 bg-rhiz-forest/15 rounded-full blur-3xl transition-transform duration-1000"
          style={{ 
            top: '10%', 
            left: '20%',
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
          }}
        />
        <div 
          className="absolute w-64 h-64 bg-rhiz-coral/20 rounded-full blur-2xl transition-transform duration-700"
          style={{ 
            bottom: '20%', 
            right: '25%',
            transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 w-full px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-rhiz-primary rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">Rhiz</span>
            <div className="px-2 py-1 bg-rhiz-forest/30 rounded-full">
              <span className="text-xs font-medium text-rhiz-sage">BETA</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className="text-rhiz-stone hover:text-rhiz-cream transition-colors">How it works</a>
            <a href="#features" className="text-rhiz-stone hover:text-rhiz-cream transition-colors">Features</a>
            <a href="mailto:hello@rhiz.ai" className="text-rhiz-stone hover:text-rhiz-cream transition-colors">Contact</a>
            <Link href="/onboarding" className="btn-rhiz-primary">
              Try Rhiz Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-rhiz-primary/20 border border-rhiz-forest/30 rounded-full text-rhiz-sage text-sm font-medium mb-8 backdrop-blur-sm">
            <Target className="w-4 h-4 mr-2" />
            Your Second Memory for Human Connection
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-[0.9] tracking-tight">
            Turn Your Network Into
            <br />
            <span className="text-gradient-rhiz">Your Biggest Asset</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-rhiz-stone-on-dark mb-12 max-w-4xl mx-auto leading-relaxed font-light">
            Stop losing opportunities buried in your contacts. Rhiz reveals hidden connections, perfect introductions, and untapped collaborations that accelerate your biggest goals.
            <span className="text-rhiz-cream font-medium"> Finally, your network works as hard as you do.</span>
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-16">
            <Link 
              href="/onboarding"
              className="group px-10 py-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl text-xl font-semibold transition-all flex items-center space-x-3 shadow-2xl shadow-amber-500/25 hover:scale-105 transform duration-200 text-white"
            >
              <span>Try Rhiz Free • 2-Minute Setup</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button 
              type="button" 
              onClick={() => handleCheckout('root_beta')}
              disabled={loadingTier !== null}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingTier === 'root_beta' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Join Root Beta • $150</span>
              )}
            </button>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center justify-center space-x-8 mb-16 text-sm text-rhiz-stone-on-dark">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-rhiz-sage rounded-full animate-pulse"></div>
              <span>Never miss an opportunity</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-rhiz-coral rounded-full animate-pulse"></div>
              <span>Every contact becomes valuable</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-rhiz-forest rounded-full animate-pulse"></div>
              <span>Goals achieved faster</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="how-it-works" className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Stop Networking. Start Winning.
            </h2>
            <p className="text-xl text-rhiz-stone-on-dark max-w-3xl mx-auto">
              The intelligent platform that transforms every relationship into revenue, partnerships, and career breakthroughs
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Goal Intelligence */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-3xl p-8 backdrop-blur-sm">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-blue-400">Goal Intelligence</h3>
              <p className="text-rhiz-stone-on-dark mb-4">
                Tell Rhiz what you want to achieve. Our AI instantly maps who in your network can help you get there.
              </p>
              <div className="text-sm text-blue-400">
                ✓ Smart goal categorization<br/>
                ✓ Progress tracking with network metrics<br/>
                ✓ Automated connection matching
              </div>
            </div>

            {/* Network Insights */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-3xl p-8 backdrop-blur-sm">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-emerald-400">Relationship Intelligence</h3>
              <p className="text-rhiz-stone-on-dark mb-4">
                See who you haven&apos;t talked to lately, discover unexpected connections, and know exactly when to reach out.
              </p>
              <div className="text-sm text-emerald-400">
                ✓ Network cluster visualization<br/>
                ✓ Relationship strength scoring<br/>
                ✓ Hidden connection discovery
              </div>
            </div>

            {/* Smart Introductions */}
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-3xl p-8 backdrop-blur-sm">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-amber-400">Introduction Engine</h3>
              <p className="text-rhiz-stone-on-dark mb-4">
                Stop guessing who to introduce. Get perfect matches with confidence scores and conversation starters included.
              </p>
              <div className="text-sm text-amber-400">
                ✓ Mutual interest matching<br/>
                ✓ Goal alignment scoring<br/>
                ✓ Perfect timing recommendations
              </div>
            </div>
          </div>

          {/* Live Feature Preview */}
          <div className="bg-gradient-to-br from-rhiz-charcoal to-rhiz-charcoal/95 rounded-3xl border border-rhiz-stone/20 overflow-hidden backdrop-blur-xl mb-16">
            <div className="p-4 border-b border-rhiz-stone/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="ml-4 text-sm text-rhiz-secondary-on-dark">Goals Dashboard</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-rhiz-sage">
                  <div className="w-2 h-2 bg-rhiz-sage rounded-full animate-pulse"></div>
                  <span>Live</span>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              {/* Goal Card Preview */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold">Raise $2M Series A</h4>
                    <p className="text-blue-100 text-sm">Fundraising • In Progress</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">67%</div>
                    <div className="text-xs text-blue-200">Progress</div>
                  </div>
                </div>
                <div className="w-full bg-blue-400/30 rounded-full h-2 mb-4">
                  <div className="bg-white rounded-full h-2 transition-all duration-500" style={{width: '67%'}}></div>
                </div>
              </div>

              {/* Suggestions Preview */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-rhiz-cream">Sarah Chen ↔ Mike Ross</span>
                    <div className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">95</div>
                  </div>
                  <p className="text-xs text-rhiz-muted-on-dark">Both Stanford alumni, SaaS expertise, timing perfect</p>
                </div>
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-rhiz-cream">Alex Kim → Series A Fund</span>
                    <div className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">88</div>
                  </div>
                  <p className="text-xs text-rhiz-muted-on-dark">Portfolio fit, recent B2B investments, warm intro available</p>
                </div>
              </div>

              {/* AI Insight */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <div className="flex items-start space-x-3">
                  <div className="text-lg">💡</div>
                  <div>
                    <div className="text-xs text-amber-400 mb-1">AI Insight (94% confidence)</div>
                    <div className="text-sm text-rhiz-cream">Sarah Chen highly aligned with your vision - 3 warm intro paths available. Strike while momentum is high.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section id="features" className="relative z-10 px-6 py-20 bg-gradient-to-b from-rhiz-charcoal/50 to-rhiz-charcoal">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">
              Your Complete <span className="text-gradient-rhiz-warm">Relationship OS</span>
            </h2>
            <p className="text-xl text-rhiz-stone-on-dark max-w-3xl mx-auto">
              Six powerful modules that turn your network into your competitive advantage
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Connection Management */}
            <div className="p-6 bg-rhiz-cream/3 backdrop-blur-xl rounded-2xl border border-rhiz-stone/10">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-3 text-rhiz-cream">Smart Connections</h3>
              <p className="text-sm text-rhiz-stone-on-dark mb-3">
                Never lose track of important relationships. Automatic scoring shows you who matters most.
              </p>
              <div className="text-xs text-blue-400">1,247 contacts • 89 clusters identified</div>
            </div>

            {/* Analytics Dashboard */}
            <div className="p-6 bg-rhiz-cream/3 backdrop-blur-xl rounded-2xl border border-rhiz-stone/10">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-3 text-rhiz-cream">Network Analytics</h3>
              <p className="text-sm text-rhiz-stone-on-dark mb-3">
                See your network like never before. Spot trends, gaps, and hidden opportunities instantly.
              </p>
              <div className="text-xs text-purple-400">24 insights generated • 12 opportunities found</div>
            </div>

            {/* Automation */}
            <div className="p-6 bg-rhiz-cream/3 backdrop-blur-xl rounded-2xl border border-rhiz-stone/10">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-3 text-rhiz-cream">Smart Automation</h3>
              <p className="text-sm text-rhiz-stone-on-dark mb-3">
                Never drop the ball again. Automated reminders and suggestions keep relationships warm.
              </p>
              <div className="text-xs text-emerald-400">15 automations active • 67% response rate</div>
            </div>

            {/* AI Insights */}
            <div className="p-6 bg-rhiz-cream/3 backdrop-blur-xl rounded-2xl border border-rhiz-stone/10">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-3 text-rhiz-cream">AI Agent Team</h3>
              <p className="text-sm text-rhiz-stone-on-dark mb-3">
                Four specialized AI agents continuously analyze, prioritize, and optimize your network.
              </p>
              <div className="text-xs text-amber-400">4 agents active • 94% confidence average</div>
            </div>

            {/* Communication Hub */}
            <div className="p-6 bg-rhiz-cream/3 backdrop-blur-xl rounded-2xl border border-rhiz-stone/10">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-3 text-rhiz-cream">Unified Inbox</h3>
              <p className="text-sm text-rhiz-stone-on-dark mb-3">
                All communications, follow-ups, and relationship context in one intelligent interface.
              </p>
              <div className="text-xs text-indigo-400">23 pending intros • 8 follow-ups due</div>
            </div>

            {/* Goal Tracking */}
            <div className="p-6 bg-rhiz-cream/3 backdrop-blur-xl rounded-2xl border border-rhiz-stone/10">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-red-500 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-3 text-rhiz-cream">Goal Orchestration</h3>
              <p className="text-sm text-rhiz-stone-on-dark mb-3">
                Track progress, measure network impact, and optimize strategies for each goal.
              </p>
              <div className="text-xs text-rose-400">5 active goals • 67% average progress</div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Success Through Collaboration
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-rhiz-cream/3 backdrop-blur-xl rounded-3xl border border-rhiz-stone/10 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-rhiz-forest to-rhiz-sage rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">10x Goal Achievement</h3>
              <p className="text-rhiz-stone-on-dark text-lg">
                When your entire network knows your goals, opportunities come to you instead of you chasing them.
              </p>
            </div>

            <div className="p-8 bg-rhiz-cream/3 backdrop-blur-xl rounded-3xl border border-rhiz-stone/10 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-rhiz-sage to-rhiz-coral rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Mutual Value Creation</h3>
              <p className="text-rhiz-stone-on-dark text-lg">
                Rhiz identifies how you can help others achieve their goals, creating stronger, more valuable relationships.
              </p>
            </div>

            <div className="p-8 bg-rhiz-cream/3 backdrop-blur-xl rounded-3xl border border-rhiz-stone/10 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-rhiz-coral to-rhiz-stone rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Perfect Timing Intelligence</h3>
              <p className="text-rhiz-stone-on-dark text-lg">
                Know exactly when someone is ready to collaborate and what mutual goals you can achieve together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="relative z-10 px-6 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-rhiz-stone-on-dark">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-rhiz-sage" />
              <span>Data Encrypted</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-rhiz-forest" />
              <span>Privacy Protected</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-rhiz-coral" />
              <span>Always Improving</span>
            </div>
          </div>
        </div>
      </section>

      {/* Root Invitation */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full text-amber-400 text-sm font-medium mb-6 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              You&apos;ve Been Chosen
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Root Invitation
            </h2>
            <p className="text-xl text-rhiz-stone-on-dark max-w-3xl mx-auto leading-relaxed">
              Welcome to Rhiz, the relationship intelligence platform redefining how networks grow and create value.
              <br /><br />
              <span className="text-rhiz-cream font-medium">This is more than access. It is an invitation into the first cohort shaping a new era of connection.</span>
            </p>
          </div>

          {/* Root Alpha & Beta Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Root Alpha */}
            <div className="relative bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-3xl p-8 backdrop-blur-sm">
              <div className="absolute top-4 right-4">
                <div className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-xs font-medium text-amber-400">
                  LIMITED TO 150
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-3xl font-bold mb-2 text-amber-400">Root Alpha</h3>
                <p className="text-rhiz-stone-on-dark text-lg mb-4">150 lifetime members</p>
                <div className="text-4xl font-bold text-rhiz-cream mb-2">$777</div>
                <p className="text-sm text-rhiz-muted-on-dark">One-time • Lifetime access</p>
              </div>

              <ul className="space-y-3 mb-8 text-rhiz-stone-on-dark">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Concierge-level access with Israel Wilson himself</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>10 guest passes for annual invitations</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Mystery box, exclusive events, private channels</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>White glove service at the center of Rhiz</span>
                </li>
              </ul>

              <button 
                type="button" 
                onClick={() => handleCheckout('root_alpha')}
                disabled={loadingTier !== null}
                className="w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl font-semibold transition-all transform hover:scale-105 text-white shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loadingTier === 'root_alpha' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Secure Root Alpha • $777</span>
                )}
              </button>
            </div>

            {/* Root Beta */}
            <div className="relative bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-3xl p-8 backdrop-blur-sm">
              <div className="absolute top-4 right-4">
                <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/40 rounded-full text-xs font-medium text-blue-400">
                  AUG 23 - OCT 6
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-3xl font-bold mb-2 text-blue-400">Root Beta</h3>
                <p className="text-rhiz-stone-on-dark text-lg mb-4">Launch window only</p>
                <div className="text-4xl font-bold text-rhiz-cream mb-2">$150</div>
                <p className="text-sm text-rhiz-muted-on-dark">$75 now, $75 in six months</p>
              </div>

              <ul className="space-y-3 mb-8 text-rhiz-stone-on-dark">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Pre-pay for one year before public launch</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Help test security, scaling, and features</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Direct input into the product roadmap</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Bridge to scale the ecosystem</span>
                </li>
              </ul>

              <button 
                type="button" 
                onClick={() => handleCheckout('root_beta')}
                disabled={loadingTier !== null}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl font-semibold transition-all transform hover:scale-105 text-white shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loadingTier === 'root_beta' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Join Root Beta • $150</span>
                )}
              </button>
            </div>
          </div>

          {/* Why Now */}
          <div className="bg-rhiz-cream/3 backdrop-blur-xl rounded-3xl border border-rhiz-stone/10 p-12 text-center mb-16">
            <h3 className="text-3xl font-bold mb-6 text-rhiz-cream">Why Now</h3>
            <div className="max-w-3xl mx-auto space-y-6 text-lg text-rhiz-stone-on-dark leading-relaxed">
              <p>
                Most launches raise money first, then chase product-market fit.
              </p>
              <p className="text-rhiz-cream font-medium">
                Rhiz is different. The product is built.
              </p>
              <p>
                What we need now is security, scale, and the right people to push it forward.
              </p>
              <p className="text-xl font-semibold text-rhiz-cream pt-4">
                Root Alpha and Beta are the infrastructure of a movement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-rhiz-stone/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-rhiz-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Rhiz</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-rhiz-secondary-on-dark">
              <a href="mailto:hello@rhiz.ai" className="hover:text-rhiz-cream transition-colors">Contact</a>
              <a href="/legal" className="hover:text-rhiz-cream transition-colors">Privacy</a>
              <a href="/legal" className="hover:text-rhiz-cream transition-colors">Terms</a>
            </div>
          </div>
          
          <div className="text-center text-rhiz-muted-on-dark text-sm mt-8">
            © 2024 Rhiz. Your second memory for human connection and collaborative goal achievement.
          </div>
        </div>
      </footer>
    </div>
  );
}