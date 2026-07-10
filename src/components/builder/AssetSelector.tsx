"use client"
import * as React from 'react'
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { ALL_ASSETS, MarketType } from '@/lib/constants/assets'

interface AssetSelectorProps {
  value: string;
  onChange: (val: string) => void;
}

export function AssetSelector({ value, onChange }: AssetSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [activeTab, setActiveTab] = React.useState<MarketType | 'ALL'>('ALL')
  
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredAssets = React.useMemo(() => {
    return ALL_ASSETS.filter(asset => {
      const matchesSearch = asset.symbol.toLowerCase().includes(search.toLowerCase()) || 
                            asset.name.toLowerCase().includes(search.toLowerCase())
      const matchesTab = activeTab === 'ALL' || asset.market === activeTab
      return matchesSearch && matchesTab
    })
  }, [search, activeTab])

  const selectedAsset = ALL_ASSETS.find(a => a.symbol === value) || ALL_ASSETS[0]

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-bg-border bg-bg-base px-3 text-[14px] text-text-primary outline-none hover:border-accent-blue/50 transition-colors"
      >
        <span className="truncate flex items-center gap-2">
          <span className="font-semibold">{selectedAsset?.symbol}</span>
          <span className="text-text-tertiary hidden sm:inline-block truncate max-w-[120px]">- {selectedAsset?.name}</span>
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-[300px] sm:w-[350px] rounded-md border border-bg-border bg-bg-surface shadow-xl p-2 animate-in fade-in zoom-in-95 duration-100">
          
          {/* Search Bar */}
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-tertiary" />
            <input 
              autoFocus
              type="text"
              placeholder="Search ticker or company name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-bg-border bg-bg-base py-2 pl-9 pr-3 text-[13px] outline-none focus:border-accent-blue"
            />
          </div>

          {/* Market Tabs */}
          <div className="flex items-center gap-1 mb-2 bg-bg-base p-1 rounded-md overflow-x-auto no-scrollbar">
            {['ALL', 'CRYPTO', 'US_EQUITY', 'IN_EQUITY'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 rounded-sm px-2 py-1 text-[11px] font-medium transition-colors ${activeTab === tab ? 'bg-bg-surface text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-primary'}`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Asset List (Virtualized feel) */}
          <div className="max-h-[250px] overflow-y-auto pr-1 flex flex-col gap-1 no-scrollbar">
            {filteredAssets.length === 0 ? (
              <div className="py-6 text-center text-sm text-text-tertiary">No assets found.</div>
            ) : (
              filteredAssets.slice(0, 50).map(asset => ( // Slice to 50 for performance since it's a simple list
                <button
                  key={asset.symbol}
                  onClick={() => {
                    onChange(asset.symbol)
                    setOpen(false)
                    setSearch("")
                  }}
                  className={`flex w-full items-center justify-between rounded-sm px-2 py-2 text-[13px] hover:bg-accent-blue/10 hover:text-accent-blue transition-colors ${value === asset.symbol ? 'bg-accent-blue/10 text-accent-blue font-semibold' : 'text-text-primary'}`}
                >
                  <div className="flex items-center gap-2 text-left truncate flex-1">
                    <span className="w-14 shrink-0">{asset.symbol}</span>
                    <span className="text-[11px] text-text-tertiary truncate">{asset.name}</span>
                  </div>
                  {value === asset.symbol && <Check className="h-4 w-4 shrink-0" />}
                </button>
              ))
            )}
            {filteredAssets.length > 50 && (
              <div className="text-[10px] text-center text-text-tertiary pt-2 border-t border-bg-border/50">
                Type to see more results...
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  )
}
