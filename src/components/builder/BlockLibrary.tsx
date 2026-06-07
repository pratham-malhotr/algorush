"use client"

import * as React from "react"
import { Search, ChevronDown, ChevronRight, GripVertical } from "lucide-react"

const CATEGORIES = [
  {
    name: "ENTRY CONDITIONS",
    color: "text-accent-blue",
    bgColor: "bg-accent-blue",
    blocks: [
      "RSI Crosses Below",
      "RSI Crosses Above",
      "Price Crosses Above MA",
      "Price Crosses Below MA",
      "MACD Bullish Crossover",
      "Bollinger Lower Breakout"
    ]
  },
  {
    name: "EXIT CONDITIONS",
    color: "text-accent-green",
    bgColor: "bg-accent-green",
    blocks: [
      "Take Profit %",
      "Stop Loss %",
      "Trailing Stop %",
      "RSI Overbought Exit",
      "Opposite MACD Signal"
    ]
  },
  {
    name: "RISK MANAGEMENT",
    color: "text-accent-amber",
    bgColor: "bg-accent-amber",
    blocks: [
      "Max Capital Per Trade",
      "Max Open Positions",
      "Daily Loss Limit"
    ]
  }
]

export function BlockLibrary() {
  const [openCategories, setOpenCategories] = React.useState<Record<string, boolean>>({
    "ENTRY CONDITIONS": true,
    "EXIT CONDITIONS": true
  })

  const toggleCategory = (name: string) => {
    setOpenCategories(prev => ({ ...prev, [name]: !prev[name] }))
  }

  const onDragStart = (event: React.DragEvent, nodeType: string, label: string, category: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.setData('application/label', label)
    event.dataTransfer.setData('application/category', category)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="flex h-full w-[260px] shrink-0 flex-col border-r border-bg-border bg-[#0F1318]">
      <div className="p-4 pb-2">
        <h3 className="mb-3 text-[12px] font-bold uppercase tracking-wider text-text-secondary">Block Library</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input 
            type="text" 
            placeholder="Search blocks..." 
            className="h-[36px] w-full rounded-md border border-bg-border bg-bg-elevated pl-9 pr-3 text-[13px] text-text-primary outline-none placeholder:text-text-tertiary focus:border-accent-blue focus:shadow-[0_0_0_2px_rgba(59,130,246,0.15)] transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {CATEGORIES.map((cat) => (
          <div key={cat.name} className="mb-2">
            <button
              onClick={() => toggleCategory(cat.name)}
              className="flex w-full items-center justify-between rounded px-2 py-2 hover:bg-white/5"
            >
              <div className="flex items-center gap-2">
                {openCategories[cat.name] ? (
                  <ChevronDown className="h-4 w-4 text-text-secondary" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-text-secondary" />
                )}
                <span className={`text-[12px] font-bold uppercase ${cat.color}`}>{cat.name}</span>
              </div>
            </button>

            {openCategories[cat.name] && (
              <div className="mt-1 flex flex-col gap-2 pl-2 pr-1 pb-3">
                {cat.blocks.map((block) => (
                  <div
                    key={block}
                    className="group relative flex h-[52px] w-full cursor-grab items-center justify-between rounded-lg border border-bg-border bg-[#070A0D]/50 backdrop-blur-md px-3 active:cursor-grabbing hover:border-accent-blue/50 hover:bg-[#0F1318] hover:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all"
                    draggable
                    onDragStart={(e) => onDragStart(e, 'conditionNode', block, cat.name)}
                  >
                    <div className="absolute inset-0 -z-10 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: `linear-gradient(to right, transparent, rgba(59,130,246,0.05))` }} />
                    <div className="flex items-center gap-3">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-md bg-bg-elevated group-hover:bg-accent-blue/10 transition-colors`}>
                        <div className={`h-2 w-2 rounded-full ${cat.bgColor} shadow-[0_0_8px_currentColor]`} />
                      </div>
                      <span className="text-[13px] font-medium text-text-primary group-hover:text-white transition-colors">{block}</span>
                    </div>
                    <GripVertical className="h-4 w-4 text-text-tertiary opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
