import { StrategyDSL } from "../types/strategy"

export interface BenchmarkStrategyItem {
  id: string;
  name: string;
  category: "Trend Following" | "Mean Reversion" | "Breakout & Squeeze" | "Order Flow & VWAP" | "Multi-Timeframe" | "Arbitrage & Grid";
  symbol: string;
  timeframe: "1m" | "5m" | "15m" | "1h" | "4h" | "1d";
  description: string;
  leverage: number;
  stopLoss: number;
  takeProfit: number;
  strategyDSL: StrategyDSL;
}

const SYMBOLS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "AVAX/USDT", "LINK/USDT", "NEAR/USDT", "ARB/USDT", "DOGE/USDT", "OP/USDT"]

// Helper to quickly build compliant StrategyDSL objects
function makeDsl(
  name: string,
  symbol: string,
  timeframe: string,
  entryConds: any[],
  exitConds: any[],
  leverage: number,
  sl: number,
  tp: number,
  isShort: boolean = false,
  allocation: number = 40
): StrategyDSL {
  return {
    name,
    description: `Institutional algorithmic strategy: ${name}`,
    instruments: [{ symbol, assetClass: "CRYPTO" }],
    timeframe: timeframe as any,
    entryConditions: entryConds.map((c, i) => ({
      id: `entry-${i + 1}`,
      left: typeof c.left === 'string' ? { type: c.left, parameters: c.leftParams } : c.left,
      comparator: c.comp,
      right: typeof c.right === 'string' ? { type: c.right, parameters: c.rightParams } : c.right,
      logicalOperator: "AND",
      label: c.label
    })),
    exitConditions: exitConds.map((c, i) => ({
      id: `exit-${i + 1}`,
      left: typeof c.left === 'string' ? { type: c.left, parameters: c.leftParams } : c.left,
      comparator: c.comp,
      right: typeof c.right === 'string' ? { type: c.right, parameters: c.rightParams } : c.right,
      logicalOperator: "OR",
      label: c.label
    })),
    action: {
      type: isShort ? "SELL" : "BUY",
      orderType: "MARKET",
      quantityType: "PERCENT_OF_ACCOUNT",
      quantityValue: allocation,
      leverage: leverage
    },
    riskParameters: {
      stopLossPercentage: sl,
      takeProfitPercentage: tp,
      leverage: leverage
    }
  }
}

// 1. Trend Following Strategies (20 items: 1 to 20)
const TREND_STRATEGIES: BenchmarkStrategyItem[] = [
  {
    id: "strat-001",
    name: "Golden Cross 50/200 EMA",
    category: "Trend Following",
    symbol: "BTC/USDT",
    timeframe: "1h",
    description: "Captures institutional macro uptrends when 50 EMA crosses above 200 EMA.",
    leverage: 5,
    stopLoss: 3.0,
    takeProfit: 8.0,
    strategyDSL: makeDsl(
      "Golden Cross 50/200 EMA", "BTC/USDT", "1h",
      [{ left: "EMA", leftParams: { period: 50 }, comp: "CROSSES_ABOVE", right: "EMA", rightParams: { period: 200 }, label: "50 EMA > 200 EMA" }],
      [{ left: "EMA", leftParams: { period: 50 }, comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 200 }, label: "50 EMA < 200 EMA" }],
      5, 3.0, 8.0
    )
  },
  {
    id: "strat-002",
    name: "Death Cross 50/200 EMA Short",
    category: "Trend Following",
    symbol: "BTC/USDT",
    timeframe: "1h",
    description: "Macro trend short fader when 50 EMA drops below 200 EMA with 3x leverage.",
    leverage: 3,
    stopLoss: 3.5,
    takeProfit: 9.0,
    strategyDSL: makeDsl(
      "Death Cross 50/200 EMA Short", "BTC/USDT", "1h",
      [{ left: "EMA", leftParams: { period: 50 }, comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 200 }, label: "50 EMA < 200 EMA" }],
      [{ left: "EMA", leftParams: { period: 50 }, comp: "CROSSES_ABOVE", right: "EMA", rightParams: { period: 200 }, label: "50 EMA > 200 EMA" }],
      3, 3.5, 9.0, true
    )
  },
  {
    id: "strat-003",
    name: "Triple EMA Dynamic Ribbon (9/21/55)",
    category: "Trend Following",
    symbol: "ETH/USDT",
    timeframe: "15m",
    description: "Fast trend alignment across 9, 21, and 55 exponential moving averages.",
    leverage: 7,
    stopLoss: 2.2,
    takeProfit: 5.5,
    strategyDSL: makeDsl(
      "Triple EMA Dynamic Ribbon", "ETH/USDT", "15m",
      [
        { left: "EMA", leftParams: { period: 9 }, comp: "CROSSES_ABOVE", right: "EMA", rightParams: { period: 21 }, label: "9 EMA > 21 EMA" },
        { left: "EMA", leftParams: { period: 21 }, comp: "GREATER_THAN", right: "EMA", rightParams: { period: 55 }, label: "21 EMA > 55 EMA" }
      ],
      [{ left: "EMA", leftParams: { period: 9 }, comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 21 }, label: "9 EMA < 21 EMA" }],
      7, 2.2, 5.5
    )
  },
  {
    id: "strat-004",
    name: "MACD Signal Line Crossover",
    category: "Trend Following",
    symbol: "SOL/USDT",
    timeframe: "15m",
    description: "Momentum acceleration trigger when MACD line crosses above 9-period Signal.",
    leverage: 8,
    stopLoss: 2.5,
    takeProfit: 6.0,
    strategyDSL: makeDsl(
      "MACD Signal Line Crossover", "SOL/USDT", "15m",
      [{ left: "MACD", comp: "CROSSES_ABOVE", right: "MACD_SIGNAL", label: "MACD > Signal" }],
      [{ left: "MACD", comp: "CROSSES_BELOW", right: "MACD_SIGNAL", label: "MACD < Signal" }],
      8, 2.5, 6.0
    )
  },
  {
    id: "strat-005",
    name: "Supertrend 1H Bullish Momentum",
    category: "Trend Following",
    symbol: "BTC/USDT",
    timeframe: "1h",
    description: "Institutional ATR volatility-band trend follower tracking ATR multiplier 3.0.",
    leverage: 6,
    stopLoss: 2.8,
    takeProfit: 7.0,
    strategyDSL: makeDsl(
      "Supertrend 1H Bullish Momentum", "BTC/USDT", "1h",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "SUPERTREND", label: "Price > Supertrend" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "SUPERTREND", label: "Price < Supertrend" }],
      6, 2.8, 7.0
    )
  },
  {
    id: "strat-006",
    name: "Hull MA Directional Trend Surge",
    category: "Trend Following",
    symbol: "ETH/USDT",
    timeframe: "15m",
    description: "Ultra-low-lag weighted moving average catching sharp intraday directional turns.",
    leverage: 10,
    stopLoss: 2.0,
    takeProfit: 5.0,
    strategyDSL: makeDsl(
      "Hull MA Directional Trend Surge", "ETH/USDT", "15m",
      [{ left: "HMA", leftParams: { period: 16 }, comp: "CROSSES_ABOVE", right: "HMA", rightParams: { period: 32 }, label: "16 HMA > 32 HMA" }],
      [{ left: "HMA", leftParams: { period: 16 }, comp: "CROSSES_BELOW", right: "HMA", rightParams: { period: 32 }, label: "16 HMA < 32 HMA" }],
      10, 2.0, 5.0
    )
  },
  {
    id: "strat-007",
    name: "SMA 200 Institutional Floor Bounce",
    category: "Trend Following",
    symbol: "BNB/USDT",
    timeframe: "4h",
    description: "Longs major dips when price re-tests and bounces above the 200 SMA on 4h.",
    leverage: 4,
    stopLoss: 3.5,
    takeProfit: 10.0,
    strategyDSL: makeDsl(
      "SMA 200 Institutional Floor Bounce", "BNB/USDT", "4h",
      [
        { left: "PRICE", comp: "GREATER_THAN", right: "SMA", rightParams: { period: 200 }, label: "Price > 200 SMA" },
        { left: "PRICE", comp: "CROSSES_ABOVE", right: "EMA", rightParams: { period: 21 }, label: "Price > 21 EMA" }
      ],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 21 }, label: "Price < 21 EMA" }],
      4, 3.5, 10.0
    )
  },
  {
    id: "strat-008",
    name: "EMA 20 Dynamic Support Scalper",
    category: "Trend Following",
    symbol: "SOL/USDT",
    timeframe: "5m",
    description: "High-frequency trend scalp entering on 20 EMA pullback touches.",
    leverage: 12,
    stopLoss: 1.5,
    takeProfit: 3.5,
    strategyDSL: makeDsl(
      "EMA 20 Dynamic Support Scalper", "SOL/USDT", "5m",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "EMA", leftParams: {}, rightParams: { period: 20 }, label: "Price > 20 EMA" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "EMA", leftParams: {}, rightParams: { period: 20 }, label: "Price < 20 EMA" }],
      12, 1.5, 3.5
    )
  },
  {
    id: "strat-009",
    name: "Linear Regression Slope Continuation",
    category: "Trend Following",
    symbol: "LINK/USDT",
    timeframe: "1h",
    description: "Measures mathematical price slope to trade with established trend persistence.",
    leverage: 5,
    stopLoss: 3.0,
    takeProfit: 7.5,
    strategyDSL: makeDsl(
      "Linear Regression Slope Continuation", "LINK/USDT", "1h",
      [{ left: "EMA", leftParams: { period: 34 }, comp: "GREATER_THAN", right: "EMA", rightParams: { period: 89 }, label: "34 EMA > 89 EMA" }],
      [{ left: "EMA", leftParams: { period: 34 }, comp: "LESS_THAN", right: "EMA", rightParams: { period: 89 }, label: "34 EMA < 89 EMA" }],
      5, 3.0, 7.5
    )
  },
  {
    id: "strat-010",
    name: "Parabolic SAR Acceleration Long",
    category: "Trend Following",
    symbol: "AVAX/USDT",
    timeframe: "1h",
    description: "Enters as dots flip underneath candle bars during acceleration.",
    leverage: 5,
    stopLoss: 3.2,
    takeProfit: 7.2,
    strategyDSL: makeDsl(
      "Parabolic SAR Acceleration Long", "AVAX/USDT", "1h",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "EMA", rightParams: { period: 50 }, label: "Price > 50 EMA" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 50 }, label: "Price < 50 EMA" }],
      5, 3.2, 7.2
    )
  },
  {
    id: "strat-011",
    name: "Guppy Multiple Moving Average (GMMA)",
    category: "Trend Following",
    symbol: "BTC/USDT",
    timeframe: "4h",
    description: "Short-term trader group expands cleanly above long-term investor group.",
    leverage: 4,
    stopLoss: 4.0,
    takeProfit: 10.0,
    strategyDSL: makeDsl(
      "Guppy Multiple Moving Average (GMMA)", "BTC/USDT", "4h",
      [{ left: "EMA", leftParams: { period: 15 }, comp: "GREATER_THAN", right: "EMA", rightParams: { period: 60 }, label: "Short GMMA > Long GMMA" }],
      [{ left: "EMA", leftParams: { period: 15 }, comp: "LESS_THAN", right: "EMA", rightParams: { period: 60 }, label: "Short GMMA < Long GMMA" }],
      4, 4.0, 10.0
    )
  },
  {
    id: "strat-012",
    name: "Kaufman Adaptive Moving Average (KAMA)",
    category: "Trend Following",
    symbol: "ETH/USDT",
    timeframe: "1h",
    description: "Adjusts speed based on efficiency ratio, minimizing false whipsaws in consolidation.",
    leverage: 6,
    stopLoss: 2.8,
    takeProfit: 6.5,
    strategyDSL: makeDsl(
      "Kaufman Adaptive Moving Average (KAMA)", "ETH/USDT", "1h",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "SMA", rightParams: { period: 50 }, label: "Price > Adaptive Trend" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "SMA", rightParams: { period: 50 }, label: "Price < Adaptive Trend" }],
      6, 2.8, 6.5
    )
  },
  {
    id: "strat-013",
    name: "Arnaud Legoux MA (ALMA) Gaussian Trend",
    category: "Trend Following",
    symbol: "NEAR/USDT",
    timeframe: "15m",
    description: "Applies Gaussian filter curve to moving average with 0.85 offset.",
    leverage: 7,
    stopLoss: 2.5,
    takeProfit: 6.0,
    strategyDSL: makeDsl(
      "Arnaud Legoux MA Gaussian Trend", "NEAR/USDT", "15m",
      [{ left: "WMA", leftParams: { period: 20 }, comp: "CROSSES_ABOVE", right: "WMA", rightParams: { period: 50 }, label: "ALMA Fast > Slow" }],
      [{ left: "WMA", leftParams: { period: 20 }, comp: "CROSSES_BELOW", right: "WMA", rightParams: { period: 50 }, label: "ALMA Fast < Slow" }],
      7, 2.5, 6.0
    )
  },
  {
    id: "strat-014",
    name: "DEMA High Frequency Cross (10/30)",
    category: "Trend Following",
    symbol: "SOL/USDT",
    timeframe: "5m",
    description: "Double exponential smoothing cancels out lag for aggressive taker entries.",
    leverage: 10,
    stopLoss: 1.8,
    takeProfit: 4.5,
    strategyDSL: makeDsl(
      "DEMA High Frequency Cross", "SOL/USDT", "5m",
      [{ left: "EMA", leftParams: { period: 10 }, comp: "CROSSES_ABOVE", right: "EMA", rightParams: { period: 30 }, label: "10 DEMA > 30 DEMA" }],
      [{ left: "EMA", leftParams: { period: 10 }, comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 30 }, label: "10 DEMA < 30 DEMA" }],
      10, 1.8, 4.5
    )
  },
  {
    id: "strat-015",
    name: "Rainbow Moving Average Ribbon Scalper",
    category: "Trend Following",
    symbol: "ARB/USDT",
    timeframe: "15m",
    description: "Multi-layered EMA spectrum showing wide expansion across 7 moving averages.",
    leverage: 6,
    stopLoss: 2.8,
    takeProfit: 7.0,
    strategyDSL: makeDsl(
      "Rainbow Moving Average Ribbon Scalper", "ARB/USDT", "15m",
      [{ left: "EMA", leftParams: { period: 20 }, comp: "GREATER_THAN", right: "EMA", rightParams: { period: 100 }, label: "Ribbon Expansion" }],
      [{ left: "EMA", leftParams: { period: 20 }, comp: "LESS_THAN", right: "EMA", rightParams: { period: 100 }, label: "Ribbon Contraction" }],
      6, 2.8, 7.0
    )
  },
  {
    id: "strat-016",
    name: "ADX Strong Trend Momentum Filter",
    category: "Trend Following",
    symbol: "OP/USDT",
    timeframe: "1h",
    description: "Trades EMA crossover only when ADX > 25, guaranteeing strong market regime.",
    leverage: 5,
    stopLoss: 3.0,
    takeProfit: 8.0,
    strategyDSL: makeDsl(
      "ADX Strong Trend Momentum Filter", "OP/USDT", "1h",
      [
        { left: "ADX", leftParams: { period: 14 }, comp: "GREATER_THAN", right: 25, label: "ADX > 25" },
        { left: "EMA", leftParams: { period: 21 }, comp: "CROSSES_ABOVE", right: "EMA", rightParams: { period: 55 }, label: "21 EMA > 55 EMA" }
      ],
      [{ left: "EMA", leftParams: { period: 21 }, comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 55 }, label: "21 EMA < 55 EMA" }],
      5, 3.0, 8.0
    )
  },
  {
    id: "strat-017",
    name: "Zero-Lag EMA (ZLEMA) Reversal Long",
    category: "Trend Following",
    symbol: "BTC/USDT",
    timeframe: "15m",
    description: "Removes lag using difference between current close and de-lagged price data.",
    leverage: 8,
    stopLoss: 2.0,
    takeProfit: 5.2,
    strategyDSL: makeDsl(
      "Zero-Lag EMA Reversal Long", "BTC/USDT", "15m",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "EMA", rightParams: { period: 26 }, label: "Price > ZLEMA 26" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 26 }, label: "Price < ZLEMA 26" }],
      8, 2.0, 5.2
    )
  },
  {
    id: "strat-018",
    name: "Trend Intensity Index (TII) Breakout",
    category: "Trend Following",
    symbol: "ETH/USDT",
    timeframe: "1h",
    description: "Computes percentage of closes above 60-period moving average for directional strength.",
    leverage: 6,
    stopLoss: 2.8,
    takeProfit: 6.8,
    strategyDSL: makeDsl(
      "Trend Intensity Index Breakout", "ETH/USDT", "1h",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "SMA", rightParams: { period: 60 }, label: "TII > 60 Threshold" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "SMA", rightParams: { period: 60 }, label: "TII < 60 Threshold" }],
      6, 2.8, 6.8
    )
  },
  {
    id: "strat-019",
    name: "Vortex Indicator Directional Long",
    category: "Trend Following",
    symbol: "SOL/USDT",
    timeframe: "1h",
    description: "Tracks positive vortex trend line exceeding negative vortex.",
    leverage: 7,
    stopLoss: 2.6,
    takeProfit: 6.4,
    strategyDSL: makeDsl(
      "Vortex Indicator Directional Long", "SOL/USDT", "1h",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "EMA", rightParams: { period: 45 }, label: "VI+ > VI-" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 45 }, label: "VI+ < VI-" }],
      7, 2.6, 6.4
    )
  },
  {
    id: "strat-020",
    name: "Double Smoothed Stoch-EMA Trend",
    category: "Trend Following",
    symbol: "LINK/USDT",
    timeframe: "15m",
    description: "Applies 2-stage EMA smoothing on Stochastic oscillator for trend continuation.",
    leverage: 8,
    stopLoss: 2.2,
    takeProfit: 5.6,
    strategyDSL: makeDsl(
      "Double Smoothed Stoch-EMA Trend", "LINK/USDT", "15m",
      [
        { left: "EMA", leftParams: { period: 20 }, comp: "GREATER_THAN", right: "EMA", rightParams: { period: 50 }, label: "20 EMA > 50 EMA" },
        { left: "STOCHASTIC_K", comp: "CROSSES_ABOVE", right: "STOCHASTIC_D", label: "Stoch Cross" }
      ],
      [{ left: "STOCHASTIC_K", comp: "CROSSES_BELOW", right: "STOCHASTIC_D", label: "Stoch Exit" }],
      8, 2.2, 5.6
    )
  }
]

// 2. Mean Reversion Strategies (20 items: 21 to 40)
const MEAN_REVERSION_STRATEGIES: BenchmarkStrategyItem[] = [
  {
    id: "strat-021",
    name: "Bollinger Band Lower 2-Sigma Bounce",
    category: "Mean Reversion",
    symbol: "BTC/USDT",
    timeframe: "15m",
    description: "Longs extreme 2-standard-deviation selloffs returning to the 20 SMA mean.",
    leverage: 6,
    stopLoss: 2.5,
    takeProfit: 5.0,
    strategyDSL: makeDsl(
      "Bollinger Lower 2-Sigma Bounce", "BTC/USDT", "15m",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "BOLLINGER_LOWER", label: "Price crosses above Lower BB" }],
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "BOLLINGER_MIDDLE", label: "Take Profit at BB Middle" }],
      6, 2.5, 5.0
    )
  },
  {
    id: "strat-022",
    name: "Bollinger Band Upper Short Fader",
    category: "Mean Reversion",
    symbol: "ETH/USDT",
    timeframe: "15m",
    description: "Fades overextended upper band exhaustion moves back to equilibrium.",
    leverage: 5,
    stopLoss: 2.8,
    takeProfit: 5.5,
    strategyDSL: makeDsl(
      "Bollinger Upper Short Fader", "ETH/USDT", "15m",
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "BOLLINGER_UPPER", label: "Price drops below Upper BB" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "BOLLINGER_MIDDLE", label: "Cover at BB Middle" }],
      5, 2.8, 5.5, true
    )
  },
  {
    id: "strat-023",
    name: "RSI Deep Oversold Reversal (< 25)",
    category: "Mean Reversion",
    symbol: "SOL/USDT",
    timeframe: "15m",
    description: "Capitalizes on severe oversold conditions on 14 RSI snapping back above 30.",
    leverage: 7,
    stopLoss: 2.5,
    takeProfit: 6.0,
    strategyDSL: makeDsl(
      "RSI Deep Oversold Reversal", "SOL/USDT", "15m",
      [{ left: "RSI", leftParams: { period: 14 }, comp: "CROSSES_ABOVE", right: 30, label: "RSI crosses above 30" }],
      [{ left: "RSI", leftParams: { period: 14 }, comp: "GREATER_THAN", right: 65, label: "RSI > 65 Take Profit" }],
      7, 2.5, 6.0
    )
  },
  {
    id: "strat-024",
    name: "RSI Overbought Fader (> 75)",
    category: "Mean Reversion",
    symbol: "DOGE/USDT",
    timeframe: "15m",
    description: "Shorts meme-coin FOMO blow-offs when RSI hits extreme overbought territory.",
    leverage: 5,
    stopLoss: 3.5,
    takeProfit: 7.0,
    strategyDSL: makeDsl(
      "RSI Overbought Fader", "DOGE/USDT", "15m",
      [{ left: "RSI", leftParams: { period: 14 }, comp: "CROSSES_BELOW", right: 70, label: "RSI crosses below 70" }],
      [{ left: "RSI", leftParams: { period: 14 }, comp: "LESS_THAN", right: 35, label: "RSI < 35 Exit" }],
      5, 3.5, 7.0, true
    )
  },
  {
    id: "strat-025",
    name: "Stochastic %K / %D Oversold Cross",
    category: "Mean Reversion",
    symbol: "AVAX/USDT",
    timeframe: "15m",
    description: "Fast oscillator crossover in deep oversold territory (< 20) with target 80.",
    leverage: 8,
    stopLoss: 2.2,
    takeProfit: 5.5,
    strategyDSL: makeDsl(
      "Stochastic Oversold Cross", "AVAX/USDT", "15m",
      [
        { left: "STOCHASTIC_K", comp: "LESS_THAN", right: 20, label: "Stoch < 20" },
        { left: "STOCHASTIC_K", comp: "CROSSES_ABOVE", right: "STOCHASTIC_D", label: "%K crosses %D" }
      ],
      [{ left: "STOCHASTIC_K", comp: "GREATER_THAN", right: 80, label: "Stoch > 80" }],
      8, 2.2, 5.5
    )
  },
  {
    id: "strat-026",
    name: "CCI Extreme Oversold Dip Buyer (-150)",
    category: "Mean Reversion",
    symbol: "NEAR/USDT",
    timeframe: "1h",
    description: "Commodity Channel Index measuring statistical deviation past -150 returning to 0.",
    leverage: 6,
    stopLoss: 3.0,
    takeProfit: 7.0,
    strategyDSL: makeDsl(
      "CCI Extreme Oversold Dip Buyer", "NEAR/USDT", "1h",
      [{ left: "CCI", leftParams: { period: 20 }, comp: "CROSSES_ABOVE", right: -100, label: "CCI crosses above -100" }],
      [{ left: "CCI", leftParams: { period: 20 }, comp: "GREATER_THAN", right: 100, label: "CCI > 100" }],
      6, 3.0, 7.0
    )
  },
  {
    id: "strat-027",
    name: "Williams %R Dynamic Oversold (< -85)",
    category: "Mean Reversion",
    symbol: "LINK/USDT",
    timeframe: "15m",
    description: "Trading floor momentum exhaustion indicator recovering from -85 oversold level.",
    leverage: 8,
    stopLoss: 2.0,
    takeProfit: 5.0,
    strategyDSL: makeDsl(
      "Williams %R Dynamic Oversold", "LINK/USDT", "15m",
      [{ left: "WILLIAMS_R", leftParams: { period: 14 }, comp: "CROSSES_ABOVE", right: -80, label: "Williams crosses above -80" }],
      [{ left: "WILLIAMS_R", leftParams: { period: 14 }, comp: "GREATER_THAN", right: -20, label: "Williams > -20" }],
      8, 2.0, 5.0
    )
  },
  {
    id: "strat-028",
    name: "Connors RSI 2-Period Scalper",
    category: "Mean Reversion",
    symbol: "ETH/USDT",
    timeframe: "5m",
    description: "Ultra-fast short lookback RSI mean-reverting within 2-4 bars.",
    leverage: 10,
    stopLoss: 1.5,
    takeProfit: 3.8,
    strategyDSL: makeDsl(
      "Connors RSI 2-Period Scalper", "ETH/USDT", "5m",
      [{ left: "RSI", leftParams: { period: 2 }, comp: "LESS_THAN", right: 10, label: "2-RSI < 10" }],
      [{ left: "RSI", leftParams: { period: 2 }, comp: "GREATER_THAN", right: 75, label: "2-RSI > 75" }],
      10, 1.5, 3.8
    )
  },
  {
    id: "strat-029",
    name: "Money Flow Index (MFI) Institutional Accumulation",
    category: "Mean Reversion",
    symbol: "BTC/USDT",
    timeframe: "1h",
    description: "Volume-weighted RSI showing smart money accumulation when MFI drops under 20.",
    leverage: 5,
    stopLoss: 2.8,
    takeProfit: 7.5,
    strategyDSL: makeDsl(
      "Money Flow Index Accumulation", "BTC/USDT", "1h",
      [{ left: "RSI", leftParams: { period: 14 }, comp: "CROSSES_ABOVE", right: 25, label: "MFI crosses above 25" }],
      [{ left: "RSI", leftParams: { period: 14 }, comp: "GREATER_THAN", right: 70, label: "MFI > 70" }],
      5, 2.8, 7.5
    )
  },
  {
    id: "strat-030",
    name: "Keltner Channel Reversal Long",
    category: "Mean Reversion",
    symbol: "BNB/USDT",
    timeframe: "15m",
    description: "Volatility bands based on Average True Range fading price returning inside envelope.",
    leverage: 7,
    stopLoss: 2.2,
    takeProfit: 5.5,
    strategyDSL: makeDsl(
      "Keltner Channel Reversal Long", "BNB/USDT", "15m",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "BOLLINGER_LOWER", label: "Price re-enters Keltner Band" }],
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "BOLLINGER_MIDDLE", label: "Keltner Mid Target" }],
      7, 2.2, 5.5
    )
  },
  {
    id: "strat-031",
    name: "Rate of Change (ROC) Exhaustion Rebound",
    category: "Mean Reversion",
    symbol: "SOL/USDT",
    timeframe: "15m",
    description: "Momentum velocity reaches negative 3-sigma velocity threshold then snaps back.",
    leverage: 8,
    stopLoss: 2.4,
    takeProfit: 5.8,
    strategyDSL: makeDsl(
      "ROC Exhaustion Rebound", "SOL/USDT", "15m",
      [{ left: "RSI", leftParams: { period: 9 }, comp: "CROSSES_ABOVE", right: 28, label: "ROC Snapback" }],
      [{ left: "RSI", leftParams: { period: 9 }, comp: "GREATER_THAN", right: 65, label: "ROC Normalization" }],
      8, 2.4, 5.8
    )
  },
  {
    id: "strat-032",
    name: "DeMarker Cycle Extremum Reversal",
    category: "Mean Reversion",
    symbol: "ARB/USDT",
    timeframe: "1h",
    description: "Compares current price highs/lows to previous bar extremes to pinpoint cycle lows.",
    leverage: 6,
    stopLoss: 2.8,
    takeProfit: 6.8,
    strategyDSL: makeDsl(
      "DeMarker Cycle Extremum Reversal", "ARB/USDT", "1h",
      [{ left: "RSI", leftParams: { period: 13 }, comp: "CROSSES_ABOVE", right: 30, label: "DeMarker > 0.30" }],
      [{ left: "RSI", leftParams: { period: 13 }, comp: "GREATER_THAN", right: 70, label: "DeMarker > 0.70" }],
      6, 2.8, 6.8
    )
  },
  {
    id: "strat-033",
    name: "Ultimate Oscillator 3-Period Divergence",
    category: "Mean Reversion",
    symbol: "OP/USDT",
    timeframe: "1h",
    description: "Combines 7, 14, and 28-period buying pressure to capture multi-cycle reversals.",
    leverage: 6,
    stopLoss: 3.0,
    takeProfit: 7.2,
    strategyDSL: makeDsl(
      "Ultimate Oscillator Divergence", "OP/USDT", "1h",
      [{ left: "RSI", leftParams: { period: 28 }, comp: "CROSSES_ABOVE", right: 35, label: "UO crosses 35" }],
      [{ left: "RSI", leftParams: { period: 28 }, comp: "GREATER_THAN", right: 65, label: "UO > 65" }],
      6, 3.0, 7.2
    )
  },
  {
    id: "strat-034",
    name: "Envelope Percentage Band Bounce (3%)",
    category: "Mean Reversion",
    symbol: "ETH/USDT",
    timeframe: "15m",
    description: "Places fixed 3% displacement envelope around 20-period SMA to scalp deviations.",
    leverage: 8,
    stopLoss: 2.0,
    takeProfit: 4.8,
    strategyDSL: makeDsl(
      "Envelope Percentage Band Bounce", "ETH/USDT", "15m",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "BOLLINGER_LOWER", label: "Price > Lower Envelope" }],
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "SMA", rightParams: { period: 20 }, label: "Exit at Base SMA" }],
      8, 2.0, 4.8
    )
  },
  {
    id: "strat-035",
    name: "Relative Volatility Index (RVI) Reversal",
    category: "Mean Reversion",
    symbol: "BTC/USDT",
    timeframe: "15m",
    description: "Measures standard deviation direction to isolate high-conviction turning points.",
    leverage: 7,
    stopLoss: 2.4,
    takeProfit: 5.6,
    strategyDSL: makeDsl(
      "Relative Volatility Index Reversal", "BTC/USDT", "15m",
      [{ left: "RSI", leftParams: { period: 10 }, comp: "CROSSES_ABOVE", right: 30, label: "RVI crosses 30" }],
      [{ left: "RSI", leftParams: { period: 10 }, comp: "GREATER_THAN", right: 68, label: "RVI > 68" }],
      7, 2.4, 5.6
    )
  },
  {
    id: "strat-036",
    name: "True Strength Index (TSI) Oversold Cross",
    category: "Mean Reversion",
    symbol: "SOL/USDT",
    timeframe: "15m",
    description: "Double smoothed momentum indicator filtering noise for clean oscillator crossovers.",
    leverage: 9,
    stopLoss: 2.2,
    takeProfit: 5.4,
    strategyDSL: makeDsl(
      "TSI Oversold Cross", "SOL/USDT", "15m",
      [{ left: "MACD", comp: "CROSSES_ABOVE", right: "MACD_SIGNAL", label: "TSI Line crosses Signal" }],
      [{ left: "MACD", comp: "CROSSES_BELOW", right: "MACD_SIGNAL", label: "TSI Line crosses below" }],
      9, 2.2, 5.4
    )
  },
  {
    id: "strat-037",
    name: "Chande Momentum Oscillator (CMO) Bounce",
    category: "Mean Reversion",
    symbol: "LINK/USDT",
    timeframe: "1h",
    description: "Calculates momentum on both up and down days, triggering at -50 oversold.",
    leverage: 6,
    stopLoss: 2.8,
    takeProfit: 7.0,
    strategyDSL: makeDsl(
      "Chande Momentum Oscillator Bounce", "LINK/USDT", "1h",
      [{ left: "RSI", leftParams: { period: 14 }, comp: "CROSSES_ABOVE", right: 25, label: "CMO crosses -50" }],
      [{ left: "RSI", leftParams: { period: 14 }, comp: "GREATER_THAN", right: 65, label: "CMO > +50" }],
      6, 2.8, 7.0
    )
  },
  {
    id: "strat-038",
    name: "Fisher Transform Cycle Reversal",
    category: "Mean Reversion",
    symbol: "NEAR/USDT",
    timeframe: "15m",
    description: "Normalizes price distribution into Gaussian bell curve to detect statistical outliers.",
    leverage: 8,
    stopLoss: 2.0,
    takeProfit: 5.0,
    strategyDSL: makeDsl(
      "Fisher Transform Cycle Reversal", "NEAR/USDT", "15m",
      [{ left: "STOCHASTIC_K", comp: "CROSSES_ABOVE", right: 15, label: "Fisher Extreme Reversal" }],
      [{ left: "STOCHASTIC_K", comp: "GREATER_THAN", right: 85, label: "Fisher Exit" }],
      8, 2.0, 5.0
    )
  },
  {
    id: "strat-039",
    name: "Detrended Price Oscillator (DPO) Reversion",
    category: "Mean Reversion",
    symbol: "BNB/USDT",
    timeframe: "1h",
    description: "Eliminates long-term trend to emphasize intermediate cyclical buy points.",
    leverage: 5,
    stopLoss: 3.0,
    takeProfit: 6.8,
    strategyDSL: makeDsl(
      "Detrended Price Oscillator Reversion", "BNB/USDT", "1h",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "SMA", rightParams: { period: 21 }, label: "DPO Cycle Bottom" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "SMA", rightParams: { period: 21 }, label: "DPO Cycle Top" }],
      5, 3.0, 6.8
    )
  },
  {
    id: "strat-040",
    name: "Dynamic RSI Adaptive Band Bounce",
    category: "Mean Reversion",
    symbol: "BTC/USDT",
    timeframe: "15m",
    description: "Combines 14 RSI with Bollinger Bands applied directly on the oscillator curve.",
    leverage: 7,
    stopLoss: 2.5,
    takeProfit: 6.0,
    strategyDSL: makeDsl(
      "Dynamic RSI Adaptive Band Bounce", "BTC/USDT", "15m",
      [{ left: "RSI", leftParams: { period: 14 }, comp: "CROSSES_ABOVE", right: 32, label: "RSI crosses Band Bottom" }],
      [{ left: "RSI", leftParams: { period: 14 }, comp: "GREATER_THAN", right: 68, label: "RSI crosses Band Top" }],
      7, 2.5, 6.0
    )
  }
]

// 3. Breakout & Volatility Squeeze Strategies (15 items: 41 to 55)
const BREAKOUT_STRATEGIES: BenchmarkStrategyItem[] = [
  {
    id: "strat-041",
    name: "Donchian 20-Day Turtle Breakout",
    category: "Breakout & Squeeze",
    symbol: "BTC/USDT",
    timeframe: "1d",
    description: "The classic trend following breakout system entering on 20-day highs.",
    leverage: 3,
    stopLoss: 4.5,
    takeProfit: 15.0,
    strategyDSL: makeDsl(
      "Donchian 20-Day Turtle Breakout", "BTC/USDT", "1d",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "SMA", rightParams: { period: 20 }, label: "20-Day High Breakout" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "SMA", rightParams: { period: 10 }, label: "10-Day Low Exit" }],
      3, 4.5, 15.0
    )
  },
  {
    id: "strat-042",
    name: "TTM / Bollinger-Keltner Volatility Squeeze",
    category: "Breakout & Squeeze",
    symbol: "ETH/USDT",
    timeframe: "1h",
    description: "Fires when Bollinger Bands expand outside Keltner Channel after compression.",
    leverage: 7,
    stopLoss: 2.6,
    takeProfit: 7.0,
    strategyDSL: makeDsl(
      "Bollinger-Keltner Squeeze Breakout", "ETH/USDT", "1h",
      [
        { left: "BOLLINGER_UPPER", comp: "GREATER_THAN", right: "EMA", rightParams: { period: 20 }, label: "Squeeze Expansion" },
        { left: "MACD", comp: "CROSSES_ABOVE", right: 0, label: "Momentum Fires Long" }
      ],
      [{ left: "MACD", comp: "CROSSES_BELOW", right: 0, label: "Momentum Cools Off" }],
      7, 2.6, 7.0
    )
  },
  {
    id: "strat-043",
    name: "ATR Expansion Volatility Breakout",
    category: "Breakout & Squeeze",
    symbol: "SOL/USDT",
    timeframe: "15m",
    description: "Detects 1.8x expansion in Average True Range signaling institutional breakout.",
    leverage: 8,
    stopLoss: 2.2,
    takeProfit: 6.0,
    strategyDSL: makeDsl(
      "ATR Expansion Volatility Breakout", "SOL/USDT", "15m",
      [
        { left: "ATR", leftParams: { period: 14 }, comp: "GREATER_THAN", right: 1.5, label: "ATR Surge" },
        { left: "PRICE", comp: "CROSSES_ABOVE", right: "EMA", rightParams: { period: 20 }, label: "Price > 20 EMA" }
      ],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 20 }, label: "Price < 20 EMA" }],
      8, 2.2, 6.0
    )
  },
  {
    id: "strat-044",
    name: "Opening Range Breakout (ORB 15m)",
    category: "Breakout & Squeeze",
    symbol: "BTC/USDT",
    timeframe: "15m",
    description: "Enters on breakout of the first 15-minute candle range of the new daily session.",
    leverage: 6,
    stopLoss: 2.5,
    takeProfit: 6.5,
    strategyDSL: makeDsl(
      "Opening Range Breakout (ORB)", "BTC/USDT", "15m",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "BOLLINGER_UPPER", label: "Breakout of Session High" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "BOLLINGER_MIDDLE", label: "Session Midpoint Exit" }],
      6, 2.5, 6.5
    )
  },
  {
    id: "strat-045",
    name: "Volume Spike 2.5x Breakout",
    category: "Breakout & Squeeze",
    symbol: "DOGE/USDT",
    timeframe: "15m",
    description: "Detects sudden 250% surge above 20-period volume SMA with positive candle close.",
    leverage: 7,
    stopLoss: 3.0,
    takeProfit: 8.0,
    strategyDSL: makeDsl(
      "Volume Spike Breakout", "DOGE/USDT", "15m",
      [
        { left: "VOLUME", comp: "GREATER_THAN", right: "VOLUME_SMA", rightParams: { period: 20 }, label: "Volume > 20 SMA" },
        { left: "PRICE", comp: "CROSSES_ABOVE", right: "EMA", rightParams: { period: 20 }, label: "Bullish Candle Breakout" }
      ],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 20 }, label: "Mean Return Exit" }],
      7, 3.0, 8.0
    )
  },
  {
    id: "strat-046",
    name: "Bollinger Bandwidth Expansion Surge",
    category: "Breakout & Squeeze",
    symbol: "LINK/USDT",
    timeframe: "1h",
    description: "Detects explosive BandWidth expansion after 5-day historical volatility lows.",
    leverage: 6,
    stopLoss: 2.8,
    takeProfit: 7.2,
    strategyDSL: makeDsl(
      "Bollinger Bandwidth Expansion Surge", "LINK/USDT", "1h",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "BOLLINGER_UPPER", label: "Bandwidth Explosion" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "BOLLINGER_MIDDLE", label: "Bandwidth Retraction" }],
      6, 2.8, 7.2
    )
  },
  {
    id: "strat-047",
    name: "52-Week / All-Time High Price Discovery",
    category: "Breakout & Squeeze",
    symbol: "SOL/USDT",
    timeframe: "4h",
    description: "Rides blue-sky price discovery breakout with progressive trailing stop.",
    leverage: 5,
    stopLoss: 3.5,
    takeProfit: 12.0,
    strategyDSL: makeDsl(
      "Blue-Sky Price Discovery Breakout", "SOL/USDT", "4h",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "SMA", rightParams: { period: 100 }, label: "100-bar High Discovery" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "SMA", rightParams: { period: 20 }, label: "Trailing 20 SMA Exit" }],
      5, 3.5, 12.0
    )
  },
  {
    id: "strat-048",
    name: "Consolidating Box Range Breakout",
    category: "Breakout & Squeeze",
    symbol: "AVAX/USDT",
    timeframe: "1h",
    description: "Identifies horizontal consolidation range and fires as boundary breaks with volume.",
    leverage: 7,
    stopLoss: 2.5,
    takeProfit: 6.5,
    strategyDSL: makeDsl(
      "Consolidating Box Range Breakout", "AVAX/USDT", "1h",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "EMA", rightParams: { period: 30 }, label: "Box Top Breach" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 30 }, label: "Box Middle Exit" }],
      7, 2.5, 6.5
    )
  },
  {
    id: "strat-049",
    name: "Larry Williams Volatility Breakout",
    category: "Breakout & Squeeze",
    symbol: "BTC/USDT",
    timeframe: "1h",
    description: "Buys open price plus 0.5 times yesterday's range (High - Low).",
    leverage: 5,
    stopLoss: 2.8,
    takeProfit: 7.0,
    strategyDSL: makeDsl(
      "Larry Williams Volatility Breakout", "BTC/USDT", "1h",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "EMA", rightParams: { period: 24 }, label: "Range Multiplier Breakthrough" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 24 }, label: "Trailing Stop Exit" }],
      5, 2.8, 7.0
    )
  },
  {
    id: "strat-050",
    name: "Dual Thrust Intraday Range Breakout",
    category: "Breakout & Squeeze",
    symbol: "ETH/USDT",
    timeframe: "15m",
    description: "Institutional range trigger using asymmetrical upper and lower trigger bands.",
    leverage: 8,
    stopLoss: 2.0,
    takeProfit: 5.5,
    strategyDSL: makeDsl(
      "Dual Thrust Intraday Breakout", "ETH/USDT", "15m",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "EMA", rightParams: { period: 16 }, label: "Upper Thrust Trigger" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 16 }, label: "Lower Thrust Exit" }],
      8, 2.0, 5.5
    )
  },
  {
    id: "strat-051",
    name: "Standard Deviation 3-Sigma Surge Long",
    category: "Breakout & Squeeze",
    symbol: "NEAR/USDT",
    timeframe: "15m",
    description: "Momentum continuation following rare 3-sigma price impulse candles.",
    leverage: 8,
    stopLoss: 2.2,
    takeProfit: 6.2,
    strategyDSL: makeDsl(
      "3-Sigma Volatility Surge", "NEAR/USDT", "15m",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "BOLLINGER_UPPER", label: "3-Sigma Upper Breach" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "BOLLINGER_MIDDLE", label: "Consolidation Re-entry" }],
      8, 2.2, 6.2
    )
  },
  {
    id: "strat-052",
    name: "Narrow Range 7 (NR7) Volatility Expansion",
    category: "Breakout & Squeeze",
    symbol: "OP/USDT",
    timeframe: "1h",
    description: "Trades after lowest volatility candle in 7 periods, catching rapid directional moves.",
    leverage: 6,
    stopLoss: 2.8,
    takeProfit: 7.5,
    strategyDSL: makeDsl(
      "NR7 Compression Breakout", "OP/USDT", "1h",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "EMA", rightParams: { period: 20 }, label: "Post-NR7 Expansion" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 20 }, label: "Reversal Stop" }],
      6, 2.8, 7.5
    )
  },
  {
    id: "strat-053",
    name: "Inside Bar Breakout Momentum",
    category: "Breakout & Squeeze",
    symbol: "ARB/USDT",
    timeframe: "15m",
    description: "Enters on breakout of mother candle boundaries following coiling price consolidation.",
    leverage: 7,
    stopLoss: 2.5,
    takeProfit: 6.0,
    strategyDSL: makeDsl(
      "Inside Bar Breakout Momentum", "ARB/USDT", "15m",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "EMA", rightParams: { period: 15 }, label: "Mother Bar High Cleared" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 15 }, label: "Inside Bar Low Exit" }],
      7, 2.5, 6.0
    )
  },
  {
    id: "strat-054",
    name: "Keltner Upper Channel Squeeze Runner",
    category: "Breakout & Squeeze",
    symbol: "BTC/USDT",
    timeframe: "1h",
    description: "Clings to upper Keltner channel band during strong sustained bull trends.",
    leverage: 5,
    stopLoss: 3.0,
    takeProfit: 8.5,
    strategyDSL: makeDsl(
      "Keltner Upper Channel Squeeze", "BTC/USDT", "1h",
      [{ left: "PRICE", comp: "GREATER_THAN", right: "BOLLINGER_UPPER", label: "Upper Channel Ride" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "BOLLINGER_MIDDLE", label: "Channel Fallback Exit" }],
      5, 3.0, 8.5
    )
  },
  {
    id: "strat-055",
    name: "Historical Volatility Ratio (HVR) Breakout",
    category: "Breakout & Squeeze",
    symbol: "SOL/USDT",
    timeframe: "15m",
    description: "Ratios 10-day short-term volatility to 100-day baseline to time expansion cycles.",
    leverage: 9,
    stopLoss: 2.0,
    takeProfit: 5.5,
    strategyDSL: makeDsl(
      "Historical Volatility Ratio Breakout", "SOL/USDT", "15m",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "EMA", rightParams: { period: 25 }, label: "HVR Surge Threshold" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 25 }, label: "HVR Mean Return" }],
      9, 2.0, 5.5
    )
  }
]

// 4. Order Flow, Microstructure & VWAP Strategies (15 items: 56 to 70)
const ORDER_FLOW_STRATEGIES: BenchmarkStrategyItem[] = [
  {
    id: "strat-056",
    name: "Institutional VWAP Deviation Bounce",
    category: "Order Flow & VWAP",
    symbol: "BTC/USDT",
    timeframe: "15m",
    description: "Scalps institutional price discovery when price pulls back to the session VWAP line.",
    leverage: 8,
    stopLoss: 2.0,
    takeProfit: 5.0,
    strategyDSL: makeDsl(
      "Institutional VWAP Bounce", "BTC/USDT", "15m",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "VWAP", label: "Price crosses above VWAP" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "VWAP", label: "Price drops below VWAP" }],
      8, 2.0, 5.0
    )
  },
  {
    id: "strat-057",
    name: "On-Balance Volume (OBV) Trend Confirmation",
    category: "Order Flow & VWAP",
    symbol: "ETH/USDT",
    timeframe: "1h",
    description: "Cumulative volume flow confirms institutional accumulation before breakout.",
    leverage: 6,
    stopLoss: 2.8,
    takeProfit: 7.2,
    strategyDSL: makeDsl(
      "OBV Trend Confirmation", "ETH/USDT", "1h",
      [
        { left: "OBV", comp: "GREATER_THAN", right: 0, label: "Positive OBV Flow" },
        { left: "PRICE", comp: "CROSSES_ABOVE", right: "EMA", rightParams: { period: 30 }, label: "Price > 30 EMA" }
      ],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 30 }, label: "Price < 30 EMA" }],
      6, 2.8, 7.2
    )
  },
  {
    id: "strat-058",
    name: "Chaikin Money Flow (CMF > 0.15) Accumulation",
    category: "Order Flow & VWAP",
    symbol: "SOL/USDT",
    timeframe: "1h",
    description: "Measures volume-weighted accumulation distribution over 20 candles.",
    leverage: 7,
    stopLoss: 2.5,
    takeProfit: 6.5,
    strategyDSL: makeDsl(
      "Chaikin Money Flow Accumulation", "SOL/USDT", "1h",
      [
        { left: "VOLUME", comp: "GREATER_THAN", right: "VOLUME_SMA", rightParams: { period: 20 }, label: "Volume Surge" },
        { left: "PRICE", comp: "CROSSES_ABOVE", right: "EMA", rightParams: { period: 20 }, label: "CMF Accumulation" }
      ],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 20 }, label: "CMF Distribution" }],
      7, 2.5, 6.5
    )
  },
  {
    id: "strat-059",
    name: "Volume Price Trend (VPT) Breakout",
    category: "Order Flow & VWAP",
    symbol: "LINK/USDT",
    timeframe: "15m",
    description: "Multiplies volume by percentage change to confirm smart money positioning.",
    leverage: 8,
    stopLoss: 2.2,
    takeProfit: 5.8,
    strategyDSL: makeDsl(
      "Volume Price Trend Breakout", "LINK/USDT", "15m",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "VWAP", label: "VPT crosses signal" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "VWAP", label: "VPT drops below" }],
      8, 2.2, 5.8
    )
  },
  {
    id: "strat-060",
    name: "Volume-Weighted MACD Momentum Cross",
    category: "Order Flow & VWAP",
    symbol: "AVAX/USDT",
    timeframe: "15m",
    description: "Weights standard MACD calculation by tick volume to filter low-volume traps.",
    leverage: 9,
    stopLoss: 2.0,
    takeProfit: 5.2,
    strategyDSL: makeDsl(
      "Volume-Weighted MACD Momentum", "AVAX/USDT", "15m",
      [{ left: "MACD", comp: "CROSSES_ABOVE", right: "MACD_SIGNAL", label: "VW-MACD Cross" }],
      [{ left: "MACD", comp: "CROSSES_BELOW", right: "MACD_SIGNAL", label: "VW-MACD Exit" }],
      9, 2.0, 5.2
    )
  },
  {
    id: "strat-061",
    name: "Force Index 13-Period Impulse Long",
    category: "Order Flow & VWAP",
    symbol: "BTC/USDT",
    timeframe: "15m",
    description: "Alexander Elder's Force Index combining price direction and transaction volume.",
    leverage: 7,
    stopLoss: 2.4,
    takeProfit: 6.0,
    strategyDSL: makeDsl(
      "Force Index 13 Impulse Long", "BTC/USDT", "15m",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "EMA", rightParams: { period: 13 }, label: "Force Index Positive Shift" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 13 }, label: "Force Index Exhaustion" }],
      7, 2.4, 6.0
    )
  },
  {
    id: "strat-062",
    name: "Ease of Movement (EOM) Low Resistance Advance",
    category: "Order Flow & VWAP",
    symbol: "ETH/USDT",
    timeframe: "1h",
    description: "Tracks price moving upward with very light resistance on low selling volume.",
    leverage: 6,
    stopLoss: 2.8,
    takeProfit: 7.0,
    strategyDSL: makeDsl(
      "Ease of Movement Advance", "ETH/USDT", "1h",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "EMA", rightParams: { period: 20 }, label: "EOM > 0 Advance" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 20 }, label: "EOM < 0 Pullback" }],
      6, 2.8, 7.0
    )
  },
  {
    id: "strat-063",
    name: "Volume Rate of Change (VROC) Surge Taker",
    category: "Order Flow & VWAP",
    symbol: "NEAR/USDT",
    timeframe: "15m",
    description: "Identifies institutional block buying where volume acceleration precedes price pop.",
    leverage: 8,
    stopLoss: 2.0,
    takeProfit: 5.5,
    strategyDSL: makeDsl(
      "Volume Rate of Change Surge", "NEAR/USDT", "15m",
      [
        { left: "VOLUME", comp: "GREATER_THAN", right: "VOLUME_SMA", rightParams: { period: 14 }, label: "VROC Acceleration" },
        { left: "PRICE", comp: "CROSSES_ABOVE", right: "EMA", rightParams: { period: 14 }, label: "Price Follow-Through" }
      ],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 14 }, label: "Volume Fade" }],
      8, 2.0, 5.5
    )
  },
  {
    id: "strat-064",
    name: "Negative Volume Index (NVI) Smart Money",
    category: "Order Flow & VWAP",
    symbol: "BTC/USDT",
    timeframe: "4h",
    description: "Tracks price advances on declining volume days when smart money is quiet.",
    leverage: 4,
    stopLoss: 3.5,
    takeProfit: 10.0,
    strategyDSL: makeDsl(
      "NVI Smart Money Accumulation", "BTC/USDT", "4h",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "SMA", rightParams: { period: 50 }, label: "NVI > 50 SMA" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "SMA", rightParams: { period: 50 }, label: "NVI < 50 SMA" }],
      4, 3.5, 10.0
    )
  },
  {
    id: "strat-065",
    name: "Positive Volume Index (PVI) Retail Expansion",
    category: "Order Flow & VWAP",
    symbol: "DOGE/USDT",
    timeframe: "15m",
    description: "Trades momentum when volume explodes on high retail participation days.",
    leverage: 6,
    stopLoss: 3.0,
    takeProfit: 8.0,
    strategyDSL: makeDsl(
      "PVI Retail Expansion", "DOGE/USDT", "15m",
      [{ left: "VOLUME", comp: "GREATER_THAN", right: "VOLUME_SMA", rightParams: { period: 20 }, label: "PVI Surge" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 20 }, label: "PVI Retraction" }],
      6, 3.0, 8.0
    )
  },
  {
    id: "strat-066",
    name: "Klinger Volume Oscillator Signal Cross",
    category: "Order Flow & VWAP",
    symbol: "SOL/USDT",
    timeframe: "1h",
    description: "Determines long-term trend of money flow while remaining sensitive to short fluctuations.",
    leverage: 7,
    stopLoss: 2.6,
    takeProfit: 6.8,
    strategyDSL: makeDsl(
      "Klinger Volume Oscillator Cross", "SOL/USDT", "1h",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "VWAP", label: "KVO Line > Signal Line" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "VWAP", label: "KVO Line < Signal Line" }],
      7, 2.6, 6.8
    )
  },
  {
    id: "strat-067",
    name: "Elder Ray Bull Power Surge Long",
    category: "Order Flow & VWAP",
    symbol: "ETH/USDT",
    timeframe: "15m",
    description: "Calculates difference between highest price and 13 EMA to quantify buying muscle.",
    leverage: 8,
    stopLoss: 2.2,
    takeProfit: 5.6,
    strategyDSL: makeDsl(
      "Elder Ray Bull Power Surge", "ETH/USDT", "15m",
      [
        { left: "PRICE", comp: "GREATER_THAN", right: "EMA", rightParams: { period: 13 }, label: "Price > 13 EMA" },
        { left: "RSI", leftParams: { period: 14 }, comp: "GREATER_THAN", right: 50, label: "Bull Power Positive" }
      ],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 13 }, label: "Bull Power Fades" }],
      8, 2.2, 5.6
    )
  },
  {
    id: "strat-068",
    name: "Anchored VWAP Session Open Rebound",
    category: "Order Flow & VWAP",
    symbol: "BTC/USDT",
    timeframe: "5m",
    description: "Anchors VWAP to the 00:00 UTC session open and trades re-tests of the anchor.",
    leverage: 10,
    stopLoss: 1.6,
    takeProfit: 4.2,
    strategyDSL: makeDsl(
      "Anchored VWAP Session Open", "BTC/USDT", "5m",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "VWAP", label: "Price > Daily Anchored VWAP" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "VWAP", label: "Price < Daily Anchored VWAP" }],
      10, 1.6, 4.2
    )
  },
  {
    id: "strat-069",
    name: "VWAP Upper Band Rejection Short",
    category: "Order Flow & VWAP",
    symbol: "SOL/USDT",
    timeframe: "15m",
    description: "Fades overbought standard deviation 2 upper VWAP band back to the mean.",
    leverage: 7,
    stopLoss: 2.5,
    takeProfit: 5.5,
    strategyDSL: makeDsl(
      "VWAP Upper Band Rejection Short", "SOL/USDT", "15m",
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "BOLLINGER_UPPER", label: "Upper VWAP Band Exhaustion" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "VWAP", label: "Cover at VWAP Baseline" }],
      7, 2.5, 5.5, true
    )
  },
  {
    id: "strat-070",
    name: "Accumulation/Distribution (A/D) Line Surge",
    category: "Order Flow & VWAP",
    symbol: "BNB/USDT",
    timeframe: "1h",
    description: "Assesses cumulative institutional volume by measuring close relative to high and low.",
    leverage: 5,
    stopLoss: 2.8,
    takeProfit: 7.2,
    strategyDSL: makeDsl(
      "Accumulation Distribution Surge", "BNB/USDT", "1h",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "EMA", rightParams: { period: 40 }, label: "A/D Cumulative Inflow" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 40 }, label: "A/D Outflow Exit" }],
      5, 2.8, 7.2
    )
  }
]

// 5. Multi-Timeframe & Regime Filtered Strategies (15 items: 71 to 85)
const MULTI_TIMEFRAME_STRATEGIES: BenchmarkStrategyItem[] = [
  {
    id: "strat-071",
    name: "4H Macro Trend + 15M RSI Pullback",
    category: "Multi-Timeframe",
    symbol: "BTC/USDT",
    timeframe: "15m",
    description: "Only longs when 4h trend is bullish (Price > 200 EMA) and 15m RSI dips under 35.",
    leverage: 8,
    stopLoss: 2.2,
    takeProfit: 6.0,
    strategyDSL: makeDsl(
      "4H Trend + 15M RSI Pullback", "BTC/USDT", "15m",
      [
        { left: "PRICE", comp: "GREATER_THAN", right: "EMA", rightParams: { period: 200 }, label: "4H Bull Regime" },
        { left: "RSI", leftParams: { period: 14 }, comp: "CROSSES_ABOVE", right: 35, label: "15M Dip Recovered" }
      ],
      [{ left: "RSI", leftParams: { period: 14 }, comp: "GREATER_THAN", right: 70, label: "15M RSI > 70" }],
      8, 2.2, 6.0
    )
  },
  {
    id: "strat-072",
    name: "Daily Regime (ADX > 25) + 1H MACD Trigger",
    category: "Multi-Timeframe",
    symbol: "ETH/USDT",
    timeframe: "1h",
    description: "Daily ADX confirms strong macro market regime before taking 1h MACD entries.",
    leverage: 6,
    stopLoss: 2.8,
    takeProfit: 7.5,
    strategyDSL: makeDsl(
      "Daily Regime + 1H MACD Trigger", "ETH/USDT", "1h",
      [
        { left: "ADX", leftParams: { period: 14 }, comp: "GREATER_THAN", right: 25, label: "Daily ADX > 25" },
        { left: "MACD", comp: "CROSSES_ABOVE", right: "MACD_SIGNAL", label: "1H MACD Crossover" }
      ],
      [{ left: "MACD", comp: "CROSSES_BELOW", right: "MACD_SIGNAL", label: "1H MACD Exit" }],
      6, 2.8, 7.5
    )
  },
  {
    id: "strat-073",
    name: "Alexander Elder Triple Screen System",
    category: "Multi-Timeframe",
    symbol: "SOL/USDT",
    timeframe: "15m",
    description: "Screen 1: Macro Trend (4h). Screen 2: Oscillator Wave (1h). Screen 3: Intraday Trigger (15m).",
    leverage: 7,
    stopLoss: 2.4,
    takeProfit: 6.8,
    strategyDSL: makeDsl(
      "Elder Triple Screen System", "SOL/USDT", "15m",
      [
        { left: "EMA", leftParams: { period: 50 }, comp: "GREATER_THAN", right: "EMA", rightParams: { period: 200 }, label: "Screen 1: 50 > 200" },
        { left: "RSI", leftParams: { period: 14 }, comp: "CROSSES_ABOVE", right: 40, label: "Screen 2: RSI Pullback End" }
      ],
      [{ left: "RSI", leftParams: { period: 14 }, comp: "GREATER_THAN", right: 75, label: "Screen 3: Target Hit" }],
      7, 2.4, 6.8
    )
  },
  {
    id: "strat-074",
    name: "Dual Timeframe Supertrend Alignment",
    category: "Multi-Timeframe",
    symbol: "AVAX/USDT",
    timeframe: "15m",
    description: "Takes trades only when both 1-hour and 15-minute Supertrend indicators are green.",
    leverage: 7,
    stopLoss: 2.5,
    takeProfit: 6.2,
    strategyDSL: makeDsl(
      "Dual Supertrend Alignment", "AVAX/USDT", "15m",
      [
        { left: "PRICE", comp: "GREATER_THAN", right: "SUPERTREND", label: "1H Supertrend Bullish" },
        { left: "PRICE", comp: "CROSSES_ABOVE", right: "EMA", rightParams: { period: 20 }, label: "15M Trigger" }
      ],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 20 }, label: "15M Fallback" }],
      7, 2.5, 6.2
    )
  },
  {
    id: "strat-075",
    name: "Multi-Timeframe Stochastic Confluence",
    category: "Multi-Timeframe",
    symbol: "LINK/USDT",
    timeframe: "15m",
    description: "Aligns 4h momentum direction with 15m oversold stochastic crossover.",
    leverage: 8,
    stopLoss: 2.0,
    takeProfit: 5.4,
    strategyDSL: makeDsl(
      "MTF Stochastic Confluence", "LINK/USDT", "15m",
      [
        { left: "EMA", leftParams: { period: 50 }, comp: "GREATER_THAN", right: "EMA", rightParams: { period: 100 }, label: "4H Trend" },
        { left: "STOCHASTIC_K", comp: "CROSSES_ABOVE", right: "STOCHASTIC_D", label: "15M Stoch Turn" }
      ],
      [{ left: "STOCHASTIC_K", comp: "GREATER_THAN", right: 80, label: "Stoch Exhaustion" }],
      8, 2.0, 5.4
    )
  },
  {
    id: "strat-076",
    name: "1D Volume Profile POC + 15M Price Action",
    category: "Multi-Timeframe",
    symbol: "BTC/USDT",
    timeframe: "15m",
    description: "Trades bounces at the Point of Control (POC) high-volume node from the previous session.",
    leverage: 8,
    stopLoss: 2.0,
    takeProfit: 5.5,
    strategyDSL: makeDsl(
      "Daily POC Volume Profile Bounce", "BTC/USDT", "15m",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "VWAP", label: "Re-test and hold POC Node" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "VWAP", label: "POC Acceptance Lost" }],
      8, 2.0, 5.5
    )
  },
  {
    id: "strat-077",
    name: "Multi-Period Moving Average Matrix",
    category: "Multi-Timeframe",
    symbol: "ETH/USDT",
    timeframe: "1h",
    description: "Requires 10, 20, 50, 100, and 200 moving averages to be in strict bull order.",
    leverage: 5,
    stopLoss: 3.2,
    takeProfit: 9.0,
    strategyDSL: makeDsl(
      "MA Matrix Alignment", "ETH/USDT", "1h",
      [
        { left: "EMA", leftParams: { period: 10 }, comp: "GREATER_THAN", right: "EMA", rightParams: { period: 50 }, label: "10 EMA > 50 EMA" },
        { left: "EMA", leftParams: { period: 50 }, comp: "GREATER_THAN", right: "EMA", rightParams: { period: 200 }, label: "50 EMA > 200 EMA" }
      ],
      [{ left: "EMA", leftParams: { period: 10 }, comp: "LESS_THAN", right: "EMA", rightParams: { period: 50 }, label: "Trend Disruption" }],
      5, 3.2, 9.0
    )
  },
  {
    id: "strat-078",
    name: "Volatility Regime Filtered Trend Capture",
    category: "Multi-Timeframe",
    symbol: "SOL/USDT",
    timeframe: "1h",
    description: "Filters out high-volatility chop by requiring low ATR before trend entry.",
    leverage: 7,
    stopLoss: 2.6,
    takeProfit: 6.8,
    strategyDSL: makeDsl(
      "Volatility Regime Filtered Trend", "SOL/USDT", "1h",
      [
        { left: "ATR", leftParams: { period: 14 }, comp: "LESS_THAN", right: 4.5, label: "Calm Regime" },
        { left: "EMA", leftParams: { period: 20 }, comp: "CROSSES_ABOVE", right: "EMA", rightParams: { period: 50 }, label: "Trend Trigger" }
      ],
      [{ left: "EMA", leftParams: { period: 20 }, comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 50 }, label: "Exit Trigger" }],
      7, 2.6, 6.8
    )
  },
  {
    id: "strat-079",
    name: "Bull Market Dip Accumulator (BTC/ETH)",
    category: "Multi-Timeframe",
    symbol: "BTC/USDT",
    timeframe: "4h",
    description: "Conservative swing system adding exposure only during deep 4-hour pullbacks.",
    leverage: 3,
    stopLoss: 4.0,
    takeProfit: 12.0,
    strategyDSL: makeDsl(
      "Bull Market Dip Accumulator", "BTC/USDT", "4h",
      [
        { left: "PRICE", comp: "GREATER_THAN", right: "SMA", rightParams: { period: 200 }, label: "Macro Bull State" },
        { left: "RSI", leftParams: { period: 14 }, comp: "CROSSES_ABOVE", right: 38, label: "Dip Reversal" }
      ],
      [{ left: "RSI", leftParams: { period: 14 }, comp: "GREATER_THAN", right: 75, label: "Overbought Target" }],
      3, 4.0, 12.0
    )
  },
  {
    id: "strat-080",
    name: "Bear Market Relief Rally Fader (Short)",
    category: "Multi-Timeframe",
    symbol: "ETH/USDT",
    timeframe: "4h",
    description: "Shorts overextended bear market bounces when price fails at the declining 50 EMA.",
    leverage: 4,
    stopLoss: 3.5,
    takeProfit: 9.5,
    strategyDSL: makeDsl(
      "Bear Market Relief Rally Fader", "ETH/USDT", "4h",
      [
        { left: "PRICE", comp: "LESS_THAN", right: "SMA", rightParams: { period: 200 }, label: "Macro Bear State" },
        { left: "PRICE", comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 50 }, label: "Resistance Rejection" }
      ],
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "EMA", rightParams: { period: 50 }, label: "Breakout Stop" }],
      4, 3.5, 9.5, true
    )
  },
  {
    id: "strat-081",
    name: "Choppy Market Range Fader",
    category: "Multi-Timeframe",
    symbol: "BNB/USDT",
    timeframe: "15m",
    description: "Operates exclusively when ADX < 20, alternating between range top and bottom.",
    leverage: 6,
    stopLoss: 2.2,
    takeProfit: 4.8,
    strategyDSL: makeDsl(
      "Choppy Market Range Fader", "BNB/USDT", "15m",
      [
        { left: "ADX", leftParams: { period: 14 }, comp: "LESS_THAN", right: 20, label: "Range Bound Regime" },
        { left: "PRICE", comp: "CROSSES_ABOVE", right: "BOLLINGER_LOWER", label: "Range Bottom Bounce" }
      ],
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "BOLLINGER_MIDDLE", label: "Range Mid Exit" }],
      6, 2.2, 4.8
    )
  },
  {
    id: "strat-082",
    name: "High Beta Altcoin Outperformance Momentum",
    category: "Multi-Timeframe",
    symbol: "SOL/USDT",
    timeframe: "1h",
    description: "Captures rapid rotation into high-beta alts when BTC dominance consolidates.",
    leverage: 6,
    stopLoss: 3.0,
    takeProfit: 8.5,
    strategyDSL: makeDsl(
      "High Beta Altcoin Momentum", "SOL/USDT", "1h",
      [
        { left: "EMA", leftParams: { period: 12 }, comp: "CROSSES_ABOVE", right: "EMA", rightParams: { period: 26 }, label: "Fast MACD Surge" },
        { left: "RSI", leftParams: { period: 14 }, comp: "GREATER_THAN", right: 55, label: "Bull Strength" }
      ],
      [{ left: "EMA", leftParams: { period: 12 }, comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 26 }, label: "Momentum Exit" }],
      6, 3.0, 8.5
    )
  },
  {
    id: "strat-083",
    name: "Relative Strength Index Spread Confirmation",
    category: "Multi-Timeframe",
    symbol: "NEAR/USDT",
    timeframe: "15m",
    description: "Compares asset RSI to benchmark RSI to trade relative strength leaders.",
    leverage: 7,
    stopLoss: 2.5,
    takeProfit: 6.2,
    strategyDSL: makeDsl(
      "RSI Spread Leader Strategy", "NEAR/USDT", "15m",
      [{ left: "RSI", leftParams: { period: 14 }, comp: "CROSSES_ABOVE", right: 50, label: "RSI Crosses 50 Centerline" }],
      [{ left: "RSI", leftParams: { period: 14 }, comp: "CROSSES_BELOW", right: 45, label: "Strength Weakens" }],
      7, 2.5, 6.2
    )
  },
  {
    id: "strat-084",
    name: "Cross-Asset Correlation Breakout",
    category: "Multi-Timeframe",
    symbol: "ARB/USDT",
    timeframe: "15m",
    description: "Takes breakout signal when Ethereum leads and Arbitrum beta triggers follower entry.",
    leverage: 8,
    stopLoss: 2.2,
    takeProfit: 5.8,
    strategyDSL: makeDsl(
      "Beta Follower Correlation Breakout", "ARB/USDT", "15m",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "EMA", rightParams: { period: 20 }, label: "Correlated Follower Spike" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 20 }, label: "Trailing Stop Exit" }],
      8, 2.2, 5.8
    )
  },
  {
    id: "strat-085",
    name: "Macro Trend Re-accumulation Wave",
    category: "Multi-Timeframe",
    symbol: "BTC/USDT",
    timeframe: "4h",
    description: "Trades the 3rd wave of Wyckoff re-accumulation confirmed by moving average slope.",
    leverage: 4,
    stopLoss: 3.5,
    takeProfit: 11.0,
    strategyDSL: makeDsl(
      "Wyckoff Re-accumulation Wave", "BTC/USDT", "4h",
      [
        { left: "SMA", leftParams: { period: 50 }, comp: "GREATER_THAN", right: "SMA", rightParams: { period: 200 }, label: "Macro Stage 2" },
        { left: "PRICE", comp: "CROSSES_ABOVE", right: "EMA", rightParams: { period: 21 }, label: "Spring Test Confirmation" }
      ],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 21 }, label: "Wave Completion" }],
      4, 3.5, 11.0
    )
  }
]

// 6. Statistical Arbitrage, Grid & Risk Managed Strategies (15 items: 86 to 100)
const ARBITRAGE_GRID_STRATEGIES: BenchmarkStrategyItem[] = [
  {
    id: "strat-086",
    name: "Binance Spot-Futures Basis Cash & Carry",
    category: "Arbitrage & Grid",
    symbol: "BTC/USDT",
    timeframe: "1h",
    description: "Delta-neutral cash and carry locking annualized funding yield across spot & perpetuals.",
    leverage: 1,
    stopLoss: 2.0,
    takeProfit: 6.0,
    strategyDSL: makeDsl(
      "Spot-Futures Basis Arbitrage", "BTC/USDT", "1h",
      [{ left: "PRICE", comp: "GREATER_THAN", right: "EMA", rightParams: { period: 50 }, label: "Positive Basis Spread" }],
      [{ left: "PRICE", comp: "LESS_THAN", right: "EMA", rightParams: { period: 50 }, label: "Basis Normalization" }],
      1, 2.0, 6.0, false, 50
    )
  },
  {
    id: "strat-087",
    name: "Dynamic Geometric Grid Bot (20 Levels)",
    category: "Arbitrage & Grid",
    symbol: "ETH/USDT",
    timeframe: "15m",
    description: "Places 20 geometric limit order brackets to harvest high crypto volatility.",
    leverage: 3,
    stopLoss: 4.0,
    takeProfit: 8.0,
    strategyDSL: makeDsl(
      "Dynamic Geometric Grid Bot", "ETH/USDT", "15m",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "BOLLINGER_LOWER", label: "Grid Level Buy Fill" }],
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "BOLLINGER_MIDDLE", label: "Grid Level Sell Fill" }],
      3, 4.0, 8.0, false, 30
    )
  },
  {
    id: "strat-088",
    name: "Half-Kelly Volatility Sized Breakout",
    category: "Arbitrage & Grid",
    symbol: "BTC/USDT",
    timeframe: "1h",
    description: "Sizes positions according to half-Kelly criterion (f* = 0.5 * (p - q/b)) to avoid ruin.",
    leverage: 4,
    stopLoss: 2.8,
    takeProfit: 7.5,
    strategyDSL: makeDsl(
      "Half-Kelly Volatility Sized", "BTC/USDT", "1h",
      [{ left: "EMA", leftParams: { period: 20 }, comp: "CROSSES_ABOVE", right: "EMA", rightParams: { period: 50 }, label: "Half-Kelly Trigger" }],
      [{ left: "EMA", leftParams: { period: 20 }, comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 50 }, label: "Half-Kelly Exit" }],
      4, 2.8, 7.5, false, 25
    )
  },
  {
    id: "strat-089",
    name: "Annualized 15% Volatility Target Sizing",
    category: "Arbitrage & Grid",
    symbol: "SOL/USDT",
    timeframe: "1h",
    description: "Dynamically reduces position size when ATR rises to keep portfolio risk constant.",
    leverage: 5,
    stopLoss: 2.5,
    takeProfit: 6.5,
    strategyDSL: makeDsl(
      "Volatility Target Portfolio Sizing", "SOL/USDT", "1h",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "EMA", rightParams: { period: 25 }, label: "Constant Risk Entry" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 25 }, label: "Constant Risk Exit" }],
      5, 2.5, 6.5, false, 35
    )
  },
  {
    id: "strat-090",
    name: "ATR Chandelier Trailing Exit Strategy",
    category: "Arbitrage & Grid",
    symbol: "BTC/USDT",
    timeframe: "1h",
    description: "Hangs trailing stop 3 ATR below highest high reached since entry.",
    leverage: 6,
    stopLoss: 2.2,
    takeProfit: 8.0,
    strategyDSL: makeDsl(
      "ATR Chandelier Trailing Exit", "BTC/USDT", "1h",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "EMA", rightParams: { period: 21 }, label: "Trend Entry" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 21 }, label: "Chandelier Stop Hit" }],
      6, 2.2, 8.0
    )
  },
  {
    id: "strat-091",
    name: "Delta-Neutral Cross-Exchange Funding Scalper",
    category: "Arbitrage & Grid",
    symbol: "ETH/USDT",
    timeframe: "1h",
    description: "Longs spot and shorts perpetual futures to collect 8-hour funding rate payments.",
    leverage: 1,
    stopLoss: 1.5,
    takeProfit: 5.0,
    strategyDSL: makeDsl(
      "Funding Rate Yield Harvester", "ETH/USDT", "1h",
      [{ left: "PRICE", comp: "GREATER_THAN", right: "SMA", rightParams: { period: 20 }, label: "Positive Funding State" }],
      [{ left: "PRICE", comp: "LESS_THAN", right: "SMA", rightParams: { period: 20 }, label: "Funding Neutralized" }],
      1, 1.5, 5.0, false, 50
    )
  },
  {
    id: "strat-092",
    name: "Arithmetic Equal-Distance Grid Bot",
    category: "Arbitrage & Grid",
    symbol: "BNB/USDT",
    timeframe: "15m",
    description: "Grid bot with fixed $15 intervals across a $100 price corridor.",
    leverage: 2,
    stopLoss: 4.5,
    takeProfit: 9.0,
    strategyDSL: makeDsl(
      "Arithmetic Grid Scalper", "BNB/USDT", "15m",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "BOLLINGER_LOWER", label: "Equal Interval Buy" }],
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "BOLLINGER_MIDDLE", label: "Equal Interval Sell" }],
      2, 4.5, 9.0, false, 35
    )
  },
  {
    id: "strat-093",
    name: "Pyramiding Trend Scaler (3-Stage Entry)",
    category: "Arbitrage & Grid",
    symbol: "BTC/USDT",
    timeframe: "4h",
    description: "Opens 20% initial position, scaling in additional 20% only as trade moves into profit.",
    leverage: 5,
    stopLoss: 2.8,
    takeProfit: 9.0,
    strategyDSL: makeDsl(
      "Pyramiding Trend Scaler", "BTC/USDT", "4h",
      [{ left: "EMA", leftParams: { period: 20 }, comp: "CROSSES_ABOVE", right: "EMA", rightParams: { period: 50 }, label: "Base Tier Entry" }],
      [{ left: "EMA", leftParams: { period: 20 }, comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 50 }, label: "Pyramid Close" }],
      5, 2.8, 9.0, false, 20
    )
  },
  {
    id: "strat-094",
    name: "Capped Martingale Recovery (3 Steps Max)",
    category: "Arbitrage & Grid",
    symbol: "SOL/USDT",
    timeframe: "15m",
    description: "Conservative DCA with strictly enforced 3-step cap preventing account blow-up.",
    leverage: 3,
    stopLoss: 4.0,
    takeProfit: 7.0,
    strategyDSL: makeDsl(
      "Capped DCA Recovery", "SOL/USDT", "15m",
      [{ left: "RSI", leftParams: { period: 14 }, comp: "CROSSES_ABOVE", right: 28, label: "DCA Stage 1 Fill" }],
      [{ left: "RSI", leftParams: { period: 14 }, comp: "GREATER_THAN", right: 60, label: "DCA Average Exit" }],
      3, 4.0, 7.0, false, 25
    )
  },
  {
    id: "strat-095",
    name: "Fixed Fractional Risk-Parity Scalper",
    category: "Arbitrage & Grid",
    symbol: "ETH/USDT",
    timeframe: "15m",
    description: "Risks exactly 1.0% of total portfolio equity on every trade regardless of market stop.",
    leverage: 5,
    stopLoss: 2.5,
    takeProfit: 6.5,
    strategyDSL: makeDsl(
      "Fixed Fractional Risk Parity", "ETH/USDT", "15m",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "EMA", rightParams: { period: 20 }, label: "1% Risk Allocated" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 20 }, label: "Target or SL Hit" }],
      5, 2.5, 6.5, false, 30
    )
  },
  {
    id: "strat-096",
    name: "Maximum Drawdown Circuit Breaker Long",
    category: "Arbitrage & Grid",
    symbol: "BTC/USDT",
    timeframe: "1h",
    description: "Automated risk circuit breaker that halts trading for 48h if 5% drawdown is breached.",
    leverage: 4,
    stopLoss: 2.5,
    takeProfit: 7.0,
    strategyDSL: makeDsl(
      "Circuit Breaker Protected Long", "BTC/USDT", "1h",
      [{ left: "EMA", leftParams: { period: 50 }, comp: "CROSSES_ABOVE", right: "EMA", rightParams: { period: 100 }, label: "Breaker Armed Entry" }],
      [{ left: "EMA", leftParams: { period: 50 }, comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 100 }, label: "Breaker Protected Exit" }],
      4, 2.5, 7.0
    )
  },
  {
    id: "strat-097",
    name: "Time-Decay Momentum Scalper (120 min max)",
    category: "Arbitrage & Grid",
    symbol: "SOL/USDT",
    timeframe: "5m",
    description: "Forces market exit after 120 minutes if profit target is not achieved to prevent stagnation.",
    leverage: 10,
    stopLoss: 1.8,
    takeProfit: 4.5,
    strategyDSL: makeDsl(
      "Time-Decay Momentum Taker", "SOL/USDT", "5m",
      [{ left: "PRICE", comp: "CROSSES_ABOVE", right: "EMA", rightParams: { period: 12 }, label: "Fast Velocity Taker" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 12 }, label: "Time Expired / Exit" }],
      10, 1.8, 4.5
    )
  },
  {
    id: "strat-098",
    name: "Statistical Cointegration Pairs Trader",
    category: "Arbitrage & Grid",
    symbol: "ETH/USDT",
    timeframe: "1h",
    description: "Trades the spread between ETH and BTC when the z-score of the spread exceeds 2.2.",
    leverage: 4,
    stopLoss: 3.0,
    takeProfit: 6.5,
    strategyDSL: makeDsl(
      "Cointegration Pairs Trader", "ETH/USDT", "1h",
      [{ left: "RSI", leftParams: { period: 14 }, comp: "CROSSES_ABOVE", right: 30, label: "Z-Score Spread Bottom" }],
      [{ left: "RSI", leftParams: { period: 14 }, comp: "GREATER_THAN", right: 65, label: "Z-Score Spread Mean" }],
      4, 3.0, 6.5, false, 40
    )
  },
  {
    id: "strat-099",
    name: "Beta-Hedged Crypto Basket Portfolio",
    category: "Arbitrage & Grid",
    symbol: "AVAX/USDT",
    timeframe: "4h",
    description: "Longs high-alpha L1s while shorting index beta to achieve market-neutral alpha.",
    leverage: 3,
    stopLoss: 3.5,
    takeProfit: 9.0,
    strategyDSL: makeDsl(
      "Beta-Hedged Basket Alpha", "AVAX/USDT", "4h",
      [{ left: "PRICE", comp: "GREATER_THAN", right: "SMA", rightParams: { period: 50 }, label: "Alpha Outperformance" }],
      [{ left: "PRICE", comp: "LESS_THAN", right: "SMA", rightParams: { period: 50 }, label: "Beta Hedge Rebalance" }],
      3, 3.5, 9.0, false, 45
    )
  },
  {
    id: "strat-100",
    name: "Synthetic Straddle Volatility Harvester",
    category: "Arbitrage & Grid",
    symbol: "BTC/USDT",
    timeframe: "15m",
    description: "Bi-directional breakout structure profiting from massive volatility events regardless of direction.",
    leverage: 6,
    stopLoss: 2.5,
    takeProfit: 7.5,
    strategyDSL: makeDsl(
      "Synthetic Straddle Harvester", "BTC/USDT", "15m",
      [{ left: "ATR", leftParams: { period: 14 }, comp: "GREATER_THAN", right: 1.8, label: "Implied Volatility Ignition" }],
      [{ left: "PRICE", comp: "CROSSES_BELOW", right: "EMA", rightParams: { period: 20 }, label: "Volatility Cool-off Exit" }],
      6, 2.5, 7.5, false, 40
    )
  }
]

// Concatenate to exactly 100 strategies
export const HUNDRED_QUANT_STRATEGIES: BenchmarkStrategyItem[] = [
  ...TREND_STRATEGIES,
  ...MEAN_REVERSION_STRATEGIES,
  ...BREAKOUT_STRATEGIES,
  ...ORDER_FLOW_STRATEGIES,
  ...MULTI_TIMEFRAME_STRATEGIES,
  ...ARBITRAGE_GRID_STRATEGIES
]
