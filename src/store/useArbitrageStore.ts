import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ArbitrageExecution {
  id: string;
  timestamp: number;
  pair: string;
  strategyType: 'SPATIAL' | 'BASIS' | 'TRIANGULAR';
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  allocatedCapitalUsdt: number;
  quantity: number;
  grossSpreadPct: number;
  grossProfitUsdt: number;
  buyFeeUsdt: number;
  sellFeeUsdt: number;
  networkGasFeeUsdt: number;
  vwapSlippageCostUsdt: number;
  totalCostsUsdt: number;
  netProfitUsdt: number;
  netRoiPct: number;
  executionTimeMs: number;
  txHash: string;
  status: 'COMPLETED' | 'HEDGED' | 'SETTLING' | 'FAILED';
  notes?: string;
}

export interface ArbitrageBotInstance {
  id: string;
  name: string;
  pair: string;
  strategyType: 'SPATIAL' | 'BASIS' | 'TRIANGULAR';
  buyExchange: string;
  sellExchange: string;
  allocatedCapitalUsdt: number;
  minSpreadPct: number;
  status: 'RUNNING' | 'PAUSED';
  createdAt: number;
  totalExecutions: number;
  totalProfitUsdt: number;
  lastExecutionTimestamp?: number;
}

export interface ArbitrageStoreState {
  executions: ArbitrageExecution[];
  activeBots: ArbitrageBotInstance[];
  totalRealizedProfitUsdt: number;
  totalVolumeExecutedUsdt: number;
  totalTradesCount: number;
  winRatePct: number;

  // Actions
  logExecution: (execution: Omit<ArbitrageExecution, 'id'>) => ArbitrageExecution;
  clearExecutionHistory: () => void;
  deployBot: (bot: Omit<ArbitrageBotInstance, 'id' | 'createdAt' | 'totalExecutions' | 'totalProfitUsdt'>) => ArbitrageBotInstance;
  toggleBotStatus: (id: string) => void;
  removeBot: (id: string) => void;
  recordBotExecution: (botId: string, profit: number) => void;
}

export const useArbitrageStore = create<ArbitrageStoreState>()(
  persist(
    (set, get) => ({
      executions: [
        {
          id: 'arb-exec-init-1',
          timestamp: Date.now() - 1000 * 60 * 25,
          pair: 'BTC/USDT',
          strategyType: 'SPATIAL',
          buyExchange: 'Binance',
          sellExchange: 'OKX',
          buyPrice: 77745.20,
          sellPrice: 77792.80,
          allocatedCapitalUsdt: 25000,
          quantity: 0.3215,
          grossSpreadPct: 0.061,
          grossProfitUsdt: 15.30,
          buyFeeUsdt: 18.75, // 0.075%
          sellFeeUsdt: 20.00, // 0.08%
          networkGasFeeUsdt: 2.50,
          vwapSlippageCostUsdt: 1.20,
          totalCostsUsdt: 42.45,
          netProfitUsdt: 8.85,
          netRoiPct: 0.035,
          executionTimeMs: 14,
          txHash: '0x8f4d92a1c6e84321b590e73f9821a34b2209d17c49e',
          status: 'COMPLETED',
          notes: 'Executed via cross-exchange institutional atomic routing engine.'
        },
        {
          id: 'arb-exec-init-2',
          timestamp: Date.now() - 1000 * 60 * 8,
          pair: 'SOL/USDT',
          strategyType: 'SPATIAL',
          buyExchange: 'Gate.io',
          sellExchange: 'Bybit',
          buyPrice: 100.22,
          sellPrice: 100.48,
          allocatedCapitalUsdt: 10000,
          quantity: 99.78,
          grossSpreadPct: 0.259,
          grossProfitUsdt: 25.94,
          buyFeeUsdt: 10.00,
          sellFeeUsdt: 10.00,
          networkGasFeeUsdt: 0.02,
          vwapSlippageCostUsdt: 0.40,
          totalCostsUsdt: 20.42,
          netProfitUsdt: 5.52,
          netRoiPct: 0.055,
          executionTimeMs: 11,
          txHash: '0x3a7e912bc4f0391dc9827361a9482b534011ef9328a',
          status: 'COMPLETED',
          notes: 'Sub-second Solana SPL lightning transfer.'
        }
      ],
      activeBots: [
        {
          id: 'bot-inst-1',
          name: 'BTC/USDT Cross-Venue Scalper',
          pair: 'BTC/USDT',
          strategyType: 'SPATIAL',
          buyExchange: 'Binance',
          sellExchange: 'Gate.io',
          allocatedCapitalUsdt: 25000,
          minSpreadPct: 0.04,
          status: 'RUNNING',
          createdAt: Date.now() - 1000 * 60 * 60 * 4,
          totalExecutions: 18,
          totalProfitUsdt: 142.80,
          lastExecutionTimestamp: Date.now() - 1000 * 60 * 12
        },
        {
          id: 'bot-inst-2',
          name: 'SOL Cash & Carry Basis Harvester',
          pair: 'SOL/USDT',
          strategyType: 'BASIS',
          buyExchange: 'OKX Spot',
          sellExchange: 'Bybit Linear',
          allocatedCapitalUsdt: 35000,
          minSpreadPct: 0.15,
          status: 'RUNNING',
          createdAt: Date.now() - 1000 * 60 * 60 * 12,
          totalExecutions: 3,
          totalProfitUsdt: 218.40,
          lastExecutionTimestamp: Date.now() - 1000 * 60 * 45
        }
      ],
      totalRealizedProfitUsdt: 14.37,
      totalVolumeExecutedUsdt: 35000,
      totalTradesCount: 2,
      winRatePct: 100,

      logExecution: (executionData) => {
        const id = 'arb-exec-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now()
        const newExecution: ArbitrageExecution = {
          ...executionData,
          id
        }

        set((state) => {
          const updatedExecutions = [newExecution, ...state.executions]
          const totalRealizedProfit = updatedExecutions.reduce((acc, curr) => acc + curr.netProfitUsdt, 0)
          const totalVolume = updatedExecutions.reduce((acc, curr) => acc + curr.allocatedCapitalUsdt, 0)
          const winningTrades = updatedExecutions.filter((t) => t.netProfitUsdt > 0).length
          const winRate = updatedExecutions.length > 0 ? (winningTrades / updatedExecutions.length) * 100 : 0

          return {
            executions: updatedExecutions,
            totalRealizedProfitUsdt: +totalRealizedProfit.toFixed(2),
            totalVolumeExecutedUsdt: Math.round(totalVolume),
            totalTradesCount: updatedExecutions.length,
            winRatePct: +winRate.toFixed(1)
          }
        })

        return newExecution
      },

      clearExecutionHistory: () => {
        set({
          executions: [],
          totalRealizedProfitUsdt: 0,
          totalVolumeExecutedUsdt: 0,
          totalTradesCount: 0,
          winRatePct: 0
        })
      },

      deployBot: (botData) => {
        const id = 'bot-' + Math.random().toString(36).substring(2, 8) + '-' + Date.now()
        const newBot: ArbitrageBotInstance = {
          ...botData,
          id,
          createdAt: Date.now(),
          totalExecutions: 0,
          totalProfitUsdt: 0
        }

        set((state) => ({
          activeBots: [newBot, ...state.activeBots]
        }))

        return newBot
      },

      toggleBotStatus: (id) => {
        set((state) => ({
          activeBots: state.activeBots.map((b) =>
            b.id === id ? { ...b, status: b.status === 'RUNNING' ? 'PAUSED' : 'RUNNING' } : b
          )
        }))
      },

      removeBot: (id) => {
        set((state) => ({
          activeBots: state.activeBots.filter((b) => b.id !== id)
        }))
      },

      recordBotExecution: (botId, profit) => {
        set((state) => ({
          activeBots: state.activeBots.map((b) =>
            b.id === botId
              ? {
                  ...b,
                  totalExecutions: b.totalExecutions + 1,
                  totalProfitUsdt: +(b.totalProfitUsdt + profit).toFixed(2),
                  lastExecutionTimestamp: Date.now()
                }
              : b
          )
        }))
      }
    }),
    {
      name: 'algotext-arbitrage-storage'
    }
  )
)
