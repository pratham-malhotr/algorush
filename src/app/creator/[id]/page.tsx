"use client"
import * as React from 'react';
import { useMarketplaceStore } from '@/store/useMarketplaceStore';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Download, Users, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function CreatorProfilePage({ params }: { params: { id: string } }) {
  const { getCreator, getStrategiesByCreator } = useMarketplaceStore();
  
  const creator = getCreator(params.id);
  const strategies = creator ? getStrategiesByCreator(creator.id) : [];

  if (!creator) {
    return <div className="p-12 text-center">Creator not found.</div>;
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      {/* Top Nav */}
      <header className="h-16 border-b border-bg-border bg-bg-surface flex items-center px-8">
        <Link href="/marketplace" className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Marketplace
        </Link>
      </header>

      <main className="max-w-7xl mx-auto p-8 flex flex-col gap-12">
        
        {/* Creator Hero */}
        <div className="bg-bg-surface border border-bg-border rounded-3xl p-12 flex flex-col md:flex-row items-center gap-10">
          <div className="h-32 w-32 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue font-bold text-5xl shrink-0">
            {creator.name.charAt(0)}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-bold mb-2 flex items-center justify-center md:justify-start gap-3">
              {creator.name}
              {creator.verified && <ShieldCheck className="h-8 w-8 text-accent-blue" />}
            </h1>
            <p className="text-xl text-text-secondary mb-6">{creator.username}</p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
              <div className="flex items-center gap-2 text-text-secondary">
                <Users className="h-5 w-5 text-accent-blue" />
                <span className="font-semibold text-text-primary">{creator.followers.toLocaleString()}</span> Followers
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <Briefcase className="h-5 w-5 text-accent-blue" />
                <span className="font-semibold text-text-primary">{creator.aum}</span> Verified AUM
              </div>
            </div>
          </div>
          <div>
            <Button size="lg" className="w-48 font-bold">Follow Creator</Button>
          </div>
        </div>

        {/* Strategies List */}
        <div>
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            Published Strategies <Badge variant="secondary">{strategies.length}</Badge>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {strategies.map(strategy => (
              <Link href={`/marketplace/${strategy.id}`} key={strategy.id} className="group flex flex-col bg-bg-surface border border-bg-border rounded-xl overflow-hidden hover:border-accent-blue/50 transition-colors">
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <Badge variant="secondary" className="bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20">
                      {strategy.category}
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 group-hover:text-accent-blue transition-colors">{strategy.name}</h3>
                  <p className="text-text-secondary text-sm line-clamp-2 mb-6 flex-1">{strategy.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-bg-border">
                    <div className="text-xs text-text-tertiary flex items-center gap-1">
                      <Download className="h-3 w-3" /> {strategy.clones} clones
                    </div>
                    <div className="font-bold">
                      {strategy.price === 0 ? 'Free' : `$${strategy.price}`}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
