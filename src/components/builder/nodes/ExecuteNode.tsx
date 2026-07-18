import * as React from "react"
import { Handle, Position } from "reactflow"

export function ExecuteNode({ data, selected }: { data: any; selected?: boolean }) {
  let displayLabel = data.label || "Execute BUY Order";
  if (data.dslAction) {
    displayLabel = `${data.dslAction.type} ${data.dslAction.quantityValue}% of Account`;
  }

  return (
    <div className={`flex h-[70px] w-[220px] flex-col items-center justify-center rounded-lg border-2 ${selected ? 'border-white shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-105' : 'border-accent-green'} bg-[#0A2010] shadow-[0_0_15px_rgba(34,197,94,0.2)] transition-all`}>
      <span className="text-[11px] font-bold uppercase tracking-wider text-accent-green mb-1">Execution</span>
      <span className="font-semibold text-text-primary">{displayLabel}</span>
      <Handle type="target" position={Position.Top} className="h-4 w-4 border-2 border-bg-base bg-accent-green" />
    </div>
  )
}
