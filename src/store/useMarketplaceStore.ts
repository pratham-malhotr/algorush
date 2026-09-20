// @ts-nocheck
import { create } from 'zustand';
import { StrategyDSL } from '@/lib/types/strategy';

export interface CreatorProfile {
  id: string;
  name: string;
  username: string;
  followers: number;
  aum: string; // Assets under management tracking them
  verified: boolean;
}

export interface PublishedStrategy {
  id: string;
  creatorId: string;
  name: string;
  description: string;
  category: 'Crypto' | 'Equities' | 'Forex' | 'Multi-Asset';
  price: number; // 0 means free
  metrics: {
    sharpe: number;
    maxDrawdown: number;
    monthlyReturn: number;
    liveDays: number;
  };
  strategyDSL: StrategyDSL;
  clones: number;
}

interface MarketplaceState {
  creators: Record<string, CreatorProfile>;
  strategies: PublishedStrategy[];
  getStrategy: (id: string) => PublishedStrategy | undefined;
  getCreator: (id: string) => CreatorProfile | undefined;
  getStrategiesByCreator: (creatorId: string) => PublishedStrategy[];
}

// Mock Data
const mockCreators: Record<string, CreatorProfile> = {
  'c_1': { id: 'c_1', name: 'QuantWizard', username: '@quantwizard', followers: 14200, aum: '$4.2M', verified: true },
  'c_2': { id: 'c_2', name: 'AlphaSeeker', username: '@alphaseeker', followers: 850, aum: '$120K', verified: false },
  'c_3': { id: 'c_3', name: 'Satoshi Trader', username: '@satoshi_trader', followers: 3200, aum: '$480K', verified: true },
  'c_4': { id: 'c_4', name: 'Yield Degen', username: '@yield_degen', followers: 1420, aum: '$210K', verified: false }
};

const mockStrategies: PublishedStrategy[] = [
  {
    id: 's_1',
    creatorId: 'c_1',
    name: 'Bitcoin Mean Reversion Pro',
    description: 'A robust mean reversion strategy running on the 1H timeframe for BTC. Capitalizes on short-term oversold conditions during bull markets.',
    category: 'Crypto',
    price: 49, // $49 one-time unlock
    metrics: { sharpe: 2.1, maxDrawdown: 12.4, monthlyReturn: 4.5, liveDays: 142 },
    clones: 843,
    strategyDSL: {
      assets: ['BTC'],
      indicators: [
        { name: 'RSI', timeframe: '1h', parameters: { length: 14 } },
        { name: 'SMA', timeframe: '1h', parameters: { length: 200 } }
      ],
      rules: {
        entry: [
          { indicator: 'RSI', operator: 'crosses_below', value: 30 },
          { indicator: 'Close', operator: 'greater_than', value: 'SMA_200' }
        ],
        exit: [
          { indicator: 'RSI', operator: 'crosses_above', value: 70 }
        ]
      },
      riskParameters: { stopLossPercentage: 5, takeProfitPercentage: 15, maxPositionSizeUSD: 1000 }
    }
  },
  {
    id: 's_2',
    creatorId: 'c_2',
    name: 'Tech Sector Momentum',
    description: 'Follows strong momentum in BTC and ETH using MACD crossovers.',
    category: 'Crypto',
    price: 0, // Free
    metrics: { sharpe: 1.4, maxDrawdown: 18.2, monthlyReturn: 2.1, liveDays: 45 },
    clones: 120,
    strategyDSL: {
      assets: ['BTC', 'ETH'],
      indicators: [{ name: 'MACD', timeframe: '1d', parameters: { fast: 12, slow: 26, signal: 9 } }],
      rules: {
        entry: [{ indicator: 'MACD_Line', operator: 'crosses_above', value: 'MACD_Signal' }],
        exit: [{ indicator: 'MACD_Line', operator: 'crosses_below', value: 'MACD_Signal' }]
      },
      riskParameters: { stopLossPercentage: 10, takeProfitPercentage: 20 }
    }
  },
  {
    id: 's_3',
    creatorId: 'c_3',
    name: 'Solana High-Volatility Breakout',
    description: 'Community-crafted momentum breakout for SOL/USDT using Bollinger Upper bands and high volume spikes.',
    category: 'Crypto',
    price: 0, // Free
    metrics: { sharpe: 1.85, maxDrawdown: 14.8, monthlyReturn: 6.2, liveDays: 89 },
    clones: 512,
    strategyDSL: {
      assets: ['SOL'],
      indicators: [
        { name: 'BOLLINGER_UPPER', timeframe: '15m', parameters: { period: 20, multiplier: 2.0 } },
        { name: 'RSI', timeframe: '15m', parameters: { period: 14 } }
      ],
      rules: {
        entry: [
          { indicator: 'Close', operator: 'crosses_above', value: 'BOLLINGER_UPPER' },
          { indicator: 'RSI', operator: 'greater_than', value: 55 }
        ],
        exit: [
          { indicator: 'Close', operator: 'crosses_below', value: 'EMA_20' }
        ]
      },
      riskParameters: { stopLossPercentage: 3.0, takeProfitPercentage: 8.0, leverage: 4 }
    }
  },
  {
    id: 's_4',
    creatorId: 'c_2',
    name: 'Ethereum Donchian Trend Rider',
    description: 'Community turtle trading adaptation for ETH on 1H timeframe with trailing stop risk protection.',
    category: 'Crypto',
    price: 29,
    metrics: { sharpe: 1.95, maxDrawdown: 11.2, monthlyReturn: 5.1, liveDays: 110 },
    clones: 340,
    strategyDSL: {
      assets: ['ETH'],
      indicators: [
        { name: 'DONCHIAN_HIGH', timeframe: '1h', parameters: { period: 20 } }
      ],
      rules: {
        entry: [
          { indicator: 'Close', operator: 'crosses_above', value: 'DONCHIAN_HIGH' }
        ],
        exit: [
          { indicator: 'Close', operator: 'crosses_below', value: 'SMA_20' }
        ]
      },
      riskParameters: { stopLossPercentage: 2.5, takeProfitPercentage: 7.5, trailingStopPercentage: 1.5, leverage: 3 }
    }
  },
  {
    id: 's_5',
    creatorId: 'c_4',
    name: 'DeFi Funding Arbitrage Harvester',
    description: 'Community yield harvester that collects perpetual futures funding premiums while hedging delta.',
    category: 'Crypto',
    price: 0,
    metrics: { sharpe: 2.45, maxDrawdown: 4.2, monthlyReturn: 3.8, liveDays: 165 },
    clones: 920,
    strategyDSL: {
      assets: ['BTC', 'USDT'],
      indicators: [
        { name: 'FUNDING_RATE', timeframe: '8h' }
      ],
      rules: {
        entry: [
          { indicator: 'FUNDING_RATE', operator: 'greater_than', value: 0.0003 }
        ],
        exit: [
          { indicator: 'FUNDING_RATE', operator: 'less_than', value: 0.00005 }
        ]
      },
      riskParameters: { stopLossPercentage: 1.5, takeProfitPercentage: 6.0, leverage: 2 }
    }
  }
];

export const useMarketplaceStore = create<MarketplaceState>((set, get) => ({
  creators: mockCreators,
  strategies: mockStrategies,
  getStrategy: (id) => get().strategies.find(s => s.id === id),
  getCreator: (id) => get().creators[id],
  getStrategiesByCreator: (creatorId) => get().strategies.filter(s => s.creatorId === creatorId)
}));
