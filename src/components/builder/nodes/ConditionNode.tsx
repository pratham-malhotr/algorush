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
  const styles = CATEGORY_STYLES[data.category] || { bg: "bg-bg-elevated", border: "border-text-tertiary", text: "text-text-tertiary" }
  const setNodes = useBuilderStore((state) => state.setNodes)
  const setEdges = useBuilderStore((state) => state.setEdges)

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nds) => nds.filter((node) => node.id !== id))
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id))
  }

  // Format the display string based on dslCondition if available
  let displayLabel = data.label;
  if (data.dslCondition) {
    const { left, comparator, right } = data.dslCondition;
    const compMap: Record<string, string> = {
      GREATER_THAN: '>',
      LESS_THAN: '<',
      EQUAL: '==',
      CROSSES_ABOVE: 'Crosses Above',
      CROSSES_BELOW: 'Crosses Below'
    };
    displayLabel = `${left.type} ${compMap[comparator] || comparator} ${right}`;
  }

  return (
    <div className={`group relative flex min-h-[100px] w-[260px] flex-col justify-center rounded-xl border ${selected ? 'border-accent-blue shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-[1.02]' : styles.border} ${styles.bg} px-5 py-4 shadow-[var(--shadow-card)] backdrop-blur-md transition-all hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(59,130,246,0.15)]`}>
      <button 
        onClick={onDelete}
        className="absolute right-2 top-2 hidden h-6 w-6 items-center justify-center rounded-md bg-bg-base/80 text-text-secondary hover:text-accent-red group-hover:flex"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2 mb-2">
        <span className={`flex h-2 w-2 rounded-full ${styles.border.replace('border-', 'bg-')} shadow-[0_0_10px_currentColor]`} />
        <span className={`text-[11px] font-bold uppercase tracking-wider ${styles.text}`}>
          {data.category.replace(" CONDITIONS", "")}
        </span>
      </div>
      
      <span className="text-[15px] font-semibold text-text-primary mb-1">{displayLabel}</span>
      {data.dslCondition?.left?.parameters?.period && (
        <span className="text-[12px] text-text-tertiary font-mono">Period: {data.dslCondition.left.parameters.period}</span>
      )}
      
      <Handle type="target" position={Position.Top} className={`h-4 w-4 border-2 border-bg-base ${styles.border.replace("border-", "bg-")} transition-transform hover:scale-125`} />
      <Handle type="source" position={Position.Bottom} className={`h-4 w-4 border-2 border-bg-base ${styles.border.replace("border-", "bg-")} transition-transform hover:scale-125`} />
    </div>
  )
}
