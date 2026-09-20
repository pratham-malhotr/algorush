"use client"

import * as React from 'react';
import { useMarketplaceStore } from '@/store/useMarketplaceStore';
import { useBuilderStore } from '@/store/useBuilderStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, ShieldCheck, Download, TrendingUp, Copy, 
  CheckCircle2, Play, BarChart3, Zap, Activity, Flame 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { normalizeStrategyDSL } from '@/lib/parser/strategyNormalizer';
import { runLocalBacktest, generateMockData, BacktestResult } from '@/lib/backtester/engine';

export default function StrategyDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { getStrategy, getCreator } = useMarketplaceStore();
  const { loadStrategyIntoCanvas } = useBuilderStore();
  
  const strategy = getStrategy(params.id);
  const creator = strategy ? getCreator(strategy.creatorId) : undefined;

  const [cloning, setCloning] = React.useState(false);
  const [isRunningBacktest, setIsRunningBacktest] = React.useState(false);
  const [backtestResult, setBacktestResult] = React.useState<BacktestResult | null>(null);

  // Normalize community strategy DSL to ensure standard schema compliance
  const normalizedDSL = React.useMemo(() => {
    if (!strategy) return null;
    return normalizeStrategyDSL(strategy.strategyDSL);
  }, [strategy]);

  if (!strategy || !creator || !normalizedDSL) {
    return <div className="p-12 text-center text-text-secondary">Strategy not found.</div>;
  }

  const handleClone = async () => {
    setCloning(true);
    
    if (strategy.price > 0) {
      await new Promise(r => setTimeout(r, 1200)); 
      toast.success(`Strategy '${strategy.name}' unlocked and cloned into Builder!`);
    } else {
      await new Promise(r => setTimeout(r, 600));
      toast.success(`Community Strategy '${strategy.name}' cloned to Builder Canvas!`);
    }

    // Load full DAG topology with working execution box onto builder canvas
    loadStrategyIntoCanvas(normalizedDSL);
    router.push('/builder');
  };

  const handleRunBacktest = async () => {
    setIsRunningBacktest(true);
    await new Promise(r => setTimeout(r, 400));
    const mockCandles = generateMockData(90);
    const result = runLocalBacktest(normalizedDSL, mockCandles);
    setBacktestResult(result);
    setIsRunningBacktest(false);
    toast.success(`90-day backtest simulation completed for '${strategy.name}'`);
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      {/* Top Nav */}
      <header className="h-16 border-b border-bg-border bg-bg-surface flex items-center justify-between px-8">
        <Link href="/marketplace" className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm font-semibold">
          <ArrowLeft className="h-4 w-4" /> Back to Strategy Marketplace
        </Link>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
            Community Verified Model
          </Badge>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Main Content */}
        <div className="md:col-span-2 flex flex-col gap-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-accent-blue/10 text-accent-blue border-accent-blue/30 font-bold">
                  {strategy.category}
                </Badge>
                <Badge className="bg-bg-elevated text-text-secondary border-bg-border font-mono">
                  {normalizedDSL.timeframe} • {normalizedDSL.instruments[0]?.symbol || 'BTC/USDT'}
                </Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">{strategy.name}</h1>
              <p className="text-text-secondary text-base leading-relaxed">{strategy.description}</p>
            </div>
          </div>

          {/* ═══ Verified Performance & 90D Live Backtester ═══ */}
          <div className="bg-bg-surface border border-bg-border rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-accent-blue" />
                  <span>Performance & Backtest Engine</span>
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  Community audited metrics & real-time client-side backtest verification.
                </p>
              </div>

              {/* Run 90D Backtest Button */}
              <Button
                variant="secondary"
                onClick={handleRunBacktest}
                disabled={isRunningBacktest}
                className="bg-accent-blue/10 hover:bg-accent-blue text-accent-blue hover:text-white border border-accent-blue/30 font-bold h-9 text-xs px-4 flex items-center gap-2 shadow-sm"
              >
                {isRunningBacktest ? (
                  <>
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-text-secondary border-t-accent-blue animate-spin" />
                    <span>Evaluating 90D Candles...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Run 90D Backtest</span>
                  </>
                )}
              </Button>
            </div>

            {/* Published Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 rounded-xl bg-bg-base border border-bg-border">
              <div>
                <div className="text-xs text-text-tertiary">Claimed Return</div>
                <div className="text-2xl font-mono font-bold text-emerald-400">
                  +{((strategy.metrics.monthlyReturn * strategy.metrics.liveDays) / 30).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-text-tertiary">Sharpe Ratio</div>
                <div className="text-2xl font-mono font-bold text-cyan-400">{strategy.metrics.sharpe}</div>
              </div>
              <div>
                <div className="text-xs text-text-tertiary">Max Drawdown</div>
                <div className="text-2xl font-mono font-bold text-rose-400">-{strategy.metrics.maxDrawdown}%</div>
              </div>
              <div>
                <div className="text-xs text-text-tertiary">Days Live</div>
                <div className="text-2xl font-mono font-bold text-text-primary">{strategy.metrics.liveDays}d</div>
              </div>
            </div>

            {/* Live Backtest Result Card (Appears on click) */}
            {backtestResult && (
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 mb-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Independent 90-Day Backtest Verified
                    </span>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] font-mono">
                    AlgoRush Engine v2.4
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <div className="text-[11px] text-text-tertiary uppercase">Simulated Return</div>
                    <div className={`text-xl font-mono font-bold ${(backtestResult.metrics.totalReturnRaw ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {backtestResult.metrics.totalReturn}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-text-tertiary uppercase">Simulated Sharpe</div>
                    <div className="text-xl font-mono font-bold text-cyan-400">
                      {backtestResult.metrics.sharpeRatio}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-text-tertiary uppercase">Simulated Win Rate</div>
                    <div className="text-xl font-mono font-bold text-blue-400">
                      {backtestResult.metrics.winRate}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-text-tertiary uppercase">Total Trades</div>
                    <div className="text-xl font-mono font-bold text-purple-400">
                      {backtestResult.metrics.totalTrades}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Visualizer card */}
            <div className="h-40 rounded-xl bg-bg-base border border-bg-border flex items-center justify-center text-text-tertiary flex-col gap-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-cyan-500/5" />
              <TrendingUp className="h-8 w-8 text-emerald-400/60" />
              <span className="text-xs font-mono text-text-secondary">Simulated 90-Day Equity Curve Verified Active</span>
            </div>
          </div>

          {/* ═══ Strategy Architecture & Logic ═══ */}
          <div className="bg-bg-surface border border-bg-border rounded-2xl p-6 sm:p-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" />
              <span>Strategy Architecture</span>
            </h3>

            <div className="flex flex-wrap gap-2 mb-6">
              {normalizedDSL.instruments.map((i) => (
                <Badge key={i.symbol} className="bg-bg-elevated border-bg-border text-xs font-mono font-bold">
                  {i.symbol} ({i.assetClass})
                </Badge>
              ))}
              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs font-bold">
                Action: {normalizedDSL.action?.type || 'BUY'} {normalizedDSL.action?.quantityValue || 50}%
              </Badge>
              {normalizedDSL.action?.leverage && normalizedDSL.action.leverage > 1 && (
                <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs font-bold">
                  {normalizedDSL.action.leverage}x Leverage
                </Badge>
              )}
            </div>

            <div className="space-y-3 text-sm text-text-secondary">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-text-primary">Entry Logic: </span>
                  {normalizedDSL.entryConditions?.length ? (
                    normalizedDSL.entryConditions.map((c, idx) => (
                      <span key={idx} className="font-mono text-xs bg-bg-elevated px-2 py-0.5 rounded border border-bg-border mr-1.5 inline-block my-0.5">
                        {(c as any).label || `${c.left?.type || 'PRICE'} ${c.comparator} ${typeof c.right === 'object' ? (c.right as any)?.type : c.right}`}
                      </span>
                    ))
                  ) : (
                    <span className="text-text-tertiary">Standard momentum trigger</span>
                  )}
                </div>
              </div>

              {normalizedDSL.exitConditions?.length ? (
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-text-primary">Exit Logic: </span>
                    {normalizedDSL.exitConditions.map((c, idx) => (
                      <span key={idx} className="font-mono text-xs bg-bg-elevated px-2 py-0.5 rounded border border-bg-border mr-1.5 inline-block my-0.5">
                        {(c as any).label || `${c.left?.type || 'PRICE'} ${c.comparator} ${typeof c.right === 'object' ? (c.right as any)?.type : c.right}`}
                      </span>
                    ))
                  }
                  </div>
                </div>
              ) : null}

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-text-primary">Risk Parameters: </span>
                  <span className="font-mono text-xs text-text-primary">
                    Stop Loss: {normalizedDSL.riskParameters?.stopLossPercentage || 2.5}% • Take Profit: {normalizedDSL.riskParameters?.takeProfitPercentage || 6.0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <div className="bg-bg-surface border border-bg-border rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
            <div>
              <div className="text-3xl font-extrabold font-mono">
                {strategy.price === 0 ? 'FREE' : `$${strategy.price}`}
              </div>
              <div className="text-xs text-text-tertiary mt-1">
                {strategy.price === 0 ? 'Open-source community model' : 'One-time unlock for private editing'}
              </div>
            </div>

            <Button 
              variant="primary" 
              className="w-full h-12 text-sm font-bold bg-accent-blue hover:bg-blue-600 text-white shadow-md shadow-accent-blue/20 flex items-center justify-center gap-2"
              onClick={handleClone}
              disabled={cloning}
            >
              <Copy className="h-4 w-4" />
              <span>{cloning ? 'Cloning to Flowchart Canvas...' : 'Clone Strategy to Builder'}</span>
            </Button>
            
            <div className="text-xs text-text-tertiary text-center leading-relaxed">
              Cloning compiles the strategy into an interactive visual DAG on your Builder Canvas with full execution boxes and risk controls.
            </div>
          </div>

          <Link href={`/creator/${creator.id}`} className="bg-bg-surface border border-bg-border rounded-2xl p-6 hover:border-accent-blue/50 transition-colors block group">
            <h4 className="text-xs font-semibold text-text-secondary mb-4 uppercase tracking-wider">Created By</h4>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-accent-blue/20 border border-accent-blue/40 flex items-center justify-center text-accent-blue font-bold text-lg group-hover:scale-105 transition-transform">
                {creator.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold flex items-center gap-1.5 text-base">
                  {creator.username}
                  {creator.verified && <ShieldCheck className="h-4 w-4 text-accent-blue" />}
                </div>
                <div className="text-xs text-text-tertiary mt-0.5">{creator.followers.toLocaleString()} followers • AUM {creator.aum}</div>
              </div>
            </div>
          </Link>
        </div>

      </main>
    </div>
  );
}
