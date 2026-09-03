import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { StrategyDSL } from '@/lib/types/strategy'

export interface Position {
  symbol: string;
  qty: number;
  avgPrice: number;
  currentPrice: number;
  side?: 'LONG' | 'SHORT';
  unrealizedPnl?: number;
  unrealizedPnlPercent?: number;
}

export interface Trade {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  qty: number;
  price: number;
  time: string; // ISO string
}

export interface ActiveStrategy {
  id: string;
  name: string;
  strategy: StrategyDSL;
  status: 'RUNNING' | 'STOPPED';
  pnl: number;
  hasTriggeredEntry?: boolean; // simple track to prevent infinite buying
}

export interface EquityDataPoint {
  time: string; // HH:mm format for charts
  value: number;
}

interface PaperTradingState {
  balance: number;
  positions: Position[];
  trades: Trade[];
  equityHistory: EquityDataPoint[];
  activeStrategies: ActiveStrategy[];
  currentPrices: Record<string, number>;
  
  // Actions
  deployStrategy: (strategy: StrategyDSL) => void;
  executeTrade: (type: 'BUY' | 'SELL', symbol: string, qty: number, price: number) => void;
  updateMarketPrices: (prices: Record<string, number>) => void;
  markStrategyTriggered: (id: string, state: boolean) => void;
  haltAllTrading: () => void;
}

export const usePaperTradingStore = create<PaperTradingState>()(
  persist(
    (set, get) => ({
  balance: 100000, // $100k starting balance
  positions: [],
  trades: [],
  equityHistory: [{ time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), value: 100000 }],
  activeStrategies: [],
  currentPrices: {},

  deployStrategy: (strategy) => {
    set((state) => ({
      activeStrategies: [
        ...state.activeStrategies,
        {
          id: Math.random().toString(36).substring(7),
          name: strategy.name || 'Custom Strategy',
          strategy,
          status: 'RUNNING',
          pnl: 0,
          hasTriggeredEntry: false
        }
      ]
    }))
  },

  markStrategyTriggered: (id, triggeredState) => {
    set((state) => ({
      activeStrategies: state.activeStrategies.map(s => s.id === id ? { ...s, hasTriggeredEntry: triggeredState } : s)
    }))
  },

  executeTrade: (type, symbol, qty, price) => {
    set((state) => {
      let newBalance = state.balance;
      let newPositions = [...state.positions];
      const posIndex = newPositions.findIndex(p => p.symbol === symbol);

      if (type === 'BUY') {
        // If existing SHORT position, BUY covers the short
        if (posIndex >= 0 && newPositions[posIndex].side === 'SHORT') {
          const pos = newPositions[posIndex];
          const closeQty = Math.min(pos.qty, qty);
          const pnl = (pos.avgPrice - price) * closeQty;
          newBalance += (closeQty * pos.avgPrice) + pnl;
          const remainingQty = pos.qty - closeQty;
          if (remainingQty <= 0.000001) {
            newPositions.splice(posIndex, 1);
          } else {
            newPositions[posIndex] = { ...pos, qty: remainingQty, currentPrice: price };
          }
        } else {
          // Open or scale into LONG position
          const cost = qty * price;
          if (newBalance < cost) {
            if (newBalance < 10) return state;
            qty = +(newBalance / price).toFixed(6);
          }
          newBalance -= qty * price;
          if (posIndex >= 0 && newPositions[posIndex].side === 'LONG') {
            const pos = newPositions[posIndex];
            const totalCost = (pos.qty * pos.avgPrice) + (qty * price);
            const newQty = pos.qty + qty;
            newPositions[posIndex] = { ...pos, qty: newQty, avgPrice: totalCost / newQty, currentPrice: price, side: 'LONG' };
          } else {
            newPositions.push({ symbol, qty, avgPrice: price, currentPrice: price, side: 'LONG', unrealizedPnl: 0, unrealizedPnlPercent: 0 });
          }
        }
      } else if (type === 'SELL') {
        // If existing LONG position, SELL closes the long
        if (posIndex >= 0 && newPositions[posIndex].side === 'LONG') {
          const pos = newPositions[posIndex];
          const closeQty = Math.min(pos.qty, qty);
          const pnl = (price - pos.avgPrice) * closeQty;
          newBalance += (closeQty * pos.avgPrice) + pnl;
          const remainingQty = pos.qty - closeQty;
          if (remainingQty <= 0.000001) {
            newPositions.splice(posIndex, 1);
          } else {
            newPositions[posIndex] = { ...pos, qty: remainingQty, currentPrice: price };
          }
        } else {
          // Open or scale into SHORT position
          const margin = qty * price;
          if (newBalance < margin) {
            if (newBalance < 10) return state;
            qty = +(newBalance / price).toFixed(6);
          }
          newBalance -= qty * price;
          if (posIndex >= 0 && newPositions[posIndex].side === 'SHORT') {
            const pos = newPositions[posIndex];
            const totalCost = (pos.qty * pos.avgPrice) + (qty * price);
            const newQty = pos.qty + qty;
            newPositions[posIndex] = { ...pos, qty: newQty, avgPrice: totalCost / newQty, currentPrice: price, side: 'SHORT' };
          } else {
            newPositions.push({ symbol, qty, avgPrice: price, currentPrice: price, side: 'SHORT', unrealizedPnl: 0, unrealizedPnlPercent: 0 });
          }
        }
      }

      const newTrade: Trade = {
        id: Math.random().toString(36).substring(7),
        symbol,
        type,
        qty: +qty.toFixed(6),
        price: +price.toFixed(2),
        time: new Date().toISOString()
      };

      return {
        balance: Math.max(0, newBalance),
        positions: newPositions,
        trades: [newTrade, ...state.trades]
      };
    })
  },

  updateMarketPrices: (prices) => {
    set((state) => {
      // 1. Update positions with new prices and unrealized PnL
      const newPositions = state.positions.map(p => {
        const curPrice = prices[p.symbol] || p.currentPrice;
        const isShort = p.side === 'SHORT';
        const pnl = isShort ? (p.avgPrice - curPrice) * p.qty : (curPrice - p.avgPrice) * p.qty;
        const pnlPct = p.avgPrice > 0 ? (pnl / (p.avgPrice * p.qty)) * 100 : 0;
        return {
          ...p,
          currentPrice: curPrice,
          unrealizedPnl: Math.round(pnl * 100) / 100,
          unrealizedPnlPercent: Math.round(pnlPct * 100) / 100
        };
      });

      // 2. Calculate Total Equity
      const totalUnrealizedPnl = newPositions.reduce((acc, pos) => acc + (pos.unrealizedPnl || 0), 0);
      const positionsCost = newPositions.reduce((acc, pos) => acc + (pos.qty * pos.avgPrice), 0);
      const totalEquity = state.balance + positionsCost + totalUnrealizedPnl;

      // 3. Update Active Strategies PnL
      const newActiveStrategies = state.activeStrategies.map(s => {
        const symbol = s.strategy.instruments?.[0]?.symbol || 'BTC/USDT';
        const pos = newPositions.find(p => p.symbol === symbol);
        return {
          ...s,
          pnl: pos ? pos.unrealizedPnl || 0 : s.pnl || 0
        };
      });

      // 4. Update Equity History
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      let newHistory = [...state.equityHistory];
      const roundedEquity = Math.round(totalEquity * 100) / 100;
      
      newHistory.push({ time: nowStr, value: roundedEquity });
      if (newHistory.length > 60) newHistory.shift();

      return {
        currentPrices: { ...state.currentPrices, ...prices },
        positions: newPositions,
        activeStrategies: newActiveStrategies,
        equityHistory: newHistory
      };
    })
  },
  
  haltAllTrading: () => {
    set((state) => {
      let newBalance = state.balance;
      const newTrades = [...state.trades];
      
      // Close all open positions at current prices
      state.positions.forEach(pos => {
        const cost = pos.qty * pos.currentPrice;
        newBalance += cost;
        
        newTrades.unshift({
          id: Math.random().toString(36).substring(7),
          symbol: pos.symbol,
          type: 'SELL',
          qty: pos.qty,
          price: pos.currentPrice,
          time: new Date().toISOString()
        });
      });

      // Stop all active strategies
      const newStrategies = state.activeStrategies.map(s => ({
        ...s,
        status: 'STOPPED' as const
      }));

      return {
        balance: newBalance,
        positions: [],
        trades: newTrades,
        activeStrategies: newStrategies
      };
    });
  }
}),
    {
      name: 'algotext-paper-trading',
      partialize: (state) => ({
        balance: state.balance,
        positions: state.positions,
        trades: state.trades,
        equityHistory: state.equityHistory,
        activeStrategies: state.activeStrategies,
        currentPrices: state.currentPrices,
      }),
    }
  )
)
