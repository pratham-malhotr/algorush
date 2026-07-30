export type MarketType = 'CRYPTO';

export interface Asset {
  symbol: string;
  name: string;
  market: MarketType;
  price?: number; 
}

export const CRYPTO_ASSETS: Asset[] = [
  { symbol: 'BTC/USDT', name: 'Bitcoin', market: 'CRYPTO', price: 62892.96 },
  { symbol: 'ETH/USDT', name: 'Ethereum', market: 'CRYPTO', price: 3416.17 },
  { symbol: 'SOL/USDT', name: 'Solana', market: 'CRYPTO', price: 145.40 },
  { symbol: 'BNB/USDT', name: 'Binance Coin', market: 'CRYPTO', price: 580.97 },
  { symbol: 'XRP/USDT', name: 'XRP', market: 'CRYPTO', price: 0.60 },
  { symbol: 'ADA/USDT', name: 'Cardano', market: 'CRYPTO', price: 0.45 },
  { symbol: 'AVAX/USDT', name: 'Avalanche', market: 'CRYPTO', price: 30.73 },
  { symbol: 'LINK/USDT', name: 'Chainlink', market: 'CRYPTO', price: 14.03 },
  { symbol: 'DOGE/USDT', name: 'Dogecoin', market: 'CRYPTO', price: 0.12 },
  { symbol: 'DOT/USDT', name: 'Polkadot', market: 'CRYPTO', price: 6.98 },
  { symbol: 'MATIC/USDT', name: 'Polygon', market: 'CRYPTO', price: 0.68 },
  { symbol: 'SHIB/USDT', name: 'Shiba Inu', market: 'CRYPTO', price: 0.000024 },
  { symbol: 'LTC/USDT', name: 'Litecoin', market: 'CRYPTO', price: 82.47 },
  { symbol: 'TRX/USDT', name: 'TRON', market: 'CRYPTO', price: 0.11 },
  { symbol: 'BCH/USDT', name: 'Bitcoin Cash', market: 'CRYPTO', price: 447.63 },
  { symbol: 'UNI/USDT', name: 'Uniswap', market: 'CRYPTO', price: 9.75 },
  { symbol: 'ATOM/USDT', name: 'Cosmos', market: 'CRYPTO', price: 8.35 },
  { symbol: 'XLM/USDT', name: 'Stellar', market: 'CRYPTO', price: 0.10 },
  { symbol: 'TON/USDT', name: 'Toncoin', market: 'CRYPTO', price: 7.46 },
  { symbol: 'ICP/USDT', name: 'Internet Computer', market: 'CRYPTO', price: 10.22 },
  { symbol: 'NEAR/USDT', name: 'NEAR Protocol', market: 'CRYPTO', price: 5.65 },
  { symbol: 'APT/USDT', name: 'Aptos', market: 'CRYPTO', price: 9.02 },
  { symbol: 'OP/USDT', name: 'Optimism', market: 'CRYPTO', price: 2.35 },
  { symbol: 'ARB/USDT', name: 'Arbitrum', market: 'CRYPTO', price: 0.93 },
  { symbol: 'FIL/USDT', name: 'Filecoin', market: 'CRYPTO', price: 4.63 },
  { symbol: 'STX/USDT', name: 'Stacks', market: 'CRYPTO', price: 1.84 },
  { symbol: 'IMX/USDT', name: 'Immutable', market: 'CRYPTO', price: 1.55 },
  { symbol: 'INJ/USDT', name: 'Injective', market: 'CRYPTO', price: 23.40 },
  { symbol: 'RNDR/USDT', name: 'Render', market: 'CRYPTO', price: 7.20 },
  { symbol: 'FET/USDT', name: 'Fetch.ai', market: 'CRYPTO', price: 1.34 },
  { symbol: 'PEPE/USDT', name: 'Pepe', market: 'CRYPTO', price: 0.000010 },
  { symbol: 'WIF/USDT', name: 'dogwifhat', market: 'CRYPTO', price: 2.45 },
  { symbol: 'SUI/USDT', name: 'Sui', market: 'CRYPTO', price: 1.05 },
  { symbol: 'KAS/USDT', name: 'Kaspa', market: 'CRYPTO', price: 0.15 },
  { symbol: 'TAO/USDT', name: 'Bittensor', market: 'CRYPTO', price: 340.50 }
];

export const ALL_ASSETS: Asset[] = [
  ...CRYPTO_ASSETS
];