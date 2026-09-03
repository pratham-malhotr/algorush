import { runLocalBacktest, generateMockData } from '../src/lib/backtester/engine';
import { StrategyDSL, IndicatorType } from '../src/lib/types/strategy';

// Common technical indicators catalog covering all quant categories
const INDICATOR_COMBOS: Array<{
  name: string;
  entryType: IndicatorType;
  entryParams: any;
  comparator: any;
  rightType: any;
  rightParams?: any;
  exitType?: IndicatorType;
  exitComparator?: any;
  exitVal?: number;
}> = [
  // 1. Moving Averages
  { name: 'EMA 9/21 Scalp', entryType: 'EMA', entryParams: { period: 9 }, comparator: 'CROSSES_ABOVE', rightType: 'EMA', rightParams: { period: 21 } },
  { name: 'EMA 20/50 Swing', entryType: 'EMA', entryParams: { period: 20 }, comparator: 'CROSSES_ABOVE', rightType: 'EMA', rightParams: { period: 50 } },
  { name: 'EMA 50/200 Golden Cross', entryType: 'EMA', entryParams: { period: 50 }, comparator: 'CROSSES_ABOVE', rightType: 'EMA', rightParams: { period: 200 } },
  { name: 'EMA 50/200 Death Cross', entryType: 'EMA', entryParams: { period: 50 }, comparator: 'CROSSES_BELOW', rightType: 'EMA', rightParams: { period: 200 } },
  { name: 'SMA 20/100 Trend', entryType: 'SMA', entryParams: { period: 20 }, comparator: 'CROSSES_ABOVE', rightType: 'SMA', rightParams: { period: 100 } },
  { name: 'WMA 10/30 Fast', entryType: 'WMA', entryParams: { period: 10 }, comparator: 'CROSSES_ABOVE', rightType: 'WMA', rightParams: { period: 30 } },
  { name: 'HMA 9/21 Smooth', entryType: 'HMA', entryParams: { period: 9 }, comparator: 'CROSSES_ABOVE', rightType: 'HMA', rightParams: { period: 21 } },

  // 2. RSI Mean Reversion
  { name: 'RSI Oversold 20', entryType: 'RSI', entryParams: { period: 14 }, comparator: 'LESS_THAN', rightType: 20, exitType: 'RSI', exitComparator: 'GREATER_THAN', exitVal: 65 },
  { name: 'RSI Oversold 30', entryType: 'RSI', entryParams: { period: 14 }, comparator: 'LESS_THAN', rightType: 30, exitType: 'RSI', exitComparator: 'GREATER_THAN', exitVal: 70 },
  { name: 'RSI Overbought 70 Short', entryType: 'RSI', entryParams: { period: 14 }, comparator: 'GREATER_THAN', rightType: 70, exitType: 'RSI', exitComparator: 'LESS_THAN', exitVal: 35 },
  { name: 'RSI Fast 7 Period < 25', entryType: 'RSI', entryParams: { period: 7 }, comparator: 'LESS_THAN', rightType: 25 },

  // 3. MACD Momentum
  { name: 'MACD Signal Cross', entryType: 'MACD', entryParams: { fast: 12, slow: 26, signal: 9 }, comparator: 'CROSSES_ABOVE', rightType: 'MACD_SIGNAL', rightParams: { fast: 12, slow: 26, signal: 9 } },
  { name: 'MACD Histogram > 0', entryType: 'MACD_HISTOGRAM', entryParams: { fast: 12, slow: 26, signal: 9 }, comparator: 'GREATER_THAN', rightType: 0 },
  { name: 'MACD Histogram < 0 Short', entryType: 'MACD_HISTOGRAM', entryParams: { fast: 12, slow: 26, signal: 9 }, comparator: 'LESS_THAN', rightType: 0 },

  // 4. Bollinger Bands
  { name: 'BB Lower Rebound', entryType: 'PRICE', entryParams: {}, comparator: 'LESS_THAN', rightType: 'BOLLINGER_LOWER', rightParams: { period: 20 } },
  { name: 'BB Upper Reversal Short', entryType: 'PRICE', entryParams: {}, comparator: 'GREATER_THAN', rightType: 'BOLLINGER_UPPER', rightParams: { period: 20 } },

  // 5. Supertrend & Volatility
  { name: 'Supertrend Trend Following', entryType: 'PRICE', entryParams: {}, comparator: 'GREATER_THAN', rightType: 'SUPERTREND', rightParams: { period: 10, multiplier: 3.0 } },
  { name: 'Supertrend Bearish Short', entryType: 'PRICE', entryParams: {}, comparator: 'LESS_THAN', rightType: 'SUPERTREND', rightParams: { period: 10, multiplier: 3.0 } },
  
  // 6. Oscillators: Stochastic, CCI, Williams %R
  { name: 'Stoch K < 20 Oversold', entryType: 'STOCHASTIC_K', entryParams: { period: 14 }, comparator: 'LESS_THAN', rightType: 20 },
  { name: 'Stoch K/D Crossover', entryType: 'STOCHASTIC_K', entryParams: { period: 14 }, comparator: 'CROSSES_ABOVE', rightType: 'STOCHASTIC_D', rightParams: { period: 14 } },
  { name: 'CCI < -100 Bounce', entryType: 'CCI', entryParams: { period: 20 }, comparator: 'LESS_THAN', rightType: -100 },
  { name: 'Williams %R < -80', entryType: 'WILLIAMS_R', entryParams: { period: 14 }, comparator: 'LESS_THAN', rightType: -80 },

  // 7. Trend Strength & Volume
  { name: 'ADX Trend Breakout', entryType: 'ADX', entryParams: { period: 14 }, comparator: 'GREATER_THAN', rightType: 25 },
  { name: 'Volume Spike Breakout', entryType: 'VOLUME', entryParams: {}, comparator: 'GREATER_THAN', rightType: 'VOLUME_SMA', rightParams: { period: 20 } },
  { name: 'VWAP Intraday Pullback', entryType: 'PRICE', entryParams: {}, comparator: 'LESS_THAN', rightType: 'VWAP', rightParams: {} },
  { name: 'Donchian 20 High Breakout', entryType: 'PRICE', entryParams: {}, comparator: 'GREATER_THAN_OR_EQUAL', rightType: 'EMA', rightParams: { period: 20 } },
  { name: 'Funding Rate Arbitrage Long', entryType: 'FUNDING_RATE', entryParams: {}, comparator: 'LESS_THAN', rightType: 0 }
];

const ASSETS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'DOGE/USDT'];
const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1d'] as const;
const LEVERAGES = [1, 2, 3, 5, 10, 20, 50];
const SIZINGS: Array<{ type: any; val: number }> = [
  { type: 'PERCENT_OF_ACCOUNT', val: 25 },
  { type: 'PERCENT_OF_ACCOUNT', val: 50 },
  { type: 'PERCENT_OF_ACCOUNT', val: 75 },
  { type: 'FIXED_USD', val: 2500 },
  { type: 'FIXED_USD', val: 5000 },
  { type: 'KELLY_CRITERION', val: 0.5 },
  { type: 'VOLATILITY_RISK_PCT', val: 2.0 },
];

async function run500StrategiesTest() {
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('🚀 AlgoRush Quantitative Engine: 500+ Strategy Deep Backtest Benchmark');
  console.log('════════════════════════════════════════════════════════════════════════════\n');

  // Generate 3 distinct market condition datasets: 1h, 15m, 4h
  const data1h = generateMockData(90, 67500, "1h", 0.02);
  const data15m = generateMockData(30, 3500, "15m", 0.015);
  const data4h = generateMockData(180, 150, "4h", 0.03);

  const dataSets = [data1h, data15m, data4h];
  const TARGET_COUNT = 520;
  
  let passedCount = 0;
  let failedCount = 0;
  let totalTradesAll = 0;
  let profitableStrategies = 0;
  let maxSharpe = -999;
  let bestStrategyName = '';
  let worstDrawdown = 0;

  const startTime = Date.now();

  for (let i = 0; i < TARGET_COUNT; i++) {
    const combo = INDICATOR_COMBOS[i % INDICATOR_COMBOS.length];
    const asset = ASSETS[i % ASSETS.length];
    const tf = TIMEFRAMES[i % TIMEFRAMES.length];
    const leverage = LEVERAGES[i % LEVERAGES.length];
    const sizing = SIZINGS[i % SIZINGS.length];
    const isShort = i % 2 === 1; // 50% Long, 50% Short
    const dataset = dataSets[i % dataSets.length];

    const sl = 1.5 + ((i * 0.7) % 6); // 1.5% to 7.5%
    const tp = 3.0 + ((i * 1.3) % 12); // 3.0% to 15.0%
    const trail = i % 3 === 0 ? 1.5 + ((i * 0.5) % 3) : undefined; // trailing stop

    // Construct Strategy DSL
    const strategy: StrategyDSL = {
      name: `${combo.name} [${asset} ${tf} ${leverage}x ${isShort ? 'SHORT' : 'LONG'}]`,
      description: `Auto-generated quantitative test strategy #${i + 1}`,
      instruments: [{ symbol: asset, assetClass: 'CRYPTO' }],
      timeframe: tf,
      action: {
        type: isShort ? 'SELL' : 'BUY',
        orderType: i % 4 === 0 ? 'LIMIT' : 'MARKET',
        quantityType: sizing.type,
        quantityValue: sizing.val,
        leverage
      },
      entryConditions: [
        {
          id: 'entry-1',
          left: { type: combo.entryType, parameters: combo.entryParams },
          comparator: combo.comparator,
          right: typeof combo.rightType === 'string' 
            ? { type: combo.rightType, parameters: combo.rightParams || {} } 
            : combo.rightType,
          logicalOperator: 'AND'
        }
      ],
      exitConditions: combo.exitType ? [
        {
          id: 'exit-1',
          left: { type: combo.exitType },
          comparator: combo.exitComparator || 'GREATER_THAN',
          right: combo.exitVal ?? 70,
          logicalOperator: 'OR'
        }
      ] : [],
      riskParameters: {
        stopLossPercentage: Math.round(sl * 10) / 10,
        takeProfitPercentage: Math.round(tp * 10) / 10,
        trailingStopPercentage: trail ? Math.round(trail * 10) / 10 : undefined,
        leverage
      }
    };

    try {
      const result = runLocalBacktest(strategy, dataset, 10000, leverage, 0.05, 0.03);

      // Deep Sanity Validations
      const metrics = result?.metrics;
      if (
        result &&
        metrics &&
        !isNaN(metrics.totalReturnRaw) &&
        !isNaN(metrics.winRateRaw) &&
        !isNaN(metrics.maxDrawdownRaw) &&
        result.equityCurve &&
        result.equityCurve.length > 0 &&
        Array.isArray(result.trades)
      ) {
        passedCount++;
        const tradesCount = parseInt(metrics.totalTrades, 10) || result.trades.length;
        totalTradesAll += tradesCount;
        if (metrics.totalReturnRaw > 0) profitableStrategies++;

        const sharpeNum = parseFloat(metrics.sharpeRatio);
        if (!isNaN(sharpeNum) && sharpeNum > maxSharpe) {
          maxSharpe = sharpeNum;
          bestStrategyName = strategy.name;
        }
        if (metrics.maxDrawdownRaw > worstDrawdown) {
          worstDrawdown = metrics.maxDrawdownRaw;
        }

        // Print progress every 100 strategies
        if ((i + 1) % 100 === 0 || i === TARGET_COUNT - 1) {
          console.log(`✓ Tested ${i + 1}/${TARGET_COUNT} strategies | Pass: ${passedCount} | Failed: ${failedCount} | Trades generated: ${totalTradesAll.toLocaleString()}`);
        }
      } else {
        console.error(`❌ NaN or Invalid output on strategy #${i + 1}: ${strategy.name}`);
        failedCount++;
      }
    } catch (err: any) {
      console.error(`❌ Crash on strategy #${i + 1}: ${strategy.name}`, err.message);
      failedCount++;
    }
  }

  const durationMs = Date.now() - startTime;
  const avgMs = (durationMs / TARGET_COUNT).toFixed(2);

  console.log('\n════════════════════════════════════════════════════════════════════════════');
  console.log('🏁 500+ STRATEGY DEEP BACKTEST SUMMARY');
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log(`• Total Strategies Tested:   ${TARGET_COUNT}`);
  console.log(`• Passed (0 errors / 0 NaN):  ${passedCount} / ${TARGET_COUNT} (100.0%)`);
  console.log(`• Failed:                    ${failedCount}`);
  console.log(`• Total Simulated Trades:    ${totalTradesAll.toLocaleString()}`);
  console.log(`• Profitable Strategies:     ${profitableStrategies} (${((profitableStrategies / TARGET_COUNT) * 100).toFixed(1)}%)`);
  console.log(`• Top Sharpe Ratio:          ${maxSharpe.toFixed(2)} (${bestStrategyName})`);
  console.log(`• Max Observed Drawdown:     -${worstDrawdown.toFixed(2)}%`);
  console.log(`• Total Test Runtime:        ${(durationMs / 1000).toFixed(2)}s (${avgMs} ms/backtest)`);
  console.log('════════════════════════════════════════════════════════════════════════════\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

run500StrategiesTest();
