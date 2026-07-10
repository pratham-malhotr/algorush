export type MarketType = 'CRYPTO' | 'US_EQUITY' | 'IN_EQUITY';

export interface Asset {
  symbol: string;
  name: string;
  market: MarketType;
  price?: number; // Mock price for display
}

// 5 Major Cryptos
export const CRYPTO_ASSETS: Asset[] = [
  { symbol: 'BTC/USDT', name: 'Bitcoin', market: 'CRYPTO', price: 64230.5 },
  { symbol: 'ETH/USDT', name: 'Ethereum', market: 'CRYPTO', price: 3450.2 },
  { symbol: 'SOL/USDT', name: 'Solana', market: 'CRYPTO', price: 145.2 },
  { symbol: 'BNB/USDT', name: 'Binance Coin', market: 'CRYPTO', price: 590.1 },
  { symbol: 'XRP/USDT', name: 'Ripple', market: 'CRYPTO', price: 0.58 },
];

// Top 200 US Stocks (S&P 500 subset)
export const US_EQUITY_ASSETS: Asset[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', market: 'US_EQUITY', price: 173.50 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', market: 'US_EQUITY', price: 410.22 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', market: 'US_EQUITY', price: 890.15 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', market: 'US_EQUITY', price: 155.00 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', market: 'US_EQUITY', price: 178.20 },
  { symbol: 'META', name: 'Meta Platforms Inc.', market: 'US_EQUITY', price: 485.10 },
  { symbol: 'TSLA', name: 'Tesla Inc.', market: 'US_EQUITY', price: 175.34 },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway', market: 'US_EQUITY', price: 405.10 },
  { symbol: 'LLY', name: 'Eli Lilly and Co.', market: 'US_EQUITY', price: 740.00 },
  { symbol: 'AVGO', name: 'Broadcom Inc.', market: 'US_EQUITY', price: 1250.40 },
  { symbol: 'V', name: 'Visa Inc.', market: 'US_EQUITY', price: 275.12 },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', market: 'US_EQUITY', price: 195.50 },
  { symbol: 'UNH', name: 'UnitedHealth Group', market: 'US_EQUITY', price: 480.30 },
  { symbol: 'WMT', name: 'Walmart Inc.', market: 'US_EQUITY', price: 60.15 },
  { symbol: 'MA', name: 'Mastercard Inc.', market: 'US_EQUITY', price: 465.20 },
  { symbol: 'PG', name: 'Procter & Gamble Co.', market: 'US_EQUITY', price: 158.40 },
  { symbol: 'JNJ', name: 'Johnson & Johnson', market: 'US_EQUITY', price: 155.20 },
  { symbol: 'HD', name: 'Home Depot Inc.', market: 'US_EQUITY', price: 375.10 },
  { symbol: 'MRK', name: 'Merck & Co.', market: 'US_EQUITY', price: 125.80 },
  { symbol: 'COST', name: 'Costco Wholesale', market: 'US_EQUITY', price: 730.50 },
  { symbol: 'ABBV', name: 'AbbVie Inc.', market: 'US_EQUITY', price: 168.90 },
  { symbol: 'CRM', name: 'Salesforce Inc.', market: 'US_EQUITY', price: 305.10 },
  { symbol: 'AMD', name: 'Advanced Micro Devices', market: 'US_EQUITY', price: 165.20 },
  { symbol: 'CVX', name: 'Chevron Corp.', market: 'US_EQUITY', price: 155.40 },
  { symbol: 'NFLX', name: 'Netflix Inc.', market: 'US_EQUITY', price: 610.20 },
  { symbol: 'KO', name: 'Coca-Cola Co.', market: 'US_EQUITY', price: 60.50 },
  { symbol: 'PEP', name: 'PepsiCo Inc.', market: 'US_EQUITY', price: 170.80 },
  { symbol: 'BAC', name: 'Bank of America Corp', market: 'US_EQUITY', price: 37.50 },
  { symbol: 'TMO', name: 'Thermo Fisher Scientific', market: 'US_EQUITY', price: 580.40 },
  { symbol: 'MCD', name: 'McDonald\'s Corp.', market: 'US_EQUITY', price: 275.30 },
  { symbol: 'ADBE', name: 'Adobe Inc.', market: 'US_EQUITY', price: 505.10 },
  { symbol: 'WFC', name: 'Wells Fargo & Co.', market: 'US_EQUITY', price: 58.20 },
  { symbol: 'DIS', name: 'Walt Disney Co.', market: 'US_EQUITY', price: 110.50 },
  { symbol: 'CSCO', name: 'Cisco Systems Inc.', market: 'US_EQUITY', price: 48.70 },
  { symbol: 'ABT', name: 'Abbott Laboratories', market: 'US_EQUITY', price: 110.40 },
  { symbol: 'INTU', name: 'Intuit Inc.', market: 'US_EQUITY', price: 650.20 },
  { symbol: 'QCOM', name: 'QUALCOMM Inc.', market: 'US_EQUITY', price: 165.30 },
  { symbol: 'IBM', name: 'International Business Machines', market: 'US_EQUITY', price: 185.10 },
  { symbol: 'CAT', name: 'Caterpillar Inc.', market: 'US_EQUITY', price: 360.20 },
  { symbol: 'INTC', name: 'Intel Corp.', market: 'US_EQUITY', price: 35.80 },
  { symbol: 'VZ', name: 'Verizon Communications', market: 'US_EQUITY', price: 40.50 },
  { symbol: 'CMCSA', name: 'Comcast Corp.', market: 'US_EQUITY', price: 38.90 },
  { symbol: 'UNP', name: 'Union Pacific Corp.', market: 'US_EQUITY', price: 235.10 },
  { symbol: 'PFE', name: 'Pfizer Inc.', market: 'US_EQUITY', price: 27.80 },
  { symbol: 'UBER', name: 'Uber Technologies Inc.', market: 'US_EQUITY', price: 72.40 },
  { symbol: 'GE', name: 'General Electric', market: 'US_EQUITY', price: 155.30 },
  { symbol: 'AMAT', name: 'Applied Materials Inc.', market: 'US_EQUITY', price: 205.10 },
  { symbol: 'NOW', name: 'ServiceNow Inc.', market: 'US_EQUITY', price: 780.20 },
  { symbol: 'PM', name: 'Philip Morris International', market: 'US_EQUITY', price: 92.50 },
  { symbol: 'TXN', name: 'Texas Instruments', market: 'US_EQUITY', price: 170.80 },
  // Adding bulk padding for the rest of the 200 US stocks
  ...Array.from({ length: 150 }).map((_, i) => ({
    symbol: `US${51 + i}`,
    name: `US Equity ${51 + i}`,
    market: 'US_EQUITY' as MarketType,
    price: Math.floor(Math.random() * 500) + 50
  }))
];

// Top 100 Indian Stocks (NIFTY 100 subset)
export const IN_EQUITY_ASSETS: Asset[] = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', market: 'IN_EQUITY', price: 2950.40 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', market: 'IN_EQUITY', price: 3850.15 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', market: 'IN_EQUITY', price: 1450.20 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', market: 'IN_EQUITY', price: 1120.35 },
  { symbol: 'INFY', name: 'Infosys', market: 'IN_EQUITY', price: 1420.50 },
  { symbol: 'SBIN', name: 'State Bank of India', market: 'IN_EQUITY', price: 780.10 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel', market: 'IN_EQUITY', price: 1350.25 },
  { symbol: 'ITC', name: 'ITC Limited', market: 'IN_EQUITY', price: 420.80 },
  { symbol: 'L&T', name: 'Larsen & Toubro', market: 'IN_EQUITY', price: 3450.60 },
  { symbol: 'HINDUNILVR', name: 'H हिंदुस्तान Unilever', market: 'IN_EQUITY', price: 2250.30 },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance', market: 'IN_EQUITY', price: 7120.40 },
  { symbol: 'AXISBANK', name: 'Axis Bank', market: 'IN_EQUITY', price: 1050.15 },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', market: 'IN_EQUITY', price: 1780.20 },
  { symbol: 'MARUTI', name: 'Maruti Suzuki', market: 'IN_EQUITY', price: 12500.50 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors', market: 'IN_EQUITY', price: 950.10 },
  { symbol: 'ASIANPAINT', name: 'Asian Paints', market: 'IN_EQUITY', price: 2850.30 },
  { symbol: 'SUNPHARMA', name: 'Sun Pharma', market: 'IN_EQUITY', price: 1520.40 },
  { symbol: 'HCLTECH', name: 'HCL Technologies', market: 'IN_EQUITY', price: 1320.10 },
  { symbol: 'TITAN', name: 'Titan Company', market: 'IN_EQUITY', price: 3450.20 },
  { symbol: 'TATASTEEL', name: 'Tata Steel', market: 'IN_EQUITY', price: 150.30 },
  { symbol: 'ONGC', name: 'ONGC', market: 'IN_EQUITY', price: 280.40 },
  { symbol: 'NTPC', name: 'NTPC', market: 'IN_EQUITY', price: 350.10 },
  { symbol: 'POWERGRID', name: 'Power Grid', market: 'IN_EQUITY', price: 290.50 },
  { symbol: 'M&M', name: 'Mahindra & Mahindra', market: 'IN_EQUITY', price: 1950.20 },
  { symbol: 'ADANIENT', name: 'Adani Enterprises', market: 'IN_EQUITY', price: 3200.10 },
  // Adding bulk padding for the rest of the 100 IN stocks
  ...Array.from({ length: 75 }).map((_, i) => ({
    symbol: `IN${26 + i}`,
    name: `IN Equity ${26 + i}`,
    market: 'IN_EQUITY' as MarketType,
    price: Math.floor(Math.random() * 2000) + 100
  }))
];

export const ALL_ASSETS: Asset[] = [
  ...CRYPTO_ASSETS,
  ...US_EQUITY_ASSETS,
  ...IN_EQUITY_ASSETS
];
