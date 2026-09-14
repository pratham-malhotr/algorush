const queries = [
  {
    type: "BACKTEST_COMMAND",
    text: "Backtest BTC when 20 EMA crosses above 50 EMA on 15m, stop loss 2%, take profit 5%",
    expect: "SUCCESS"
  },
  {
    type: "BACKTEST_COMMAND",
    text: "Backtest a strategy: Long SOL when price < lower Bollinger Band and RSI < 30 on 1h, 5x leverage",
    expect: "SUCCESS"
  },
  {
    type: "WHEN_RULE_COMMAND",
    text: "When 50 EMA crosses above 200 EMA on 4h buy BTC with 5x leverage, stop loss 3%, take profit 8%",
    expect: "SUCCESS"
  },
  {
    type: "STRATEGY_COMMAND",
    text: "Short ETH when 20 EMA crosses below 50 EMA on 5m and MACD histogram < 0, 10x leverage, stop loss 1.5%, take profit 4%",
    expect: "SUCCESS"
  },
  {
    type: "QUANT_QUESTION",
    text: "What is lookahead bias in backtesting and how does AlgoRush prevent it?",
    expect: "CONVERSATIONAL"
  },
  {
    type: "QUANT_QUESTION",
    text: "How does slippage simulation and maker/taker fees impact high frequency crypto backtests?",
    expect: "CONVERSATIONAL"
  },
  {
    type: "QUANT_QUESTION",
    text: "Tell me how to set an ATR dynamic trailing stop",
    expect: "CONVERSATIONAL"
  },
  {
    type: "QUANT_QUESTION",
    text: "Can you explain Sharpe ratio vs Sortino ratio in simple terms?",
    expect: "CONVERSATIONAL"
  },
  {
    type: "QUANT_QUESTION",
    text: "Is it better to trade 1m or 1h timeframe for algorithmic momentum?",
    expect: "CONVERSATIONAL"
  },
  {
    type: "QUANT_QUESTION",
    text: "Explain pairs trading and statistical arbitrage between BTC and ETH",
    expect: "CONVERSATIONAL"
  },
  {
    type: "QUANT_QUESTION",
    text: "How does order book imbalance predict short-term price momentum?",
    expect: "CONVERSATIONAL"
  },
  {
    type: "QUANT_QUESTION",
    text: "What is the difference between isolated and cross margin liquidation?",
    expect: "CONVERSATIONAL"
  },
  {
    type: "QUANT_QUESTION",
    text: "What is the Kelly Criterion formula and why do quants use half-kelly?",
    expect: "CONVERSATIONAL"
  },
  {
    type: "QUANT_QUESTION",
    text: "Why do market crashes cause correlation breakdown to 1.0?",
    expect: "CONVERSATIONAL"
  },
  {
    type: "CASUAL_GREETING",
    text: "Hi, I am new to algorithmic trading, what can you do?",
    expect: "CONVERSATIONAL"
  }
];

async function runBacktest() {
  console.log(`\n======================================================`);
  console.log(`🚀 RUNNING ENTERPRISE TEXT SENDER DIVERSITY BACKTEST`);
  console.log(`   Total Queries: ${queries.length} across 5 distinct categories`);
  console.log(`======================================================\n`);

  let passCount = 0;
  let failCount = 0;

  for (let i = 0; i < queries.length; i++) {
    const q = queries[i];
    const startTime = Date.now();
    try {
      const res = await fetch("http://localhost:3000/api/parse-strategy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer at_admin_master_secret"
        },
        body: JSON.stringify({
          text: q.text,
          model: "gemini-3.8-flash"
        })
      });

      const elapsed = Date.now() - startTime;
      const data = await res.json();

      const isStatusOk = data.status === q.expect;
      if (isStatusOk) {
        passCount++;
      } else {
        failCount++;
      }

      console.log(`[Test ${i + 1}/${queries.length}] [${q.type}] Status: ${isStatusOk ? '✅ PASS' : '❌ FAIL'} (${data.status}) | ${elapsed}ms`);
      console.log(`  Input: "${q.text}"`);
      console.log(`  Model: ${data.modelUsed || 'N/A'} | Latency: ${data.latencyMs || elapsed}ms`);
      
      if (data.status === "SUCCESS") {
        console.log(`  Strategy: "${data.strategy?.name}" | Symbol: ${data.strategy?.instruments?.[0]?.symbol} | Side: ${data.strategy?.action?.type} | Lev: ${data.strategy?.action?.leverage || 1}x`);
        console.log(`  Audit Score: ${data.verificationAudit?.score}/100 | Alignment: ${data.verificationAudit?.directionalAlignment} | Liq Buffer: ~${data.verificationAudit?.estimatedLiquidationDistancePct}%`);
        console.log(`  Thesis: ${data.reasoning?.substring(0, 100)}...`);
      } else if (data.status === "CONVERSATIONAL") {
        const preview = (data.conversationalResponse || "").substring(0, 120).replace(/\n/g, ' ');
        console.log(`  Answer Preview: ${preview}...`);
        console.log(`  Suggestions: ${JSON.stringify(data.suggestedTweaks || [])}`);
      }
      console.log('------------------------------------------------------');
    } catch (err) {
      failCount++;
      console.error(`[Test ${i + 1}/${queries.length}] ❌ ERROR:`, err.message);
    }
  }

  console.log(`\n======================================================`);
  console.log(`📊 FINAL DIVERSITY BACKTEST SUMMARY:`);
  console.log(`   Passed: ${passCount} / ${queries.length} (${((passCount / queries.length) * 100).toFixed(1)}%)`);
  console.log(`   Failed: ${failCount} / ${queries.length}`);
  console.log(`======================================================\n`);
}

runBacktest();
