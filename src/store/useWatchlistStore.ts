import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WatchlistState {
  watchlistedSymbols: string[];
  addWatchlist: (symbol: string) => void;
  removeWatchlist: (symbol: string) => void;
  isWatchlisted: (symbol: string) => boolean;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      watchlistedSymbols: ['BTC/USDT', 'AAPL', 'RELIANCE'], // Defaults
      
      addWatchlist: (symbol) => {
        set((state) => ({
          watchlistedSymbols: state.watchlistedSymbols.includes(symbol) 
            ? state.watchlistedSymbols 
            : [...state.watchlistedSymbols, symbol]
        }))
      },
      
      removeWatchlist: (symbol) => {
        set((state) => ({
          watchlistedSymbols: state.watchlistedSymbols.filter(s => s !== symbol)
        }))
      },
      
      isWatchlisted: (symbol) => {
        return get().watchlistedSymbols.includes(symbol)
      }
    }),
    {
      name: 'algotext-watchlist',
    }
  )
)
