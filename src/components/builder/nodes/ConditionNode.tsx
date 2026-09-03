import * as React from "react"
import { Handle, Position } from "reactflow"
import { X } from "lucide-react"
import { useBuilderStore } from "@/store/useBuilderStore"

const CATEGORY_STYLES: Record<string, { bg: string, border: string, text: string }> = {
  "ENTRY CONDITIONS": { bg: "bg-[#0F2036]", border: "border-accent-blue", text: "text-accent-blue" },
  "EXIT CONDITIONS": { bg: "bg-[#0A1F12]", border: "border-accent-green", text: "text-accent-green" },
  "RISK MANAGEMENT": { bg: "bg-[#1F1706]", border: "border-accent-amber", text: "text-accent-amber" },
}

export function ConditionNode({ id, data, selected }: { id: string; data: any; selected?: boolean }) {
  // Normalize legacy category names to the canonical format
  const CATEGORY_MAP: Record<string, string> = {
    'technical': 'ENTRY CONDITIONS',
    'entry': 'ENTRY CONDITIONS',
    'risk': 'EXIT CONDITIONS',
    'exit': 'EXIT CONDITIONS',
  };
  const normalizedCategory = CATEGORY_MAP[data.category?.toLowerCase()] || data.category || 'ENTRY CONDITIONS';
  const styles = CATEGORY_STYLES[normalizedCategory] || { bg: "bg-[#0F2036]", border: "border-accent-blue", text: "text-accent-blue" }
  const setNodes = useBuilderStore((state) => state.setNodes)
  const setEdges = useBuilderStore((state) => state.setEdges)

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nds) => nds.filter((node) => node.id !== id))
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id))
  }

  // Format indicator string (e.g. 50 EMA, 1h RSI(14)[-1])
  const formatIndicatorStr = (ind: any) => {
    if (!ind || !ind.type) return '';
    const tf = ind.timeframe ? `[${ind.timeframe}] ` : '';
    const offset = ind.offset ? `[-${ind.offset}]` : '';
    const period = ind.parameters?.period ? `(${ind.parameters.period})` : '';
    const mult = ind.parameters?.multiplier ? ` x${ind.parameters.multiplier}` : '';
    
    if (ind.parameters?.period && (ind.type === 'EMA' || ind.type === 'SMA' || ind.type === 'WMA' || ind.type === 'HMA')) {
      return `${tf}${ind.parameters.period} ${ind.type}${offset}`;
    }
    return `${tf}${ind.type}${period}${mult}${offset}`;
  };

  // Format display string based on dslCondition if available
  let displayLabel = data.label;
  let subDetails = '';
  
  if (data.dslCondition) {
    const { left, comparator, right, logicalOperator } = data.dslCondition;
    const compMap: Record<string, string> = {
      GREATER_THAN: '>',
      LESS_THAN: '<',
      EQUAL: '==',
      CROSSES_ABOVE: 'Crosses Above',
      CROSSES_BELOW: 'Crosses Below'
    };

    const leftStr = formatIndicatorStr(left);
    let rightStr = '';

    if (typeof right === 'object' && right !== null && right.type) {
      rightStr = formatIndicatorStr(right);
    } else {
      rightStr = String(right);
    }

    displayLabel = `${leftStr} ${compMap[comparator] || comparator} ${rightStr}`;
    
    const tfBadge = left?.timeframe ? `Timeframe: ${left.timeframe}` : '';
    const logicBadge = logicalOperator ? `Gate: ${logicalOperator}` : '';
    subDetails = [tfBadge, logicBadge].filter(Boolean).join(' | ');
  }

  return (
    <div className={`group relative flex min-h-[100px] w-[280px] flex-col justify-center rounded-xl border ${selected ? 'border-accent-blue shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-[1.02]' : styles.border} ${styles.bg} px-5 py-4 shadow-[var(--shadow-card)] backdrop-blur-md transition-all hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(59,130,246,0.15)]`}>
      <button 
        onClick={onDelete}
        className="absolute right-2 top-2 hidden h-6 w-6 items-center justify-center rounded-md bg-bg-base/80 text-text-secondary hover:text-accent-red group-hover:flex"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className={`flex h-2 w-2 rounded-full ${styles.border.replace('border-', 'bg-')} shadow-[0_0_10px_currentColor]`} />
          <span className={`text-[11px] font-bold uppercase tracking-wider ${styles.text}`}>
            {normalizedCategory.replace(" CONDITIONS", "")}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {data.dslCondition?.left?.timeframe && (
            <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
              {data.dslCondition.left.timeframe}
            </span>
          )}
          {data.dslCondition?.logicalOperator && (
            <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-accent-blue/20 text-accent-blue border border-accent-blue/30">
              {data.dslCondition.logicalOperator}
            </span>
          )}
        </div>
      </div>
      
      <span className="text-[14px] font-semibold text-text-primary mb-1 leading-snug">{displayLabel}</span>
      {subDetails && (
        <span className="text-[11px] text-text-tertiary font-mono">{subDetails}</span>
      )}
      
      <Handle type="target" position={Position.Top} className={`h-4 w-4 border-2 border-bg-base ${styles.border.replace("border-", "bg-")} transition-transform hover:scale-125`} />
      <Handle type="source" position={Position.Bottom} className={`h-4 w-4 border-2 border-bg-base ${styles.border.replace("border-", "bg-")} transition-transform hover:scale-125`} />
    </div>
  )
}

