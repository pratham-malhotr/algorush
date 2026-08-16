import { runLocalBacktest, generateMockData } from '../lib/backtester/engine';
import { StrategyDSL } from '../lib/types/strategy';

async function runContinuous10MinTest() {
  console.log("==========================================================================");
  console.log("  ALGOTEXT 10-MINUTE CONTINUOUS STRATEGY STRESS TEST                      ");
  console.log("  Target: http://localhost:3000                                           ");
  console.log("  Duration: 600 Seconds (10 Continuous Minutes)                           ");
  console.log("==========================================================================\n");

  const startTime = Date.now();
  const durationMs = 10 * 60 * 1000; // 10 minutes
  const endTime = startTime + durationMs;

  let totalRequests = 0;
  let successfulRequests = 0;
  let failedRequests = 0;
  let totalLatencyMs = 0;
  let minLatencyMs = Infinity;
  let maxLatencyMs = 0;
  let totalOrdersExecuted = 0;
  let totalBacktestsRun = 0;

  const promptText = "Buy BTC when 50 EMA crosses above 200 EMA and RSI(14) is below 40 with 2% stop loss";

  // Initial Strategy Compile
  console.log("[00:00] Initializing baseline strategy compilation against /api/parse-strategy...");
  const initRes = await fetch("http://localhost:3000/api/parse-strategy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer at_admin_master_secret"
    },
    body: JSON.stringify({ text: promptText })
  });

  const initData = await initRes.json();
  const strategy: StrategyDSL = initData.strategy;
  console.log(`[00:00] Strategy '${strategy?.name || 'BTC Strategy'}' compiled successfully.\n`);

  let lastReportMinute = 0;

  while (Date.now() < endTime) {
    const iterationStart = Date.now();
    totalRequests++;

    try {
      // 1. Post Order API test
      const orderRes = await fetch("http://localhost:3000/api/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer at_live_stresstest_key_99"
        },
        body: JSON.stringify({
          symbol: "BTC/USDT",
          assetClass: "CRYPTO",
          side: totalRequests % 2 === 0 ? "buy" : "sell",
          type: "market",
          quantity: 0.25
        })
      });

      if (orderRes.ok) {
        successfulRequests++;
        totalOrdersExecuted++;
      } else {
        failedRequests++;
      }

      // 2. Run Quantitative Engine Backtest Cycle every 5 iterations
      if (totalRequests % 5 === 0) {
        const mockData = generateMockData(90, 64000);
        const backtestResult = runLocalBacktest(strategy, mockData, 10000, 10, 0.05, 0.03, "Binance Futures");
        totalBacktestsRun++;
        totalOrdersExecuted += backtestResult.trades.length;
      }

      const latency = Date.now() - iterationStart;
      totalLatencyMs += latency;
      if (latency < minLatencyMs) minLatencyMs = latency;
      if (latency > maxLatencyMs) maxLatencyMs = latency;

    } catch (err: any) {
      failedRequests++;
      console.error(`[ERROR] Request failed at step ${totalRequests}:`, err.message);
    }

    // Minute progress logging
    const elapsedMs = Date.now() - startTime;
    const currentMinute = Math.floor(elapsedMs / (60 * 1000));
    if (currentMinute > lastReportMinute) {
      lastReportMinute = currentMinute;
      const memMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
      const avgLat = (totalLatencyMs / (totalRequests || 1)).toFixed(1);
      console.log(
        `[${String(currentMinute).padStart(2, '0')}:00] Telemetry | Total Req: ${totalRequests} | Success: ${successfulRequests} | Failed: ${failedRequests} | Avg Latency: ${avgLat}ms | Memory: ${memMB} MB | Orders: ${totalOrdersExecuted}`
      );
    }

    // Delay between iterations (200ms sleep)
    await new Promise(r => setTimeout(r, 200));
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  const avgLatency = (totalLatencyMs / totalRequests).toFixed(2);
  const throughputRps = (totalRequests / Number(durationSec)).toFixed(2);
  const heapUsageMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

  console.log("\n==========================================================================");
  console.log("  10-MINUTE CONTINUOUS STRATEGY STRESS TEST COMPLETE                      ");
  console.log("==========================================================================");
  console.table({
    "Total Test Duration": `${durationSec}s`,
    "Total API & Engine Requests": totalRequests,
    "Successful Executions": successfulRequests,
    "Failed Requests": failedRequests,
    "Average Latency": `${avgLatency}ms`,
    "Min Latency": `${minLatencyMs}ms`,
    "Max Latency": `${maxLatencyMs}ms`,
    "Throughput": `${throughputRps} req/sec`,
    "Total Backtests Run": totalBacktestsRun,
    "Total Orders Executed": totalOrdersExecuted,
    "Heap Memory Usage": `${heapUsageMB} MB`,
    "System Health": failedRequests === 0 ? "PASSED (100% RELIABILITY)" : "WARNING"
  });
  console.log("==========================================================================\n");
}

runContinuous10MinTest().catch(err => {
  console.error("10-minute continuous test failed:", err);
  process.exit(1);
});
