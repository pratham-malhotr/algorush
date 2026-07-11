import { MockBinanceBroker } from '../lib/broker/binance';
import { StrategyDSL } from '../lib/types/strategy';
import { OrderRequest } from '../lib/broker/types';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runBitcoinAlgo() {
  console.log("Starting Bitcoin Trading Algorithm...");

  const broker = new MockBinanceBroker();
  await broker.connect('MOCK_API_KEY', 'MOCK_API_SECRET');

  const PORTFOLIO_VALUE = 100_000;
  const CAPITAL_ALLOCATION_PCT = 0.02; // 2%
  const BTC_PRICE_ESTIMATE = 60_000;

  const tradeValueUsd = PORTFOLIO_VALUE * CAPITAL_ALLOCATION_PCT;
  const btcQty = Number((tradeValueUsd / BTC_PRICE_ESTIMATE).toFixed(5));
  
  console.log(`Portfolio Value: $${PORTFOLIO_VALUE}`);
  console.log(`Capital per trade: 2% = $${tradeValueUsd}`);
  console.log(`Estimated BTC Qty per trade: ${btcQty} BTC\n`);

  // Dummy strategy to pass risk checks
  const dummyStrategy: StrategyDSL = {
    id: 'btc_algo_1',
    name: 'BTC High Frequency Mock',
    description: 'Buy BTC, wait 30s, sell, wait 1m, repeat for 12m',
    instruments: [{ symbol: 'BTCUSD', assetClass: 'CRYPTO' }],
    entryConditions: [],
    action: {
      type: 'BUY',
      quantityType: 'USD_VALUE',
      quantityValue: tradeValueUsd
    },
    riskParameters: {
      stopLossPercentage: 5, // Required by risk engine
      maxPositionSizeUSD: tradeValueUsd * 2
    }
  };

  const DURATION_MINUTES = 12;
  const START_TIME = Date.now();
  const END_TIME = START_TIME + DURATION_MINUTES * 60 * 1000;

  let cycle = 1;

  while (Date.now() < END_TIME) {
    console.log(`\n--- Cycle ${cycle} ---`);
    console.log(`[${new Date().toLocaleTimeString()}] Executing BUY...`);
    
    try {
      const buyOrder: OrderRequest = {
        symbol: 'BTCUSD',
        qty: btcQty,
        side: 'buy',
        type: 'market',
        time_in_force: 'gtc'
      };
      
      const buyRes = await broker.submitOrder(dummyStrategy, buyOrder);
      console.log(`Buy Order Success: ${buyRes.orderId}`);

      console.log(`[${new Date().toLocaleTimeString()}] Waiting 30 seconds before selling...`);
      await delay(30 * 1000);

      console.log(`[${new Date().toLocaleTimeString()}] Executing SELL...`);
      const sellOrder: OrderRequest = {
        symbol: 'BTCUSD',
        qty: btcQty,
        side: 'sell',
        type: 'market',
        time_in_force: 'gtc'
      };
      
      const sellRes = await broker.submitOrder(dummyStrategy, sellOrder);
      console.log(`Sell Order Success: ${sellRes.orderId}`);

      if (Date.now() < END_TIME) {
        console.log(`[${new Date().toLocaleTimeString()}] Waiting 1 minute before next cycle...`);
        await delay(60 * 1000);
      } else {
        console.log(`[${new Date().toLocaleTimeString()}] Time limit reached. Ending algorithm.`);
        break;
      }
      
      cycle++;
    } catch (error: any) {
      console.error(`Error in cycle ${cycle}:`, error.message);
      console.log("Waiting 10 seconds before retrying...");
      await delay(10 * 1000);
    }
  }

  console.log("\nAlgorithm execution completed.");
}

runBitcoinAlgo().catch(console.error);
