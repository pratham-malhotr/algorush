import { runLocalBacktest, generateMockData } from '../lib/backtester/engine';
import { StrategyDSL } from '../lib/types/strategy';

async function testE2EBuilder() {
  console.log("=========================================================");
  console.log("  E2E BUILDER & API INTEGRATION VALIDATION TEST          ");
  console.log("=========================================================\n");

  const promptText = "Buy ETH when 50 EMA crosses above 200 EMA and 1h RSI is below 40, stop loss 2.0%, take profit 5.5%";
  
  console.log(`Step 1: Sending prompt to /api/parse-strategy...`);
  const response = await fetch("http://localhost:3000/api/parse-strategy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer at_admin_master_secret"
    },
    body: JSON.stringify({ text: promptText })
  });

  if (!response.ok) {
    throw new Error(`API response failed with status ${response.status}`);
  }

  const json = await response.json();
  console.log("✓ API Response received:", json.status);

  if (json.status !== "SUCCESS" || !json.strategy) {
    throw new Error("Expected status SUCCESS with strategy object");
  }

  const strategy: StrategyDSL = json.strategy;
  console.log("✓ Strategy Name:", strategy.name);
  console.log("✓ Instruments:", JSON.stringify(strategy.instruments));
  console.log("✓ Entry Conditions:", strategy.entryConditions.length);
  console.log("✓ Exit Conditions:", strategy.exitConditions?.length || 0);
  console.log("✓ Risk Parameters:", JSON.stringify(strategy.riskParameters));

  console.log("\nStep 2: Simulating Backtesting Engine Execution...");
  const mockData = generateMockData(90, 3000);
  const backtestRes = runLocalBacktest(strategy, mockData);

  console.log("✓ Backtest Metrics Calculated:");
  console.table(backtestRes.metrics);
  console.log(`✓ Equity Curve generated with ${backtestRes.equityCurve.length} data points.`);

  console.log("\n=========================================================");
  console.log("  ALL BUILDER & API INTEGRATION TESTS PASSED SUCCESSFULLY! ");
  console.log("=========================================================\n");
}

testE2EBuilder().catch((err) => {
  console.error("✗ E2E Test Failed:", err);
  process.exit(1);
});
