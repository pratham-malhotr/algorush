export type MarketType = 'CRYPTO';

export type MarketSegment = 
  | 'Layer 1' 
  | 'Layer 2' 
  | 'DeFi' 
  | 'AI & Big Data' 
  | 'Meme' 
  | 'DePIN' 
  | 'RWA' 
  | 'Gaming' 
  | 'Infrastructure'
  | 'Payments';

export interface Asset {
  symbol: string;
  name: string;
  market: MarketType;
  price?: number;
  change24h?: number;
  marketCap?: number;
  marketCapFormatted?: string;
  fdv?: number;
  fdvFormatted?: string;
  volume24h?: number;
  volume24hFormatted?: string;
  circulatingSupply?: number;
  circulatingSupplyFormatted?: string;
  totalSupply?: number;
  totalSupplyFormatted?: string;
  ath?: number;
  athChange?: number;
  high24h?: number;
  low24h?: number;
  rank?: number;
  segment?: MarketSegment;
  marketDominance?: number;
  description?: string;
  technicalSummary?: {
    rsi14: number;
    rsiSignal: 'Oversold' | 'Neutral' | 'Overbought';
    macdSignal: 'Bullish' | 'Bearish' | 'Neutral';
    ema20_50: 'Bullish Cross' | 'Bearish Cross' | 'Neutral';
    overall: 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell';
  };
}

export const CRYPTO_ASSETS: Asset[] = [
  // Top 10
  {
    symbol: 'BTC/USDT', name: 'Bitcoin', market: 'CRYPTO', price: 77752.67, change24h: 0.119,
    marketCap: 1535615232500, marketCapFormatted: '$1.54T', fdv: 1632806070000, fdvFormatted: '$1.63T',
    volume24h: 1015694896, volume24hFormatted: '$1.02B', circulatingSupply: 19750000, circulatingSupplyFormatted: '19.75M BTC',
    totalSupply: 21000000, totalSupplyFormatted: '21.00M BTC', ath: 73750.07, athChange: 5.4,
    high24h: 77900, low24h: 76264, rank: 1, segment: 'Layer 1', marketDominance: 54.8,
    description: 'Decentralized peer-to-peer store of value and digital gold protocol secured by Proof of Work consensus.',
    technicalSummary: { rsi14: 61.4, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Strong Buy' }
  },
  {
    symbol: 'ETH/USDT', name: 'Ethereum', market: 'CRYPTO', price: 2402.5, change24h: -0.741,
    marketCap: 288900625000, marketCapFormatted: '$288.90B', fdv: 288900625000, fdvFormatted: '$288.90B',
    volume24h: 670966207, volume24hFormatted: '$671.0M', circulatingSupply: 120250000, circulatingSupplyFormatted: '120.25M ETH',
    totalSupply: 120250000, totalSupplyFormatted: '120.25M ETH', ath: 4891.70, athChange: -50.9,
    high24h: 2429, low24h: 2356.41, rank: 2, segment: 'Layer 1', marketDominance: 17.5,
    description: 'Primary smart contract platform hosting decentralized finance, layer 2 rollups, and Web3 infrastructure.',
    technicalSummary: { rsi14: 58.2, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Buy' }
  },
  {
    symbol: 'SOL/USDT', name: 'Solana', market: 'CRYPTO', price: 100.75, change24h: 0.619,
    marketCap: 47070400000, marketCapFormatted: '$47.07B', fdv: 58636500000, fdvFormatted: '$58.64B',
    volume24h: 202908217, volume24hFormatted: '$202.9M', circulatingSupply: 467200000, circulatingSupplyFormatted: '467.2M SOL',
    totalSupply: 582000000, totalSupplyFormatted: '582.0M SOL', ath: 260.06, athChange: -61.3,
    high24h: 101.34, low24h: 97.38, rank: 3, segment: 'Layer 1', marketDominance: 3.1,
    description: 'Ultra-high-throughput blockchain utilizing Proof of History, low transaction fees, and high-frequency trading apps.',
    technicalSummary: { rsi14: 64.8, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Strong Buy' }
  },
  {
    symbol: 'BNB/USDT', name: 'BNB', market: 'CRYPTO', price: 695.24, change24h: 0.892,
    marketCap: 104286000000, marketCapFormatted: '$104.29B', fdv: 104286000000, fdvFormatted: '$104.29B',
    volume24h: 60005092, volume24hFormatted: '$60.0M', circulatingSupply: 150000000, circulatingSupplyFormatted: '150.0M BNB',
    totalSupply: 150000000, totalSupplyFormatted: '150.0M BNB', ath: 720.67, athChange: -3.5,
    high24h: 695.48, low24h: 680.41, rank: 4, segment: 'Layer 1', marketDominance: 3.8,
    description: 'Ecosystem token powering BNB Chain, trading fee rebates on Binance, and decentralized application execution.',
    technicalSummary: { rsi14: 52.1, rsiSignal: 'Neutral', macdSignal: 'Neutral', ema20_50: 'Neutral', overall: 'Neutral' }
  },
  {
    symbol: 'XRP/USDT', name: 'XRP', market: 'CRYPTO', price: 1.3661, change24h: 1.365,
    marketCap: 76774820000, marketCapFormatted: '$76.77B', fdv: 136610000000, fdvFormatted: '$136.61B',
    volume24h: 166622589, volume24hFormatted: '$166.6M', circulatingSupply: 56200000000, circulatingSupplyFormatted: '56.2B XRP',
    totalSupply: 100000000000, totalSupplyFormatted: '100.0B XRP', ath: 3.84, athChange: -64.4,
    high24h: 1.3745, low24h: 1.3098, rank: 5, segment: 'Payments', marketDominance: 1.4,
    description: 'Enterprise cross-border settlement token designed for instant financial institution liquidity and remittances.',
    technicalSummary: { rsi14: 48.6, rsiSignal: 'Neutral', macdSignal: 'Bearish', ema20_50: 'Neutral', overall: 'Neutral' }
  },
  {
    symbol: 'DOGE/USDT', name: 'Dogecoin', market: 'CRYPTO', price: 0.08291, change24h: 1.246,
    marketCap: 12021950000, marketCapFormatted: '$12.02B', fdv: 12021950000, fdvFormatted: '$12.02B',
    volume24h: 52920946, volume24hFormatted: '$52.9M', circulatingSupply: 145000000000, circulatingSupplyFormatted: '145.0B DOGE',
    totalSupply: 145000000000, totalSupplyFormatted: '145.0B DOGE', ath: 0.737, athChange: -88.8,
    high24h: 0.08329, low24h: 0.08013, rank: 6, segment: 'Meme', marketDominance: 0.72,
    description: 'Pioneering community-driven meme cryptocurrency with scrypt proof-of-work algorithm and worldwide brand recognition.',
    technicalSummary: { rsi14: 59.2, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Buy' }
  },
  {
    symbol: 'ADA/USDT', name: 'Cardano', market: 'CRYPTO', price: 0.2054, change24h: 3.528,
    marketCap: 7332780000, marketCapFormatted: '$7.33B', fdv: 9243000000, fdvFormatted: '$9.24B',
    volume24h: 24250813, volume24hFormatted: '$24.3M', circulatingSupply: 35700000000, circulatingSupplyFormatted: '35.7B ADA',
    totalSupply: 45000000000, totalSupplyFormatted: '45.0B ADA', ath: 3.10, athChange: -93.4,
    high24h: 0.2078, low24h: 0.192, rank: 7, segment: 'Layer 1', marketDominance: 0.58,
    description: 'Peer-reviewed proof-of-stake blockchain platform engineered with formal verification and Haskell foundation.',
    technicalSummary: { rsi14: 46.5, rsiSignal: 'Neutral', macdSignal: 'Neutral', ema20_50: 'Neutral', overall: 'Neutral' }
  },
  {
    symbol: 'AVAX/USDT', name: 'Avalanche', market: 'CRYPTO', price: 7.286, change24h: 0.649,
    marketCap: 2928972000, marketCapFormatted: '$2.93B', fdv: 5245920000, fdvFormatted: '$5.25B',
    volume24h: 13155566, volume24hFormatted: '$13.2M', circulatingSupply: 402000000, circulatingSupplyFormatted: '402.0M AVAX',
    totalSupply: 720000000, totalSupplyFormatted: '720.0M AVAX', ath: 146.22, athChange: -95,
    high24h: 7.313, low24h: 7.041, rank: 8, segment: 'Layer 1', marketDominance: 0.49,
    description: 'Scalable smart contracts platform with sub-second finality and customizable subnet architecture for enterprises.',
    technicalSummary: { rsi14: 67.2, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Strong Buy' }
  },
  {
    symbol: 'SUI/USDT', name: 'Sui', market: 'CRYPTO', price: 0.7675, change24h: 5.906,
    marketCap: 2110625000, marketCapFormatted: '$2.11B', fdv: 7675000000, fdvFormatted: '$7.67B',
    volume24h: 54440064, volume24hFormatted: '$54.4M', circulatingSupply: 2750000000, circulatingSupplyFormatted: '2.75B SUI',
    totalSupply: 10000000000, totalSupplyFormatted: '10.0B SUI', ath: 2.36, athChange: -67.5,
    high24h: 0.7804, low24h: 0.7038, rank: 9, segment: 'Layer 1', marketDominance: 0.22,
    description: 'Move-powered object-centric Layer 1 blockchain built by former Meta engineers for high-throughput gaming and DeFi.',
    technicalSummary: { rsi14: 74.5, rsiSignal: 'Overbought', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Strong Buy' }
  },
  {
    symbol: 'TON/USDT', name: 'Toncoin', market: 'CRYPTO', price: 1.6, change24h: 0.946,
    marketCap: 4064000000, marketCapFormatted: '$4.06B', fdv: 8160000000, fdvFormatted: '$8.16B',
    volume24h: 7717352, volume24hFormatted: '$7.7M', circulatingSupply: 2540000000, circulatingSupplyFormatted: '2.54B TON',
    totalSupply: 5100000000, totalSupplyFormatted: '5.10B TON', ath: 8.24, athChange: -80.6,
    high24h: 1.641, low24h: 1.58, rank: 10, segment: 'Layer 1', marketDominance: 0.61,
    description: 'The Open Network blockchain tightly integrated into Telegram ecosystem for mass consumer mini-apps and Web3 payments.',
    technicalSummary: { rsi14: 53.4, rsiSignal: 'Neutral', macdSignal: 'Neutral', ema20_50: 'Neutral', overall: 'Neutral' }
  },

  // Rank 11-20
  {
    symbol: 'TRX/USDT', name: 'TRON', market: 'CRYPTO', price: 0.3263, change24h: 1.022,
    marketCap: 28355470000, marketCapFormatted: '$28.36B', fdv: 28355470000, fdvFormatted: '$28.36B',
    volume24h: 23929423, volume24hFormatted: '$23.9M', circulatingSupply: 86900000000, circulatingSupplyFormatted: '86.9B TRX',
    totalSupply: 86900000000, totalSupplyFormatted: '86.9B TRX', ath: 0.30, athChange: 8.8,
    high24h: 0.3264, low24h: 0.3224, rank: 11, segment: 'Layer 1', marketDominance: 0.57,
    description: 'High-volume stablecoin settlement network processing the majority of global USDT peer-to-peer transfers.',
    technicalSummary: { rsi14: 57.8, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Buy' }
  },
  {
    symbol: 'LINK/USDT', name: 'Chainlink', market: 'CRYPTO', price: 11.212, change24h: -0.568,
    marketCap: 6816896000, marketCapFormatted: '$6.82B', fdv: 11212000000, fdvFormatted: '$11.21B',
    volume24h: 25170067, volume24hFormatted: '$25.2M', circulatingSupply: 608000000, circulatingSupplyFormatted: '608.0M LINK',
    totalSupply: 1000000000, totalSupplyFormatted: '1.0B LINK', ath: 52.88, athChange: -78.8,
    high24h: 11.299, low24h: 10.908, rank: 12, segment: 'Infrastructure', marketDominance: 0.31,
    description: 'Industry-standard decentralized oracle network and CCIP cross-chain interoperability protocol connecting smart contracts with real-world data.',
    technicalSummary: { rsi14: 63.2, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Strong Buy' }
  },
  {
    symbol: 'DOT/USDT', name: 'Polkadot', market: 'CRYPTO', price: 0.877, change24h: 0.573,
    marketCap: 1254110000, marketCapFormatted: '$1.25B', fdv: 1333040000, fdvFormatted: '$1.33B',
    volume24h: 6057159, volume24hFormatted: '$6.1M', circulatingSupply: 1430000000, circulatingSupplyFormatted: '1.43B DOT',
    totalSupply: 1520000000, totalSupplyFormatted: '1.52B DOT', ath: 55.00, athChange: -98.4,
    high24h: 0.888, low24h: 0.838, rank: 13, segment: 'Layer 1', marketDominance: 0.27,
    description: 'Heterogeneous multi-chain architecture connecting specialized parachains under a shared security relay chain.',
    technicalSummary: { rsi14: 49.1, rsiSignal: 'Neutral', macdSignal: 'Neutral', ema20_50: 'Neutral', overall: 'Neutral' }
  },
  {
    symbol: 'NEAR/USDT', name: 'NEAR Protocol', market: 'CRYPTO', price: 1.9, change24h: 1.279,
    marketCap: 2280000000, marketCapFormatted: '$2.28B', fdv: 2337000000, fdvFormatted: '$2.34B',
    volume24h: 24565908, volume24hFormatted: '$24.6M', circulatingSupply: 1200000000, circulatingSupplyFormatted: '1.20B NEAR',
    totalSupply: 1230000000, totalSupplyFormatted: '1.23B NEAR', ath: 20.42, athChange: -90.7,
    high24h: 1.916, low24h: 1.827, rank: 14, segment: 'Layer 1', marketDominance: 0.25,
    description: 'Nightshade sharding blockchain platform focused on Chain Abstraction, user-friendly account models, and AI agent workloads.',
    technicalSummary: { rsi14: 68.4, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Strong Buy' }
  },
  {
    symbol: 'SHIB/USDT', name: 'Shiba Inu', market: 'CRYPTO', price: 0.00000523, change24h: 0.771,
    marketCap: 3080470000, marketCapFormatted: '$3.08B', fdv: 3080470000, fdvFormatted: '$3.08B',
    volume24h: 3035600, volume24hFormatted: '$3.0M', circulatingSupply: 589000000000000, circulatingSupplyFormatted: '589.0T SHIB',
    totalSupply: 589000000000000, totalSupplyFormatted: '589.0T SHIB', ath: 0.000088, athChange: -94.1,
    high24h: 0.00000526, low24h: 0.00000505, rank: 15, segment: 'Meme', marketDominance: 0.45,
    description: 'Decentralized meme ecosystem expanded with Shibarium Layer 2, ShibaSwap DEX, and metaverse utility.',
    technicalSummary: { rsi14: 55.6, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Neutral', overall: 'Buy' }
  },
  {
    symbol: 'PEPE/USDT', name: 'Pepe', market: 'CRYPTO', price: 0.00000346, change24h: 0.29,
    marketCap: 1455587400, marketCapFormatted: '$1.46B', fdv: 1455587400, fdvFormatted: '$1.46B',
    volume24h: 18800774, volume24hFormatted: '$18.8M', circulatingSupply: 420690000000000, circulatingSupplyFormatted: '420.69T PEPE',
    totalSupply: 420690000000000, totalSupplyFormatted: '420.69T PEPE', ath: 0.0000171, athChange: -79.8,
    high24h: 0.00000348, low24h: 0.00000336, rank: 16, segment: 'Meme', marketDominance: 0.17,
    description: 'Leading Ethereum meme token paying homage to the Pepe the Frog internet meme, characterized by zero taxes and deflationary burning.',
    technicalSummary: { rsi14: 71.2, rsiSignal: 'Overbought', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Strong Buy' }
  },
  {
    symbol: 'LTC/USDT', name: 'Litecoin', market: 'CRYPTO', price: 50.14, change24h: 1.519,
    marketCap: 3755486000, marketCapFormatted: '$3.76B', fdv: 4211760000, fdvFormatted: '$4.21B',
    volume24h: 17313504, volume24hFormatted: '$17.3M', circulatingSupply: 74900000, circulatingSupplyFormatted: '74.9M LTC',
    totalSupply: 84000000, totalSupplyFormatted: '84.0M LTC', ath: 412.96, athChange: -87.9,
    high24h: 50.41, low24h: 48.5, rank: 17, segment: 'Payments', marketDominance: 0.22,
    description: 'Long-standing Bitcoin hard fork designed for lightweight payments, 2.5-minute blocks, and MWEB privacy.',
    technicalSummary: { rsi14: 51.0, rsiSignal: 'Neutral', macdSignal: 'Neutral', ema20_50: 'Neutral', overall: 'Neutral' }
  },
  {
    symbol: 'BCH/USDT', name: 'Bitcoin Cash', market: 'CRYPTO', price: 248.6, change24h: 0.081,
    marketCap: 4917308000, marketCapFormatted: '$4.92B', fdv: 5220600000, fdvFormatted: '$5.22B',
    volume24h: 5623334, volume24hFormatted: '$5.6M', circulatingSupply: 19780000, circulatingSupplyFormatted: '19.78M BCH',
    totalSupply: 21000000, totalSupplyFormatted: '21.0M BCH', ath: 4355.62, athChange: -94.3,
    high24h: 249.4, low24h: 241.3, rank: 18, segment: 'Payments', marketDominance: 0.29,
    description: 'Electronic peer-to-peer cash network preserving on-chain capacity scaling through 32MB block sizes.',
    technicalSummary: { rsi14: 53.8, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Neutral', overall: 'Buy' }
  },
  {
    symbol: 'UNI/USDT', name: 'Uniswap', market: 'CRYPTO', price: 5.704, change24h: -8.56,
    marketCap: 3422400000, marketCapFormatted: '$3.42B', fdv: 5704000000, fdvFormatted: '$5.70B',
    volume24h: 87341250, volume24hFormatted: '$87.3M', circulatingSupply: 600000000, circulatingSupplyFormatted: '600.0M UNI',
    totalSupply: 1000000000, totalSupplyFormatted: '1.0B UNI', ath: 44.97, athChange: -87.3,
    high24h: 6.37, low24h: 5.676, rank: 19, segment: 'DeFi', marketDominance: 0.19,
    description: 'Leading decentralized automated market maker (AMM) protocol governing Uniswap v2, v3, and v4 liquidity.',
    technicalSummary: { rsi14: 59.5, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Buy' }
  },
  {
    symbol: 'APT/USDT', name: 'Aptos', market: 'CRYPTO', price: 0.606, change24h: 8.408,
    marketCap: 303000000, marketCapFormatted: '$303.0M', fdv: 675690000, fdvFormatted: '$675.7M',
    volume24h: 8866486, volume24hFormatted: '$8.9M', circulatingSupply: 500000000, circulatingSupplyFormatted: '500.0M APT',
    totalSupply: 1115000000, totalSupplyFormatted: '1.11B APT', ath: 19.90, athChange: -97,
    high24h: 0.607, low24h: 0.544, rank: 20, segment: 'Layer 1', marketDominance: 0.17,
    description: 'Block-STM parallel execution engine utilizing Move programming language for deterministic high-speed contract processing.',
    technicalSummary: { rsi14: 65.1, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Strong Buy' }
  },

  // Rank 21-35: AI, DePIN & Infrastructure
  {
    symbol: 'TAO/USDT', name: 'Bittensor', market: 'CRYPTO', price: 221, change24h: 0.091,
    marketCap: 1630980000, marketCapFormatted: '$1.63B', fdv: 4641000000, fdvFormatted: '$4.64B',
    volume24h: 11454936, volume24hFormatted: '$11.5M', circulatingSupply: 7380000, circulatingSupplyFormatted: '7.38M TAO',
    totalSupply: 21000000, totalSupplyFormatted: '21.0M TAO', ath: 757.60, athChange: -70.8,
    high24h: 221.2, low24h: 214.9, rank: 21, segment: 'AI & Big Data', marketDominance: 0.11,
    description: 'Decentralized machine intelligence marketplace incentivizing competitive neural network subnets and machine learning compute.',
    technicalSummary: { rsi14: 72.8, rsiSignal: 'Overbought', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Strong Buy' }
  },
  {
    symbol: 'FET/USDT', name: 'Artificial Superintelligence', market: 'CRYPTO', price: 0.155, change24h: 0.065,
    marketCap: 390600000, marketCapFormatted: '$390.6M', fdv: 421445000, fdvFormatted: '$421.4M',
    volume24h: 6878465, volume24hFormatted: '$6.9M', circulatingSupply: 2520000000, circulatingSupplyFormatted: '2.52B FET',
    totalSupply: 2719000000, totalSupplyFormatted: '2.72B FET', ath: 3.47, athChange: -95.5,
    high24h: 0.1556, low24h: 0.1497, rank: 22, segment: 'AI & Big Data', marketDominance: 0.14,
    description: 'Alliance uniting Fetch.ai, SingularityNET, and Ocean Protocol building decentralized artificial general intelligence infrastructure.',
    technicalSummary: { rsi14: 66.2, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Strong Buy' }
  },
  {
    symbol: 'RENDER/USDT', name: 'Render Network', market: 'CRYPTO', price: 1.427, change24h: -0.627,
    marketCap: 739186000, marketCapFormatted: '$739.2M', fdv: 764872000, fdvFormatted: '$764.9M',
    volume24h: 1560889, volume24hFormatted: '$1.6M', circulatingSupply: 518000000, circulatingSupplyFormatted: '518.0M RENDER',
    totalSupply: 536000000, totalSupplyFormatted: '536.0M RENDER', ath: 13.60, athChange: -89.5,
    high24h: 1.437, low24h: 1.388, rank: 23, segment: 'DePIN', marketDominance: 0.12,
    description: 'Distributed GPU rendering network connecting digital artists and AI developers with idle cloud graphics processing power.',
    technicalSummary: { rsi14: 64.1, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Strong Buy' }
  },
  {
    symbol: 'KAS/USDT', name: 'Kaspa', market: 'CRYPTO', price: 0.02877, change24h: 3.229,
    marketCap: 707742000, marketCapFormatted: '$707.7M', fdv: 825699000, fdvFormatted: '$825.7M',
    volume24h: 2841943, volume24hFormatted: '$2.8M', circulatingSupply: 24600000000, circulatingSupplyFormatted: '24.6B KAS',
    totalSupply: 28700000000, totalSupplyFormatted: '28.7B KAS', ath: 0.207, athChange: -86.1,
    high24h: 0.02901, low24h: 0.02717, rank: 24, segment: 'Layer 1', marketDominance: 0.17,
    description: 'Proof of work cryptocurrency implementing GHOSTDAG protocol for sub-second block validation without orphan blocks.',
    technicalSummary: { rsi14: 58.4, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Buy' }
  },
  {
    symbol: 'ICP/USDT', name: 'Internet Computer', market: 'CRYPTO', price: 2.489, change24h: -3.152,
    marketCap: 1167341000, marketCapFormatted: '$1.17B', fdv: 1299258000, fdvFormatted: '$1.30B',
    volume24h: 6578781, volume24hFormatted: '$6.6M', circulatingSupply: 469000000, circulatingSupplyFormatted: '469.0M ICP',
    totalSupply: 522000000, totalSupplyFormatted: '522.0M ICP', ath: 750.73, athChange: -99.7,
    high24h: 2.578, low24h: 2.43, rank: 25, segment: 'Infrastructure', marketDominance: 0.16,
    description: 'Decentralized cloud computing architecture hosting tamperproof web applications directly on sovereign blockchain nodes.',
    technicalSummary: { rsi14: 48.9, rsiSignal: 'Neutral', macdSignal: 'Neutral', ema20_50: 'Neutral', overall: 'Neutral' }
  },
  {
    symbol: 'STX/USDT', name: 'Stacks', market: 'CRYPTO', price: 0.2756, change24h: 6.656,
    marketCap: 407888000, marketCapFormatted: '$407.9M', fdv: 501040800, fdvFormatted: '$501.0M',
    volume24h: 2164151, volume24hFormatted: '$2.2M', circulatingSupply: 1480000000, circulatingSupplyFormatted: '1.48B STX',
    totalSupply: 1818000000, totalSupplyFormatted: '1.82B STX', ath: 3.84, athChange: -92.8,
    high24h: 0.2818, low24h: 0.2517, rank: 26, segment: 'Layer 2', marketDominance: 0.11,
    description: 'Bitcoin Layer 2 enabling smart contracts, sBTC non-custodial bridging, and DeFi with 100% Bitcoin finality settlement.',
    technicalSummary: { rsi14: 62.8, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Strong Buy' }
  },
  {
    symbol: 'INJ/USDT', name: 'Injective', market: 'CRYPTO', price: 4.826, change24h: -0.454,
    marketCap: 471982800, marketCapFormatted: '$472.0M', fdv: 482600000, fdvFormatted: '$482.6M',
    volume24h: 4528354, volume24hFormatted: '$4.5M', circulatingSupply: 97800000, circulatingSupplyFormatted: '97.8M INJ',
    totalSupply: 100000000, totalSupplyFormatted: '100.0M INJ', ath: 52.75, athChange: -90.9,
    high24h: 4.914, low24h: 4.718, rank: 27, segment: 'DeFi', marketDominance: 0.08,
    description: 'Cosmos-based Layer 1 built for financial applications with on-chain order book primitives and MEV-resistant trading.',
    technicalSummary: { rsi14: 63.5, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Strong Buy' }
  },
  {
    symbol: 'TIA/USDT', name: 'Celestia', market: 'CRYPTO', price: 0.3621, change24h: 0.555,
    marketCap: 77127300, marketCapFormatted: '$77.1M', fdv: 383826000, fdvFormatted: '$383.8M',
    volume24h: 2457631, volume24hFormatted: '$2.5M', circulatingSupply: 213000000, circulatingSupplyFormatted: '213.0M TIA',
    totalSupply: 1060000000, totalSupplyFormatted: '1.06B TIA', ath: 20.91, athChange: -98.3,
    high24h: 0.3631, low24h: 0.3457, rank: 28, segment: 'Infrastructure', marketDominance: 0.05,
    description: 'Pioneering modular data availability blockchain decoupling execution from consensus for rollup scaling.',
    technicalSummary: { rsi14: 51.2, rsiSignal: 'Neutral', macdSignal: 'Neutral', ema20_50: 'Neutral', overall: 'Neutral' }
  },
  {
    symbol: 'ARB/USDT', name: 'Arbitrum', market: 'CRYPTO', price: 0.1314, change24h: 16.078,
    marketCap: 467784000, marketCapFormatted: '$467.8M', fdv: 1314000000, fdvFormatted: '$1.31B',
    volume24h: 41714471, volume24hFormatted: '$41.7M', circulatingSupply: 3560000000, circulatingSupplyFormatted: '3.56B ARB',
    totalSupply: 10000000000, totalSupplyFormatted: '10.0B ARB', ath: 2.40, athChange: -94.5,
    high24h: 0.1327, low24h: 0.1059, rank: 29, segment: 'Layer 2', marketDominance: 0.09,
    description: 'Leading Ethereum optimistic rollup network boasting the deepest decentralized liquidity and lowest transaction fees.',
    technicalSummary: { rsi14: 54.0, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Neutral', overall: 'Buy' }
  },
  {
    symbol: 'OP/USDT', name: 'Optimism', market: 'CRYPTO', price: 0.0982, change24h: 2.505,
    marketCap: 115876000, marketCapFormatted: '$115.9M', fdv: 421670800, fdvFormatted: '$421.7M',
    volume24h: 6289869, volume24hFormatted: '$6.3M', circulatingSupply: 1180000000, circulatingSupplyFormatted: '1.18B OP',
    totalSupply: 4294000000, totalSupplyFormatted: '4.29B OP', ath: 4.85, athChange: -98,
    high24h: 0.1007, low24h: 0.0934, rank: 30, segment: 'Layer 2', marketDominance: 0.08,
    description: 'Superchain collective architecture running the open-source OP Stack framework adopted by Base, Zora, and World Chain.',
    technicalSummary: { rsi14: 56.7, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Neutral', overall: 'Buy' }
  },

  // Rank 31-50: DeFi, Gaming & Enterprise
  {
    symbol: 'POL/USDT', name: 'Polygon Ecosystem Token', market: 'CRYPTO', price: 0.09349, change24h: 3.843,
    marketCap: 744180400, marketCapFormatted: '$744.2M', fdv: 934900000, fdvFormatted: '$934.9M',
    volume24h: 3628716, volume24hFormatted: '$3.6M', circulatingSupply: 7960000000, circulatingSupplyFormatted: '7.96B POL',
    totalSupply: 10000000000, totalSupplyFormatted: '10.0B POL', ath: 2.92, athChange: -96.8,
    high24h: 0.0942, low24h: 0.08957, rank: 31, segment: 'Layer 2', marketDominance: 0.14,
    description: 'AggLayer aggregation architecture linking ZK-powered chains for cross-chain atomic liquidity settlement.',
    technicalSummary: { rsi14: 48.2, rsiSignal: 'Neutral', macdSignal: 'Neutral', ema20_50: 'Neutral', overall: 'Neutral' }
  },
  {
    symbol: 'XLM/USDT', name: 'Stellar', market: 'CRYPTO', price: 0.1773, change24h: 0.968,
    marketCap: 5265810000, marketCapFormatted: '$5.27B', fdv: 8865000000, fdvFormatted: '$8.87B',
    volume24h: 9989532, volume24hFormatted: '$10.0M', circulatingSupply: 29700000000, circulatingSupplyFormatted: '29.7B XLM',
    totalSupply: 50000000000, totalSupplyFormatted: '50.0B XLM', ath: 0.938, athChange: -81.1,
    high24h: 0.1791, low24h: 0.1713, rank: 32, segment: 'Payments', marketDominance: 0.12,
    description: 'Open network that allows money to be moved and stored with smart contracts enabled via Soroban Rust engine.',
    technicalSummary: { rsi14: 47.1, rsiSignal: 'Neutral', macdSignal: 'Neutral', ema20_50: 'Neutral', overall: 'Neutral' }
  },
  {
    symbol: 'FIL/USDT', name: 'Filecoin', market: 'CRYPTO', price: 0.8148, change24h: 2.349,
    marketCap: 477472800, marketCapFormatted: '$477.5M', fdv: 1597008000, fdvFormatted: '$1.60B',
    volume24h: 15310030, volume24hFormatted: '$15.3M', circulatingSupply: 586000000, circulatingSupplyFormatted: '586.0M FIL',
    totalSupply: 1960000000, totalSupplyFormatted: '1.96B FIL', ath: 237.24, athChange: -99.7,
    high24h: 0.8349, low24h: 0.759, rank: 33, segment: 'DePIN', marketDominance: 0.09,
    description: 'Decentralized storage network turning cloud storage into an algorithmic marketplace powered by the Filecoin Virtual Machine (FVM).',
    technicalSummary: { rsi14: 52.4, rsiSignal: 'Neutral', macdSignal: 'Neutral', ema20_50: 'Neutral', overall: 'Neutral' }
  },
  {
    symbol: 'ATOM/USDT', name: 'Cosmos Hub', market: 'CRYPTO', price: 1.467, change24h: 0.479,
    marketCap: 575064000, marketCapFormatted: '$575.1M', fdv: 575064000, fdvFormatted: '$575.1M',
    volume24h: 1122286, volume24hFormatted: '$1.1M', circulatingSupply: 392000000, circulatingSupplyFormatted: '392.0M ATOM',
    totalSupply: 392000000, totalSupplyFormatted: '392.0M ATOM', ath: 44.70, athChange: -96.7,
    high24h: 1.473, low24h: 1.44, rank: 34, segment: 'Layer 1', marketDominance: 0.07,
    description: 'Heart of the Inter-Blockchain Communication (IBC) protocol connecting independent sovereign application-specific blockchains.',
    technicalSummary: { rsi14: 46.8, rsiSignal: 'Neutral', macdSignal: 'Neutral', ema20_50: 'Neutral', overall: 'Neutral' }
  },
  {
    symbol: 'IMX/USDT', name: 'Immutable', market: 'CRYPTO', price: 0.1244, change24h: -0.56,
    marketCap: 199040000, marketCapFormatted: '$199.0M', fdv: 248800000, fdvFormatted: '$248.8M',
    volume24h: 221689, volume24hFormatted: '$221,689.101', circulatingSupply: 1600000000, circulatingSupplyFormatted: '1.60B IMX',
    totalSupply: 2000000000, totalSupplyFormatted: '2.0B IMX', ath: 9.50, athChange: -98.7,
    high24h: 0.1255, low24h: 0.1203, rank: 35, segment: 'Gaming', marketDominance: 0.10,
    description: 'First layer-2 scaling solution for web3 gaming and NFTs on Ethereum with zero gas fees and passport login wallet.',
    technicalSummary: { rsi14: 61.2, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Buy' }
  },
  {
    symbol: 'HBAR/USDT', name: 'Hedera', market: 'CRYPTO', price: 0.0759, change24h: 2.415,
    marketCap: 2846250000, marketCapFormatted: '$2.85B', fdv: 3795000000, fdvFormatted: '$3.79B',
    volume24h: 5089574, volume24hFormatted: '$5.1M', circulatingSupply: 37500000000, circulatingSupplyFormatted: '37.5B HBAR',
    totalSupply: 50000000000, totalSupplyFormatted: '50.0B HBAR', ath: 0.570, athChange: -86.7,
    high24h: 0.07628, low24h: 0.07277, rank: 36, segment: 'Layer 1', marketDominance: 0.09,
    description: 'Enterprise-grade public hashgraph distributed ledger governed by global consortium of industry leaders including Google and IBM.',
    technicalSummary: { rsi14: 49.3, rsiSignal: 'Neutral', macdSignal: 'Neutral', ema20_50: 'Neutral', overall: 'Neutral' }
  },
  {
    symbol: 'VET/USDT', name: 'VeChain', market: 'CRYPTO', price: 0.006591, change24h: -0.618,
    marketCap: 533211900, marketCapFormatted: '$533.2M', fdv: 566166900, fdvFormatted: '$566.2M',
    volume24h: 784453, volume24hFormatted: '$784,453.134', circulatingSupply: 80900000000, circulatingSupplyFormatted: '80.9B VET',
    totalSupply: 85900000000, totalSupplyFormatted: '85.9B VET', ath: 0.278, athChange: -97.6,
    high24h: 0.00674, low24h: 0.00644, rank: 37, segment: 'Layer 1', marketDominance: 0.08,
    description: 'Enterprise smart contract platform focused on supply chain tracking, carbon credit verification, and IoT asset passports.',
    technicalSummary: { rsi14: 48.0, rsiSignal: 'Neutral', macdSignal: 'Neutral', ema20_50: 'Neutral', overall: 'Neutral' }
  },
  {
    symbol: 'MKR/USDT', name: 'Maker', market: 'CRYPTO', price: 1813.7, change24h: 0.761,
    marketCap: 1686741000, marketCapFormatted: '$1.69B', fdv: 1771984900, fdvFormatted: '$1.77B',
    volume24h: 440709, volume24hFormatted: '$440,708.836', circulatingSupply: 930000, circulatingSupplyFormatted: '930K MKR',
    totalSupply: 977000, totalSupplyFormatted: '977K MKR', ath: 6339.00, athChange: -71.4,
    high24h: 1830, low24h: 1780.6, rank: 38, segment: 'DeFi', marketDominance: 0.07,
    description: 'Governance token of the Sky/MakerDAO protocol generating and backing the USDS and DAI decentralized stablecoins.',
    technicalSummary: { rsi14: 58.7, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Buy' }
  },
  {
    symbol: 'AAVE/USDT', name: 'Aave', market: 'CRYPTO', price: 127.55, change24h: -5.686,
    marketCap: 1900495000, marketCapFormatted: '$1.90B', fdv: 2040800000, fdvFormatted: '$2.04B',
    volume24h: 17462115, volume24hFormatted: '$17.5M', circulatingSupply: 14900000, circulatingSupplyFormatted: '14.9M AAVE',
    totalSupply: 16000000, totalSupplyFormatted: '16.0M AAVE', ath: 666.86, athChange: -80.9,
    high24h: 135.24, low24h: 125.7, rank: 39, segment: 'DeFi', marketDominance: 0.10,
    description: 'Non-custodial liquidity protocol enabling users to supply, borrow crypto assets, and execute flash loans across chains.',
    technicalSummary: { rsi14: 69.4, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Strong Buy' }
  },
  {
    symbol: 'WIF/USDT', name: 'dogwifhat', market: 'CRYPTO', price: 0.2011, change24h: 1.463,
    marketCap: 200878790, marketCapFormatted: '$200.9M', fdv: 200878790, fdvFormatted: '$200.9M',
    volume24h: 1302609, volume24hFormatted: '$1.3M', circulatingSupply: 998900000, circulatingSupplyFormatted: '998.9M WIF',
    totalSupply: 998900000, totalSupplyFormatted: '998.9M WIF', ath: 4.85, athChange: -95.9,
    high24h: 0.2032, low24h: 0.1915, rank: 40, segment: 'Meme', marketDominance: 0.10,
    description: 'Premier Solana meme token capturing viral Web3 culture, symbolizing community resilience and frictionless decentralized trade.',
    technicalSummary: { rsi14: 70.4, rsiSignal: 'Overbought', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Strong Buy' }
  },
  {
    symbol: 'BONK/USDT', name: 'Bonk', market: 'CRYPTO', price: 0.00000299, change24h: -0.993,
    marketCap: 211692000, marketCapFormatted: '$211.7M', fdv: 278070000, fdvFormatted: '$278.1M',
    volume24h: 2139955, volume24hFormatted: '$2.1M', circulatingSupply: 70800000000000, circulatingSupplyFormatted: '70.8T BONK',
    totalSupply: 93000000000000, totalSupplyFormatted: '93.0T BONK', ath: 0.000047, athChange: -93.6,
    high24h: 0.00000303, low24h: 0.00000287, rank: 41, segment: 'Meme', marketDominance: 0.07,
    description: 'Community dog token of Solana airdropped across developers, NFT collectors, and DeFi participants to rejuvenate ecosystem activity.',
    technicalSummary: { rsi14: 67.8, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Strong Buy' }
  },
  {
    symbol: 'FLOKI/USDT', name: 'Floki', market: 'CRYPTO', price: 0.00002439, change24h: 1.203,
    marketCap: 236339100, marketCapFormatted: '$236.3M', fdv: 243900000, fdvFormatted: '$243.9M',
    volume24h: 1099290, volume24hFormatted: '$1.1M', circulatingSupply: 9690000000000, circulatingSupplyFormatted: '9.69T FLOKI',
    totalSupply: 10000000000000, totalSupplyFormatted: '10.0T FLOKI', ath: 0.000343, athChange: -92.9,
    high24h: 0.00002466, low24h: 0.00002344, rank: 42, segment: 'Meme', marketDominance: 0.06,
    description: 'Utility meme ecosystem spanning Valhalla NFT metaverse game, FlokiFi locker, and crypto educational university.',
    technicalSummary: { rsi14: 65.4, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Strong Buy' }
  },
  {
    symbol: 'ONDO/USDT', name: 'Ondo Finance', market: 'CRYPTO', price: 0.3507, change24h: 1.948,
    marketCap: 487473000, marketCapFormatted: '$487.5M', fdv: 3507000000, fdvFormatted: '$3.51B',
    volume24h: 7438205, volume24hFormatted: '$7.4M', circulatingSupply: 1390000000, circulatingSupplyFormatted: '1.39B ONDO',
    totalSupply: 10000000000, totalSupplyFormatted: '10.0B ONDO', ath: 1.48, athChange: -76.3,
    high24h: 0.355, low24h: 0.3373, rank: 43, segment: 'RWA', marketDominance: 0.05,
    description: 'Decentralized institutional finance protocol tokenizing real-world financial assets including US Treasuries (OUSG) and USDY.',
    technicalSummary: { rsi14: 64.9, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Strong Buy' }
  },
  {
    symbol: 'PENDLE/USDT', name: 'Pendle', market: 'CRYPTO', price: 1.856, change24h: -0.483,
    marketCap: 296960000, marketCapFormatted: '$297.0M', fdv: 478848000, fdvFormatted: '$478.8M',
    volume24h: 4195173, volume24hFormatted: '$4.2M', circulatingSupply: 160000000, circulatingSupplyFormatted: '160.0M PENDLE',
    totalSupply: 258000000, totalSupplyFormatted: '258.0M PENDLE', ath: 7.52, athChange: -75.3,
    high24h: 1.867, low24h: 1.767, rank: 44, segment: 'DeFi', marketDominance: 0.03,
    description: 'Yield-trading DeFi protocol tokenizing future yield into Principal Tokens (PT) and Yield Tokens (YT) for fixed-rate yield trading.',
    technicalSummary: { rsi14: 63.8, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Buy' }
  },
  {
    symbol: 'LDO/USDT', name: 'Lido DAO', market: 'CRYPTO', price: 0.3704, change24h: 0.081,
    marketCap: 331508000, marketCapFormatted: '$331.5M', fdv: 370400000, fdvFormatted: '$370.4M',
    volume24h: 2086347, volume24hFormatted: '$2.1M', circulatingSupply: 895000000, circulatingSupplyFormatted: '895.0M LDO',
    totalSupply: 1000000000, totalSupplyFormatted: '1.0B LDO', ath: 18.64, athChange: -98,
    high24h: 0.3722, low24h: 0.353, rank: 45, segment: 'DeFi', marketDominance: 0.04,
    description: 'Liquid staking solution for Ethereum allowing users to earn beacon chain staking rewards while maintaining liquidity through stETH.',
    technicalSummary: { rsi14: 49.2, rsiSignal: 'Neutral', macdSignal: 'Neutral', ema20_50: 'Neutral', overall: 'Neutral' }
  },
  {
    symbol: 'ENA/USDT', name: 'Ethena', market: 'CRYPTO', price: 0.1512, change24h: -4.786,
    marketCap: 424872000, marketCapFormatted: '$424.9M', fdv: 2268000000, fdvFormatted: '$2.27B',
    volume24h: 27608296, volume24hFormatted: '$27.6M', circulatingSupply: 2810000000, circulatingSupplyFormatted: '2.81B ENA',
    totalSupply: 15000000000, totalSupplyFormatted: '15.0B ENA', ath: 1.52, athChange: -90.1,
    high24h: 0.1604, low24h: 0.1463, rank: 46, segment: 'DeFi', marketDominance: 0.04,
    description: 'Synthetic dollar protocol generating USDe through delta-hedged ETH and BTC perpetual short collateralization.',
    technicalSummary: { rsi14: 62.4, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Buy' }
  },
  {
    symbol: 'SEI/USDT', name: 'Sei', market: 'CRYPTO', price: 0.04859, change24h: 2.727,
    marketCap: 172494500, marketCapFormatted: '$172.5M', fdv: 485900000, fdvFormatted: '$485.9M',
    volume24h: 5983842, volume24hFormatted: '$6.0M', circulatingSupply: 3550000000, circulatingSupplyFormatted: '3.55B SEI',
    totalSupply: 10000000000, totalSupplyFormatted: '10.0B SEI', ath: 1.14, athChange: -95.7,
    high24h: 0.05014, low24h: 0.04561, rank: 47, segment: 'Layer 1', marketDominance: 0.06,
    description: 'High-speed parallelized EVM Layer 1 blockchain engineered with twin-turbo consensus and built-in order book matching engine.',
    technicalSummary: { rsi14: 67.1, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Strong Buy' }
  },
  {
    symbol: 'RUNE/USDT', name: 'THORChain', market: 'CRYPTO', price: 0.477, change24h: 0.846,
    marketCap: 159795000, marketCapFormatted: '$159.8M', fdv: 238500000, fdvFormatted: '$238.5M',
    volume24h: 1359698, volume24hFormatted: '$1.4M', circulatingSupply: 335000000, circulatingSupplyFormatted: '335.0M RUNE',
    totalSupply: 500000000, totalSupplyFormatted: '500.0M RUNE', ath: 21.26, athChange: -97.8,
    high24h: 0.479, low24h: 0.466, rank: 48, segment: 'DeFi', marketDominance: 0.07,
    description: 'Decentralized liquidity network that allows users to swap native Bitcoin, Ethereum, and BNB without wrapped tokens.',
    technicalSummary: { rsi14: 61.8, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Buy' }
  },
  {
    symbol: 'GRT/USDT', name: 'The Graph', market: 'CRYPTO', price: 0.01656, change24h: 0.976,
    marketCap: 158148000, marketCapFormatted: '$158.1M', fdv: 178848000, fdvFormatted: '$178.8M',
    volume24h: 403419, volume24hFormatted: '$403,419.239', circulatingSupply: 9550000000, circulatingSupplyFormatted: '9.55B GRT',
    totalSupply: 10800000000, totalSupplyFormatted: '10.8B GRT', ath: 2.88, athChange: -99.4,
    high24h: 0.01678, low24h: 0.01592, rank: 49, segment: 'Infrastructure', marketDominance: 0.06,
    description: 'Indexing and query protocol powering Web3 data access via open GraphQL subgraphs for smart contract analytics.',
    technicalSummary: { rsi14: 55.4, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Neutral', overall: 'Buy' }
  },
  {
    symbol: 'FTM/USDT', name: 'Sonic (Fantom)', market: 'CRYPTO', price: 0.6994, change24h: -0.766,
    marketCap: 1958320000, marketCapFormatted: '$1.96B', fdv: 2220595000, fdvFormatted: '$2.22B',
    volume24h: 1301242, volume24hFormatted: '$1.3M', circulatingSupply: 2800000000, circulatingSupplyFormatted: '2.80B FTM',
    totalSupply: 3175000000, totalSupplyFormatted: '3.18B FTM', ath: 3.48, athChange: -79.9,
    high24h: 0.7111, low24h: 0.69, rank: 50, segment: 'Layer 1', marketDominance: 0.08,
    description: 'Sonic EVM upgrade delivering 10,000 TPS, sub-second finality, and native developer fee monetization.',
    technicalSummary: { rsi14: 69.8, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Strong Buy' }
  },

  // Rank 51-75: DePIN, Memes & Scaling
  {
    symbol: 'ALGO/USDT', name: 'Algorand', market: 'CRYPTO', price: 0.0922, change24h: 1.319,
    marketCap: 756040000, marketCapFormatted: '$756.0M', fdv: 922000000, fdvFormatted: '$922.0M',
    volume24h: 2346082, volume24hFormatted: '$2.3M', circulatingSupply: 8200000000, circulatingSupplyFormatted: '8.20B ALGO',
    totalSupply: 10000000000, totalSupplyFormatted: '10.0B ALGO', ath: 3.28, athChange: -97.2,
    high24h: 0.0951, low24h: 0.0879, rank: 51, segment: 'Layer 1', marketDominance: 0.05,
    description: 'Pure proof-of-stake blockchain invented by Turing award laureate Silvio Micali ensuring mathematical finality without forks.',
    technicalSummary: { rsi14: 48.7, rsiSignal: 'Neutral', macdSignal: 'Neutral', ema20_50: 'Neutral', overall: 'Neutral' }
  },
  {
    symbol: 'THETA/USDT', name: 'Theta Network', market: 'CRYPTO', price: 0.1679, change24h: -1.583,
    marketCap: 167900000, marketCapFormatted: '$167.9M', fdv: 167900000, fdvFormatted: '$167.9M',
    volume24h: 226002, volume24hFormatted: '$226,001.846', circulatingSupply: 1000000000, circulatingSupplyFormatted: '1.0B THETA',
    totalSupply: 1000000000, totalSupplyFormatted: '1.0B THETA', ath: 15.90, athChange: -98.9,
    high24h: 0.1707, low24h: 0.1657, rank: 52, segment: 'DePIN', marketDominance: 0.05,
    description: 'Decentralized video delivery and EdgeCloud AI computing network reducing CDN bandwidth costs through peer sharing.',
    technicalSummary: { rsi14: 56.1, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Neutral', overall: 'Buy' }
  },
  {
    symbol: 'FLOW/USDT', name: 'Flow', market: 'CRYPTO', price: 0.02742, change24h: 4.021,
    marketCap: 42226800, marketCapFormatted: '$42.2M', fdv: 42226800, fdvFormatted: '$42.2M',
    volume24h: 401905, volume24hFormatted: '$401,905.1', circulatingSupply: 1540000000, circulatingSupplyFormatted: '1.54B FLOW',
    totalSupply: 1540000000, totalSupplyFormatted: '1.54B FLOW', ath: 46.16, athChange: -99.9,
    high24h: 0.02772, low24h: 0.02574, rank: 53, segment: 'Gaming', marketDominance: 0.04,
    description: 'Consumer-scale blockchain engineered by Dapper Labs for mainstream sports, digital collectibles, and EVM compatibility.',
    technicalSummary: { rsi14: 51.5, rsiSignal: 'Neutral', macdSignal: 'Neutral', ema20_50: 'Neutral', overall: 'Neutral' }
  },
  {
    symbol: 'PYTH/USDT', name: 'Pyth Network', market: 'CRYPTO', price: 0.05706, change24h: 1.53,
    marketCap: 206557200, marketCapFormatted: '$206.6M', fdv: 570600000, fdvFormatted: '$570.6M',
    volume24h: 6665441, volume24hFormatted: '$6.7M', circulatingSupply: 3620000000, circulatingSupplyFormatted: '3.62B PYTH',
    totalSupply: 10000000000, totalSupplyFormatted: '10.0B PYTH', ath: 1.15, athChange: -95,
    high24h: 0.05969, low24h: 0.05341, rank: 54, segment: 'Infrastructure', marketDominance: 0.05,
    description: 'Specialized financial oracle publishing sub-second market data directly from major trading firms, market makers, and exchanges.',
    technicalSummary: { rsi14: 63.1, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Strong Buy' }
  },
  {
    symbol: 'JUP/USDT', name: 'Jupiter', market: 'CRYPTO', price: 0.2179, change24h: 0.647,
    marketCap: 294165000, marketCapFormatted: '$294.2M', fdv: 2179000000, fdvFormatted: '$2.18B',
    volume24h: 3663624, volume24hFormatted: '$3.7M', circulatingSupply: 1350000000, circulatingSupplyFormatted: '1.35B JUP',
    totalSupply: 10000000000, totalSupplyFormatted: '10.0B JUP', ath: 2.04, athChange: -89.3,
    high24h: 0.2247, low24h: 0.2086, rank: 55, segment: 'DeFi', marketDominance: 0.05,
    description: 'Premier decentralized trading engine on Solana providing routing aggregation, limit orders, DCA, and perpetual leverage.',
    technicalSummary: { rsi14: 66.8, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Strong Buy' }
  },
  {
    symbol: 'BRETT/USDT', name: 'Brett', market: 'CRYPTO', price: 0.004962, change24h: -2.649,
    marketCap: 49173420, marketCapFormatted: '$49.2M', fdv: 49620000, fdvFormatted: '$49.6M',
    volume24h: 1333472, volume24hFormatted: '$1.3M', circulatingSupply: 9910000000, circulatingSupplyFormatted: '9.91B BRETT',
    totalSupply: 10000000000, totalSupplyFormatted: '10.0B BRETT', ath: 0.193, athChange: -97.4,
    high24h: 0.005119, low24h: 0.00482, rank: 56, segment: 'Meme', marketDominance: 0.04,
    description: 'The flagship mascot and community meme token of Coinbase Base blockchain ecosystem.',
    technicalSummary: { rsi14: 71.8, rsiSignal: 'Overbought', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Strong Buy' }
  },
  {
    symbol: 'POPCAT/USDT', name: 'Popcat', market: 'CRYPTO', price: 0.05212, change24h: 0.058,
    marketCap: 51072388, marketCapFormatted: '$51.1M', fdv: 51072388, fdvFormatted: '$51.1M',
    volume24h: 1730774, volume24hFormatted: '$1.7M', circulatingSupply: 979900000, circulatingSupplyFormatted: '979.9M POPCAT',
    totalSupply: 979900000, totalSupplyFormatted: '979.9M POPCAT', ath: 1.81, athChange: -97.1,
    high24h: 0.05247, low24h: 0.05023, rank: 57, segment: 'Meme', marketDominance: 0.05,
    description: 'Viral cat-themed Solana meme sensation supported by dedicated global community clicks and trading velocity.',
    technicalSummary: { rsi14: 73.5, rsiSignal: 'Overbought', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Strong Buy' }
  },
  {
    symbol: 'BEAM/USDT', name: 'Beam', market: 'CRYPTO', price: 0.0652, change24h: 3.165,
    marketCap: 3273040000, marketCapFormatted: '$3.27B', fdv: 4094560000, fdvFormatted: '$4.09B',
    volume24h: 739250, volume24hFormatted: '$739,250.42', circulatingSupply: 50200000000, circulatingSupplyFormatted: '50.2B BEAM',
    totalSupply: 62800000000, totalSupplyFormatted: '62.8B BEAM', ath: 0.044, athChange: 48.2,
    high24h: 0.068, low24h: 0.0631, rank: 58, segment: 'Gaming', marketDominance: 0.03,
    description: 'Gaming network ecosystem initiated by Merit Circle DAO running on specialized Avalanche subnet infrastructure.',
    technicalSummary: { rsi14: 57.2, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Neutral', overall: 'Buy' }
  },
  {
    symbol: 'CRV/USDT', name: 'Curve DAO', market: 'CRYPTO', price: 0.3621, change24h: -4.409,
    marketCap: 452625000, marketCapFormatted: '$452.6M', fdv: 1194930000, fdvFormatted: '$1.19B',
    volume24h: 6135224, volume24hFormatted: '$6.1M', circulatingSupply: 1250000000, circulatingSupplyFormatted: '1.25B CRV',
    totalSupply: 3300000000, totalSupplyFormatted: '3.3B CRV', ath: 15.37, athChange: -97.6,
    high24h: 0.3811, low24h: 0.3524, rank: 59, segment: 'DeFi', marketDominance: 0.015,
    description: 'Deep liquidity decentralized exchange optimized for extremely low slippage stablecoin and pegged asset swaps.',
    technicalSummary: { rsi14: 49.5, rsiSignal: 'Neutral', macdSignal: 'Neutral', ema20_50: 'Neutral', overall: 'Neutral' }
  },
  {
    symbol: 'DYDX/USDT', name: 'dYdX', market: 'CRYPTO', price: 0.11122, change24h: -1.497,
    marketCap: 71736900, marketCapFormatted: '$71.7M', fdv: 111220000, fdvFormatted: '$111.2M',
    volume24h: 562918, volume24hFormatted: '$562,917.978', circulatingSupply: 645000000, circulatingSupplyFormatted: '645.0M DYDX',
    totalSupply: 1000000000, totalSupplyFormatted: '1.0B DYDX', ath: 27.78, athChange: -99.6,
    high24h: 0.11323, low24h: 0.1088, rank: 60, segment: 'DeFi', marketDominance: 0.03,
    description: 'Decentralized perpetual exchange running a dedicated Cosmos app-chain with off-chain order matching and 100% on-chain settlement.',
    technicalSummary: { rsi14: 58.1, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Neutral', overall: 'Buy' }
  },
  {
    symbol: 'SNX/USDT', name: 'Synthetix', market: 'CRYPTO', price: 0.21, change24h: -3.758,
    marketCap: 70140000, marketCapFormatted: '$70.1M', fdv: 70140000, fdvFormatted: '$70.1M',
    volume24h: 432982, volume24hFormatted: '$432,981.982', circulatingSupply: 334000000, circulatingSupplyFormatted: '334.0M SNX',
    totalSupply: 334000000, totalSupplyFormatted: '334.0M SNX', ath: 28.77, athChange: -99.3,
    high24h: 0.2195, low24h: 0.2046, rank: 61, segment: 'DeFi', marketDominance: 0.02,
    description: 'Decentralized synthetic asset liquidity layer enabling multi-collateral perpetual futures trading via Synthetix v3.',
    technicalSummary: { rsi14: 53.6, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Neutral', overall: 'Buy' }
  },
  {
    symbol: 'GALA/USDT', name: 'Gala', market: 'CRYPTO', price: 0.001783, change24h: -0.834,
    marketCap: 62405000, marketCapFormatted: '$62.4M', fdv: 89150000, fdvFormatted: '$89.2M',
    volume24h: 1178385, volume24hFormatted: '$1.2M', circulatingSupply: 35000000000, circulatingSupplyFormatted: '35.0B GALA',
    totalSupply: 50000000000, totalSupplyFormatted: '50.0B GALA', ath: 0.836, athChange: -99.8,
    high24h: 0.001798, low24h: 0.001711, rank: 62, segment: 'Gaming', marketDominance: 0.03,
    description: 'Web3 entertainment platform spanning Gala Games, Gala Music, and Gala Film running on custom GalaChain L1.',
    technicalSummary: { rsi14: 56.8, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Neutral', overall: 'Buy' }
  },
  {
    symbol: 'SAND/USDT', name: 'The Sandbox', market: 'CRYPTO', price: 0.03903, change24h: 2.468,
    marketCap: 88988400, marketCapFormatted: '$89.0M', fdv: 117090000, fdvFormatted: '$117.1M',
    volume24h: 1711146, volume24hFormatted: '$1.7M', circulatingSupply: 2280000000, circulatingSupplyFormatted: '2.28B SAND',
    totalSupply: 3000000000, totalSupplyFormatted: '3.0B SAND', ath: 8.44, athChange: -99.5,
    high24h: 0.03945, low24h: 0.0367, rank: 63, segment: 'Gaming', marketDominance: 0.025,
    description: 'User-generated voxel metaverse platform allowing creators to monetize 3D virtual real estate LAND and gaming experiences.',
    technicalSummary: { rsi14: 50.1, rsiSignal: 'Neutral', macdSignal: 'Neutral', ema20_50: 'Neutral', overall: 'Neutral' }
  },
  {
    symbol: 'MANA/USDT', name: 'Decentraland', market: 'CRYPTO', price: 0.0745, change24h: 1.776,
    marketCap: 144530000, marketCapFormatted: '$144.5M', fdv: 163155000, fdvFormatted: '$163.2M',
    volume24h: 324686, volume24hFormatted: '$324,685.587', circulatingSupply: 1940000000, circulatingSupplyFormatted: '1.94B MANA',
    totalSupply: 2190000000, totalSupplyFormatted: '2.19B MANA', ath: 5.90, athChange: -98.7,
    high24h: 0.075, low24h: 0.0727, rank: 64, segment: 'Gaming', marketDominance: 0.023,
    description: 'Virtual world powered by Ethereum where participants purchase LAND plots, build decentralized scenes, and socialize.',
    technicalSummary: { rsi14: 49.6, rsiSignal: 'Neutral', macdSignal: 'Neutral', ema20_50: 'Neutral', overall: 'Neutral' }
  },
  {
    symbol: 'AXS/USDT', name: 'Axie Infinity', market: 'CRYPTO', price: 0.924, change24h: -0.538,
    marketCap: 137676000, marketCapFormatted: '$137.7M', fdv: 249480000, fdvFormatted: '$249.5M',
    volume24h: 1073982, volume24hFormatted: '$1.1M', circulatingSupply: 149000000, circulatingSupplyFormatted: '149.0M AXS',
    totalSupply: 270000000, totalSupplyFormatted: '270.0M AXS', ath: 165.37, athChange: -99.4,
    high24h: 0.946, low24h: 0.904, rank: 65, segment: 'Gaming', marketDominance: 0.03,
    description: 'Turn-based pet battling strategy game pioneering Play-to-Earn mechanics built on Ronin Network sidechain.',
    technicalSummary: { rsi14: 54.2, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Neutral', overall: 'Buy' }
  },
  {
    symbol: 'CHZ/USDT', name: 'Chiliz', market: 'CRYPTO', price: 0.01348, change24h: -0.148,
    marketCap: 119972000, marketCapFormatted: '$120.0M', fdv: 119972000, fdvFormatted: '$120.0M',
    volume24h: 940692, volume24hFormatted: '$940,692.173', circulatingSupply: 8900000000, circulatingSupplyFormatted: '8.90B CHZ',
    totalSupply: 8900000000, totalSupplyFormatted: '8.90B CHZ', ath: 0.891, athChange: -98.5,
    high24h: 0.01372, low24h: 0.01305, rank: 66, segment: 'Gaming', marketDominance: 0.024,
    description: 'Sports and fan engagement blockchain network powering Socios.com fan tokens for top international soccer clubs.',
    technicalSummary: { rsi14: 51.3, rsiSignal: 'Neutral', macdSignal: 'Neutral', ema20_50: 'Neutral', overall: 'Neutral' }
  },
  {
    symbol: 'STRK/USDT', name: 'Starknet', market: 'CRYPTO', price: 0.0267, change24h: -0.964,
    marketCap: 49662000, marketCapFormatted: '$49.7M', fdv: 267000000, fdvFormatted: '$267.0M',
    volume24h: 1426479, volume24hFormatted: '$1.4M', circulatingSupply: 1860000000, circulatingSupplyFormatted: '1.86B STRK',
    totalSupply: 10000000000, totalSupplyFormatted: '10.0B STRK', ath: 2.67, athChange: -99,
    high24h: 0.02729, low24h: 0.02585, rank: 67, segment: 'Layer 2', marketDominance: 0.03,
    description: 'Permissionless validity rollup scaling Ethereum using STARK cryptographic proofs and native account abstraction.',
    technicalSummary: { rsi14: 61.4, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Buy' }
  },
  {
    symbol: 'ZK/USDT', name: 'ZKsync', market: 'CRYPTO', price: 0.00896, change24h: 1.357,
    marketCap: 32883200, marketCapFormatted: '$32.9M', fdv: 188160000, fdvFormatted: '$188.2M',
    volume24h: 1362329, volume24hFormatted: '$1.4M', circulatingSupply: 3670000000, circulatingSupplyFormatted: '3.67B ZK',
    totalSupply: 21000000000, totalSupplyFormatted: '21.0B ZK', ath: 0.32, athChange: -97.2,
    high24h: 0.00912, low24h: 0.00871, rank: 68, segment: 'Layer 2', marketDominance: 0.02,
    description: 'Zero-knowledge rollup utilizing ZK-Credo principles to scale Ethereum with hyperchain interoperability.',
    technicalSummary: { rsi14: 59.8, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Neutral', overall: 'Buy' }
  },
  {
    symbol: 'W/USDT', name: 'Wormhole', market: 'CRYPTO', price: 0.00966, change24h: -0.923,
    marketCap: 17388000, marketCapFormatted: '$17.4M', fdv: 96600000, fdvFormatted: '$96.6M',
    volume24h: 561707, volume24hFormatted: '$561,706.731', circulatingSupply: 1800000000, circulatingSupplyFormatted: '1.80B W',
    totalSupply: 10000000000, totalSupplyFormatted: '10.0B W', ath: 1.61, athChange: -99.4,
    high24h: 0.00988, low24h: 0.00932, rank: 69, segment: 'Infrastructure', marketDominance: 0.023,
    description: 'Interoperability platform connecting over 30 leading blockchains for secure cross-chain messaging and liquidity transfer.',
    technicalSummary: { rsi14: 52.8, rsiSignal: 'Neutral', macdSignal: 'Neutral', ema20_50: 'Neutral', overall: 'Neutral' }
  },
  {
    symbol: 'AEVO/USDT', name: 'Aevo', market: 'CRYPTO', price: 0.02156, change24h: 0.466,
    marketCap: 19188400, marketCapFormatted: '$19.2M', fdv: 21560000, fdvFormatted: '$21.6M',
    volume24h: 243304, volume24hFormatted: '$243,304.364', circulatingSupply: 890000000, circulatingSupplyFormatted: '890.0M AEVO',
    totalSupply: 1000000000, totalSupplyFormatted: '1.0B AEVO', ath: 3.94, athChange: -99.5,
    high24h: 0.02175, low24h: 0.02102, rank: 70, segment: 'DeFi', marketDominance: 0.014,
    description: 'High-performance decentralized options and perpetual futures exchange built on custom OP Stack rollup.',
    technicalSummary: { rsi14: 62.1, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Buy' }
  },
  {
    symbol: 'NOT/USDT', name: 'Notcoin', market: 'CRYPTO', price: 0.000447, change24h: 2.055,
    marketCap: 45817500, marketCapFormatted: '$45.8M', fdv: 45817500, fdvFormatted: '$45.8M',
    volume24h: 638058, volume24hFormatted: '$638,058.094', circulatingSupply: 102500000000, circulatingSupplyFormatted: '102.5B NOT',
    totalSupply: 102500000000, totalSupplyFormatted: '102.5B NOT', ath: 0.0289, athChange: -98.5,
    high24h: 0.000454, low24h: 0.000427, rank: 71, segment: 'Meme', marketDominance: 0.033,
    description: 'Viral Telegram tap-to-earn community onboarding game transitioning into an explore-to-earn web3 gateway.',
    technicalSummary: { rsi14: 64.3, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Strong Buy' }
  },
  {
    symbol: 'BOME/USDT', name: 'Book of Meme', market: 'CRYPTO', price: 0.0008869, change24h: 1.627,
    marketCap: 61196100, marketCapFormatted: '$61.2M', fdv: 61196100, fdvFormatted: '$61.2M',
    volume24h: 1802572, volume24hFormatted: '$1.8M', circulatingSupply: 69000000000, circulatingSupplyFormatted: '69.0B BOME',
    totalSupply: 69000000000, totalSupplyFormatted: '69.0B BOME', ath: 0.028, athChange: -96.8,
    high24h: 0.0009187, low24h: 0.0008512, rank: 72, segment: 'Meme', marketDominance: 0.021,
    description: 'Experimental digital compendium immortally recording internet memes on Arweave, IPFS, and Solana inscriptions.',
    technicalSummary: { rsi14: 63.7, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Buy' }
  },
  {
    symbol: 'MEW/USDT', name: 'cat in a dogs world', market: 'CRYPTO', price: 0.0004116, change24h: 1.006,
    marketCap: 36586667, marketCapFormatted: '$36.6M', fdv: 36586667, fdvFormatted: '$36.6M',
    volume24h: 868852, volume24hFormatted: '$868,852.292', circulatingSupply: 88888888888, circulatingSupplyFormatted: '88.9B MEW',
    totalSupply: 88888888888, totalSupplyFormatted: '88.9B MEW', ath: 0.0104, athChange: -96,
    high24h: 0.0004132, low24h: 0.0003976, rank: 73, segment: 'Meme', marketDominance: 0.025,
    description: 'Premier Solana feline meme currency disrupting canine domination with high-production artistic animations.',
    technicalSummary: { rsi14: 68.9, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Strong Buy' }
  },
  {
    symbol: 'TURBO/USDT', name: 'Turbo', market: 'CRYPTO', price: 0.000961, change24h: 0.523,
    marketCap: 66309000, marketCapFormatted: '$66.3M', fdv: 66309000, fdvFormatted: '$66.3M',
    volume24h: 414266, volume24hFormatted: '$414,266.273', circulatingSupply: 69000000000, circulatingSupplyFormatted: '69.0B TURBO',
    totalSupply: 69000000000, totalSupplyFormatted: '69.0B TURBO', ath: 0.0098, athChange: -90.2,
    high24h: 0.000964, low24h: 0.000918, rank: 74, segment: 'AI & Big Data', marketDominance: 0.018,
    description: 'First ever AI-created cryptocurrency designed entirely by GPT-4 with a modest starting budget of $69.',
    technicalSummary: { rsi14: 70.8, rsiSignal: 'Overbought', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Strong Buy' }
  },
  {
    symbol: 'JASMY/USDT', name: 'JasmyCoin', market: 'CRYPTO', price: 0.00465, change24h: -5.488,
    marketCap: 229245000, marketCapFormatted: '$229.2M', fdv: 232500000, fdvFormatted: '$232.5M',
    volume24h: 759611, volume24hFormatted: '$759,610.627', circulatingSupply: 49300000000, circulatingSupplyFormatted: '49.3B JASMY',
    totalSupply: 50000000000, totalSupplyFormatted: '50.0B JASMY', ath: 4.99, athChange: -99.9,
    high24h: 0.00494, low24h: 0.00459, rank: 75, segment: 'DePIN', marketDominance: 0.043,
    description: 'Tokyo-based IoT data monetization platform restoring personal sovereign data ownership to device users.',
    technicalSummary: { rsi14: 61.3, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Buy' }
  },

  // Rank 76-105: Proven Web3 Infrastructure, DePIN & Ecosystem L1s
  {
    symbol: 'IOTA/USDT', name: 'IOTA', market: 'CRYPTO', price: 0.0403, change24h: 0.499,
    marketCap: 137020000, marketCapFormatted: '$137.0M', fdv: 185380000, fdvFormatted: '$185.4M',
    volume24h: 506337, volume24hFormatted: '$506,336.735', circulatingSupply: 3400000000, circulatingSupplyFormatted: '3.40B IOTA',
    totalSupply: 4600000000, totalSupplyFormatted: '4.60B IOTA', ath: 5.69, athChange: -99.3,
    high24h: 0.0405, low24h: 0.0387, rank: 76, segment: 'Layer 1', marketDominance: 0.017,
    description: 'Feeless distributed ledger using Directed Acyclic Graph (Tangle) architecture optimized for machine-to-machine micropayments.',
    technicalSummary: { rsi14: 49.0, rsiSignal: 'Neutral', macdSignal: 'Neutral', ema20_50: 'Neutral', overall: 'Neutral' }
  },
  {
    symbol: 'NEO/USDT', name: 'NEO', market: 'CRYPTO', price: 2.051, change24h: 0.049,
    marketCap: 144595500, marketCapFormatted: '$144.6M', fdv: 205100000, fdvFormatted: '$205.1M',
    volume24h: 281761, volume24hFormatted: '$281,760.708', circulatingSupply: 70500000, circulatingSupplyFormatted: '70.5M NEO',
    totalSupply: 100000000, totalSupplyFormatted: '100.0M NEO', ath: 196.85, athChange: -99,
    high24h: 2.062, low24h: 1.995, rank: 77, segment: 'Layer 1', marketDominance: 0.03,
    description: 'Smart economy platform utilizing delegated Byzantine Fault Tolerance (dBFT) supporting multiple programming languages.',
    technicalSummary: { rsi14: 55.2, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Neutral', overall: 'Buy' }
  },
  {
    symbol: 'EOS/USDT', name: 'EOS', market: 'CRYPTO', price: 0.7799, change24h: -0.662,
    marketCap: 1162051000, marketCapFormatted: '$1.16B', fdv: 1637790000, fdvFormatted: '$1.64B',
    volume24h: 924392, volume24hFormatted: '$924,391.644', circulatingSupply: 1490000000, circulatingSupplyFormatted: '1.49B EOS',
    totalSupply: 2100000000, totalSupplyFormatted: '2.10B EOS', ath: 22.89, athChange: -96.6,
    high24h: 0.7996, low24h: 0.768, rank: 78, segment: 'Layer 1', marketDominance: 0.03,
    description: 'Antelope framework layer-1 offering zero transaction fees and sub-second deterministic block confirmations.',
    technicalSummary: { rsi14: 48.4, rsiSignal: 'Neutral', macdSignal: 'Neutral', ema20_50: 'Neutral', overall: 'Neutral' }
  },
  {
    symbol: 'KAVA/USDT', name: 'Kava', market: 'CRYPTO', price: 0.04871, change24h: 2.872,
    marketCap: 52606800, marketCapFormatted: '$52.6M', fdv: 52606800, fdvFormatted: '$52.6M',
    volume24h: 1229508, volume24hFormatted: '$1.2M', circulatingSupply: 1080000000, circulatingSupplyFormatted: '1.08B KAVA',
    totalSupply: 1080000000, totalSupplyFormatted: '1.08B KAVA', ath: 9.18, athChange: -99.5,
    high24h: 0.04949, low24h: 0.04714, rank: 79, segment: 'DeFi', marketDominance: 0.016,
    description: 'Co-chain architecture uniting the flexibility of Ethereum smart contracts with the speed and interoperability of Cosmos.',
    technicalSummary: { rsi14: 52.6, rsiSignal: 'Neutral', macdSignal: 'Neutral', ema20_50: 'Neutral', overall: 'Neutral' }
  },
  {
    symbol: 'GNO/USDT', name: 'Gnosis', market: 'CRYPTO', price: 114.79, change24h: -1.205,
    marketCap: 296158200, marketCapFormatted: '$296.2M', fdv: 344370000, fdvFormatted: '$344.4M',
    volume24h: 242750, volume24hFormatted: '$242,750.117', circulatingSupply: 2580000, circulatingSupplyFormatted: '2.58M GNO',
    totalSupply: 3000000, totalSupplyFormatted: '3.0M GNO', ath: 644.20, athChange: -82.2,
    high24h: 116.47, low24h: 113.2, rank: 80, segment: 'Infrastructure', marketDominance: 0.02,
    description: 'Decentralized collective pioneering Gnosis Safe multi-sig treasury, CoW Swap batch auctions, and resilient Gnosis Chain.',
    technicalSummary: { rsi14: 54.7, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Neutral', overall: 'Buy' }
  },
  {
    symbol: 'QNT/USDT', name: 'Quant', market: 'CRYPTO', price: 64.67, change24h: -1.056,
    marketCap: 776040000, marketCapFormatted: '$776.0M', fdv: 944182000, fdvFormatted: '$944.2M',
    volume24h: 1103611, volume24hFormatted: '$1.1M', circulatingSupply: 12000000, circulatingSupplyFormatted: '12.0M QNT',
    totalSupply: 14600000, totalSupplyFormatted: '14.6M QNT', ath: 428.38, athChange: -84.9,
    high24h: 66.81, low24h: 63.23, rank: 81, segment: 'Infrastructure', marketDominance: 0.036,
    description: 'Overledger blockchain operating system interoperating enterprise banking rails with distributed ledger technology.',
    technicalSummary: { rsi14: 51.0, rsiSignal: 'Neutral', macdSignal: 'Neutral', ema20_50: 'Neutral', overall: 'Neutral' }
  },
  {
    symbol: 'CFX/USDT', name: 'Conflux', market: 'CRYPTO', price: 0.04808, change24h: 2.341,
    marketCap: 204340000, marketCapFormatted: '$204.3M', fdv: 259632000, fdvFormatted: '$259.6M',
    volume24h: 777355, volume24hFormatted: '$777,354.735', circulatingSupply: 4250000000, circulatingSupplyFormatted: '4.25B CFX',
    totalSupply: 5400000000, totalSupplyFormatted: '5.40B CFX', ath: 1.70, athChange: -97.2,
    high24h: 0.04853, low24h: 0.04592, rank: 82, segment: 'Layer 1', marketDominance: 0.026,
    description: 'Regulatory-compliant public blockchain in China operating Tree-Graph consensus for high-speed cross-border commerce.',
    technicalSummary: { rsi14: 63.4, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Buy' }
  },
  {
    symbol: 'ROSE/USDT', name: 'Oasis Network', market: 'CRYPTO', price: 0.00629, change24h: 2.61,
    marketCap: 42268800, marketCapFormatted: '$42.3M', fdv: 62900000, fdvFormatted: '$62.9M',
    volume24h: 755078, volume24hFormatted: '$755,077.797', circulatingSupply: 6720000000, circulatingSupplyFormatted: '6.72B ROSE',
    totalSupply: 10000000000, totalSupplyFormatted: '10.0B ROSE', ath: 0.596, athChange: -98.9,
    high24h: 0.0064, low24h: 0.00604, rank: 83, segment: 'Layer 1', marketDominance: 0.017,
    description: 'Privacy-focused Layer 1 modular architecture featuring Sapphire confidential EVM runtime and trusted execution environments.',
    technicalSummary: { rsi14: 53.8, rsiSignal: 'Neutral', macdSignal: 'Neutral', ema20_50: 'Neutral', overall: 'Neutral' }
  },
  {
    symbol: 'MINA/USDT', name: 'Mina Protocol', market: 'CRYPTO', price: 0.0726, change24h: 1.114,
    marketCap: 81312000, marketCapFormatted: '$81.3M', fdv: 87120000, fdvFormatted: '$87.1M',
    volume24h: 1262299, volume24hFormatted: '$1.3M', circulatingSupply: 1120000000, circulatingSupplyFormatted: '1.12B MINA',
    totalSupply: 1200000000, totalSupplyFormatted: '1.20B MINA', ath: 9.90, athChange: -99.3,
    high24h: 0.0746, low24h: 0.0685, rank: 84, segment: 'Layer 1', marketDominance: 0.022,
    description: 'Succinct 22KB constant-size blockchain utilizing recursive zk-SNARK cryptographic proofs to verify entire chain state.',
    technicalSummary: { rsi14: 56.4, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Neutral', overall: 'Buy' }
  },
  {
    symbol: 'AKT/USDT', name: 'Akash Network', market: 'CRYPTO', price: 0.5105, change24h: 1.531,
    marketCap: 126093500, marketCapFormatted: '$126.1M', fdv: 198074000, fdvFormatted: '$198.1M',
    volume24h: 1465680, volume24hFormatted: '$1.5M', circulatingSupply: 247000000, circulatingSupplyFormatted: '247.0M AKT',
    totalSupply: 388000000, totalSupplyFormatted: '388.0M AKT', ath: 8.08, athChange: -93.7,
    high24h: 0.5128, low24h: 0.493, rank: 85, segment: 'DePIN', marketDominance: 0.028,
    description: 'Open-source decentralized Supercloud compute marketplace allowing anyone to lease server and high-end AI GPU clusters.',
    technicalSummary: { rsi14: 64.7, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Strong Buy' }
  },
  {
    symbol: 'WLD/USDT', name: 'Worldcoin', market: 'CRYPTO', price: 0.3755, change24h: 2.568,
    marketCap: 221545000, marketCapFormatted: '$221.5M', fdv: 3755000000, fdvFormatted: '$3.75B',
    volume24h: 15751472, volume24hFormatted: '$15.8M', circulatingSupply: 590000000, circulatingSupplyFormatted: '590.0M WLD',
    totalSupply: 10000000000, totalSupplyFormatted: '10.0B WLD', ath: 11.82, athChange: -96.8,
    high24h: 0.3761, low24h: 0.3532, rank: 86, segment: 'AI & Big Data', marketDominance: 0.04,
    description: 'Privacy-preserving biometric proof-of-personhood protocol founded by Sam Altman issuing World ID and global universal basic income.',
    technicalSummary: { rsi14: 66.3, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Strong Buy' }
  },
  {
    symbol: 'CORE/USDT', name: 'Core', market: 'CRYPTO', price: 0.0205, change24h: 1.25,
    marketCap: 18368000, marketCapFormatted: '$18.4M', fdv: 43050000, fdvFormatted: '$43.0M',
    volume24h: 14500000, volume24hFormatted: '$14.5M', circulatingSupply: 896000000, circulatingSupplyFormatted: '896.0M CORE',
    totalSupply: 2100000000, totalSupplyFormatted: '2.10B CORE', ath: 6.47, athChange: -99.7,
    high24h: 0.0215, low24h: 0.0198, rank: 87, segment: 'Layer 1', marketDominance: 0.035,
    description: 'Satoshi Plus consensus network combining delegated Bitcoin proof-of-work hashrate with delegated proof-of-stake.',
    technicalSummary: { rsi14: 60.1, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Buy' }
  },
  {
    symbol: 'EGLD/USDT', name: 'MultiversX', market: 'CRYPTO', price: 5.41, change24h: 28.932,
    marketCap: 146070000, marketCapFormatted: '$146.1M', fdv: 169874000, fdvFormatted: '$169.9M',
    volume24h: 8100549, volume24hFormatted: '$8.1M', circulatingSupply: 27000000, circulatingSupplyFormatted: '27.0M EGLD',
    totalSupply: 31400000, totalSupplyFormatted: '31.4M EGLD', ath: 542.58, athChange: -99,
    high24h: 5.5, low24h: 4.131, rank: 88, segment: 'Layer 1', marketDominance: 0.031,
    description: 'Adaptive state sharding blockchain processing 30,000+ transactions per second with WASM virtual machine smart contracts.',
    technicalSummary: { rsi14: 51.4, rsiSignal: 'Neutral', macdSignal: 'Neutral', ema20_50: 'Neutral', overall: 'Neutral' }
  },
  {
    symbol: 'TWT/USDT', name: 'Trust Wallet', market: 'CRYPTO', price: 0.5254, change24h: -2.505,
    marketCap: 218566400, marketCapFormatted: '$218.6M', fdv: 525400000, fdvFormatted: '$525.4M',
    volume24h: 1397275, volume24hFormatted: '$1.4M', circulatingSupply: 416000000, circulatingSupplyFormatted: '416.0M TWT',
    totalSupply: 1000000000, totalSupplyFormatted: '1.0B TWT', ath: 2.72, athChange: -80.7,
    high24h: 0.549, low24h: 0.5217, rank: 89, segment: 'Infrastructure', marketDominance: 0.016,
    description: 'Utility token providing governance votes and in-app purchase discounts across the multi-million user self-custody Trust Wallet.',
    technicalSummary: { rsi14: 52.8, rsiSignal: 'Neutral', macdSignal: 'Neutral', ema20_50: 'Neutral', overall: 'Neutral' }
  },
  {
    symbol: 'OSMO/USDT', name: 'Osmosis', market: 'CRYPTO', price: 0.0338, change24h: 0.297,
    marketCap: 23322000, marketCapFormatted: '$23.3M', fdv: 33800000, fdvFormatted: '$33.8M',
    volume24h: 166592, volume24hFormatted: '$166,592.356', circulatingSupply: 690000000, circulatingSupplyFormatted: '690.0M OSMO',
    totalSupply: 1000000000, totalSupplyFormatted: '1.0B OSMO', ath: 11.25, athChange: -99.7,
    high24h: 0.0341, low24h: 0.0329, rank: 90, segment: 'DeFi', marketDominance: 0.012,
    description: 'Premier decentralized exchange and cross-chain liquidity hub of the Cosmos interchain ecosystem.',
    technicalSummary: { rsi14: 55.6, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Neutral', overall: 'Buy' }
  },
  {
    symbol: 'ASTR/USDT', name: 'Astar', market: 'CRYPTO', price: 0.005502, change24h: 0.456,
    marketCap: 40439700, marketCapFormatted: '$40.4M', fdv: 45886680, fdvFormatted: '$45.9M',
    volume24h: 171743, volume24hFormatted: '$171,743.462', circulatingSupply: 7350000000, circulatingSupplyFormatted: '7.35B ASTR',
    totalSupply: 8340000000, totalSupplyFormatted: '8.34B ASTR', ath: 0.335, athChange: -98.4,
    high24h: 0.005594, low24h: 0.005361, rank: 91, segment: 'Layer 1', marketDominance: 0.019,
    description: 'Multi-virtual machine smart contract hub in Japan connecting Polkadot parachain security with Polygon CDK rollups.',
    technicalSummary: { rsi14: 50.8, rsiSignal: 'Neutral', macdSignal: 'Neutral', ema20_50: 'Neutral', overall: 'Neutral' }
  },
  {
    symbol: 'AR/USDT', name: 'Arweave', market: 'CRYPTO', price: 2.586, change24h: 11.803,
    marketCap: 169641600, marketCapFormatted: '$169.6M', fdv: 170676000, fdvFormatted: '$170.7M',
    volume24h: 5460455, volume24hFormatted: '$5.5M', circulatingSupply: 65600000, circulatingSupplyFormatted: '65.6M AR',
    totalSupply: 66000000, totalSupplyFormatted: '66.0M AR', ath: 90.94, athChange: -97.2,
    high24h: 2.658, low24h: 2.178, rank: 92, segment: 'DePIN', marketDominance: 0.052,
    description: 'Permanent decentralized hard-drive network implementing blockweave proof-of-access storage and AO hyper-parallel computer.',
    technicalSummary: { rsi14: 65.2, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Strong Buy' }
  },
  {
    symbol: '1INCH/USDT', name: '1inch', market: 'CRYPTO', price: 0.0875, change24h: -3.528,
    marketCap: 109375000, marketCapFormatted: '$109.4M', fdv: 131250000, fdvFormatted: '$131.3M',
    volume24h: 1054667, volume24hFormatted: '$1.1M', circulatingSupply: 1250000000, circulatingSupplyFormatted: '1.25B 1INCH',
    totalSupply: 1500000000, totalSupplyFormatted: '1.50B 1INCH', ath: 7.87, athChange: -98.9,
    high24h: 0.0911, low24h: 0.0856, rank: 93, segment: 'DeFi', marketDominance: 0.014,
    description: 'Leading decentralized DEX aggregator splitting order routes across hundreds of liquidity pools for minimal slippage.',
    technicalSummary: { rsi14: 52.3, rsiSignal: 'Neutral', macdSignal: 'Neutral', ema20_50: 'Neutral', overall: 'Neutral' }
  },
  {
    symbol: 'COMP/USDT', name: 'Compound', market: 'CRYPTO', price: 20.09, change24h: 4.854,
    marketCap: 139424600, marketCapFormatted: '$139.4M', fdv: 200900000, fdvFormatted: '$200.9M',
    volume24h: 616199, volume24hFormatted: '$616,198.564', circulatingSupply: 6940000, circulatingSupplyFormatted: '6.94M COMP',
    totalSupply: 10000000, totalSupplyFormatted: '10.0M COMP', ath: 912.75, athChange: -97.8,
    high24h: 20.25, low24h: 18.74, rank: 94, segment: 'DeFi', marketDominance: 0.013,
    description: 'Autonomous interest rate protocol that unlocked algorithmic money markets and yield farming on Ethereum.',
    technicalSummary: { rsi14: 56.7, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Neutral', overall: 'Buy' }
  },
  {
    symbol: 'ZIL/USDT', name: 'Zilliqa', market: 'CRYPTO', price: 0.002646, change24h: -0.489,
    marketCap: 50274000, marketCapFormatted: '$50.3M', fdv: 55566000, fdvFormatted: '$55.6M',
    volume24h: 295002, volume24hFormatted: '$295,001.689', circulatingSupply: 19000000000, circulatingSupplyFormatted: '19.0B ZIL',
    totalSupply: 21000000000, totalSupplyFormatted: '21.0B ZIL', ath: 0.256, athChange: -99,
    high24h: 0.002695, low24h: 0.0026, rank: 95, segment: 'Layer 1', marketDominance: 0.012,
    description: 'First public blockchain architecture to successfully implement linear network sharding at consensus layer.',
    technicalSummary: { rsi14: 48.9, rsiSignal: 'Neutral', macdSignal: 'Neutral', ema20_50: 'Neutral', overall: 'Neutral' }
  },
  {
    symbol: 'ENS/USDT', name: 'Ethereum Name Service', market: 'CRYPTO', price: 5.48, change24h: -1.968,
    marketCap: 175908000, marketCapFormatted: '$175.9M', fdv: 548000000, fdvFormatted: '$548.0M',
    volume24h: 2867835, volume24hFormatted: '$2.9M', circulatingSupply: 32100000, circulatingSupplyFormatted: '32.1M ENS',
    totalSupply: 100000000, totalSupplyFormatted: '100.0M ENS', ath: 85.69, athChange: -93.6,
    high24h: 5.59, low24h: 5.2, rank: 96, segment: 'Infrastructure', marketDominance: 0.024,
    description: 'Decentralized open domain naming standard mapping human-readable names (.eth) to alphanumeric blockchain addresses.',
    technicalSummary: { rsi14: 64.8, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Strong Buy' }
  },
  {
    symbol: 'BLUR/USDT', name: 'Blur', market: 'CRYPTO', price: 0.0161, change24h: 3.804,
    marketCap: 28175000, marketCapFormatted: '$28.2M', fdv: 48300000, fdvFormatted: '$48.3M',
    volume24h: 261784, volume24hFormatted: '$261,783.81', circulatingSupply: 1750000000, circulatingSupplyFormatted: '1.75B BLUR',
    totalSupply: 3000000000, totalSupplyFormatted: '3.0B BLUR', ath: 1.40, athChange: -98.9,
    high24h: 0.01619, low24h: 0.01526, rank: 97, segment: 'DeFi', marketDominance: 0.017,
    description: 'Pro NFT trading marketplace with real-time portfolio tracking, floor sweeping sweeps, and Blast L2 staking ties.',
    technicalSummary: { rsi14: 57.3, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Neutral', overall: 'Buy' }
  },
  {
    symbol: 'SUPER/USDT', name: 'SuperVerse', market: 'CRYPTO', price: 0.1069, change24h: -2.641,
    marketCap: 52274100, marketCapFormatted: '$52.3M', fdv: 106900000, fdvFormatted: '$106.9M',
    volume24h: 540748, volume24hFormatted: '$540,748.149', circulatingSupply: 489000000, circulatingSupplyFormatted: '489.0M SUPER',
    totalSupply: 1000000000, totalSupplyFormatted: '1.0B SUPER', ath: 4.74, athChange: -97.7,
    high24h: 0.1114, low24h: 0.1054, rank: 98, segment: 'Gaming', marketDominance: 0.018,
    description: 'Unified gaming and entertainment ecosystem deploying cross-game social protocols and GigaChad web3 arcade tournaments.',
    technicalSummary: { rsi14: 67.5, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Strong Buy' }
  },
  {
    symbol: 'LPT/USDT', name: 'Livepeer', market: 'CRYPTO', price: 1.335, change24h: 0.075,
    marketCap: 44055000, marketCapFormatted: '$44.1M', fdv: 44055000, fdvFormatted: '$44.1M',
    volume24h: 229243, volume24hFormatted: '$229,243.498', circulatingSupply: 33000000, circulatingSupplyFormatted: '33.0M LPT',
    totalSupply: 33000000, totalSupplyFormatted: '33.0M LPT', ath: 100.24, athChange: -98.7,
    high24h: 1.343, low24h: 1.307, rank: 99, segment: 'AI & Big Data', marketDominance: 0.017,
    description: 'Decentralized video infrastructure network utilizing distributed orchestrator nodes for scalable AI video transcoding and diffusion.',
    technicalSummary: { rsi14: 63.2, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Buy' }
  },
  {
    symbol: 'AUDIO/USDT', name: 'Audius', market: 'CRYPTO', price: 0.01307, change24h: -0.835,
    marketCap: 16337500, marketCapFormatted: '$16.3M', fdv: 16337500, fdvFormatted: '$16.3M',
    volume24h: 497382, volume24hFormatted: '$497,381.754', circulatingSupply: 1250000000, circulatingSupplyFormatted: '1.25B AUDIO',
    totalSupply: 1250000000, totalSupplyFormatted: '1.25B AUDIO', ath: 4.99, athChange: -99.7,
    high24h: 0.01352, low24h: 0.01278, rank: 100, segment: 'DePIN', marketDominance: 0.007,
    description: 'Decentralized music streaming platform connecting artists directly with fans without traditional record label intermediaries.',
    technicalSummary: { rsi14: 51.2, rsiSignal: 'Neutral', macdSignal: 'Neutral', ema20_50: 'Neutral', overall: 'Neutral' }
  },
  {
    symbol: 'DCR/USDT', name: 'Decred', market: 'CRYPTO', price: 13.72, change24h: -4.457,
    marketCap: 220892000, marketCapFormatted: '$220.9M', fdv: 288120000, fdvFormatted: '$288.1M',
    volume24h: 249122, volume24hFormatted: '$249,121.754', circulatingSupply: 16100000, circulatingSupplyFormatted: '16.1M DCR',
    totalSupply: 21000000, totalSupplyFormatted: '21.0M DCR', ath: 250.02, athChange: -94.5,
    high24h: 14.41, low24h: 13.66, rank: 101, segment: 'Payments', marketDominance: 0.009,
    description: 'Hybrid PoW/PoS cryptocurrency placing governance power in the hands of ticket holders through Politeia decision engine.',
    technicalSummary: { rsi14: 50.4, rsiSignal: 'Neutral', macdSignal: 'Neutral', ema20_50: 'Neutral', overall: 'Neutral' }
  },
  {
    symbol: 'BAT/USDT', name: 'Basic Attention Token', market: 'CRYPTO', price: 0.0678, change24h: -2.165,
    marketCap: 101022000, marketCapFormatted: '$101.0M', fdv: 101700000, fdvFormatted: '$101.7M',
    volume24h: 302980, volume24hFormatted: '$302,979.932', circulatingSupply: 1490000000, circulatingSupplyFormatted: '1.49B BAT',
    totalSupply: 1500000000, totalSupplyFormatted: '1.50B BAT', ath: 1.92, athChange: -96.5,
    high24h: 0.0698, low24h: 0.067, rank: 102, segment: 'Infrastructure', marketDominance: 0.011,
    description: 'Digital advertising token powering private reward monetization inside the Brave web browser ecosystem.',
    technicalSummary: { rsi14: 53.1, rsiSignal: 'Neutral', macdSignal: 'Neutral', ema20_50: 'Neutral', overall: 'Neutral' }
  },
  {
    symbol: 'HOT/USDT', name: 'Holo', market: 'CRYPTO', price: 0.000372, change24h: -0.535,
    marketCap: 63612000, marketCapFormatted: '$63.6M', fdv: 63612000, fdvFormatted: '$63.6M',
    volume24h: 98321, volume24hFormatted: '$98,321.473', circulatingSupply: 171000000000, circulatingSupplyFormatted: '171.0B HOT',
    totalSupply: 171000000000, totalSupplyFormatted: '171.0B HOT', ath: 0.0315, athChange: -98.8,
    high24h: 0.000375, low24h: 0.000362, rank: 103, segment: 'Infrastructure', marketDominance: 0.013,
    description: 'Peer-to-peer distributed hosting platform bridging agent-centric Holochain applications with the traditional World Wide Web.',
    technicalSummary: { rsi14: 52.8, rsiSignal: 'Neutral', macdSignal: 'Neutral', ema20_50: 'Neutral', overall: 'Neutral' }
  },
  {
    symbol: 'ANKR/USDT', name: 'Ankr', market: 'CRYPTO', price: 0.00446, change24h: 11.779,
    marketCap: 44600000, marketCapFormatted: '$44.6M', fdv: 44600000, fdvFormatted: '$44.6M',
    volume24h: 4789526, volume24hFormatted: '$4.8M', circulatingSupply: 10000000000, circulatingSupplyFormatted: '10.0B ANKR',
    totalSupply: 10000000000, totalSupplyFormatted: '10.0B ANKR', ath: 0.225, athChange: -98,
    high24h: 0.00513, low24h: 0.00393, rank: 104, segment: 'Infrastructure', marketDominance: 0.011,
    description: 'Decentralized web3 RPC endpoint provider and Neura blockchain uniting AI compute with decentralized liquid staking.',
    technicalSummary: { rsi14: 56.7, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Neutral', overall: 'Buy' }
  },
  {
    symbol: 'GLM/USDT', name: 'Golem', market: 'CRYPTO', price: 0.1076, change24h: 2.574,
    marketCap: 107600000, marketCapFormatted: '$107.6M', fdv: 107600000, fdvFormatted: '$107.6M',
    volume24h: 424243, volume24hFormatted: '$424,243.162', circulatingSupply: 1000000000, circulatingSupplyFormatted: '1.0B GLM',
    totalSupply: 1000000000, totalSupplyFormatted: '1.0B GLM', ath: 1.25, athChange: -91.4,
    high24h: 0.1104, low24h: 0.1037, rank: 105, segment: 'DePIN', marketDominance: 0.014,
    description: 'Decentralized open-source compute network enabling users to rent computational processing capacity for AI inference and scientific rendering.',
    technicalSummary: { rsi14: 61.2, rsiSignal: 'Neutral', macdSignal: 'Bullish', ema20_50: 'Bullish Cross', overall: 'Buy' }
  }
];

export const ALL_ASSETS: Asset[] = [
  ...CRYPTO_ASSETS
];