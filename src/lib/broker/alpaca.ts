import { StrategyDSL } from '../types/strategy';
import { runRiskChecks } from '../risk/engine';
import { BrokerAdapter, OrderRequest, OrderResponse, ConnectionStatus } from './types';

export class MockAlpacaBroker implements BrokerAdapter {
  private connected = false;

  async connect(apiKey: string, apiSecret: string): Promise<ConnectionStatus> {
    // Simulate connection delay
    await new Promise((r) => setTimeout(r, 1000));
    if (!apiKey || !apiSecret) {
      throw new Error('Invalid credentials');
    }
    this.connected = true;
    return { status: 'CONNECTED', broker: 'Alpaca (Mock)' };
  }

  async submitOrder(strategy: StrategyDSL, order: OrderRequest): Promise<OrderResponse> {
    if (!this.connected) throw new Error('Alpaca Broker not connected');

    // Run Pre-trade risk checks
    const riskCheck = runRiskChecks(strategy, order);
    if (!riskCheck.approved) {
      throw new Error(`Risk Check Failed: ${riskCheck.reason}`);
    }

    console.log(`[Alpaca Mock] Submitting order: ${order.side} ${order.qty} ${order.symbol}`);
    
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 500));
    
    return {
      orderId: `ord_${Math.random().toString(36).substr(2, 9)}`,
      status: 'accepted',
      filled_at: new Date().toISOString(),
      ...order
    };
  }
}

export const broker = new MockAlpacaBroker();
