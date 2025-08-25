'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowRight, Sparkles, Target, Brain, 
  CheckCircle, PlayCircle, Network,
  Globe, Shield, BarChart3, MessageCircle,
  Mic, Eye, GitBranch, Bot
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: Brain,
    title: "Never Forget a Face",
    description: "Remember every person you&apos;ve met, what you talked about, and how you can help each other grow.",
    color: "from-rhiz-forest to-rhiz-sage",
    metric: "Remember everyone"
  },
  {
    icon: Target,
    title: "Meaningful Connections",
    description: "Share what matters to you. We&apos;ll surface the people who can genuinely help or collaborate.",
    color: "from-rhiz-sage to-rhiz-forest",
    metric: "Quality over quantity"
  },
  {
    icon: MessageCircle,
    title: "Conversation Memory",
    description: "Capture the essence of every conversation. Never wonder what you discussed or promised to follow up on.",
    color: "from-rhiz-coral to-rhiz-stone",
    metric: "Perfect conversation recall"
  },
  {
    icon: BarChart3,
    title: "Relationship Depth",
    description: "See beyond your immediate circle. Discover the hidden connections that could change everything.",
    color: "from-rhiz-stone to-rhiz-coral",
    metric: "Expand your world"
  }
];

const capabilities = [
  "Remember every conversation and the context that matters",
  "Track relationship depth, not just contact frequency",
  "Connect across all your platforms and communication channels",  
  "Visualize the hidden web of relationships around you",
  "Discover paths to anyone through people you trust",
  "Gentle reminders to nurture relationships that matter"
];

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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
        <div 
          className="absolute w-48 h-48 bg-rhiz-sage/15 rounded-full blur-xl transition-transform duration-500"
          style={{ 
            top: '60%', 
            left: '70%',
            transform: `translate(${mousePosition.y}px, ${mousePosition.x}px)`
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
            <a href="#features" className="text-rhiz-stone hover:text-rhiz-cream transition-colors">Features</a>
            <a href="#demo" className="text-rhiz-stone hover:text-rhiz-cream transition-colors">Demo</a>
            <a href="mailto:hello@rhiz.ai" className="text-rhiz-stone hover:text-rhiz-cream transition-colors">Contact</a>
            <Link href="/dashboard" className="btn-rhiz-primary">
              Get Early Access
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-rhiz-primary/20 border border-rhiz-forest/30 rounded-full text-rhiz-sage text-sm font-medium mb-8 backdrop-blur-sm">
            <Bot className="w-4 h-4 mr-2" />
            Coming Soon: Beyond Dunbar&apos;s Limit
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-[0.9] tracking-tight">
            Remember
            <br />
            Everyone You&apos;ve
            <span className="text-gradient-rhiz"> Ever Met</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-rhiz-stone-on-dark mb-12 max-w-4xl mx-auto leading-relaxed font-light">
            You know amazing people. You just can&apos;t remember them all. Rhiz helps you nurture 
            every meaningful relationship and discover the connections that matter most.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/dashboard">
              <button type="button" className="group px-8 py-4 bg-gradient-rhiz-primary hover:bg-rhiz-forest/90 rounded-xl text-lg font-semibold transition-all flex items-center space-x-2 shadow-2xl shadow-rhiz-forest/25 hover:scale-105 transform duration-200">
                <span>Join the Beta</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            
            <a href="#demo" className="group px-8 py-4 bg-rhiz-cream/5 hover:bg-rhiz-cream/10 border border-rhiz-stone/20 rounded-xl text-lg font-semibold transition-all flex items-center space-x-2 backdrop-blur-xl hover:scale-105 transform duration-200">
              <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>See How It Works</span>
            </a>
          </div>

          {/* Social Proof - Enterprise Logos */}
          <div className="mb-16">
            <p className="text-sm text-rhiz-muted-on-dark text-center mb-6">Trusted by professionals at leading companies</p>
            <div className="flex items-center justify-center space-x-8 opacity-50">
              <div className="h-8 w-24 bg-rhiz-stone/60 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-rhiz-cream">ENTERPRISE</span>
              </div>
              <div className="h-8 w-24 bg-rhiz-forest/60 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-rhiz-cream">TECH CORP</span>
              </div>
              <div className="h-8 w-24 bg-rhiz-coral/60 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-rhiz-charcoal">CONSULTING</span>
              </div>
              <div className="h-8 w-24 bg-rhiz-sage/60 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-rhiz-cream">FINANCE</span>
              </div>
            </div>
          </div>

          {/* Problem Statement */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="p-8 bg-rhiz-coral/10 border border-rhiz-coral/20 rounded-2xl backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-4 text-rhiz-coral">Beyond Human Limits</h3>
              <p className="text-rhiz-stone-on-dark leading-relaxed">
                Dunbar&apos;s research shows we can only maintain about 150 meaningful relationships. 
                But you&apos;ve met thousands of incredible people. What if you could remember them all?
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              Your Network
              <span className="text-gradient-rhiz"> Has No</span>
              <br />Limits.
            </h2>
            <p className="text-xl text-rhiz-stone-on-dark max-w-3xl mx-auto font-light">
              For people who know amazing humans but struggle to stay connected with them all. 
              Finally, a way to nurture relationships at the scale of your ambitions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-8 bg-rhiz-cream/3 backdrop-blur-xl rounded-3xl border border-rhiz-stone/10 hover:bg-rhiz-cream/5 transition-all duration-500 hover:scale-[1.02] transform"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-rhiz-stone-on-dark leading-relaxed text-lg mb-4">{feature.description}</p>
                <div className="inline-flex items-center px-3 py-1 bg-rhiz-sage/20 rounded-full">
                  <span className="text-sm font-medium text-rhiz-sage">{feature.metric}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Capabilities Grid */}
          <div className="bg-gradient-rhiz-primary/10 border border-rhiz-forest/20 rounded-3xl p-8 md:p-12 backdrop-blur-sm">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold mb-4">Platform Capabilities</h3>
              <p className="text-rhiz-stone-on-dark max-w-2xl mx-auto">Everything you need to nurture authentic relationships and discover meaningful connections</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {capabilities.map((capability, index) => (
                <div key={index} className="group flex items-center space-x-3 p-4 bg-rhiz-cream/5 hover:bg-rhiz-cream/10 rounded-xl border border-rhiz-stone/10 hover:border-rhiz-stone/20 transition-all duration-200">
                  <CheckCircle className="w-5 h-5 text-rhiz-sage flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-rhiz-stone-on-dark group-hover:text-rhiz-cream-bright transition-colors">{capability}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="relative z-10 px-6 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-8 tracking-tight">
            See It In
            <span className="text-gradient-rhiz-warm"> Action</span>
          </h2>
          
          {/* Mock Interface Preview */}
          <div className="relative mb-12">
            <div className="aspect-video bg-gradient-to-br from-rhiz-charcoal to-rhiz-charcoal/95 rounded-2xl border border-rhiz-stone/20 overflow-hidden backdrop-blur-xl">
              <div className="p-6 border-b border-rhiz-stone/10">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="ml-4 text-sm text-rhiz-secondary-on-dark">Rhiz Dashboard</div>
                </div>
              </div>
              <div className="p-8 flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-rhiz-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Network className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">Interactive Demo Coming Soon</h3>
                  <p className="text-rhiz-secondary-on-dark">Experience the full power of AI-driven networking</p>
                </div>
              </div>
            </div>
            
            {/* Floating UI Elements */}
            <div className="absolute -top-4 -left-4 w-24 h-12 bg-rhiz-forest/30 border border-rhiz-forest/50 rounded-lg backdrop-blur-sm flex items-center justify-center">
              <Mic className="w-4 h-4 text-rhiz-sage" />
              <span className="text-xs text-rhiz-sage ml-2">Voice AI</span>
            </div>
            <div className="absolute -top-4 -right-4 w-28 h-12 bg-rhiz-coral/30 border border-rhiz-coral/50 rounded-lg backdrop-blur-sm flex items-center justify-center">
              <Eye className="w-4 h-4 text-rhiz-coral" />
              <span className="text-xs text-rhiz-coral ml-2">Insights</span>
            </div>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-12 bg-rhiz-sage/30 border border-rhiz-sage/50 rounded-lg backdrop-blur-sm flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-rhiz-sage" />
              <span className="text-xs text-rhiz-sage ml-2">Connections</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-rhiz-primary/10 border border-rhiz-forest/20 rounded-3xl p-12 backdrop-blur-sm">
            <h2 className="text-5xl font-bold mb-6 tracking-tight">
              Ready to Remember
              <br />
              <span className="text-gradient-rhiz-warm">
                Everyone?
              </span>
            </h2>
            
            <p className="text-xl text-rhiz-stone-on-dark mb-12 max-w-2xl mx-auto font-light">
              Join others who believe relationships are the foundation of everything amazing. 
              Finally, a tool worthy of the people you know.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
              <Link href="/dashboard">
                <button type="button" className="group px-10 py-5 bg-gradient-rhiz-primary hover:opacity-90 rounded-xl text-xl font-semibold transition-all flex items-center space-x-3 shadow-2xl shadow-rhiz-forest/25 hover:scale-105 transform duration-200 text-rhiz-cream">
                  <span>Get Early Access</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-rhiz-stone-on-dark">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-rhiz-sage" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-rhiz-forest" />
                <span>Enterprise-grade security</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-rhiz-coral" />
                <span>Setup in under 5 minutes</span>
              </div>
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
              <div className="px-2 py-1 bg-rhiz-forest/30 rounded-full">
                <span className="text-xs font-medium text-rhiz-sage">BETA</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-rhiz-secondary-on-dark">
              <a href="mailto:hello@rhiz.ai" className="hover:text-rhiz-cream transition-colors">Contact</a>
              <a href="/legal" className="hover:text-rhiz-cream transition-colors">Privacy</a>
              <a href="/legal" className="hover:text-rhiz-cream transition-colors">Terms</a>
            </div>
          </div>
          
          <div className="text-center text-rhiz-muted-on-dark text-sm mt-8">
            © 2024 Rhiz. Building the future of intelligent networking.
          </div>
        </div>
      </footer>
    </div>
  );
}