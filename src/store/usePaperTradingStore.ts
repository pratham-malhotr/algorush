import { create } from 'zustand'
import { StrategyDSL } from '@/lib/types/strategy'

export interface Position {
  symbol: string;
  qty: number;
  avgPrice: number;
  currentPrice: number;
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
}

export const usePaperTradingStore = create<PaperTradingState>((set, get) => ({
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
      const cost = qty * price;
      let newBalance = state.balance;
      let newPositions = [...state.positions];
      
      const posIndex = newPositions.findIndex(p => p.symbol === symbol);

      if (type === 'BUY') {
        if (newBalance < cost) return state; // Insufficient funds
        newBalance -= cost;
        if (posIndex >= 0) {
          // average up/down
          const pos = newPositions[posIndex];
          const totalCost = (pos.qty * pos.avgPrice) + cost;
          const newQty = pos.qty + qty;
          newPositions[posIndex] = { ...pos, qty: newQty, avgPrice: totalCost / newQty, currentPrice: price };
        } else {
          newPositions.push({ symbol, qty, avgPrice: price, currentPrice: price });
        }
      } else if (type === 'SELL') {
        if (posIndex < 0 || newPositions[posIndex].qty < qty) return state; // Can't short sell for now, or insufficient qty
        newBalance += cost;
        const pos = newPositions[posIndex];
        const newQty = pos.qty - qty;
        if (newQty === 0) {
          newPositions.splice(posIndex, 1);
        } else {
          newPositions[posIndex] = { ...pos, qty: newQty, currentPrice: price };
        }
      }

      const newTrade: Trade = {
        id: Math.random().toString(36).substring(7),
        symbol,
        type,
        qty,
        price,
        time: new Date().toISOString()
      };

      return {
        balance: newBalance,
        positions: newPositions,
        trades: [newTrade, ...state.trades]
      };
    })
  },

  updateMarketPrices: (prices) => {
    set((state) => {
      // 1. Update positions with new prices
      const newPositions = state.positions.map(p => ({
        ...p,
        currentPrice: prices[p.symbol] || p.currentPrice
      }));

      // 2. Calculate Total Equity (Balance + Sum(Qty * CurrentPrice))
      const positionsValue = newPositions.reduce((acc, pos) => acc + (pos.qty * pos.currentPrice), 0);
      const totalEquity = state.balance + positionsValue;

      // 3. Update Equity History
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      let newHistory = [...state.equityHistory];
      const lastPoint = newHistory[newHistory.length - 1];
      
      if (lastPoint && lastPoint.time === nowStr) {
        // Update current minute immutably
        newHistory[newHistory.length - 1] = { ...lastPoint, value: totalEquity };
      } else {
        newHistory.push({ time: nowStr, value: totalEquity });
        if (newHistory.length > 50) newHistory.shift(); // Keep last 50 points
      }

      return {
        currentPrices: { ...state.currentPrices, ...prices },
        positions: newPositions,
        equityHistory: newHistory
      };
    })
  }
}))
