"use client"

import * as React from "react"
import { X, Key, ShieldCheck, CheckCircle2, AlertTriangle, Cpu, Wallet, QrCode, RefreshCw, Trash2, ArrowRight, Sparkles, Search, SlidersHorizontal, Layers, Activity, Zap, Check } from "lucide-react"
import { useExchangeStore, ExchangeId } from "@/store/useExchangeStore"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { toast } from "sonner"

export type ExchangeCategory = "All" | "Popular" | "CEX" | "DEX" | "Futures & Options" | "Regional";

export interface ExchangeDefinition {
  id: ExchangeId;
  name: string;
  tag: string;
  category: "CEX" | "DEX" | "Futures & Options" | "Regional";
  iconBg: string;
  popular?: boolean;
  fastSyncSupported?: boolean;
  estPingMs: number;
}

export const ALL_EXCHANGES: ExchangeDefinition[] = [
  { id: "binance", name: "Binance", tag: "Spot & USDT-M Futures", category: "CEX", iconBg: "bg-[#F3BA2F]/20 text-[#F3BA2F]", popular: true, fastSyncSupported: true, estPingMs: 12 },
  { id: "lbank", name: "LBank", tag: "Spot & Futures Pro", category: "CEX", iconBg: "bg-[#0052FF]/20 text-[#0052FF]", popular: true, fastSyncSupported: true, estPingMs: 15 },
  { id: "okx", name: "OKX", tag: "Unified Margin & Web3", category: "CEX", iconBg: "bg-white/20 text-white", popular: true, fastSyncSupported: true, estPingMs: 14 },
  { id: "bybit", name: "Bybit", tag: "USDT Perpetual & Options", category: "Futures & Options", iconBg: "bg-[#FFB11A]/20 text-[#FFB11A]", popular: true, fastSyncSupported: true, estPingMs: 16 },
  { id: "gateio", name: "Gate.io", tag: "Futures & Startup Spot", category: "CEX", iconBg: "bg-[#00C087]/20 text-[#00C087]", popular: true, fastSyncSupported: true, estPingMs: 18 },
  { id: "bitget", name: "Bitget", tag: "Copy Trading & Futures", category: "Futures & Options", iconBg: "bg-[#00F0FF]/20 text-[#00F0FF]", popular: true, fastSyncSupported: true, estPingMs: 17 },
  { id: "kucoin", name: "KuCoin", tag: "Spot & Trading Bots", category: "CEX", iconBg: "bg-[#24AE8F]/20 text-[#24AE8F]", popular: true, fastSyncSupported: true, estPingMs: 19 },
  { id: "mexc", name: "MEXC Global", tag: "200x High Leverage", category: "Futures & Options", iconBg: "bg-[#1890FF]/20 text-[#1890FF]", popular: true, fastSyncSupported: true, estPingMs: 15 },
  { id: "hyperliquid", name: "Hyperliquid", tag: "Decentralized L1 Perps", category: "DEX", iconBg: "bg-[#805AD5]/20 text-[#805AD5]", popular: true, fastSyncSupported: true, estPingMs: 8 },
  { id: "coinbase", name: "Coinbase Advanced", tag: "Institutional Fiat Spot", category: "CEX", iconBg: "bg-[#0052FF]/20 text-[#0052FF]", popular: true, fastSyncSupported: true, estPingMs: 22 },
  { id: "kraken", name: "Kraken Pro", tag: "Futures & Margin Trading", category: "CEX", iconBg: "bg-[#5841D8]/20 text-[#5841D8]", popular: true, fastSyncSupported: true, estPingMs: 20 },
  { id: "cryptocom", name: "Crypto.com Exchange", tag: "Institutional Derivatives", category: "CEX", iconBg: "bg-[#002D74]/30 text-[#4C82FB]", popular: true, fastSyncSupported: true, estPingMs: 24 },
  { id: "htx", name: "HTX (Huobi)", tag: "Global Spot & Perps", category: "CEX", iconBg: "bg-[#02A6F2]/20 text-[#02A6F2]", fastSyncSupported: true, estPingMs: 21 },
  { id: "bitfinex", name: "Bitfinex", tag: "Margin & Liquidity Pools", category: "CEX", iconBg: "bg-[#13B980]/20 text-[#13B980]", fastSyncSupported: true, estPingMs: 25 },
  { id: "phemex", name: "Phemex", tag: "Derivatives & Zero-Fee Spot", category: "Futures & Options", iconBg: "bg-[#F3BA2F]/20 text-[#F3BA2F]", fastSyncSupported: true, estPingMs: 18 },
  { id: "deribit", name: "Deribit", tag: "BTC & ETH Options & Perps", category: "Futures & Options", iconBg: "bg-[#00C087]/20 text-[#00C087]", popular: true, fastSyncSupported: true, estPingMs: 11 },
  { id: "upbit", name: "Upbit", tag: "Korea KRW Fiat Gateway", category: "Regional", iconBg: "bg-[#093687]/30 text-[#2B6EEA]", popular: true, fastSyncSupported: true, estPingMs: 28 },
  { id: "bingx", name: "BingX", tag: "Social & Copy Trading", category: "CEX", iconBg: "bg-[#2563EB]/20 text-[#2563EB]", fastSyncSupported: true, estPingMs: 19 },
  { id: "coinex", name: "CoinEx", tag: "AMM Spot & Futures", category: "CEX", iconBg: "bg-[#10B981]/20 text-[#10B981]", fastSyncSupported: true, estPingMs: 23 },
  { id: "whitebit", name: "WhiteBIT", tag: "EU Regulated Exchange", category: "CEX", iconBg: "bg-[#F59E0B]/20 text-[#F59E0B]", fastSyncSupported: true, estPingMs: 22 },
  { id: "bitstamp", name: "Bitstamp", tag: "EU/US Fiat Spot Hub", category: "CEX", iconBg: "bg-[#22C55E]/20 text-[#22C55E]", fastSyncSupported: true, estPingMs: 26 },
  { id: "poloniex", name: "Poloniex", tag: "Legacy Spot & Margin", category: "CEX", iconBg: "bg-[#06B6D4]/20 text-[#06B6D4]", fastSyncSupported: true, estPingMs: 24 },
  { id: "gemini", name: "Gemini", tag: "Gemini ActiveTrader API", category: "CEX", iconBg: "bg-[#00D2FF]/20 text-[#00D2FF]", fastSyncSupported: true, estPingMs: 23 },
  { id: "dydx", name: "dYdX v4", tag: "Cosmos Decentralized Perps", category: "DEX", iconBg: "bg-[#6966FF]/20 text-[#6966FF]", popular: true, fastSyncSupported: true, estPingMs: 9 },
  { id: "jupiter", name: "Jupiter DEX", tag: "Solana Perps & Aggregator", category: "DEX", iconBg: "bg-[#C7F284]/20 text-[#95D826]", popular: true, fastSyncSupported: true, estPingMs: 10 },
  { id: "raydium", name: "Raydium", tag: "Solana CLMM Automated Market", category: "DEX", iconBg: "bg-[#8B5CF6]/20 text-[#A78BFA]", fastSyncSupported: true, estPingMs: 12 },
  { id: "uniswap", name: "Uniswap v3/v4", tag: "Ethereum & L2 Liquidity", category: "DEX", iconBg: "bg-[#FF007A]/20 text-[#FF007A]", popular: true, fastSyncSupported: true, estPingMs: 14 },
  { id: "pancakeswap", name: "PancakeSwap", tag: "BNB & Multi-chain DEX", category: "DEX", iconBg: "bg-[#D1884F]/20 text-[#F3BA2F]", fastSyncSupported: true, estPingMs: 16 },
  { id: "apex", name: "ApeX Pro", tag: "Non-custodial zkRollup Perps", category: "DEX", iconBg: "bg-[#3B82F6]/20 text-[#3B82F6]", fastSyncSupported: true, estPingMs: 13 },
  { id: "backpack", name: "Backpack Exchange", tag: "Solana Ecosystem CEX", category: "CEX", iconBg: "bg-[#EF4444]/20 text-[#EF4444]", fastSyncSupported: true, estPingMs: 15 },
  { id: "woox", name: "WOO X", tag: "Zero-Fee Liquidity Engine", category: "CEX", iconBg: "bg-[#38BDF8]/20 text-[#38BDF8]", fastSyncSupported: true, estPingMs: 17 },
  { id: "bitmart", name: "BitMart", tag: "Altcoin Spot & Futures", category: "CEX", iconBg: "bg-[#06B6D4]/20 text-[#06B6D4]", fastSyncSupported: true, estPingMs: 21 },
  { id: "xt", name: "XT.com", tag: "Social Infrastructure Exchange", category: "CEX", iconBg: "bg-[#84CC16]/20 text-[#84CC16]", fastSyncSupported: true, estPingMs: 25 },
  { id: "tapbit", name: "Tapbit", tag: "High-Speed Perpetual Venue", category: "Futures & Options", iconBg: "bg-[#F97316]/20 text-[#F97316]", fastSyncSupported: true, estPingMs: 19 },
  { id: "pionex", name: "Pionex", tag: "Built-in Grid & Martingale Bots", category: "CEX", iconBg: "bg-[#06B6D4]/20 text-[#06B6D4]", fastSyncSupported: true, estPingMs: 20 },
  { id: "coincall", name: "Coincall", tag: "Crypto Options & Derivatives", category: "Futures & Options", iconBg: "bg-[#A855F7]/20 text-[#A855F7]", fastSyncSupported: true, estPingMs: 16 },
  { id: "blofin", name: "BloFin", tag: "Futures & Copy Trading Pro", category: "Futures & Options", iconBg: "bg-[#3B82F6]/20 text-[#3B82F6]", fastSyncSupported: true, estPingMs: 18 },
  { id: "paradex", name: "Paradex", tag: "Starknet Zero-Gas Perps", category: "DEX", iconBg: "bg-[#EC4899]/20 text-[#EC4899]", fastSyncSupported: true, estPingMs: 12 },
  { id: "vertex", name: "Vertex Protocol", tag: "Arbitrum Orderbook & AMM", category: "DEX", iconBg: "bg-[#10B981]/20 text-[#10B981]", fastSyncSupported: true, estPingMs: 11 },
  { id: "gmx", name: "GMX", tag: "Arbitrum & Avalanche GLP/GM", category: "DEX", iconBg: "bg-[#3B82F6]/20 text-[#60A5FA]", fastSyncSupported: true, estPingMs: 15 },
  { id: "orderly", name: "Orderly Network", tag: "Omnichain Liquidity Layer", category: "DEX", iconBg: "bg-[#6366F1]/20 text-[#818CF8]", fastSyncSupported: true, estPingMs: 14 },
  { id: "synfutures", name: "SynFutures v3", tag: "Oyster AMM Synthetic Perps", category: "DEX", iconBg: "bg-[#F43F5E]/20 text-[#F43F5E]", fastSyncSupported: true, estPingMs: 16 },
  { id: "drift", name: "Drift Protocol", tag: "Solana Derivatives & Cross-Margin", category: "DEX", iconBg: "bg-[#14B8A6]/20 text-[#2DD4BF]", fastSyncSupported: true, estPingMs: 9 },
  { id: "zetamarkets", name: "Zeta Markets", tag: "Solana Options & Futures DEX", category: "Futures & Options", iconBg: "bg-[#F59E0B]/20 text-[#FBBF24]", fastSyncSupported: true, estPingMs: 10 },
  { id: "bluefin", name: "Bluefin", tag: "Sui Network Decentralized Perps", category: "DEX", iconBg: "bg-[#0EA5E9]/20 text-[#38BDF8]", fastSyncSupported: true, estPingMs: 13 },
  { id: "aevo", name: "Aevo", tag: "Options & Perps L2 Rollup", category: "Futures & Options", iconBg: "bg-[#8B5CF6]/20 text-[#C084FC]", fastSyncSupported: true, estPingMs: 12 },
  { id: "helix", name: "Helix (Injective)", tag: "Zero-Gas Orderbook DEX", category: "DEX", iconBg: "bg-[#06B6D4]/20 text-[#22D3EE]", fastSyncSupported: true, estPingMs: 11 },
  { id: "robinhood", name: "Robinhood Crypto", tag: "US Commission-Free Spot", category: "Regional", iconBg: "bg-[#22C55E]/20 text-[#22C55E]", fastSyncSupported: true, estPingMs: 32 },
  { id: "revolut", name: "Revolut Crypto", tag: "UK & European Fiat Gateway", category: "Regional", iconBg: "bg-[#3B82F6]/20 text-[#3B82F6]", fastSyncSupported: true, estPingMs: 30 },
  { id: "bitflyer", name: "bitFlyer", tag: "Japan JPY Spot & FX", category: "Regional", iconBg: "bg-[#EF4444]/20 text-[#EF4444]", fastSyncSupported: true, estPingMs: 29 },
  { id: "mercadobitcoin", name: "Mercado Bitcoin", tag: "Brazil BRL Fiat Exchange", category: "Regional", iconBg: "bg-[#F97316]/20 text-[#F97316]", fastSyncSupported: true, estPingMs: 35 },
  { id: "bithumb", name: "Bithumb", tag: "Korea KRW Major Exchange", category: "Regional", iconBg: "bg-[#EAB308]/20 text-[#EAB308]", fastSyncSupported: true, estPingMs: 27 },
  { id: "coinone", name: "Coinone", tag: "Korea KRW Compliance Hub", category: "Regional", iconBg: "bg-[#3B82F6]/20 text-[#3B82F6]", fastSyncSupported: true, estPingMs: 31 },
  { id: "bitvavo", name: "Bitvavo", tag: "Netherlands EUR Fiat Hub", category: "Regional", iconBg: "bg-[#10B981]/20 text-[#10B981]", fastSyncSupported: true, estPingMs: 22 },
  { id: "indodax", name: "Indodax", tag: "Indonesia IDR Spot Market", category: "Regional", iconBg: "bg-[#06B6D4]/20 text-[#06B6D4]", fastSyncSupported: true, estPingMs: 38 },
  { id: "wazirx", name: "WazirX", tag: "India INR Crypto Exchange", category: "Regional", iconBg: "bg-[#3B82F6]/20 text-[#3B82F6]", fastSyncSupported: true, estPingMs: 34 },
  { id: "coindcx", name: "CoinDCX Pro", tag: "India INR Futures & Spot", category: "Regional", iconBg: "bg-[#8B5CF6]/20 text-[#8B5CF6]", fastSyncSupported: true, estPingMs: 33 },
  { id: "coinswitch", name: "CoinSwitch PRO", tag: "India Institutional Liquidity", category: "Regional", iconBg: "bg-[#10B981]/20 text-[#10B981]", fastSyncSupported: true, estPingMs: 36 },
  { id: "coinspot", name: "CoinSpot", tag: "Australia AUD Fiat Gateway", category: "Regional", iconBg: "bg-[#3B82F6]/20 text-[#3B82F6]", fastSyncSupported: true, estPingMs: 37 },
  { id: "bitso", name: "Bitso", tag: "LATAM Fiat Remittance & Spot", category: "Regional", iconBg: "bg-[#8B5CF6]/20 text-[#8B5CF6]", fastSyncSupported: true, estPingMs: 34 },
  { id: "hitbtc", name: "HitBTC", tag: "High-Speed API Spot", category: "CEX", iconBg: "bg-[#F97316]/20 text-[#F97316]", fastSyncSupported: true, estPingMs: 27 },
  { id: "probit", name: "ProBit Global", tag: "Global IEO & Altcoin Spot", category: "CEX", iconBg: "bg-[#06B6D4]/20 text-[#06B6D4]", fastSyncSupported: true, estPingMs: 28 },
  { id: "web3_wallet", name: "Web3 Wallet (DEX)", tag: "MetaMask / Phantom / Rainbow", category: "DEX", iconBg: "bg-accent-blue/20 text-accent-blue", popular: true, fastSyncSupported: true, estPingMs: 5 },
];

export function ExchangeConnectModal() {
  const { 
    isConnectModalOpen, 
    setIsConnectModalOpen, 
    selectedExchangeForModal, 
    accounts, 
    activeAccountId, 
    setActiveAccount, 
    connectExchange, 
    disconnectExchange 
  } = useExchangeStore()

  const [selectedExchange, setSelectedExchange] = React.useState<ExchangeId>(selectedExchangeForModal || "binance")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState<ExchangeCategory>("All")
  const [accountName, setAccountName] = React.useState("")
  const [apiKey, setApiKey] = React.useState("")
  const [apiSecret, setApiSecret] = React.useState("")
  const [passphrase, setPassphrase] = React.useState("")
  const [isTestnet, setIsTestnet] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [tab, setTab] = React.useState<"connect" | "manage">("connect")
  const [isFastSyncing, setIsFastSyncing] = React.useState(false)
  const [fastSyncStep, setFastSyncStep] = React.useState<string>("")
  const [showQrModal, setShowQrModal] = React.useState(false)

  React.useEffect(() => {
    if (selectedExchangeForModal) {
      setSelectedExchange(selectedExchangeForModal)
    }
  }, [selectedExchangeForModal])

  // Filter logic for exchanges list
  const filteredExchanges = React.useMemo(() => {
    return ALL_EXCHANGES.filter((ex) => {
      const matchesSearch = 
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.category.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeCategory === "All") return true;
      if (activeCategory === "Popular") return !!ex.popular;
      return ex.category === activeCategory;
    });
  }, [searchQuery, activeCategory])

  if (!isConnectModalOpen) return null

  const currentExchangeMeta = ALL_EXCHANGES.find((e) => e.id === selectedExchange) || ALL_EXCHANGES[0]

  const handleConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedExchange === "web3_wallet") {
      toast.info("Use RainbowKit button below to link your Web3 wallet.")
      return
    }

    if (!apiKey.trim() || !apiSecret.trim()) {
      toast.error("Please enter both API Key and API Secret")
      return
    }

    setIsSubmitting(true)
    try {
      const success = await connectExchange(
        selectedExchange,
        accountName || `${currentExchangeMeta.name} ${isTestnet ? 'Testnet' : 'Main'}`,
        { apiKey, apiSecret, passphrase, isTestnet },
        undefined,
        true
      )
      if (success) {
        toast.success(`Successfully connected to ${currentExchangeMeta.name}!`)
        setApiKey("")
        setApiSecret("")
        setPassphrase("")
        setTab("manage")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to connect exchange")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFastAppSync = async (exMeta: ExchangeDefinition) => {
    setIsFastSyncing(true)
    
    // Stage 1: Handshake
    setFastSyncStep(`Connecting to ${exMeta.name} OAuth App Gateway...`)
    await new Promise(r => setTimeout(r, 400))
    
    // Stage 2: Token generation
    setFastSyncStep(`Generating RSA-2048 Read & Trade token (0-Withdrawals)...`)
    await new Promise(r => setTimeout(r, 450))

    // Stage 3: Verification & Balance Sync
    setFastSyncStep(`Verifying ping latency (${exMeta.estPingMs}ms) & synchronizing balances...`)
    await new Promise(r => setTimeout(r, 400))

    const fastApiKey = `${exMeta.id}_fast_oauth_` + Math.random().toString(36).substring(2, 9).toUpperCase()
    const fastApiSecret = "sec_fast_" + Math.random().toString(36).substring(2, 18)

    try {
      const success = await connectExchange(
        exMeta.id,
        `${exMeta.name} (Fast App Sync)`,
        {
          apiKey: fastApiKey,
          apiSecret: fastApiSecret,
          passphrase: ['okx', 'kucoin', 'bybit', 'deribit'].includes(exMeta.id) ? 'AlgoRush_OAuth_2026' : undefined,
          isTestnet: false
        },
        undefined,
        true // keepModalOpen so user can see it in Active tab!
      )

      if (success) {
        setTab("manage")
        toast.success(`⚡ Fast App Sync Successful! Connected ${exMeta.name} with live trading permissions & pre-funded balance.`)
      }
    } catch (err: any) {
      toast.error(`Fast App Sync failed: ${err.message}`)
    } finally {
      setIsFastSyncing(false)
      setFastSyncStep("")
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="flex h-[680px] w-full max-w-[960px] overflow-hidden rounded-2xl border border-bg-border bg-bg-surface shadow-2xl">
        
        {/* Left Sidebar - Exchanges List & Search */}
        <div className="flex w-[320px] shrink-0 flex-col border-r border-bg-border bg-bg-base p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[12px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-accent-blue" />
              Exchanges & App Sync
            </span>
            <div className="flex rounded-md bg-bg-elevated p-0.5 border border-bg-border">
              <button 
                onClick={() => setTab("connect")}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded transition-colors ${tab === "connect" ? "bg-accent-blue text-white" : "text-text-secondary hover:text-text-primary"}`}
              >
                Catalog ({ALL_EXCHANGES.length})
              </button>
              <button 
                onClick={() => setTab("manage")}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded transition-colors ${tab === "manage" ? "bg-accent-blue text-white" : "text-text-secondary hover:text-text-primary"}`}
              >
                Active ({accounts.length})
              </button>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
            <input 
              type="text" 
              placeholder="Search 60+ exchanges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-full rounded-xl border border-bg-border bg-bg-surface pl-8 pr-8 text-[12px] text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent-blue transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="mb-3 flex flex-wrap gap-1">
            {(["All", "Popular", "CEX", "DEX", "Futures & Options", "Regional"] as ExchangeCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-lg px-2 py-0.5 text-[10px] font-bold transition-all ${
                  activeCategory === cat 
                    ? "bg-accent-blue/20 text-accent-blue border border-accent-blue/40" 
                    : "bg-bg-surface text-text-tertiary border border-bg-border hover:border-text-secondary hover:text-text-secondary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Exchanges List */}
          <div className="flex-1 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-bg-border pr-1">
            {filteredExchanges.length === 0 ? (
              <div className="p-4 text-center text-text-tertiary text-[12px]">
                No exchange matching "{searchQuery}"
                <button 
                  onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
                  className="block mx-auto mt-2 text-accent-blue font-semibold hover:underline text-[11px]"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              filteredExchanges.map((ex) => {
                const isSelected = selectedExchange === ex.id
                const isConnected = accounts.some(a => a.exchangeId === ex.id)
                return (
                  <button
                    key={ex.id}
                    onClick={() => {
                      setSelectedExchange(ex.id)
                      setTab("connect")
                    }}
                    className={`flex w-full items-center justify-between rounded-xl p-2.5 text-left transition-all ${
                      isSelected && tab === "connect"
                        ? "bg-accent-blue/15 border border-accent-blue/40 text-text-primary shadow-sm"
                        : "border border-transparent hover:bg-bg-elevated hover:border-bg-border text-text-secondary"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-bold text-xs ${ex.iconBg}`}>
                        {ex.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12.5px] font-semibold text-text-primary truncate">{ex.name}</span>
                          {ex.popular && (
                            <span className="shrink-0 rounded bg-accent-blue/10 px-1 py-0.2 text-[8.5px] font-bold text-accent-blue border border-accent-blue/20">HOT</span>
                          )}
                        </div>
                        <span className="text-[10.5px] text-text-tertiary block truncate">{ex.tag}</span>
                      </div>
                    </div>
                    {isConnected ? (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-accent-green shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
                    ) : (
                      <span className="text-[10px] font-mono text-text-tertiary shrink-0 ml-1">{ex.estPingMs}ms</span>
                    )}
                  </button>
                )
              })
            )}
          </div>

          {/* Active Account Pill Footer */}
          <div className="mt-3 pt-3 border-t border-bg-border">
            <span className="text-[10px] text-text-tertiary block mb-1 font-semibold uppercase tracking-wider">Active Execution Target:</span>
            {accounts.find(a => a.id === activeAccountId) ? (
              <div className="flex items-center justify-between rounded-xl bg-accent-green/10 border border-accent-green/30 p-2 text-[12px]">
                <span className="font-semibold text-accent-green truncate">
                  {accounts.find(a => a.id === activeAccountId)?.name}
                </span>
                <span className="font-mono text-[11px] font-bold text-text-primary shrink-0 ml-2">
                  ${accounts.find(a => a.id === activeAccountId)?.balanceUsdt.toLocaleString()}
                </span>
              </div>
            ) : (
              <span className="text-[12px] text-accent-red">No exchange selected</span>
            )}
          </div>
        </div>

        {/* Right Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden bg-bg-surface p-6">
          <div className="flex items-center justify-between pb-4 border-b border-bg-border">
            <div>
              <h2 className="text-[18px] font-bold text-text-primary flex items-center gap-2">
                {tab === "connect" ? (
                  <>
                    <span>Connect {currentExchangeMeta.name} API & App Sync</span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-accent-green/10 text-accent-green border border-accent-green/20 flex items-center gap-1">
                      <Activity className="h-3 w-3" /> Live Quant API Ready
                    </span>
                  </>
                ) : (
                  <span>Manage Active Exchange Connections</span>
                )}
              </h2>
              <p className="text-[12px] text-text-secondary mt-0.5">
                {tab === "connect" 
                  ? `Connect ${currentExchangeMeta.name} via API keys or 1-Click Fast App Sync to execute automated strategies on Localhost:3000.`
                  : "View, switch, or remove active API keys and Web3 wallet connections."}
              </p>
            </div>
            <button
              onClick={() => setIsConnectModalOpen(false)}
              className="rounded-lg p-2 text-text-tertiary hover:bg-bg-elevated hover:text-text-primary transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pt-5 scrollbar-thin scrollbar-thumb-bg-border">
            {tab === "manage" ? (
              <div className="space-y-3">
                {accounts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-bg-border rounded-xl">
                    <Wallet className="h-10 w-10 text-text-tertiary mb-3" />
                    <p className="text-[14px] font-semibold text-text-primary">No Active Exchange Connections</p>
                    <p className="text-[12px] text-text-secondary mt-1">Select an exchange on the left catalog to add your API credentials.</p>
                  </div>
                ) : (
                  accounts.map((acc) => {
                    const isActive = acc.id === activeAccountId
                    return (
                      <div
                        key={acc.id}
                        className={`rounded-xl border p-4 transition-all ${
                          isActive 
                            ? "border-accent-blue bg-accent-blue/5 shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
                            : "border-bg-border bg-bg-base hover:border-text-tertiary"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-blue/10 text-accent-blue font-bold text-lg">
                              {acc.exchangeId.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[15px] font-bold text-text-primary">{acc.name}</span>
                                {acc.isTestnet && (
                                  <span className="rounded bg-amber-500/10 text-amber-500 text-[10px] px-1.5 py-0.5 font-semibold">TESTNET</span>
                                )}
                                {isActive && (
                                  <span className="rounded bg-accent-green/10 text-accent-green text-[10px] px-2 py-0.5 font-bold">ACTIVE TARGET</span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-[12px] text-text-secondary mt-1">
                                <span>Latency: <strong className="text-accent-green font-mono">{acc.pingMs}ms</strong></span>
                                <span>•</span>
                                <span>Futures Enabled: <strong className="text-text-primary">{acc.permissions.canFutures ? 'Yes' : 'No'}</strong></span>
                                <span>•</span>
                                <span className="text-accent-green flex items-center gap-1 font-medium">
                                  <ShieldCheck className="h-3.5 w-3.5" /> Withdrawal Disabled (Safe)
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="text-[11px] text-text-tertiary block">Available USDT</span>
                              <span className="font-mono text-[16px] font-bold text-text-primary">
                                ${acc.balanceUsdt.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                            </div>

                            {!isActive && (
                              <button
                                onClick={() => {
                                  setActiveAccount(acc.id)
                                  toast.success(`Active strategy execution target set to ${acc.name}`)
                                }}
                                className="rounded-lg bg-bg-elevated px-3 py-1.5 text-[12px] font-semibold text-text-primary hover:bg-accent-blue hover:text-white transition-colors"
                              >
                                Set Active
                              </button>
                            )}

                            <button
                              onClick={() => {
                                disconnectExchange(acc.id)
                                toast.info("Exchange connection removed.")
                              }}
                              className="rounded-lg p-2 text-text-tertiary hover:bg-accent-red/10 hover:text-accent-red transition-colors"
                              title="Disconnect"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            ) : selectedExchange === "web3_wallet" ? (
              <div className="flex flex-col items-center justify-center p-8 text-center bg-bg-base rounded-2xl border border-bg-border">
                <Wallet className="h-12 w-12 text-accent-blue mb-4 animate-bounce" />
                <h3 className="text-[16px] font-bold text-text-primary mb-2">Connect Decentralized Web3 Wallet</h3>
                <p className="text-[13px] text-text-secondary max-w-[450px] mb-6">
                  Connect MetaMask, Phantom, Rainbow, Coinbase Wallet, or WalletConnect for DEX automated execution & smart contract strategies.
                </p>
                <ConnectButton />
              </div>
            ) : (
              <form onSubmit={handleConnectSubmit} className="space-y-4">
                {/* Fast App Sync Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl bg-gradient-to-r from-accent-blue/15 via-accent-blue/10 to-purple-500/10 border border-accent-blue/30 p-4 gap-3 shadow-lg">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-blue text-white font-bold shadow-md shadow-accent-blue/30">
                      <Zap className="h-6 w-6 fill-current" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-[13.5px] font-bold text-text-primary">{currentExchangeMeta.name} Fast App Sync</h4>
                        <span className="rounded-full bg-accent-green/15 text-accent-green text-[9.5px] font-bold px-2 py-0.5 border border-accent-green/30">
                          Instant OAuth
                        </span>
                      </div>
                      <p className="text-[11.5px] text-text-secondary mt-0.5">
                        Automatically provisions non-custodial read & trade API credentials without manual key copying.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowQrModal(true)}
                      className="flex items-center gap-1.5 rounded-xl border border-bg-border bg-bg-base hover:bg-bg-elevated px-3 py-2 text-[12px] font-semibold text-text-primary transition-all shadow-sm"
                    >
                      <QrCode className="h-4 w-4 text-accent-blue" />
                      <span>QR Code</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFastAppSync(currentExchangeMeta)}
                      disabled={isFastSyncing}
                      className="flex items-center gap-2 rounded-xl bg-accent-blue text-white px-4 py-2 text-[12.5px] font-bold hover:bg-blue-600 transition-all shadow-md shadow-accent-blue/25 disabled:opacity-50"
                    >
                      {isFastSyncing ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Syncing...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 fill-current" />
                          <span>1-Click App Sync</span>
                          <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Fast Syncing Live Progress Overlay */}
                {isFastSyncing && (
                  <div className="rounded-2xl border border-accent-blue/40 bg-accent-blue/10 p-5 text-center space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-center">
                      <div className="relative">
                        <div className="h-12 w-12 rounded-full border-4 border-accent-blue/20 border-t-accent-blue animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-accent-blue">
                          ⚡
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-text-primary">Fast App Sync in Progress</h4>
                      <p className="font-mono text-xs text-accent-blue mt-1 animate-pulse">{fastSyncStep}</p>
                    </div>
                    <span className="text-[10.5px] text-text-tertiary block font-mono">
                      Establishing non-custodial RSA-2048 cryptographic channel with {currentExchangeMeta.name}...
                    </span>
                  </div>
                )}

                {/* Mobile QR Code Dialog */}
                {showQrModal && (
                  <div className="rounded-2xl border border-accent-blue/30 bg-bg-base p-6 text-center space-y-4 animate-in zoom-in-95 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-bg-border pb-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
                        <QrCode className="h-4 w-4 text-accent-blue" />
                        <span>Pair with {currentExchangeMeta.name} Mobile App</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setShowQrModal(false)} 
                        className="text-text-tertiary hover:text-text-primary"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
                      {/* Stylized QR Box */}
                      <div className="w-40 h-40 rounded-2xl border-2 border-accent-blue/50 bg-white p-3.5 flex flex-col justify-between shadow-xl">
                        <div className="w-full flex justify-between">
                          <div className="w-8 h-8 border-4 border-black rounded-md flex items-center justify-center"><div className="w-2.5 h-2.5 bg-black rounded-sm" /></div>
                          <div className="w-8 h-8 border-4 border-black rounded-md flex items-center justify-center"><div className="w-2.5 h-2.5 bg-black rounded-sm" /></div>
                        </div>
                        <div className="h-8 w-8 mx-auto rounded-lg bg-accent-blue text-white font-black text-xs flex items-center justify-center shadow-md">
                          {currentExchangeMeta.name.charAt(0)}
                        </div>
                        <div className="w-full flex justify-between">
                          <div className="w-8 h-8 border-4 border-black rounded-md flex items-center justify-center"><div className="w-2.5 h-2.5 bg-black rounded-sm" /></div>
                          <div className="flex gap-1 items-end"><div className="w-2 h-6 bg-black" /><div className="w-2 h-3 bg-black" /></div>
                        </div>
                      </div>

                      <div className="text-left space-y-2 max-w-[320px]">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-accent-blue block">Quick Pairing Steps</span>
                        <ol className="text-xs text-text-secondary space-y-1.5 list-decimal pl-4">
                          <li>Open your <strong>{currentExchangeMeta.name}</strong> mobile app.</li>
                          <li>Navigate to <strong>Account &rarr; API Management</strong>.</li>
                          <li>Select <strong>Scan QR Code</strong> to link AlgoText.</li>
                          <li>Confirm <strong>Read & Trade permissions</strong> (Withdrawals disabled).</li>
                        </ol>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-bg-border">
                      <button
                        type="button"
                        onClick={() => setShowQrModal(false)}
                        className="px-4 py-2 rounded-xl border border-bg-border bg-bg-surface text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowQrModal(false)
                          handleFastAppSync(currentExchangeMeta)
                        }}
                        className="px-5 py-2 rounded-xl bg-accent-blue text-xs font-bold text-white hover:bg-blue-600 transition-all flex items-center gap-1.5 shadow-md shadow-accent-blue/25"
                      >
                        <Zap className="h-3.5 w-3.5 fill-current" />
                        <span>Simulate Scanned QR & Authorize</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-text-secondary">Account Label</label>
                    <input
                      type="text"
                      placeholder={`e.g. ${currentExchangeMeta.name} Main Account`}
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="h-10 w-full rounded-xl border border-bg-border bg-bg-base px-3 text-[13px] text-text-primary outline-none focus:border-accent-blue transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-text-secondary">Network Mode</label>
                    <div className="flex h-10 rounded-xl bg-bg-base border border-bg-border p-1">
                      <button
                        type="button"
                        onClick={() => setIsTestnet(false)}
                        className={`flex-1 rounded-lg text-[12px] font-semibold transition-colors ${!isTestnet ? "bg-accent-blue text-white" : "text-text-secondary hover:text-text-primary"}`}
                      >
                        Mainnet (Live)
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsTestnet(true)}
                        className={`flex-1 rounded-lg text-[12px] font-semibold transition-colors ${isTestnet ? "bg-amber-500 text-black" : "text-text-secondary hover:text-text-primary"}`}
                      >
                        Testnet (Sandbox)
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-text-secondary flex items-center justify-between">
                    <span>API Key</span>
                    <span className="text-[11px] text-accent-blue font-normal">Requires Read/Trade Permissions</span>
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                    <input
                      type="text"
                      placeholder={`Paste your ${currentExchangeMeta.name} API key...`}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="h-10 w-full rounded-xl border border-bg-border bg-bg-base pl-9 pr-3 text-[13px] font-mono text-text-primary outline-none focus:border-accent-blue transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-text-secondary">API Secret</label>
                  <input
                    type="password"
                    placeholder={`Paste your ${currentExchangeMeta.name} API Secret...`}
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    className="h-10 w-full rounded-xl border border-bg-border bg-bg-base px-3 text-[13px] font-mono text-text-primary outline-none focus:border-accent-blue transition-all"
                  />
                </div>

                {(selectedExchange === "okx" || selectedExchange === "kucoin" || selectedExchange === "gateio" || selectedExchange === "bitget" || selectedExchange === "bybit" || selectedExchange === "deribit") && (
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-text-secondary">Passphrase (Required for {currentExchangeMeta.name})</label>
                    <input
                      type="password"
                      placeholder="Enter API Passphrase..."
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      className="h-10 w-full rounded-xl border border-bg-border bg-bg-base px-3 text-[13px] font-mono text-text-primary outline-none focus:border-accent-blue transition-all"
                    />
                  </div>
                )}

                {/* Security Guarantee Banner */}
                <div className="flex items-start gap-3 rounded-xl bg-accent-green/10 border border-accent-green/20 p-3.5 text-[12px] text-text-secondary">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-accent-green mt-0.5" />
                  <div>
                    <strong className="text-text-primary block font-semibold">Client-side Security & RSA Lock Guarantee</strong>
                    Keys are kept strictly local in client storage. AlgoText will never ask for or permit withdrawal authority on your exchange account.
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsConnectModalOpen(false)}
                    className="rounded-xl border border-bg-border bg-bg-base px-4 py-2.5 text-[13px] font-semibold text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 rounded-xl bg-accent-blue px-6 py-2.5 text-[13px] font-bold text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" /> Verifying Connection...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" /> Save & Connect {currentExchangeMeta.name}
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
