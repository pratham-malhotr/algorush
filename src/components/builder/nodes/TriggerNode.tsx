import * as React from "react"
import { Handle, Position } from "reactflow"

export function TriggerNode({ data, selected }: { data: any; selected?: boolean }) {
  return (
    <div className={`flex h-[70px] w-[220px] flex-col items-center justify-center rounded-lg border-2 ${selected ? 'border-white shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-105' : 'border-accent-blue'} bg-[#0F2036] shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all`}>
      <span className="font-semibold text-text-primary">{data.label}</span>
      <div className="mt-1 text-[11px] text-text-secondary">Start Flow</div>
      
      {/* Output Handle */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="h-4 w-4 border-2 border-bg-base bg-accent-blue"
      />
    </div>
  )
}
