import { BrokerAdapter } from './types';
import { MockAlpacaBroker } from './alpaca';
import { MockBinanceBroker } from './binance';
import { MockIBKRBroker } from './ibkr';

export type BrokerType = 'ALPACA' | 'BINANCE' | 'IBKR';

export class BrokerFactory {
  static getBroker(type: BrokerType): BrokerAdapter {
    switch (type) {
      case 'ALPACA':
        return new MockAlpacaBroker();
      case 'BINANCE':
        return new MockBinanceBroker();
      case 'IBKR':
        return new MockIBKRBroker();
      default:
        throw new Error(`Unsupported broker type: ${type}`);
    }
  }
}
