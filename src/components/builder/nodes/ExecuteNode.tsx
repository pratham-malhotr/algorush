import * as React from "react"
import { Handle, Position } from "reactflow"
import { X } from "lucide-react"
import { useBuilderStore } from "@/store/useBuilderStore"

export function ExecuteNode({ id, data, selected }: { id: string; data: any; selected?: boolean }) {
  const setNodes = useBuilderStore((state) => state.setNodes);
  const setEdges = useBuilderStore((state) => state.setEdges);

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
  };

  let displayLabel = data.label || "Execute BUY Order";
  if (data.dslAction) {
    if (data.dslAction.type === 'CLOSE_POSITION') {
      displayLabel = "CLOSE POSITION";
    } else {
      displayLabel = `${data.dslAction.type} ${data.dslAction.quantityValue || 0}% of Account`;
    }
  }

  return (
    <div className={`group relative flex h-[70px] w-[220px] flex-col items-center justify-center rounded-lg border-2 ${selected ? 'border-white shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-105' : 'border-accent-green'} bg-[#0A2010] shadow-[0_0_15px_rgba(34,197,94,0.2)] transition-all`}>
      <button 
        onClick={onDelete}
        className="absolute right-1 top-1 hidden h-5 w-5 items-center justify-center rounded-md bg-bg-base/80 text-text-secondary hover:text-accent-red group-hover:flex"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <span className="text-[11px] font-bold uppercase tracking-wider text-accent-green mb-1">Execution</span>
      <span className="font-semibold text-text-primary">{displayLabel}</span>
      <Handle type="target" position={Position.Top} className="h-4 w-4 border-2 border-bg-base bg-accent-green transition-transform hover:scale-125" />
      <Handle type="source" position={Position.Bottom} className="h-4 w-4 border-2 border-bg-base bg-accent-green transition-transform hover:scale-125" />
    </div>
  )
}
