"use client"
import * as React from 'react';
import { useMarketplaceStore } from '@/store/useMarketplaceStore';
import Link from 'next/link';
import { Search, TrendingUp, ShieldCheck, Download, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function MarketplacePage() {
  const { strategies, creators } = useMarketplaceStore();
  const [filter, setFilter] = React.useState('All');

  const filteredStrategies = filter === 'All' 
    ? strategies 
    : strategies.filter(s => s.category === filter);

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col">
      {/* Top Nav */}
      <header className="h-16 border-b border-bg-border bg-bg-surface flex items-center justify-between px-8 shrink-0">
        <div className="font-bold text-xl flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-accent-blue" />
          AlgoText Marketplace
        </div>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-medium hover:text-accent-blue transition-colors">My Dashboard</Link>
          <Link href="/builder" className="text-sm font-medium hover:text-accent-blue transition-colors">Builder</Link>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
        
        {/* Hero Section */}
        <div className="bg-bg-surface border border-bg-border rounded-2xl p-10 flex flex-col items-center text-center">
          <h1 className="text-4xl font-bold mb-4">Discover verified alpha.</h1>
          <p className="text-text-secondary text-lg max-w-2xl mb-8">
            Browse and clone algorithmic trading strategies built by top quantitative traders. All performance metrics are verified on live market data.
          </p>
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
            <input 
              type="text" 
              placeholder="Search for strategies (e.g., 'Mean Reversion', 'Crypto BTC')" 
              className="w-full bg-bg-surface border border-bg-border rounded-full py-4 pl-12 pr-4 outline-none focus:border-accent-blue transition-colors"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {['All', 'Crypto', 'Equities', 'Forex', 'Multi-Asset'].map(cat => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                filter === cat ? 'bg-accent-blue text-white' : 'bg-bg-surface border border-bg-border text-text-secondary hover:text-text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Strategy Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredStrategies.map(strategy => {
            const creator = creators[strategy.creatorId];
            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={strategy.id}
                className="h-full"
              >
                <Link href={`/marketplace/${strategy.id}`} className="group flex flex-col h-full bg-bg-surface border border-bg-border rounded-xl overflow-hidden hover:border-accent-blue/50 hover:shadow-[0_8px_30px_rgba(59,130,246,0.12)] hover:-translate-y-1 transition-all duration-300">
                  <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <Badge className="bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20">
                      {strategy.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm font-semibold text-accent-green">
                      <TrendingUp className="h-4 w-4" />
                      {strategy.metrics.monthlyReturn}%/mo
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 group-hover:text-accent-blue transition-colors">{strategy.name}</h3>
                  <p className="text-text-secondary text-sm line-clamp-2 mb-6 flex-1">{strategy.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-bg-border/50">
                    <div>
                      <div className="text-xs text-text-tertiary">Sharpe Ratio</div>
                      <div className="font-mono font-semibold">{strategy.metrics.sharpe}</div>
                    </div>
                    <div>
                      <div className="text-xs text-text-tertiary">Max Drawdown</div>
                      <div className="font-mono font-semibold text-accent-red">-{strategy.metrics.maxDrawdown}%</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-bg-border">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue font-bold text-xs">
                        {creator?.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold flex items-center gap-1">
                          {creator?.username}
                          {creator?.verified && <ShieldCheck className="h-3 w-3 text-accent-blue" />}
                        </div>
                        <div className="text-xs text-text-tertiary flex items-center gap-1">
                          <Download className="h-3 w-3" /> {strategy.clones} clones
                        </div>
                      </div>
                    </div>
                    <div className="font-bold">
                      {strategy.price === 0 ? 'Free' : `$${strategy.price}`}
                    </div>
                  </div>
                </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>

      </main>
    </div>
  );
}
