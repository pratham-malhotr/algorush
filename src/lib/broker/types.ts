import { StrategyDSL } from '../types/strategy';

export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit' | 'stop';

export interface OrderRequest {
  symbol: string;
  qty: number;
  side: OrderSide;
  type: OrderType;
  time_in_force: 'day' | 'gtc';
  limit_price?: number;
  stop_price?: number;
}

export interface OrderResponse {
  orderId: string;
  status: 'accepted' | 'rejected' | 'filled';
  filled_at?: string;
  symbol: string;
  qty: number;
  side: OrderSide;
}

export interface ConnectionStatus {
  status: 'CONNECTED' | 'DISCONNECTED';
  broker: string;
}

export interface BrokerAdapter {
  connect(apiKey: string, apiSecret: string): Promise<ConnectionStatus>;
  submitOrder(strategy: StrategyDSL, order: OrderRequest): Promise<OrderResponse>;
  // Future capabilities: getAccountBalance, getPositions, cancelOrder
}
