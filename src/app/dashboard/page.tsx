"use client"
import * as React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, ShieldAlert, Zap, TrendingUp, Settings } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const portfolioData = [
  { time: '09:30', value: 25000 },
  { time: '10:00', value: 25120 },
  { time: '11:00', value: 25400 },
  { time: '12:00', value: 25300 },
  { time: '13:00', value: 25800 },
  { time: '14:00', value: 26100 },
  { time: '15:00', value: 25950 },
  { time: '16:00', value: 26250 },
];

export default function DashboardPage() {
  const { user } = useAuthStore();

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
            <div className="text-3xl font-mono font-bold">$26,250.00</div>
            <div className="text-sm text-accent-green mt-2 flex items-center gap-1"><TrendingUp className="h-4 w-4"/> +5.0% Today</div>
          </div>
          <div className="bg-bg-surface border border-bg-border p-6 rounded-xl hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all">
            <div className="text-sm text-text-secondary mb-1">Active Strategies</div>
            <div className="text-3xl font-mono font-bold">2 / 10</div>
            <div className="text-sm text-text-tertiary mt-2">Using Pro Plan</div>
          </div>
          <div className="bg-bg-surface border border-bg-border p-6 rounded-xl hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all">
            <div className="text-sm text-text-secondary mb-1">Total Exposure</div>
            <div className="text-3xl font-mono font-bold">14.5%</div>
            <div className="text-sm text-text-tertiary mt-2">Well below 50% cap</div>
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
                <LineChart data={portfolioData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-bg-border)" vertical={false} />
                  <XAxis dataKey="time" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 1000', 'dataMax + 1000']} tickFormatter={(v) => `$${v/1000}k`}/>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-bg-border)' }} />
                  <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} dot={false} />
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
              {['RSI Mean Reversion (AAPL)', 'MACD Trend Follow (BTC)'].map((strat, i) => (
                <div key={strat} className="p-4 border border-bg-border rounded-lg flex items-center justify-between hover:border-accent-blue/50 cursor-pointer transition-colors">
                  <div>
                    <div className="font-semibold text-sm">{strat}</div>
                    <div className="text-xs text-accent-green mt-1">Live • +${(Math.random() * 500).toFixed(2)} P&L</div>
                  </div>
                  <Settings className="h-4 w-4 text-text-secondary" />
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-bg-border pt-4">
              <h4 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2"><Activity className="h-4 w-4" /> Recent Trades</h4>
              <div className="text-xs text-text-tertiary flex flex-col gap-2">
                <div className="flex justify-between"><span>Buy 50 AAPL @ $150.23</span><span>10:42 AM</span></div>
                <div className="flex justify-between"><span>Sell 200 TSLA @ $202.10</span><span>09:35 AM</span></div>
              </div>
            </div>

          </div>
        </div>
      </motion.main>
    </div>
  );
}
