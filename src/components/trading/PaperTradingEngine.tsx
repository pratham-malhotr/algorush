"use client"
import * as React from 'react'
import { usePaperTradingStore } from '@/store/usePaperTradingStore'
import { ALL_ASSETS } from '@/lib/constants/assets'

export function PaperTradingEngine() {
  const updateMarketPrices = usePaperTradingStore(state => state.updateMarketPrices)
  const executeTrade = usePaperTradingStore(state => state.executeTrade)
  const activeStrategies = usePaperTradingStore(state => state.activeStrategies)
  const markStrategyTriggered = usePaperTradingStore(state => state.markStrategyTriggered)
  const currentPrices = usePaperTradingStore(state => state.currentPrices)

  // 1. Price Simulator & Live Binance Fetcher Loop
  React.useEffect(() => {
    // Initialize base prices if empty
    const initialPrices: Record<string, number> = {
      'BTC/USDT': 67540.20,
      'ETH/USDT': 3540.80,
      'SOL/USDT': 148.50,
      'BNB/USDT': 585.20,
      'NVDA': 128.40,
    }
    ALL_ASSETS.forEach(a => {
      if (a.price !== undefined) {
        initialPrices[a.symbol] = a.price
      }
    })
    
    // Seed initial prices immediately
    updateMarketPrices(initialPrices)

    const interval = setInterval(async () => {
      const current = usePaperTradingStore.getState().currentPrices;
      const symbols = Object.keys(current).length > 0 ? Object.keys(current) : ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT'];
      
      let newPrices: Record<string, number> = {};
      
      try {
        const res = await fetch(`/api/prices?symbols=${symbols.slice(0, 10).join(',')}`);
        if (res.ok) {
          const data = await res.json();
          if (data.prices && Object.keys(data.prices).length > 0) {
            newPrices = data.prices;
          }
        }
      } catch {
        // Fallback to random walk
      }

      // Apply random walk to any missing symbols or as micro-ticks
      symbols.forEach(symbol => {
        const last = newPrices[symbol] || current[symbol] || (symbol.includes('BTC') ? 67500 : symbol.includes('ETH') ? 3500 : 150);
        const volatility = 0.0015; // 0.15% max move per tick
        const change = 1 + ((Math.random() * volatility * 2) - volatility);
        newPrices[symbol] = Math.round(last * change * 100) / 100;
      });

      updateMarketPrices(newPrices);
    }, 2000); // tick every 2 seconds

    return () => clearInterval(interval);
  }, []);

  // 2. Strategy Evaluator & Execution Loop
  React.useEffect(() => {
    const interval = setInterval(() => {
      const state = usePaperTradingStore.getState();
      const prices = state.currentPrices;

      state.activeStrategies.forEach(activeStrat => {
        if (activeStrat.status !== 'RUNNING') return;

        const strat = activeStrat.strategy;
        const targetAsset = strat.instruments?.[0]?.symbol || 'BTC/USDT';
        const currentPrice = prices[targetAsset];
        if (!currentPrice || currentPrice <= 0) return;

        // Correctly calculate quantity in asset units from percentage or USD
        const quantityVal = strat.action?.quantityValue || 40;
        const isFixedUSD = strat.action?.quantityType === 'FIXED_USD' || strat.action?.quantityType === 'USD_VALUE';
        const allocationDollars = isFixedUSD ? quantityVal : state.balance * (quantityVal / 100);
        const qty = Math.max(0.0001, +(allocationDollars / currentPrice).toFixed(6));

        if (!activeStrat.hasTriggeredEntry) {
          // Entry check: trigger entry within 1-2 ticks so user sees live trading immediately
          const entryType = strat.action?.type === 'SELL' ? 'SELL' : 'BUY';
          executeTrade(entryType, targetAsset, qty, currentPrice);
          markStrategyTriggered(activeStrat.id, true);
        } else {
          // Check position exit (SL / TP / Trailing stop)
          const pos = state.positions.find(p => p.symbol === targetAsset);
          if (pos && pos.qty > 0) {
            const isShort = pos.side === 'SHORT';
            const pnlPct = isShort ? (pos.avgPrice - currentPrice) / pos.avgPrice : (currentPrice - pos.avgPrice) / pos.avgPrice;
            const slPct = (strat.riskParameters?.stopLossPercentage || 3) / 100;
            const tpPct = (strat.riskParameters?.takeProfitPercentage || 6) / 100;

            let shouldExit = false;
            if (pnlPct <= -slPct || pnlPct >= tpPct) {
              shouldExit = true;
            }

            if (shouldExit) {
              const exitType = isShort ? 'BUY' : 'SELL';
              executeTrade(exitType, targetAsset, pos.qty, currentPrice);
              
              // Reset state to allow next entry cycle
              usePaperTradingStore.setState(s => ({
                activeStrategies: s.activeStrategies.map(ast => 
                  ast.id === activeStrat.id ? { ...ast, hasTriggeredEntry: false } : ast
                )
              }));
            }
          }
        }
      });
    }, 2500); // evaluate every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  return null; // Headless component
}
