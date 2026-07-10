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
  'c_2': { id: 'c_2', name: 'AlphaSeeker', username: '@alphaseeker', followers: 850, aum: '$120K', verified: false }
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
    description: 'Follows strong momentum in AAPL and MSFT using MACD crossovers.',
    category: 'Equities',
    price: 0, // Free
    metrics: { sharpe: 1.4, maxDrawdown: 18.2, monthlyReturn: 2.1, liveDays: 45 },
    clones: 120,
    strategyDSL: {
      assets: ['AAPL', 'MSFT'],
      indicators: [{ name: 'MACD', timeframe: '1d', parameters: { fast: 12, slow: 26, signal: 9 } }],
      rules: {
        entry: [{ indicator: 'MACD_Line', operator: 'crosses_above', value: 'MACD_Signal' }],
        exit: [{ indicator: 'MACD_Line', operator: 'crosses_below', value: 'MACD_Signal' }]
      },
      riskParameters: { stopLossPercentage: 10, takeProfitPercentage: 20 }
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
