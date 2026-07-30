import { StrategyDSL } from '../types/strategy';
import { OrderRequest } from '../broker/types';

export interface RiskCheckResult {
  approved: boolean;
  reason?: string;
}

// Global state for Risk (In production, this lives in Redis or Postgres)
let isKillSwitchEngaged = false;
let globalDailyDrawdown = 0; // percentage
const GLOBAL_DRAWDOWN_LIMIT = 15; // 15%

// Mock state of active positions across all strategies
const activePositions = [
  { symbol: 'BTC', allocationUsd: 5000, strategyId: 'strat_1' }
];

// Mock correlation matrix (1.0 = identical, -1.0 = opposite)
const correlationMatrix: Record<string, Record<string, number>> = {
  'BTC': { 'ETH': 0.85, 'SOL': 0.4 },
  'ETH': { 'BTC': 0.85, 'SOL': 0.3 },
  'SOL': { 'BTC': 0.4, 'ETH': 0.3 }
};

export function engageKillSwitch() {
  isKillSwitchEngaged = true;
  console.warn("CRITICAL: Global Kill Switch Engaged. All trading halted.");
  // In a real system, this would immediately send 'cancel all' to broker
}

export function disengageKillSwitch() {
  isKillSwitchEngaged = false;
  console.log("Global Kill Switch Disengaged.");
}

export function runRiskChecks(strategy: StrategyDSL, order: OrderRequest): RiskCheckResult {
  if (isKillSwitchEngaged) {
    return { approved: false, reason: "GLOBAL_KILL_SWITCH_ACTIVE" };
  }

  // 1. Global Circuit Breaker Check
  if (globalDailyDrawdown >= GLOBAL_DRAWDOWN_LIMIT) {
    return { approved: false, reason: "GLOBAL_CIRCUIT_BREAKER: Daily drawdown limit exceeded across portfolio" };
  }

  // 2. Portfolio Correlation Check
  if (order.side === 'buy') {
    for (const pos of activePositions) {
      if (pos.symbol === order.symbol) continue;
      
      const correlation = correlationMatrix[order.symbol]?.[pos.symbol] || 0;
      if (correlation > 0.8) {
        return { 
          approved: false, 
          reason: `CORRELATION_LIMIT: Proposed trade ${order.symbol} is highly correlated (${correlation}) with existing position ${pos.symbol}`
        };
      }
    }
  }

  const { riskParameters } = strategy;

  // 3. Max Position Size Check
  if (riskParameters?.maxPositionSizeUSD) {
    // For mock, assuming price is 60000 for BTC
    const estimatedValue = order.qty * 150; 
    if (estimatedValue > riskParameters.maxPositionSizeUSD) {
      return { 
        approved: false, 
        reason: `Order value ($${estimatedValue}) exceeds max position size ($${riskParameters.maxPositionSizeUSD})` 
      };
    }
  }

  // 4. Stop Loss / Take Profit presence check (Policy: All strategies must have SL)
  if (!riskParameters?.stopLossPercentage) {
    return {
      approved: false,
      reason: `Strategy missing mandatory Stop Loss parameter. Execution rejected.`
    }
  }

  return { approved: true };
}
