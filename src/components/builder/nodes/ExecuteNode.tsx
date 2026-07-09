import * as React from "react"
import { Handle, Position } from "reactflow"

export function ExecuteNode({ data }: { data: { label: string } }) {
  return (
    <div className="flex h-[60px] w-[200px] items-center justify-center rounded-lg border-2 border-accent-green bg-[#0A2010] shadow-[0_0_15px_rgba(34,197,94,0.2)]">
      <span className="font-semibold text-text-primary">{data.label || "Execute BUY Order"}</span>
      <Handle type="target" position={Position.Top} className="h-3 w-3 border-2 border-bg-base bg-accent-green" />
    </div>
  )
}
