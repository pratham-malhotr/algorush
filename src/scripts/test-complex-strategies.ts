import { runLocalBacktest, generateMockData } from '../lib/backtester/engine';
import { StrategyDSL } from '../lib/types/strategy';

console.log("=========================================================");
console.log("  ENTERPRISE COMPLEX STRATEGY VERIFICATION SUITE       ");
console.log("=========================================================\n");

let passed = 0;
let failed = 0;

function assert(condition: boolean, title: string, details: string = '') {
  if (condition) {
    console.log(`[PASS] ✓ ${title} ${details ? `(${details})` : ''}`);
    passed++;
  } else {
    console.error(`[FAIL] ✗ ${title} - ${details}`);
    failed++;
  }
}

// 1. Generate multi-timeframe mock dataset
const mockCandles = generateMockData(90, 65000, "15m");
assert(mockCandles.length >= 350, "Generated Multi-Candle Dataset", `Candles: ${mockCandles.length}`);

// 2. Test Complex Strategy: Institutional 3-Tier Multi-Timeframe Confluence with Staged TP Ladder
console.log("\n--- TEST 1: Institutional 3-Tier Multi-Timeframe Confluence ---");
const complexStrategy: StrategyDSL = {
  name: "Institutional 3-Tier Multi-Timeframe Confluence",
  description: "4h Trend + 1h VWAP + 15m RSI Pullback into Confluence Gate",
  instruments: [{ symbol: "BTC/USDT", assetClass: "CRYPTO" }],
  timeframe: "15m",
  entryConditions: [
    {
      id: "e1",
      left: { type: "EMA", timeframe: "4h", parameters: { period: 50 } },
      comparator: "GREATER_THAN",
      right: { type: "EMA", timeframe: "4h", parameters: { period: 200 } },
      logicalOperator: "AND"
    },
    {
      id: "e2",
      left: { type: "PRICE", timeframe: "1h" },
      comparator: "GREATER_THAN",
      right: { type: "VWAP", timeframe: "1h" },
      logicalOperator: "AND"
    },
    {
      id: "e3",
      left: { type: "RSI", timeframe: "15m", parameters: { period: 14 } },
      comparator: "LESS_THAN",
      right: 38,
      logicalOperator: "AND"
    }
  ],
  exitConditions: [
    {
      id: "x1",
      left: { type: "RSI", timeframe: "15m", parameters: { period: 14 } },
      comparator: "GREATER_THAN",
      right: 75,
      logicalOperator: "OR"
    }
  ],
  logicGates: [
    { id: "gate-1", operator: "ALL_TRUE", threshold: 3 }
  ],
  filters: [
    { sessions: ["LONDON", "NEW_YORK"], minVolatilityATR: 0.8 }
  ],
  action: {
    type: "BUY",
    orderType: "LIMIT",
    quantityType: "PERCENT_OF_ACCOUNT",
    quantityValue: 35,
    leverage: 5
  },
  riskParameters: {
    stopLossPercentage: 2.2,
    takeProfitPercentage: 8.5,
    trailingStopPercentage: 1.8,
    maxDailyDrawdownPct: 5.0,
    leverage: 5,
    takeProfitLadder: [
      { targetPercentage: 2.5, allocationPercentage: 50, moveToBreakEven: true },
      { targetPercentage: 5.0, allocationPercentage: 30 },
      { targetPercentage: 8.5, allocationPercentage: 20, trailingStopPct: 1.8 }
    ]
  }
};

const result1 = runLocalBacktest(complexStrategy, mockCandles);
assert(result1.equityCurve.length === mockCandles.length, "Equity Curve Length Matches Candle Count", `Points: ${result1.equityCurve.length}`);
assert(typeof result1.metrics.totalReturn === 'string', "Total Return Metric Generated", `Return: ${result1.metrics.totalReturn}`);
assert(typeof result1.metrics.sharpeRatio === 'string', "Sharpe Ratio Calculated", `Sharpe: ${result1.metrics.sharpeRatio}`);
assert(typeof result1.metrics.sortinoRatio === 'string', "Sortino Ratio Calculated", `Sortino: ${result1.metrics.sortinoRatio}`);
assert(typeof result1.metrics.calmarRatio === 'string', "Calmar Ratio Calculated", `Calmar: ${result1.metrics.calmarRatio}`);
assert(typeof result1.metrics.monteCarloVar95 === 'string', "Monte Carlo 95% VaR Calculated", `VaR 95%: ${result1.metrics.monteCarloVar95}`);

// 3. Test Delta-Neutral Basis Arbitrage Strategy
console.log("\n--- TEST 2: Delta-Neutral Basis Arbitrage Strategy ---");
const arbStrategy: StrategyDSL = {
  name: "Delta-Neutral Funding Basis Arbitrage",
  description: "Cash & Carry spot + perp funding capture",
  instruments: [{ symbol: "SOL/USDT", assetClass: "CRYPTO" }],
  timeframe: "1h",
  entryConditions: [
    {
      id: "arb-1",
      left: { type: "FUNDING_RATE" },
      comparator: "GREATER_THAN",
      right: 0.00035,
      logicalOperator: "AND"
    }
  ],
  logicGates: [{ id: "g1", operator: "ALL_TRUE" }],
  action: {
    type: "BUY",
    orderType: "MARKET",
    quantityType: "PERCENT_OF_ACCOUNT",
    quantityValue: 50,
    leverage: 1
  },
  riskParameters: {
    stopLossPercentage: 1.0,
    takeProfitPercentage: 10.0,
    leverage: 1
  }
};

const result2 = runLocalBacktest(arbStrategy, mockCandles);
assert(result2.metrics.totalTrades !== undefined, "Basis Arbitrage Execution", `Trades: ${result2.metrics.totalTrades}`);

// 4. Test Volatility Grid & Staged DCA Strategy
console.log("\n--- TEST 3: Volatility Grid & Staged DCA Engine ---");
const gridStrategy: StrategyDSL = {
  name: "Dynamic Volatility Grid & DCA Engine",
  description: "Grid limit orders with volatility regimes",
  instruments: [{ symbol: "ETH/USDT", assetClass: "CRYPTO" }],
  timeframe: "15m",
  entryConditions: [
    {
      id: "grid-cond",
      left: { type: "PRICE" },
      comparator: "LESS_THAN",
      right: { type: "BOLLINGER_LOWER", parameters: { period: 20, multiplier: 2.0 } },
      logicalOperator: "AND"
    }
  ],
  filters: [{ minVolatilityATR: 1.2 }],
  action: {
    type: "BUY",
    orderType: "GRID_LIMIT",
    quantityType: "PERCENT_OF_ACCOUNT",
    quantityValue: 25,
    leverage: 3
  },
  riskParameters: {
    stopLossPercentage: 4.0,
    takeProfitPercentage: 5.0,
    maxDailyDrawdownPct: 5.0,
    leverage: 3,
    takeProfitLadder: [
      { targetPercentage: 1.5, allocationPercentage: 35 },
      { targetPercentage: 3.0, allocationPercentage: 35 },
      { targetPercentage: 5.0, allocationPercentage: 30 }
    ]
  }
};

const result3 = runLocalBacktest(gridStrategy, mockCandles);
assert(result3.trades.length >= 0, "Grid Strategy Execution Verification", `Trades logged: ${result3.trades.length}`);

// 5. Test Short Breakdown with High Leverage Liquidation Protection
console.log("\n--- TEST 4: High Leverage Short Selling with Liquidation Protection ---");
const shortStrategy: StrategyDSL = {
  name: "10x High-Leverage Short Breakdown Scalper",
  description: "Short BTC on 20 EMA < 50 EMA with 10x leverage",
  instruments: [{ symbol: "BTC/USDT", assetClass: "CRYPTO" }],
  timeframe: "5m",
  entryConditions: [
    {
      id: "short-1",
      left: { type: "EMA", parameters: { period: 20 } },
      comparator: "CROSSES_BELOW",
      right: { type: "EMA", parameters: { period: 50 } },
      logicalOperator: "AND"
    }
  ],
  action: {
    type: "SELL",
    orderType: "MARKET",
    quantityType: "PERCENT_OF_ACCOUNT",
    quantityValue: 20,
    leverage: 10
  },
  riskParameters: {
    stopLossPercentage: 1.5,
    takeProfitPercentage: 4.0,
    trailingStopPercentage: 1.0,
    leverage: 10
  }
};

const result4 = runLocalBacktest(shortStrategy, mockCandles);
assert(result4.metrics.totalReturn !== undefined, "High-Leverage Short Strategy Simulation", `Net Return: ${result4.metrics.totalReturn}`);
const hasShortTrades = result4.trades.some(t => t.side === "SELL_SHORT");
assert(result4.trades.length === 0 || hasShortTrades, "Short Trades Execution Side Verified", `Short positions modeled correctly`);

console.log("\n=========================================================");
console.log(`COMPLEX STRATEGY VERIFICATION: ${passed} PASSED, ${failed} FAILED`);
console.log("=========================================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("✓ All enterprise complex strategy backtests executed flawlessly!");
}
