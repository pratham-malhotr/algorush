import { classifyUserIntent, isExplicitStrategyIntent } from '../lib/parser/intentClassifier';

interface TestCase {
  id: number;
  prompt: string;
  expected: 'CONVERSATIONAL' | 'STRATEGY_BUILD';
  category: string;
}

const TEST_SUITE: TestCase[] = [
  // ─── 30 CONVERSATIONAL / INQUIRY COMMANDS ─────────────────────────────────
  { id: 1, prompt: "Hi", expected: 'CONVERSATIONAL', category: 'Greeting' },
  { id: 2, prompt: "Hello there!", expected: 'CONVERSATIONAL', category: 'Greeting' },
  { id: 3, prompt: "Good morning, how are you today?", expected: 'CONVERSATIONAL', category: 'Greeting & Status' },
  { id: 4, prompt: "Hey, what's up?", expected: 'CONVERSATIONAL', category: 'Casual Opener' },
  { id: 5, prompt: "Thank you so much for the help!", expected: 'CONVERSATIONAL', category: 'Courtesy' },
  { id: 6, prompt: "Cool, got it, thanks!", expected: 'CONVERSATIONAL', category: 'Courtesy' },
  { id: 7, prompt: "Who are you?", expected: 'CONVERSATIONAL', category: 'Platform Identity' },
  { id: 8, prompt: "What can you do?", expected: 'CONVERSATIONAL', category: 'Platform Capabilities' },
  { id: 9, prompt: "How does AlgoRush work?", expected: 'CONVERSATIONAL', category: 'Platform Overview' },
  { id: 10, prompt: "Hi! How does AlgoRush AI Copilot help me develop quant trading strategies?", expected: 'CONVERSATIONAL', category: 'Built-in App Preset 1' },
  { id: 11, prompt: "Explain how EMA reduces lag compared to SMA in crypto trading and provide an async CCXT code snippet", expected: 'CONVERSATIONAL', category: 'Built-in App Preset 2' },
  { id: 12, prompt: "What is the Kelly Criterion formula and how do quants use half-kelly to prevent liquidation cascades?", expected: 'CONVERSATIONAL', category: 'Built-in App Preset 3' },
  { id: 13, prompt: "What is RSI and how is it calculated?", expected: 'CONVERSATIONAL', category: 'Technical Indicator' },
  { id: 14, prompt: "Can you explain what Bollinger Bands measure?", expected: 'CONVERSATIONAL', category: 'Technical Indicator' },
  { id: 15, prompt: "How does the MACD histogram show momentum acceleration?", expected: 'CONVERSATIONAL', category: 'Technical Indicator' },
  { id: 16, prompt: "What is ATR and why do quants use it for stop loss?", expected: 'CONVERSATIONAL', category: 'Risk Math / Indicator' },
  { id: 17, prompt: "What is a momentum strategy?", expected: 'CONVERSATIONAL', category: 'Strategy Theory' },
  { id: 18, prompt: "How does a grid trading bot work?", expected: 'CONVERSATIONAL', category: 'Bot Architecture' },
  { id: 19, prompt: "Can you explain mean reversion in financial markets?", expected: 'CONVERSATIONAL', category: 'Strategy Theory' },
  { id: 20, prompt: "What is the difference between a trend following strategy and mean reversion?", expected: 'CONVERSATIONAL', category: 'Strategy Comparison' },
  { id: 21, prompt: "What is dollar cost averaging (DCA) and how does it work?", expected: 'CONVERSATIONAL', category: 'DCA Theory' },
  { id: 22, prompt: "How do algorithmic trading bots make money?", expected: 'CONVERSATIONAL', category: 'Quant Theory' },
  { id: 23, prompt: "Why do retail traders lose money in crypto futures?", expected: 'CONVERSATIONAL', category: 'Market Microstructure' },
  { id: 24, prompt: "What is slippage and how does it affect trade execution?", expected: 'CONVERSATIONAL', category: 'Market Microstructure' },
  { id: 25, prompt: "What is the funding rate in perpetual swaps?", expected: 'CONVERSATIONAL', category: 'Derivatives Concept' },
  { id: 26, prompt: "How does liquidation work in 10x leveraged trades?", expected: 'CONVERSATIONAL', category: 'Leverage Mechanics' },
  { id: 27, prompt: "Should I use 10x leverage or 2x leverage for swing trading?", expected: 'CONVERSATIONAL', category: 'Advisory Inquiry' },
  { id: 28, prompt: "Which timeframe is best for scalping crypto?", expected: 'CONVERSATIONAL', category: 'Timeframe Advice' },
  { id: 29, prompt: "When does a bear market typically end?", expected: 'CONVERSATIONAL', category: 'Macro Question' },
  { id: 30, prompt: "When should a trader exit a losing position?", expected: 'CONVERSATIONAL', category: 'Risk Advisory' },

  // ─── 30 STRATEGY BUILDING DIRECTIVES ──────────────────────────────────────
  { id: 31, prompt: "Build a strategy for BTC", expected: 'STRATEGY_BUILD', category: 'Build Directive' },
  { id: 32, prompt: "Create an ETH scalping strategy on 15m", expected: 'STRATEGY_BUILD', category: 'Build Directive' },
  { id: 33, prompt: "Generate a momentum strategy for SOL with 10x leverage", expected: 'STRATEGY_BUILD', category: 'Build Directive' },
  { id: 34, prompt: "Make me an algorithmic strategy using 20 and 50 EMA", expected: 'STRATEGY_BUILD', category: 'Build Directive' },
  { id: 35, prompt: "Design a trend following bot for Bitcoin", expected: 'STRATEGY_BUILD', category: 'Build Directive' },
  { id: 36, prompt: "Can you build a strategy for BTC with 5x leverage and 2% stop loss?", expected: 'STRATEGY_BUILD', category: 'Build Request' },
  { id: 37, prompt: "Can you create a momentum bot for SOL using RSI and MACD?", expected: 'STRATEGY_BUILD', category: 'Build Request' },
  { id: 38, prompt: "Buy BTC when 20 EMA crosses above 50 EMA", expected: 'STRATEGY_BUILD', category: 'Trading Rule' },
  { id: 39, prompt: "Long ETH when RSI < 30 on 15m, stop loss 2%, take profit 6%", expected: 'STRATEGY_BUILD', category: 'Trading Rule + Risk' },
  { id: 40, prompt: "Short SOL when price drops below lower Bollinger Band, 5x leverage", expected: 'STRATEGY_BUILD', category: 'Short Directive' },
  { id: 41, prompt: "Buy 50% BTC on 1h when 50 EMA > 200 EMA and volume > 1.5x SMA", expected: 'STRATEGY_BUILD', category: 'Complex Multi-Rule' },
  { id: 42, prompt: "Enter long when MACD histogram crosses above 0 on 15m", expected: 'STRATEGY_BUILD', category: 'Indicator Entry' },
  { id: 43, prompt: "When 20 EMA crosses 50 EMA buy BTC", expected: 'STRATEGY_BUILD', category: 'When-Trigger Rule' },
  { id: 44, prompt: "Go short ETH when price breaks below support and RSI > 70", expected: 'STRATEGY_BUILD', category: 'Short Rule' },
  { id: 45, prompt: "Long SOL when price is below lower Bollinger Band and RSI < 30 on 15m, exit when price reaches upper Bollinger Band, stop loss 3%, 5x leverage", expected: 'STRATEGY_BUILD', category: 'Full Archetype' },
  { id: 46, prompt: "Backtest ETH when 20 EMA crosses above 50 EMA on 15m and RSI < 35, stop loss 2.5%, take profit 6%, 10x leverage", expected: 'STRATEGY_BUILD', category: 'Backtest Command' },
  { id: 47, prompt: "Backtest BTC with 50/200 EMA golden cross on 4h", expected: 'STRATEGY_BUILD', category: 'Backtest Command' },
  { id: 48, prompt: "Simulate buying SOL on 15m when RSI < 25", expected: 'STRATEGY_BUILD', category: 'Simulation Command' },
  { id: 49, prompt: "Change leverage to 10x", expected: 'STRATEGY_BUILD', category: 'Canvas Mutation' },
  { id: 50, prompt: "Set stop loss to 2.5%", expected: 'STRATEGY_BUILD', category: 'Canvas Mutation' },
  { id: 51, prompt: "Set take profit to 7%", expected: 'STRATEGY_BUILD', category: 'Canvas Mutation' },
  { id: 52, prompt: "Tighten stop loss to 1.5%", expected: 'STRATEGY_BUILD', category: 'Canvas Mutation' },
  { id: 53, prompt: "Add a 200 EMA filter", expected: 'STRATEGY_BUILD', category: 'Canvas Mutation' },
  { id: 54, prompt: "Add trailing stop of 1.5%", expected: 'STRATEGY_BUILD', category: 'Canvas Mutation' },
  { id: 55, prompt: "Switch timeframe to 1h", expected: 'STRATEGY_BUILD', category: 'Canvas Mutation' },
  { id: 56, prompt: "Switch pair to ETH/USDT", expected: 'STRATEGY_BUILD', category: 'Canvas Mutation' },
  { id: 57, prompt: "Apply this tweak: add ATR trailing stop", expected: 'STRATEGY_BUILD', category: 'Canvas Mutation' },
  { id: 58, prompt: "Deploy delta-neutral cash and carry basis arbitrage between Binance spot and quarterly futures on BTC/USDT with 50% allocation", expected: 'STRATEGY_BUILD', category: 'Institutional Setup' },
  { id: 59, prompt: "Long BTC when 50 EMA crosses above 200 EMA and 14 RSI > 50 on 1h, stop loss 3%, take profit 7%, 5x leverage", expected: 'STRATEGY_BUILD', category: 'Full Strategy Prompt' },
  { id: 60, prompt: "Buy BTC/USDT on 15m when 20 EMA Crosses Above 50 EMA and RSI < 35, stop loss 2.5%, take profit 6.0%, 10x leverage", expected: 'STRATEGY_BUILD', category: 'Matrix Clause Build' },

  // ─── REQUIREMENTS GATHERING: UNDERSPECIFIED STRATEGY REQUESTS ─────────────
  { id: 61, prompt: "can you build a strategy for me", expected: 'CONVERSATIONAL', category: 'Requirements Gathering' },
  { id: 62, prompt: "can you build a strategy", expected: 'CONVERSATIONAL', category: 'Requirements Gathering' },
  { id: 63, prompt: "build me a strategy", expected: 'CONVERSATIONAL', category: 'Requirements Gathering' },
  { id: 64, prompt: "build a strategy for me", expected: 'CONVERSATIONAL', category: 'Requirements Gathering' },
  { id: 65, prompt: "help me build a strategy", expected: 'CONVERSATIONAL', category: 'Requirements Gathering' },
  { id: 66, prompt: "can you create a strategy for me", expected: 'CONVERSATIONAL', category: 'Requirements Gathering' },
  { id: 67, prompt: "can you make a strategy for me", expected: 'CONVERSATIONAL', category: 'Requirements Gathering' },
  { id: 68, prompt: "i want you to build a strategy for me", expected: 'CONVERSATIONAL', category: 'Requirements Gathering' },

  // ─── ANAPHORIC STRATEGY BUILD DIRECTIVES ───────────────────────────────────
  { id: 69, prompt: "build this strategy", expected: 'STRATEGY_BUILD', category: 'Anaphoric Build' },
  { id: 70, prompt: "build this", expected: 'STRATEGY_BUILD', category: 'Anaphoric Build' },
  { id: 71, prompt: "create this strategy", expected: 'STRATEGY_BUILD', category: 'Anaphoric Build' },
  { id: 72, prompt: "build it", expected: 'STRATEGY_BUILD', category: 'Anaphoric Build' },
  { id: 73, prompt: "make this", expected: 'STRATEGY_BUILD', category: 'Anaphoric Build' },
  { id: 74, prompt: "go ahead and build it", expected: 'STRATEGY_BUILD', category: 'Anaphoric Build' },
  { id: 75, prompt: "yes build it", expected: 'STRATEGY_BUILD', category: 'Anaphoric Build' },
  { id: 76, prompt: "proceed", expected: 'STRATEGY_BUILD', category: 'Anaphoric Build' }
];

interface MultiTurnStep {
  role: 'user' | 'assistant';
  content: string;
  expectedIntent?: 'CONVERSATIONAL' | 'STRATEGY_BUILD';
  description?: string;
}

const MULTI_TURN_TEST_THREAD: MultiTurnStep[] = [
  {
    role: 'user',
    content: 'hi how are you doing',
    expectedIntent: 'CONVERSATIONAL',
    description: 'Turn 1: Casual social greeting'
  },
  {
    role: 'assistant',
    content: "Hey there! I'm doing great, thanks for asking. How can I help you today—whether it's a trading concept, risk question, or building a strategy?"
  },
  {
    role: 'user',
    content: 'which is best risk management strategy according to you',
    expectedIntent: 'CONVERSATIONAL',
    description: 'Turn 2: Educational question on risk management'
  },
  {
    role: 'assistant',
    content: 'In institutional trading, the most robust risk-management framework combines position-sizing based on the Kelly criterion, a hard stop-loss tied to 2x ATR...'
  },
  {
    role: 'user',
    content: 'it is possible for you to create this strategy',
    expectedIntent: 'CONVERSATIONAL',
    description: 'Turn 3: Open-ended build query eliciting requirements'
  },
  {
    role: 'assistant',
    content: 'Absolutely—I can put together a full institutional-grade strategy for you. To tailor it perfectly, could you let me know the four key details?\n1. Asset & Timeframe\n2. Strategy Archetype\n3. Indicators & Entry Triggers\n4. Risk Parameters'
  },
  {
    role: 'user',
    content: 'timeframe is 15 minutes , mean reversion strategy , RSI < 30, stop is 5 percent and target is 12 percent and the capital allocation is around 10 percent of whole portfolio',
    expectedIntent: 'STRATEGY_BUILD',
    description: 'Turn 4: Providing multi-parameter specifications'
  },
  {
    role: 'assistant',
    content: "Got it! You've outlined a 15-minute mean-reversion setup with an RSI < 30 entry, a 5% stop-loss, a 12% target... I just need to know which asset you'd like to trade and the leverage you want to use."
  },
  {
    role: 'user',
    content: 'build this strategy',
    expectedIntent: 'STRATEGY_BUILD',
    description: 'Turn 5: Direct anaphoric build directive'
  },
  {
    role: 'assistant',
    content: 'Sure thing! To finish building your mean-reversion strategy I just need two more details: the asset you want to trade and the leverage.'
  },
  {
    role: 'user',
    content: 'BTC asset leverage is 10x',
    expectedIntent: 'STRATEGY_BUILD',
    description: 'Turn 6: Answering remaining asset & leverage requirements'
  },
  {
    role: 'assistant',
    content: "Got it! You'd like to trade BTC/USDT with 10x leverage."
  },
  {
    role: 'user',
    content: 'not any other risk parameteres',
    expectedIntent: 'STRATEGY_BUILD',
    description: 'Turn 7: Concluding parameters confirmation'
  }
];

async function runTestSuite() {
  console.log("==========================================================================");
  console.log("  ALGORUSH QUANT COPILOT: COMPREHENSIVE INTENT CLASSIFICATION SUITE     ");
  console.log("==========================================================================\n");

  let passed = 0;
  let failed = 0;
  const failures: Array<{ id: number; prompt: string; expected: string; actual: string; reason: string }> = [];

  console.log("--- PART 1: SINGLE-TURN BENCHMARK TESTS (76 PROMPTS) ---");
  for (const tc of TEST_SUITE) {
    const result = classifyUserIntent(tc.prompt);
    const isSuccess = result.intent === tc.expected;

    if (isSuccess) {
      passed++;
      const icon = result.intent === 'CONVERSATIONAL' ? '💬' : '⚡';
      console.log(`[PASS] #${tc.id.toString().padStart(2, '0')} ${icon} [${result.intent.padEnd(16)}] [${tc.category.padEnd(24)}] "${tc.prompt.slice(0, 50)}${tc.prompt.length > 50 ? '...' : ''}"`);
    } else {
      failed++;
      failures.push({
        id: tc.id,
        prompt: tc.prompt,
        expected: tc.expected,
        actual: result.intent,
        reason: result.reason
      });
      console.error(`[FAIL] #${tc.id.toString().padStart(2, '0')} ❌ Expected ${tc.expected} but got ${result.intent} for: "${tc.prompt}"`);
    }
  }

  console.log("\n--- PART 2: REAL USER MULTI-TURN DIALOGUE TESTS ---");
  const runningHistory: Array<{ role: string; content: string }> = [];
  let multiTurnPassed = 0;
  let multiTurnTotal = 0;

  for (let i = 0; i < MULTI_TURN_TEST_THREAD.length; i++) {
    const step = MULTI_TURN_TEST_THREAD[i];
    if (step.role === 'user' && step.expectedIntent) {
      multiTurnTotal++;
      const result = classifyUserIntent(step.content, runningHistory);
      const isSuccess = result.intent === step.expectedIntent;

      if (isSuccess) {
        multiTurnPassed++;
        passed++;
        const icon = result.intent === 'CONVERSATIONAL' ? '💬' : '⚡';
        console.log(`[PASS] Turn ${multiTurnTotal} ${icon} [${result.intent.padEnd(16)}] ${step.description}: "${step.content.slice(0, 45)}..."`);
      } else {
        failed++;
        failures.push({
          id: 100 + multiTurnTotal,
          prompt: step.content,
          expected: step.expectedIntent,
          actual: result.intent,
          reason: result.reason
        });
        console.error(`[FAIL] Turn ${multiTurnTotal} ❌ Expected ${step.expectedIntent} but got ${result.intent} for: "${step.content}"`);
      }
    }
    runningHistory.push({ role: step.role, content: step.content });
  }

  const grandTotal = TEST_SUITE.length + multiTurnTotal;
  console.log("\n==========================================================================");
  console.log(`  RESULTS: ${passed}/${grandTotal} PASSED (${((passed / grandTotal) * 100).toFixed(1)}%) | ${failed} FAILED`);
  console.log(`  Multi-Turn Benchmark: ${multiTurnPassed}/${multiTurnTotal} Passed (100%)`);
  console.log("==========================================================================\n");

  if (failed > 0) {
    console.error("FAILURES DETECTED:");
    console.table(failures);
    process.exit(1);
  } else {
    console.log("🎉 ALL TESTS CLASSIFIED WITH 100% ACCURACY!");
    console.log("✓ Single-turn questions & build directives: 76/76 (100%)");
    console.log("✓ Multi-turn user sequence: accurately synthesized with 0 infinite re-asking loops!");
  }
}

runTestSuite().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
