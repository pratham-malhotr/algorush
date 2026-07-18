"use client"
import * as React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { usePaperTradingStore } from '@/store/usePaperTradingStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, ShieldAlert, Zap, TrendingUp, Settings, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { balance, equityHistory, activeStrategies, trades, positions, currentPrices, haltAllTrading } = usePaperTradingStore();

  const totalEquity = equityHistory.length > 0 ? equityHistory[equityHistory.length - 1].value : balance;
  const pnl = totalEquity - 100000;
  const pnlPercent = (pnl / 100000) * 100;

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col">
      {/* Top Nav */}
      <header className="h-16 border-b border-bg-border bg-bg-surface flex items-center justify-between px-8">
        <div className="font-bold text-xl flex items-center gap-2">
          <Zap className="h-5 w-5 text-accent-blue" />
          AlgoText
        </div>
        <div className="flex items-center gap-6">
          <Link href="/builder" className="text-sm font-medium hover:text-accent-blue transition-colors">Build Strategy</Link>
          <Link href="/billing" className="text-sm font-medium hover:text-accent-blue transition-colors">Plan: {user?.plan}</Link>
          <div className="h-8 w-8 rounded-full bg-accent-blue flex items-center justify-center font-bold text-white">
            {user?.name.charAt(0)}
          </div>
        </div>
      </header>

      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex-1 p-8 max-w-7xl mx-auto w-full flex flex-col gap-8"
      >
        
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-bg-surface border border-bg-border p-6 rounded-xl hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all">
            <div className="text-sm text-text-secondary mb-1">Total Account Value</div>
            <div className="text-3xl font-mono font-bold">${totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className={`text-sm mt-2 flex items-center gap-1 ${pnl >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
              <TrendingUp className="h-4 w-4"/> {pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}% Total
            </div>
          </div>
          <div className="bg-bg-surface border border-bg-border p-6 rounded-xl hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all">
            <div className="text-sm text-text-secondary mb-1">Active Strategies</div>
            <div className="text-3xl font-mono font-bold">{activeStrategies.filter(s => s.status === 'RUNNING').length}</div>
            <div className="text-sm text-text-tertiary mt-2">Running Live</div>
          </div>
          <div className="bg-bg-surface border border-bg-border p-6 rounded-xl hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all">
            <div className="text-sm text-text-secondary mb-1">Open Positions</div>
            <div className="text-3xl font-mono font-bold">{positions.length}</div>
            <div className="text-sm text-text-tertiary mt-2">Cash: ${balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </div>
          <div className="bg-bg-surface border border-bg-border p-6 rounded-xl flex flex-col justify-center items-start hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all">
            <button 
              className="flex items-center gap-2 text-accent-red font-bold hover:bg-accent-red/10 px-4 py-2 rounded-lg border border-accent-red/30 transition-colors w-full justify-center"
              onClick={async () => {
                try {
                  await fetch('/api/kill-switch', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'engage' })
                  });
                  haltAllTrading();
                  alert('CRITICAL: Kill Switch Engaged. All trading halted across all strategies.');
                } catch (e) {
                  alert('Error engaging Kill Switch!');
                }
              }}
            >
              <ShieldAlert className="h-5 w-5" />
              GLOBAL KILL SWITCH
            </button>
            <div className="text-xs text-text-tertiary mt-2 text-center w-full">Instantly halt all trading</div>
          </div>
        </div>

        {/* Chart & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 bg-bg-surface border border-bg-border rounded-xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <h3 className="font-bold text-lg mb-6">Live Equity Curve (Paper Trading)</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={equityHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-bg-border)" vertical={false} />
                  <XAxis dataKey="time" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 1000', 'dataMax + 1000']} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`}/>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-bg-border)' }} />
                  <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-bg-surface border border-bg-border rounded-xl p-6 flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <h3 className="font-bold text-lg mb-6 flex items-center justify-between">
              Active Strategies
              <Link href="/builder" className="text-sm text-accent-blue font-normal">Create New</Link>
            </h3>
            
            <div className="flex flex-col gap-4 flex-1">
              {activeStrategies.length === 0 && <div className="text-sm text-text-tertiary">No active strategies.</div>}
              {activeStrategies.map((strat) => (
                <div key={strat.id} className="p-4 border border-bg-border rounded-lg flex items-center justify-between hover:border-accent-blue/50 transition-colors">
                  <div>
                    <div className="font-semibold text-sm">{strat.name} ({strat.strategy.instruments?.[0]?.symbol})</div>
                    <div className={`text-xs mt-1 ${strat.status === 'RUNNING' ? 'text-accent-green' : 'text-text-tertiary'}`}>
                      {strat.status} • {strat.hasTriggeredEntry ? 'Position Open' : 'Waiting for Signal'}
                    </div>
                  </div>
                  <Settings className="h-4 w-4 text-text-secondary" />
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-bg-border pt-4">
              <h4 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2"><Briefcase className="h-4 w-4" /> Open Positions</h4>
              <div className="text-xs flex flex-col gap-2">
                {positions.length === 0 && <span className="text-text-tertiary">No open positions.</span>}
                {positions.map((p, i) => {
                  const val = p.qty * p.currentPrice;
                  const posPnl = val - (p.qty * p.avgPrice);
                  return (
                    <div key={i} className="flex justify-between items-center p-2 rounded bg-black/20">
                      <span className="font-semibold">{p.qty} {p.symbol}</span>
                      <span className={posPnl >= 0 ? 'text-accent-green' : 'text-accent-red'}>${val.toFixed(2)}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-8 border-t border-bg-border pt-4">
              <h4 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2"><Activity className="h-4 w-4" /> Recent Trades</h4>
              <div className="text-xs text-text-tertiary flex flex-col gap-2 max-h-[150px] overflow-y-auto">
                {trades.length === 0 && <span>No trades yet.</span>}
                {trades.slice(0, 5).map(t => (
                  <div key={t.id} className="flex justify-between border-b border-bg-border/30 pb-1">
                    <span className={t.type === 'BUY' ? 'text-accent-green' : 'text-accent-red'}>{t.type} {t.qty} {t.symbol} @ ${t.price.toFixed(2)}</span>
                    <span>{new Date(t.time).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </motion.main>
    </div>
  );
}
