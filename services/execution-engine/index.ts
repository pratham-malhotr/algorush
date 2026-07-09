import { Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

const worker = new Worker('execution-queue', async job => {
  console.log(`[Execution Engine] Processing signal ${job.id}`);
  
  const { strategyId, signal, orderDetails } = job.data;
  
  // 1. Verify with Risk Engine (In real microservices, via gRPC/REST or another queue)
  console.log(`[Execution Engine] Requesting risk clearance for ${orderDetails.symbol}...`);
  await new Promise(r => setTimeout(r, 200)); // Simulate risk check network delay

  // 2. Submit to Broker
  console.log(`[Execution Engine] Submitting ${orderDetails.side} order to Broker...`);
  await new Promise(r => setTimeout(r, 500)); // Simulate broker API delay
  
  return { 
    status: 'filled', 
    orderId: `exec_${Date.now()}`
  };
}, { connection });

console.log('[Execution Engine] Started and listening on "execution-queue"');
