import { parseStrategyWithGroq } from '../src/lib/parser/groq';
import { runLocalBacktest, generateMockData, getRealisticAssetPrice } from '../src/lib/backtester/engine';

const GROQ_KEY = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY || '';

const TEST_PROMPTS = [
  {
    name: "1. BTC EMA Crossover + RSI Scalp (10x Lev)",
    prompt: "Buy BTC when 20 EMA crosses above 50 EMA on 15m and RSI < 35, stop loss 2%, take profit 6%, 10x leverage",
    isStrategy: true
  },
  {
    name: "2. ETH Short Momentum Death Cross (5x Lev)",
    prompt: "Go short ETH when 50 EMA crosses below 200 EMA on 1h and MACD histogram < 0, stop loss 3%, take profit 8%, 5x leverage",
    isStrategy: true
  },
  {
    name: "3. SOL Bollinger Mean Reversion (5x Lev)",
    prompt: "Long SOL when price is below lower Bollinger Band and RSI < 30 on 5m, 2% trailing stop, take profit 7%, 5x leverage",
    isStrategy: true
  },
  {
    name: "4. AVAX Supertrend + ATR Trailing Stop (3x Lev)",
    prompt: "Buy AVAX when price is above Supertrend on 15m with 2.5% ATR trailing stop and 3x leverage, take profit 9%",
    isStrategy: true
  },
  {
    name: "5. Conversational Quant Inquiry",
    prompt: "Explain how Kelly Criterion and expected value E[R] apply to high frequency crypto algorithms",
    isStrategy: false
  }
];

async function runGroqDeepTest() {
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('⚡ AlgoRush Groq Real Model & Deep Backtesting Live Integration Suite');
  console.log('════════════════════════════════════════════════════════════════════════════\n');

  let passed = 0;
  let failed = 0;

  for (const t of TEST_PROMPTS) {
    console.log(`\n▶ Testing: ${t.name}`);
    console.log(`  Prompt: "${t.prompt}"`);
    const start = Date.now();

    try {
      const response = await parseStrategyWithGroq({
        text: t.prompt,
        model: 'groq-gpt-120b', // Resolves to openai/gpt-oss-120b
        apiKey: GROQ_KEY
      });

      const elapsed = Date.now() - start;
      console.log(`  ✓ Groq Response received in ${elapsed}ms using ${response.modelUsed}`);
      console.log(`  • Status: ${response.status}`);

      if (!t.isStrategy) {
        if (response.status === 'CONVERSATIONAL' && response.conversationalResponse) {
          console.log(`  ✓ Verified conversational response (${response.conversationalResponse.length} chars)`);
          passed++;
        } else {
          console.error(`  ✗ Expected CONVERSATIONAL status but got ${response.status}`);
          failed++;
        }
        continue;
      }

      if (response.status !== 'SUCCESS' || !response.strategy) {
        console.error(`  ✗ Expected SUCCESS status with strategy DSL but got: ${response.status}`);
        failed++;
        continue;
      }

      const strat = response.strategy;
      const symbol = strat.instruments?.[0]?.symbol || 'BTC/USDT';
      const tf = strat.timeframe || '15m';
      const side = strat.action?.type || 'BUY';
      const lev = strat.action?.leverage || strat.riskParameters?.leverage || 1;
      const sl = strat.riskParameters?.stopLossPercentage;
      const tp = strat.riskParameters?.takeProfitPercentage;

      console.log(`  • Strategy: "${strat.name}"`);
      console.log(`  • Asset: ${symbol} | Timeframe: ${tf} | Side: ${side} | Leverage: ${lev}x`);
      console.log(`  • Risk: SL ${sl}% | TP ${tp}% | Entries: ${strat.entryConditions?.length} | Exits: ${strat.exitConditions?.length}`);

      // Run Deep Backtest
      const { price, volatility } = getRealisticAssetPrice(symbol);
      const testCandles = generateMockData(90, price, tf, volatility);
      const backtest = runLocalBacktest(strat, testCandles, 10000, lev, 0.05, 0.03);

      const m = backtest.metrics;
      console.log(`  📊 Deep Backtest Results (90-Day Simulation on ${symbol}):`);
      console.log(`     • Return: ${m.totalReturn} (Benchmark: ${m.benchmarkReturn})`);
      console.log(`     • Win Rate: ${m.winRate} (${m.winningTrades}W / ${m.losingTrades}L) | Trades: ${m.totalTrades}`);
      console.log(`     • Sharpe: ${m.sharpeRatio} | Sortino: ${m.sortinoRatio} | Calmar: ${m.calmarRatio}`);
      console.log(`     • Max Drawdown: ${m.maxDrawdown} | VaR 95%: ${m.monteCarloVar95}`);
      console.log(`     • Fees: ${m.feeCostTotal} | Slippage: ${m.slippageCostTotal}`);

      // Sanity checks
      if (
        !isNaN(m.totalReturnRaw) &&
        !isNaN(m.winRateRaw) &&
        !isNaN(m.maxDrawdownRaw) &&
        backtest.equityCurve.length > 0 &&
        Array.isArray(backtest.trades)
      ) {
        console.log(`  ✓ Deep Backtest passed with 0 NaN values & ${backtest.trades.length} executed trades`);
        passed++;
      } else {
        console.error(`  ✗ Backtest produced invalid or NaN values`);
        failed++;
      }

    } catch (err: any) {
      console.error(`  ✗ Error running test: ${err.message}`);
      failed++;
    }

    await new Promise(r => setTimeout(r, 6000));
  }

  console.log('\n════════════════════════════════════════════════════════════════════════════');
  console.log(`🏁 GROQ REAL MODEL & DEEP BACKTEST SUITE COMPLETE: ${passed}/${TEST_PROMPTS.length} PASSED (${failed} failed)`);
  console.log('════════════════════════════════════════════════════════════════════════════\n');

  if (failed > 0) process.exit(1);
}

runGroqDeepTest();
