"use client"
import * as React from 'react';
import { useMarketplaceStore } from '@/store/useMarketplaceStore';
import { useBuilderStore } from '@/store/useBuilderStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Download, TrendingUp, Copy, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function StrategyDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { getStrategy, getCreator } = useMarketplaceStore();
  const { updateStrategy } = useBuilderStore();
  
  const strategy = getStrategy(params.id);
  const creator = strategy ? getCreator(strategy.creatorId) : undefined;

  const [cloning, setCloning] = React.useState(false);

  if (!strategy || !creator) {
    return <div className="p-12 text-center">Strategy not found.</div>;
  }

  const handleClone = async () => {
    setCloning(true);
    
    // Mock Payment / Processing delay
    if (strategy.price > 0) {
      await new Promise(r => setTimeout(r, 1500)); 
      // In reality, we'd redirect to Stripe checkout here
      alert(`Payment of $${strategy.price} successful! Cloning strategy...`);
    } else {
      await new Promise(r => setTimeout(r, 800));
    }

    // Load into builder
    updateStrategy(strategy.strategyDSL);
    
    router.push('/builder');
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      {/* Top Nav */}
      <header className="h-16 border-b border-bg-border bg-bg-surface flex items-center px-8">
        <Link href="/marketplace" className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Marketplace
        </Link>
      </header>

      <main className="max-w-5xl mx-auto p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Main Content */}
        <div className="md:col-span-2 flex flex-col gap-8">
          <div className="flex items-start justify-between">
            <div>
              <Badge variant="secondary" className="mb-4 bg-accent-blue/10 text-accent-blue">{strategy.category}</Badge>
              <h1 className="text-4xl font-bold mb-4">{strategy.name}</h1>
              <p className="text-text-secondary text-lg">{strategy.description}</p>
            </div>
          </div>

          <div className="bg-bg-surface border border-bg-border rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-6">Verified Performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div>
                <div className="text-sm text-text-tertiary">Total Return (Live)</div>
                <div className="text-2xl font-mono font-bold text-accent-green">+{strategy.metrics.monthlyReturn * strategy.metrics.liveDays / 30}%</div>
              </div>
              <div>
                <div className="text-sm text-text-tertiary">Sharpe Ratio</div>
                <div className="text-2xl font-mono font-bold">{strategy.metrics.sharpe}</div>
              </div>
              <div>
                <div className="text-sm text-text-tertiary">Max Drawdown</div>
                <div className="text-2xl font-mono font-bold text-accent-red">-{strategy.metrics.maxDrawdown}%</div>
              </div>
              <div>
                <div className="text-sm text-text-tertiary">Days Live</div>
                <div className="text-2xl font-mono font-bold">{strategy.metrics.liveDays}</div>
              </div>
            </div>
            
            {/* Mock Chart Area */}
            <div className="h-64 rounded-xl bg-bg-surface border border-bg-border flex items-center justify-center text-text-tertiary flex-col gap-2">
              <TrendingUp className="h-8 w-8 text-accent-green/50" />
              <span>Interactive Equity Curve visualization would go here</span>
            </div>
          </div>

          <div className="bg-bg-surface border border-bg-border rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-6">Strategy Architecture</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {strategy.strategyDSL.assets.map(a => <Badge key={a} variant="outline">{a}</Badge>)}
            </div>
            <div className="space-y-4 text-sm text-text-secondary">
              <div className="flex gap-2"><CheckCircle2 className="h-5 w-5 text-accent-green shrink-0" /> Uses {strategy.strategyDSL.indicators.length} primary indicators</div>
              <div className="flex gap-2"><CheckCircle2 className="h-5 w-5 text-accent-green shrink-0" /> Contains strict Entry & Exit conditions</div>
              <div className="flex gap-2"><CheckCircle2 className="h-5 w-5 text-accent-green shrink-0" /> Built-in Risk Management (Stop Loss: {strategy.strategyDSL.riskParameters?.stopLossPercentage || 0}%)</div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <div className="bg-bg-surface border border-bg-border rounded-2xl p-6 flex flex-col gap-6">
            <div className="text-3xl font-bold">
              {strategy.price === 0 ? 'Free' : `$${strategy.price}`}
              {strategy.price > 0 && <span className="text-sm text-text-tertiary font-normal ml-2">one-time unlock</span>}
            </div>

            <Button 
              size="lg" 
              variant="primary" 
              className="w-full h-12 text-md font-bold"
              onClick={handleClone}
              disabled={cloning}
            >
              <Copy className="h-5 w-5 mr-2" />
              {cloning ? 'Cloning to Builder...' : 'Clone Strategy'}
            </Button>
            
            <div className="text-xs text-text-tertiary text-center">
              Cloning copies the DSL into your private builder where you can modify it before going live.
            </div>
          </div>

          <Link href={`/creator/${creator.id}`} className="bg-bg-surface border border-bg-border rounded-2xl p-6 hover:border-accent-blue/50 transition-colors block group">
            <h4 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wider">Creator</h4>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue font-bold text-lg group-hover:scale-105 transition-transform">
                {creator.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold flex items-center gap-1 text-lg">
                  {creator.username}
                  {creator.verified && <ShieldCheck className="h-4 w-4 text-accent-blue" />}
                </div>
                <div className="text-sm text-text-tertiary">{creator.followers.toLocaleString()} followers</div>
              </div>
            </div>
          </Link>
        </div>

      </main>
    </div>
  );
}
