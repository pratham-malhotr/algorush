import { Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

const worker = new Worker('backtest-queue', async job => {
  console.log(`[Backtest Worker] Processing job ${job.id}`);
  
  const { strategy, dataParams } = job.data;
  
  // Simulated Backtest Work
  console.log(`[Backtest Worker] Fetching historical data for ${dataParams.symbol}...`);
  await new Promise(r => setTimeout(r, 1000));
  
  console.log(`[Backtest Worker] Running simulation...`);
  await new Promise(r => setTimeout(r, 2000));
  
  console.log(`[Backtest Worker] Job ${job.id} completed.`);
  
  return { 
    status: 'success', 
    metrics: { totalReturn: "+24%", winRate: "58%" },
    jobId: job.id
  };
}, { connection });

worker.on('completed', job => {
  console.log(`[Backtest Worker] Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  console.error(`[Backtest Worker] Job ${job?.id} has failed with ${err.message}`);
});

console.log('[Backtest Worker] Started and listening on "backtest-queue"');
