import { runLocalBacktest, generateMockData } from '../lib/backtester/engine';
import { StrategyDSL } from '../lib/types/strategy';

console.log("=========================================================");
console.log("  ALGONAUT / ALGORUSH DEEP STRATEGY BUILDER TEST SUITE  ");
console.log("=========================================================\n");

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail: string = '') {
  if (condition) {
    console.log(`[PASS] ✓ ${testName} ${detail ? `(${detail})` : ''}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ✗ ${testName} - ${detail}`);
    failedTests++;
  }
}

// 1. Synthetic Historical Data Generation Test
console.log("--- TEST GROUP 1: Market Data Engine ---");
const mockData = generateMockData(120, 100);
assert(mockData.length === 121, "Generate 120-Day OHLCV Data", `Received ${mockData.length} candles`);
assert(mockData[0].close > 0 && mockData[0].volume > 0, "OHLCV Data Integrity", `First candle price: $${mockData[0].close.toFixed(2)}`);

// 2. Strategy 1: Golden Cross + RSI Oversold (Trend + Momentum)
console.log("\n--- TEST GROUP 2: Trend & Momentum Strategy Backtest ---");
const goldenCrossStrategy: StrategyDSL = {
  name: "Institutional Golden Cross + RSI",
  description: "Buy when 50 EMA crosses above 200 EMA and RSI < 45",
  instruments: [{ symbol: "BTC/USDT", assetClass: "CRYPTO" }],
  entryConditions: [
    {
      id: "e1",
      left: { type: "EMA", timeframe: "5m", parameters: { period: 50 } },
      comparator: "CROSSES_ABOVE",
      right: { type: "EMA", timeframe: "5m", parameters: { period: 200 } },
      logicalOperator: "AND"
    },
    {
      id: "e2",
      left: { type: "RSI", timeframe: "5m", parameters: { period: 14 } },
      comparator: "LESS_THAN",
      right: 45,
      logicalOperator: "AND"
    }
  ],
  exitConditions: [
    {
      id: "x1",
      left: { type: "RSI", timeframe: "5m", parameters: { period: 14 } },
      comparator: "GREATER_THAN",
      right: 70,
      logicalOperator: "OR"
    }
  ],
  action: { type: "BUY", orderType: "MARKET", quantityType: "PERCENT_OF_ACCOUNT", quantityValue: 50 },
  riskParameters: { stopLossPercentage: 3.0, takeProfitPercentage: 6.0, riskPerTradePct: 1.0 }
};

const result1 = runLocalBacktest(goldenCrossStrategy, mockData);
assert(result1.equityCurve.length > 0, "Golden Cross Backtest Execution", `Curve points: ${result1.equityCurve.length}`);
assert(typeof result1.metrics.totalReturn === 'string', "Total Return Calculation", `Return: ${result1.metrics.totalReturn}`);
assert(typeof result1.metrics.sharpeRatio === 'string', "Sharpe Ratio Metric", `Sharpe: ${result1.metrics.sharpeRatio}`);
assert(typeof result1.metrics.sortinoRatio === 'string', "Sortino Ratio Metric", `Sortino: ${result1.metrics.sortinoRatio}`);
assert(typeof result1.metrics.calmarRatio === 'string', "Calmar Ratio Metric", `Calmar: ${result1.metrics.calmarRatio}`);
assert(typeof result1.metrics.profitFactor === 'string', "Profit Factor Metric", `Profit Factor: ${result1.metrics.profitFactor}`);

// 3. Strategy 2: Multi-Timeframe Trend Filter Strategy (1h EMA Trend + 5m Breakout)
console.log("\n--- TEST GROUP 3: Multi-Timeframe Strategy Backtest ---");
const mtfStrategy: StrategyDSL = {
  name: "Multi-Timeframe Trend Filter Strategy",
  description: "1h 50 EMA trend filter with 5m Bollinger Band Lower breakout",
  instruments: [{ symbol: "ETH/USDT", assetClass: "CRYPTO" }],
  entryConditions: [
    {
      id: "mtf1",
      left: { type: "EMA", timeframe: "1h", parameters: { period: 50 } },
      comparator: "GREATER_THAN",
      right: { type: "EMA", timeframe: "1h", parameters: { period: 200 } },
      logicalOperator: "AND"
    },
    {
      id: "mtf2",
      left: { type: "PRICE", timeframe: "5m" },
      comparator: "LESS_THAN",
      right: { type: "BOLLINGER_LOWER", timeframe: "5m", parameters: { period: 20 } },
      logicalOperator: "AND"
    }
  ],
  exitConditions: [
    {
      id: "mtf_exit",
      left: { type: "PRICE", timeframe: "5m" },
      comparator: "GREATER_THAN",
      right: { type: "BOLLINGER_UPPER", timeframe: "5m", parameters: { period: 20 } },
      logicalOperator: "OR"
    }
  ],
  action: { type: "BUY", orderType: "LIMIT", quantityType: "VOLATILITY_RISK_PCT", quantityValue: 1.5 },
  riskParameters: { stopLossPercentage: 2.5, takeProfitPercentage: 5.5, trailingStopPercentage: 1.5 }
};

const result2 = runLocalBacktest(mtfStrategy, mockData);
assert(result2.metrics.totalTrades !== undefined, "Multi-Timeframe Strategy Execution", `Total trades: ${result2.metrics.totalTrades}`);
assert(result2.metrics.monteCarloVar95 !== undefined, "Monte Carlo 95% VaR", `VaR: ${result2.metrics.monteCarloVar95}`);
assert(result2.metrics.walkForwardRobustness !== undefined, "Walk-Forward Efficiency Score", `Walk-Forward: ${result2.metrics.walkForwardRobustness}`);

// Summary Report
console.log("\n=========================================================");
console.log(`TEST RESULTS SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log("=========================================================\n");

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log("✓ All Strategy Builder & Institutional Backtester tests passed successfully!");
}
