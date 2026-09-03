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

  const action = data.dslAction || {};
  const isShort = action.type === 'SELL';
  const isClose = action.type === 'CLOSE_POSITION';
  
  let title = isClose ? 'Close Position' : isShort ? 'Short Execution' : 'Long Execution';
  let badgeColor = isClose ? 'text-purple-400 border-purple-500/30' : isShort ? 'text-accent-red border-accent-red/30' : 'text-accent-green border-accent-green/30';
  let borderColor = isClose ? 'border-purple-500/60' : isShort ? 'border-accent-red/60' : 'border-accent-green/60';
  let bgColor = isClose ? 'bg-[#180E29]' : isShort ? 'bg-[#250D0D]' : 'bg-[#0A2010]';
  let handleColor = isClose ? 'bg-purple-500' : isShort ? 'bg-accent-red' : 'bg-accent-green';

  let displayLabel = data.label || (isShort ? "Sell Short" : "Buy Long");
  if (action.type) {
    if (isClose) {
      displayLabel = "CLOSE FULL POSITION";
    } else {
      const orderTypeStr = action.orderType && action.orderType !== 'MARKET' ? ` ${action.orderType}` : '';
      const qtyStr = action.quantityType === 'FIXED_USD' || action.quantityType === 'USD_VALUE'
        ? `$${action.quantityValue || 0}`
        : action.quantityType === 'KELLY_CRITERION'
        ? `Kelly (${action.quantityValue || 0.5})`
        : `${action.quantityValue || 50}%`;
      const levStr = action.leverage && action.leverage > 1 ? ` (${action.leverage}x Lev)` : '';
      displayLabel = `${isShort ? 'SHORT' : 'BUY'}${orderTypeStr} ${qtyStr}${levStr}`;
    }
  }

  return (
    <div className={`group relative flex min-h-[75px] w-[240px] flex-col items-center justify-center rounded-xl border-2 ${selected ? 'border-white shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-105' : borderColor} ${bgColor} p-3 shadow-lg transition-all`}>
      <button 
        onClick={onDelete}
        className="absolute right-1.5 top-1.5 hidden h-5 w-5 items-center justify-center rounded-md bg-bg-base/80 text-text-secondary hover:text-accent-red group-hover:flex"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <div className="flex items-center gap-1.5 mb-1">
        <span className={`h-2 w-2 rounded-full ${handleColor} animate-pulse`} />
        <span className={`text-[10.5px] font-bold uppercase tracking-wider ${badgeColor}`}>
          {title}
        </span>
      </div>
      <span className="font-bold text-text-primary text-[13px] text-center px-2">{displayLabel}</span>
      <Handle type="target" position={Position.Top} className={`h-4 w-4 border-2 border-bg-base ${handleColor} transition-transform hover:scale-125`} />
      <Handle type="source" position={Position.Bottom} className={`h-4 w-4 border-2 border-bg-base ${handleColor} transition-transform hover:scale-125`} />
    </div>
  )
}
