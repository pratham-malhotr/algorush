import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ExchangeId = 
  | 'binance' 
  | 'lbank' 
  | 'okx' 
  | 'bybit' 
  | 'gateio' 
  | 'bitget' 
  | 'kucoin' 
  | 'mexc' 
  | 'coinbase' 
  | 'kraken' 
  | 'hyperliquid' 
  | 'web3_wallet'
  | 'cryptocom'
  | 'htx'
  | 'bitfinex'
  | 'phemex'
  | 'deribit'
  | 'upbit'
  | 'bingx'
  | 'coinex'
  | 'whitebit'
  | 'bitstamp'
  | 'poloniex'
  | 'gemini'
  | 'dydx'
  | 'jupiter'
  | 'raydium'
  | 'uniswap'
  | 'pancakeswap'
  | 'apex'
  | 'backpack'
  | 'woox'
  | 'bitmart'
  | 'xt'
  | 'tapbit'
  | 'pionex'
  | 'coincall'
  | 'blofin'
  | 'paradex'
  | 'vertex'
  | 'gmx'
  | 'orderly'
  | 'synfutures'
  | 'drift'
  | 'zetamarkets'
  | 'bluefin'
  | 'aevo'
  | 'helix'
  | 'robinhood'
  | 'revolut'
  | 'bitflyer'
  | 'mercadobitcoin'
  | 'bithumb'
  | 'coinone'
  | 'bitvavo'
  | 'indodax'
  | 'wazirx'
  | 'coindcx'
  | 'coinswitch'
  | 'coinspot'
  | 'bitso'
  | 'hitbtc'
  | 'probit'
  | (string & {});

export interface ExchangeCredentials {
  apiKey: string;
  apiSecret: string;
  passphrase?: string;
  isTestnet: boolean;
}

export interface ConnectedAccount {
  id: string;
  exchangeId: ExchangeId;
  name: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'CONNECTING';
  isTestnet: boolean;
  credentials?: ExchangeCredentials;
  balanceUsdt: number;
  balanceBtc: number;
  walletAddress?: string;
  connectedAt: string;
  pingMs: number;
  permissions: {
    canRead: boolean;
    canTrade: boolean;
    canFutures: boolean;
    canWithdraw: boolean; // Should always be false for security
  };
}

interface ExchangeState {
  accounts: ConnectedAccount[];
  activeAccountId: string | null;
  isConnectModalOpen: boolean;
  selectedExchangeForModal: ExchangeId | null;
  
  // Actions
  setIsConnectModalOpen: (open: boolean, exchangeId?: ExchangeId) => void;
  setActiveAccount: (id: string | null) => void;
  connectExchange: (exchangeId: ExchangeId, name: string, credentials: ExchangeCredentials, walletAddress?: string) => Promise<boolean>;
  disconnectExchange: (id: string) => void;
  getActiveAccount: () => ConnectedAccount | null;
  testConnection: (id: string) => Promise<boolean>;
}

export const useExchangeStore = create<ExchangeState>()(
  persist(
    (set, get) => ({
      accounts: [
        {
          id: 'binance-demo-1',
          exchangeId: 'binance',
          name: 'Binance Main Account (Futures)',
          status: 'CONNECTED',
          isTestnet: false,
          credentials: {
            apiKey: 'vmPU...9kL2',
            apiSecret: '••••••••••••••••',
            isTestnet: false,
          },
          balanceUsdt: 42850.50,
          balanceBtc: 0.85,
          connectedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          pingMs: 14,
          permissions: {
            canRead: true,
            canTrade: true,
            canFutures: true,
            canWithdraw: false,
          },
        },
        {
          id: 'lbank-demo-1',
          exchangeId: 'lbank',
          name: 'LBank Spot & Futures Pro',
          status: 'CONNECTED',
          isTestnet: false,
          credentials: {
            apiKey: 'lb_key_9921_x82',
            apiSecret: '••••••••••••••••',
            isTestnet: false,
          },
          balanceUsdt: 18450.25,
          balanceBtc: 0.35,
          connectedAt: new Date(Date.now() - 86400000).toISOString(),
          pingMs: 18,
          permissions: {
            canRead: true,
            canTrade: true,
            canFutures: true,
            canWithdraw: false,
          },
        },
      ],
      activeAccountId: 'binance-demo-1',
      isConnectModalOpen: false,
      selectedExchangeForModal: null,

      setIsConnectModalOpen: (open, exchangeId) =>
        set({ isConnectModalOpen: open, selectedExchangeForModal: exchangeId || null }),

      setActiveAccount: (id) => set({ activeAccountId: id }),

      connectExchange: async (exchangeId, name, credentials, walletAddress) => {
        await new Promise((resolve) => setTimeout(resolve, 700));

        const newAccount: ConnectedAccount = {
          id: `${exchangeId}-${Date.now()}`,
          exchangeId,
          name: name || `${exchangeId.toUpperCase()} Account`,
          status: 'CONNECTED',
          isTestnet: credentials.isTestnet,
          credentials,
          walletAddress,
          balanceUsdt: credentials.isTestnet ? 10000.00 : 25400.75,
          balanceBtc: 0.45,
          connectedAt: new Date().toISOString(),
          pingMs: Math.floor(Math.random() * 20) + 12,
          permissions: {
            canRead: true,
            canTrade: true,
            canFutures: true,
            canWithdraw: false,
          },
        };

        set((state) => ({
          accounts: [...state.accounts, newAccount],
          activeAccountId: newAccount.id,
          isConnectModalOpen: false,
        }));

        return true;
      },

      disconnectExchange: (id) => {
        set((state) => {
          const updated = state.accounts.filter((acc) => acc.id !== id);
          return {
            accounts: updated,
            activeAccountId: state.activeAccountId === id ? (updated[0]?.id || null) : state.activeAccountId,
          };
        });
      },

      getActiveAccount: () => {
        const { accounts, activeAccountId } = get();
        return accounts.find((a) => a.id === activeAccountId) || accounts[0] || null;
      },

      testConnection: async (id) => {
        await new Promise((r) => setTimeout(r, 400));
        set((state) => ({
          accounts: state.accounts.map((acc) =>
            acc.id === id ? { ...acc, pingMs: Math.floor(Math.random() * 18) + 10 } : acc
          ),
        }));
        return true;
      },
    }),
    {
      name: 'algotext-exchanges',
      partialize: (state) => ({ accounts: state.accounts, activeAccountId: state.activeAccountId }),
    }
  )
);
