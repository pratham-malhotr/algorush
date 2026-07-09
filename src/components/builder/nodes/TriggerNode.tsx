import * as React from "react"
import { Handle, Position } from "reactflow"

export function TriggerNode({ data }: { data: { label: string } }) {
  return (
    <div className="flex h-[60px] w-[200px] flex-col items-center justify-center rounded-lg border-2 border-accent-blue bg-[#1D4ED8] shadow-[0_0_15px_rgba(59,130,246,0.3)]">
      <span className="font-semibold text-text-primary">{data.label}</span>
      <div className="mt-1 text-[11px] text-text-secondary">Target: BTC/USDT</div>
      
      {/* Output Handle */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="h-3 w-3 border-2 border-bg-base bg-accent-blue"
      />
    </div>
  )
}
