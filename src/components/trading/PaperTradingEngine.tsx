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

  // 1. Price Simulator Loop
  React.useEffect(() => {
    // Initialize base prices if empty
    const initialPrices: Record<string, number> = {}
    ALL_ASSETS.forEach(a => {
      if (a.price !== undefined) {
        initialPrices[a.symbol] = a.price
      }
    })
    
    // Seed initial prices immediately
    updateMarketPrices(initialPrices)

    const interval = setInterval(() => {
      // Simulate live market ticks (random walk)
      const current = usePaperTradingStore.getState().currentPrices;
      const newPrices: Record<string, number> = {};
      
      Object.keys(current).forEach(symbol => {
        const volatility = 0.002; // max 0.2% movement per tick
        const change = 1 + ((Math.random() * volatility * 2) - volatility);
        newPrices[symbol] = current[symbol] * change;
      });

      updateMarketPrices(newPrices);
    }, 3000); // tick every 3 seconds

    return () => clearInterval(interval);
  }, []); // Run once on mount

  // 2. Strategy Evaluator Loop
  React.useEffect(() => {
    const interval = setInterval(() => {
      const state = usePaperTradingStore.getState();
      const prices = state.currentPrices;

      state.activeStrategies.forEach(activeStrat => {
        if (activeStrat.status !== 'RUNNING') return;

        const strat = activeStrat.strategy;
        const targetAsset = strat.instruments?.[0]?.symbol || 'BTC/USDT';
        const currentPrice = prices[targetAsset];
        if (!currentPrice) return;

        const qty = strat.action?.quantityValue || 1;

        // Simple mock evaluator for MVP
        // In a real system, we'd use a robust AST evaluator traversing the condition tree.
        if (!activeStrat.hasTriggeredEntry) {
          // Check Entry (e.g. MARKET_EVENT == TODAY)
          const entryCond = strat.entryConditions?.[0];
          let shouldEnter = true; // default true for MVP if no condition
          
          if (entryCond) {
             // For the demo: if it asks for TODAY or OPEN, just trigger it immediately to see it work!
             if (entryCond.right === 'TODAY' || entryCond.right === 'OPEN') {
               shouldEnter = true;
             } else {
               // Mock chance for other technical indicators
               shouldEnter = Math.random() > 0.8; 
             }
          }

          if (shouldEnter) {
            const entryType = strat.action?.type === 'SELL' || strat.action?.type === 'CLOSE_POSITION' ? 'SELL' : 'BUY';
            executeTrade(entryType, targetAsset, qty, currentPrice);
            markStrategyTriggered(activeStrat.id, true);
          }
        } else {
          // Has triggered entry, check exit
          const exitCond = strat.exitConditions?.[0];
          let shouldExit = false;

          if (exitCond) {
             // For the demo: if exit says MONDAY, simulate it hitting the condition randomly
             // so the user sees the full loop complete within a few minutes.
             shouldExit = Math.random() > 0.95; 
          }

          if (shouldExit) {
            // Reverse the action type (if entry was BUY, exit is SELL)
            const entryType = strat.action?.type === 'SELL' || strat.action?.type === 'CLOSE_POSITION' ? 'SELL' : 'BUY';
            const exitType = entryType === 'BUY' ? 'SELL' : 'BUY';
            executeTrade(exitType, targetAsset, qty, currentPrice);
            
            // Reset state to look for the next entry
            usePaperTradingStore.setState(s => ({
              activeStrategies: s.activeStrategies.map(ast => 
                ast.id === activeStrat.id ? { ...ast, hasTriggeredEntry: false } : ast
              )
            }));
          }
        }

      });
    }, 3000); // eval every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return null; // Headless component
}
