"use client"
import * as React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { usePaperTradingStore } from '@/store/usePaperTradingStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, ShieldAlert, Zap, TrendingUp, Settings, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// Simple indicator evaluator for live paper trading
function evaluateLiveCondition(cond: any, price: number, prevPrice: number, indicators: Record<string, number>): boolean {
  if (!cond || !cond.left) return false;
  
  // Get left value based on indicator type
  let leftVal = price;
  const lt = cond.left.type;
  if (lt === 'RSI') leftVal = indicators.rsi ?? 50;
  else if (lt === 'EMA' || lt === 'SMA') {
    const period = cond.left.parameters?.period || 14;
    // Approximate MA with price offset: shorter period tracks closer to price
    leftVal = price * (1 + (period > 100 ? -0.004 : period > 50 ? -0.001 : 0.002));
  }
  else if (lt === 'PRICE') leftVal = price;
  else if (lt === 'VOLUME') leftVal = indicators.volume ?? 500000;
  else if (lt === 'MACD') leftVal = indicators.macd ?? 0;
  else if (lt === 'MACD_HISTOGRAM') leftVal = indicators.macdHist ?? 0;
  else if (lt === 'ATR') leftVal = indicators.atr ?? (price * 0.015);
  else if (lt === 'ADX') leftVal = indicators.adx ?? 25;
  else if (lt === 'STOCHASTIC_K') leftVal = indicators.stochK ?? 50;
  else if (lt === 'STOCHASTIC_D') leftVal = indicators.stochD ?? 50;
  else if (lt === 'CCI') leftVal = indicators.cci ?? 0;
  else if (lt === 'WILLIAMS_R') leftVal = indicators.williamsR ?? -50;
  else if (lt === 'OBV') leftVal = indicators.obv ?? 0;
  else if (lt === 'ICHIMOKU_TENKAN') leftVal = price * 1.001;
  else if (lt === 'ICHIMOKU_KIJUN') leftVal = price * 0.998;
  else if (lt === 'SUPERTREND') leftVal = price * 0.985;
  else if (lt === 'BOLLINGER_UPPER') leftVal = price * 1.03;
  else if (lt === 'BOLLINGER_LOWER') leftVal = price * 0.97;
  
  // Get right value
  let rightVal = 0;
  if (typeof cond.right === 'number') {
    rightVal = cond.right;
  } else if (typeof cond.right === 'string') {
    rightVal = parseFloat(cond.right) || 0;
  } else if (typeof cond.right === 'object' && cond.right !== null && cond.right.type) {
    const rt = cond.right.type;
    if (rt === 'EMA' || rt === 'SMA') {
      const rPeriod = cond.right.parameters?.period || 200;
      rightVal = price * (1 + (rPeriod > 100 ? -0.006 : rPeriod > 50 ? -0.002 : 0.001));
    } else if (rt === 'MACD_SIGNAL') rightVal = indicators.macdSignal ?? 0;
    else if (rt === 'BOLLINGER_LOWER') rightVal = price * 0.97;
    else if (rt === 'BOLLINGER_UPPER') rightVal = price * 1.03;
    else if (rt === 'SUPERTREND') rightVal = price * 0.985;
    else if (rt === 'VOLUME_SMA') rightVal = (indicators.volume ?? 500000) * 0.85;
    else if (rt === 'STOCHASTIC_D') rightVal = indicators.stochD ?? 50;
    else if (rt === 'ICHIMOKU_KIJUN') rightVal = price * 0.998;
    else if (rt === 'ICHIMOKU_TENKAN') rightVal = price * 1.001;
    else rightVal = price;
  }
  
  switch (cond.comparator) {
    case 'GREATER_THAN': return leftVal > rightVal;
    case 'LESS_THAN': return leftVal < rightVal;
    case 'EQUAL': return Math.abs(leftVal - rightVal) < 0.001;
    case 'CROSSES_ABOVE': return leftVal > rightVal && prevPrice <= rightVal * (price / leftVal || 1);
    case 'CROSSES_BELOW': return leftVal < rightVal && prevPrice >= rightVal * (price / leftVal || 1);
    default: return false;
  }
}

function evaluateConditionsGroup(conds: any[], price: number, prevPrice: number, indicators: Record<string, number>): boolean {
  if (!conds || conds.length === 0) return false;
  
  let result = evaluateLiveCondition(conds[0], price, prevPrice, indicators);
  for (let i = 1; i < conds.length; i++) {
    const prevOp = conds[i - 1].logicalOperator || 'AND';
    const condResult = evaluateLiveCondition(conds[i], price, prevPrice, indicators);
    if (prevOp === 'OR') result = result || condResult;
    else result = result && condResult;
  }
  return result;
}

// Simulated RSI state tracker for more realistic behavior
function simulateIndicators(price: number, prevPrice: number, tickCount: number): Record<string, number> {
  const pctChange = prevPrice > 0 ? (price - prevPrice) / prevPrice : 0;
  
  // RSI: tends toward 50 with momentum shifts
  const rsiBase = 50 + pctChange * 800; // amplify small price changes
  const rsi = Math.max(10, Math.min(90, rsiBase + (Math.random() - 0.5) * 15));
  
  // MACD: oscillates based on price momentum
  const macd = pctChange * 100 + (Math.random() - 0.48) * 0.5;
  const macdSignal = macd * 0.7 + (Math.random() - 0.5) * 0.3;
  const macdHist = macd - macdSignal;
  
  // Stochastic: momentum oscillator 0-100
  const stochK = Math.max(0, Math.min(100, 50 + pctChange * 1200 + (Math.random() - 0.5) * 20));
  const stochD = stochK * 0.8 + 10 + (Math.random() - 0.5) * 5;
  
  // ADX: trend strength 0-100
  const adx = 15 + Math.abs(pctChange) * 2000 + Math.random() * 15;
  
  // CCI: centered around 0
  const cci = pctChange * 5000 + (Math.random() - 0.5) * 50;
  
  // Williams %R: -100 to 0
  const williamsR = -50 + pctChange * 600 + (Math.random() - 0.5) * 25;
  
  // Volume (randomized realistic range)
  const volume = 300000 + Math.random() * 700000;
  
  // ATR
  const atr = price * (0.01 + Math.random() * 0.01);
  
  // OBV (cumulative, based on direction)
  const obv = pctChange > 0 ? volume : -volume;
  
  return { rsi, macd, macdSignal, macdHist, stochK, stochD, adx, cci, williamsR, volume, atr, obv };
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { balance, equityHistory, activeStrategies, trades, positions, currentPrices, haltAllTrading, executeTrade, updateMarketPrices, markStrategyTriggered } = usePaperTradingStore();

  const totalEquity = equityHistory.length > 0 ? equityHistory[equityHistory.length - 1].value : balance;
  const pnl = totalEquity - 100000;
  const pnlPercent = (pnl / 100000) * 100;

  // --- Live Strategy Execution Engine with REAL Binance Prices ---
  const prevPricesRef = React.useRef<Record<string, number>>({});
  const tickCountRef = React.useRef(0);
  const cooldownRef = React.useRef<Record<string, number>>({}); // strategy id → ticks until re-entry
  const priceSourceRef = React.useRef<string>('connecting');
  const [priceSource, setPriceSource] = React.useState('connecting');
  
  React.useEffect(() => {
    const interval = setInterval(async () => {
      const runningStrategies = usePaperTradingStore.getState().activeStrategies.filter(s => s.status === 'RUNNING');
      if (runningStrategies.length === 0) return;
      
      tickCountRef.current++;
      
      // Collect all unique symbols from running strategies
      const symbols = [...new Set(runningStrategies.map(s => s.strategy.instruments?.[0]?.symbol || 'BTC/USDT'))];
      
      // Fetch REAL prices from Binance via our API route
      let newPrices: Record<string, number> = {};
      let source = 'binance_live';
      
      try {
        const res = await fetch(`/api/prices?symbols=${symbols.join(',')}`);
        if (res.ok) {
          const data = await res.json();
          newPrices = data.prices || {};
          source = data.source || 'binance_live';
        } else {
          throw new Error('API error');
        }
      } catch {
        // Fallback: use last known prices with small random walk
        source = 'offline_fallback';
        const lastPrices = usePaperTradingStore.getState().currentPrices;
        symbols.forEach(symbol => {
          const last = lastPrices[symbol] || 
            (symbol.includes('BTC') ? 67500 : symbol.includes('ETH') ? 3500 : symbol.includes('SOL') ? 145 : 100);
          const change = last * (Math.random() - 0.5) * 0.002;
          newPrices[symbol] = Math.max(1, last + change);
        });
      }
      
      if (priceSourceRef.current !== source) {
        priceSourceRef.current = source;
        setPriceSource(source);
      }
      
      const prevPrices = prevPricesRef.current;
      updateMarketPrices(newPrices);
      
      // Process cooldowns
      for (const id in cooldownRef.current) {
        if (cooldownRef.current[id] > 0) cooldownRef.current[id]--;
      }
      
      // Evaluate each strategy against real market data
      runningStrategies.forEach(strat => {
        const symbol = strat.strategy.instruments?.[0]?.symbol || 'BTC/USDT';
        const price = newPrices[symbol] || 67500;
        const prevPrice = prevPrices[symbol] || price;
        
        // Generate simulated indicators based on real price movement
        const indicators = simulateIndicators(price, prevPrice, tickCountRef.current);
        
        const entryConds = strat.strategy.entryConditions || [];
        const exitConds = strat.strategy.exitConditions || [];
        
        // Check cooldown for re-entry
        if (cooldownRef.current[strat.id] && cooldownRef.current[strat.id] > 0) return;
        
        if (!strat.hasTriggeredEntry) {
          // Check entry conditions
          const shouldEnter = evaluateConditionsGroup(entryConds, price, prevPrice, indicators);
          if (shouldEnter) {
            const quantityValue = strat.strategy.action?.quantityValue || 50;
            const currentBalance = usePaperTradingStore.getState().balance;
            const allocationDollars = currentBalance * (quantityValue / 100);
            const qty = allocationDollars / price;
            
            if (qty > 0 && allocationDollars >= 10) {
              const actionType = strat.strategy.action?.type || 'BUY';
              if (actionType === 'BUY' || actionType === 'REBALANCE') {
                executeTrade('BUY', symbol, +qty.toFixed(6), +price.toFixed(2));
                markStrategyTriggered(strat.id, true);
                toast.success(`📈 ${strat.name}: BUY ${qty.toFixed(4)} ${symbol} @ $${price.toFixed(2)} [${source === 'binance_live' ? 'LIVE' : 'SIM'}]`);
              } else if (actionType === 'SELL') {
                executeTrade('SELL', symbol, +qty.toFixed(6), +price.toFixed(2));
                markStrategyTriggered(strat.id, true);
                toast.success(`📉 ${strat.name}: SELL ${qty.toFixed(4)} ${symbol} @ $${price.toFixed(2)} [${source === 'binance_live' ? 'LIVE' : 'SIM'}]`);
              }
            }
          }
        } else {
          // Check exit conditions (SL/TP/signal)
          const pos = usePaperTradingStore.getState().positions.find(p => p.symbol === symbol);
          if (pos) {
            const slPct = (strat.strategy.riskParameters?.stopLossPercentage || 3) / 100;
            const tpPct = (strat.strategy.riskParameters?.takeProfitPercentage || 6) / 100;
            const unrealizedPnlPct = (price - pos.avgPrice) / pos.avgPrice;
            
            let shouldExit = false;
            let reason = '';
            
            if (unrealizedPnlPct <= -slPct) {
              shouldExit = true;
              reason = `Stop Loss (-${(slPct * 100).toFixed(1)}%)`;
            }
            else if (unrealizedPnlPct >= tpPct) {
              shouldExit = true;
              reason = `Take Profit (+${(tpPct * 100).toFixed(1)}%)`;
            }
            else if (exitConds.length > 0 && evaluateConditionsGroup(exitConds, price, prevPrice, indicators)) {
              shouldExit = true;
              reason = 'Exit Signal';
            }
            
            if (shouldExit && pos.qty > 0) {
              executeTrade('SELL', symbol, pos.qty, +price.toFixed(2));
              markStrategyTriggered(strat.id, false);
              // Set cooldown: 5 ticks (≈15s) before re-entry
              cooldownRef.current[strat.id] = 5;
              const pnlAmount = (price - pos.avgPrice) * pos.qty;
              toast.info(`🔔 ${strat.name}: CLOSED @ $${price.toFixed(2)} (${reason}) — PnL: ${pnlAmount >= 0 ? '+' : ''}$${pnlAmount.toFixed(2)}`);
            }
          } else {
            markStrategyTriggered(strat.id, false);
          }
        }
      });
      
      prevPricesRef.current = { ...newPrices };
    }, 3000); // Tick every 3 seconds
    
    return () => clearInterval(interval);
  }, [executeTrade, updateMarketPrices, markStrategyTriggered]);

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
            <div className="flex items-center justify-between text-sm text-text-secondary mb-1">
              <span>Total Account Value</span>
              <span className="flex items-center gap-1 text-[10.5px] font-bold text-accent-green uppercase">
                <span className="h-2 w-2 rounded-full bg-accent-green animate-ping" />
                Live Ticks
              </span>
            </div>
            <div className="text-3xl font-mono font-bold text-text-primary transition-all duration-300">
              ${totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`text-sm mt-2 flex items-center gap-1 font-mono font-bold ${pnl >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
              <TrendingUp className="h-4 w-4"/> {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} ({pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
            </div>
          </div>
          <div className="bg-bg-surface border border-bg-border p-6 rounded-xl hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all">
            <div className="text-sm text-text-secondary mb-1">Active Strategies</div>
            <div className="text-3xl font-mono font-bold">{activeStrategies.filter(s => s.status === 'RUNNING').length}</div>
            <div className="text-sm text-text-tertiary mt-2">Running Live Sandbox</div>
          </div>
          <div className="bg-bg-surface border border-bg-border p-6 rounded-xl hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all">
            <div className="text-sm text-text-secondary mb-1">Open Positions</div>
            <div className="text-3xl font-mono font-bold">{positions.length}</div>
            <div className="text-sm text-text-tertiary mt-2">Available Cash: ${balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
          </div>
          <div className="bg-bg-surface border border-bg-border p-6 rounded-xl flex flex-col justify-center items-start hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all">
            <button 
              className="flex items-center gap-2 text-accent-red font-bold hover:bg-accent-red/10 px-4 py-2 rounded-lg border border-accent-red/30 transition-colors w-full justify-center"
              onClick={async () => {
                try {
                  await fetch('/api/kill-switch', {
                    method: 'POST',
                    headers: { 
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer at_admin_master_secret'
                    },
                    body: JSON.stringify({ reason: 'Manual Emergency Stop' })
                  });
                  haltAllTrading();
                  toast.error('🛑 EMERGENCY STOP ACTIVATED. All positions liquidated and strategies stopped.');
                } catch {
                  haltAllTrading();
                  toast.error('Emergency stop executed locally.');
                }
              }}
            >
              <ShieldAlert className="h-4 w-4" />
              EMERGENCY STOP (KILL)
            </button>
            <div className="text-xs text-text-tertiary mt-2 w-full text-center">Instantly closes all active positions</div>
          </div>
        </div>

        {/* Live Charts & Strategy Feeds */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 bg-bg-surface border border-bg-border rounded-xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Live Equity Curve (Paper Trading Sandbox)</h3>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-accent-green animate-pulse" />
                <span className="text-xs font-mono text-text-secondary">Updates every 2s</span>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
                <LineChart data={equityHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-bg-border)" vertical={false} />
                  <XAxis dataKey="time" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} domain={['auto', 'auto']} tickFormatter={(v) => `$${v.toLocaleString()}`}/>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-bg-border)' }} />
                  <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-bg-surface border border-bg-border rounded-xl p-6 flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <h3 className="font-bold text-lg mb-6 flex items-center justify-between">
              Active Strategies
              <Link href="/builder" className="text-sm text-accent-blue font-normal hover:underline">Create New</Link>
            </h3>
            
            <div className="flex flex-col gap-3 flex-1">
              {activeStrategies.length === 0 && <div className="text-sm text-text-tertiary">No active strategies.</div>}
              {activeStrategies.map((strat) => {
                const sym = strat.strategy.instruments?.[0]?.symbol || 'BTC/USDT';
                const livePrice = currentPrices[sym];
                const stratPnl = strat.pnl || 0;
                return (
                <div key={strat.id} className="p-3.5 border border-bg-border rounded-xl flex items-center justify-between hover:border-accent-blue/50 transition-all bg-bg-base/40">
                  <div>
                    <div className="font-semibold text-sm flex items-center gap-1.5">
                      <span>{strat.name}</span>
                      <span className="text-[11px] font-mono text-text-secondary">({sym})</span>
                    </div>
                    <div className={`text-xs mt-1 flex items-center gap-2 ${strat.status === 'RUNNING' ? 'text-accent-green' : 'text-text-tertiary'}`}>
                      <span className="font-semibold">{strat.status}</span>
                      <span>•</span>
                      <span>{strat.hasTriggeredEntry ? '🟢 In Position' : '🟡 Scanning Signals'}</span>
                    </div>
                    {livePrice && (
                      <div className="text-xs mt-1.5 text-text-secondary flex items-center gap-2 font-mono">
                        <span className="font-bold">${livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${stratPnl >= 0 ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'}`}>
                          {stratPnl >= 0 ? '+' : ''}${stratPnl.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                  <Settings className="h-4 w-4 text-text-secondary hover:text-text-primary cursor-pointer transition-colors" />
                </div>
                );
              })}
            </div>

            <div className="mt-6 border-t border-bg-border pt-4">
              <h4 className="text-sm font-semibold text-text-secondary mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> Open Positions ({positions.length})</span>
              </h4>
              <div className="text-xs flex flex-col gap-2 max-h-[140px] overflow-y-auto">
                {positions.length === 0 && <span className="text-text-tertiary">No open positions currently.</span>}
                {positions.map((p, i) => {
                  const isShort = p.side === 'SHORT';
                  const val = p.qty * p.currentPrice;
                  const posPnl = p.unrealizedPnl !== undefined ? p.unrealizedPnl : (isShort ? (p.avgPrice - p.currentPrice) * p.qty : val - (p.qty * p.avgPrice));
                  const pnlPct = p.avgPrice > 0 ? (posPnl / (p.qty * p.avgPrice)) * 100 : 0;
                  return (
                    <div key={i} className="flex justify-between items-center p-2.5 rounded-lg border border-bg-border bg-bg-base/60 font-mono">
                      <div className="flex flex-col">
                        <div className="font-bold flex items-center gap-1.5 text-[12px]">
                          <span className={`px-1 rounded text-[9.5px] font-bold ${isShort ? 'bg-accent-red/15 text-accent-red' : 'bg-accent-green/15 text-accent-green'}`}>
                            {isShort ? 'SHORT' : 'LONG'}
                          </span>
                          <span>{p.qty} {p.symbol}</span>
                        </div>
                        <span className="text-[10.5px] text-text-tertiary mt-0.5">Entry: ${p.avgPrice.toFixed(2)} → Now: ${p.currentPrice.toFixed(2)}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${val.toFixed(2)}</div>
                        <div className={`text-[11px] font-bold ${posPnl >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                          {posPnl >= 0 ? '+' : ''}${posPnl.toFixed(2)} ({posPnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-6 border-t border-bg-border pt-4">
              <h4 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2"><Activity className="h-4 w-4" /> Live Execution Stream</h4>
              <div className="text-xs text-text-tertiary flex flex-col gap-2 max-h-[140px] overflow-y-auto">
                {trades.length === 0 && <span>No trades executed yet.</span>}
                {trades.slice(0, 5).map(t => (
                  <div key={t.id} className="flex justify-between items-center border-b border-bg-border/30 pb-1.5 font-mono">
                    <span className={`font-bold flex items-center gap-1 ${t.type === 'BUY' ? 'text-accent-green' : 'text-accent-red'}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {t.type} {t.qty} {t.symbol} @ ${t.price.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-text-tertiary">{new Date(t.time).toLocaleTimeString()}</span>
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
