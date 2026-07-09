import * as React from "react"
import { Handle, Position } from "reactflow"
import { X } from "lucide-react"
import { useBuilderStore } from "@/store/useBuilderStore"

const CATEGORY_STYLES: Record<string, { bg: string, border: string, text: string }> = {
  "ENTRY CONDITIONS": { bg: "bg-[#0F2036]", border: "border-accent-blue", text: "text-accent-blue" },
  "EXIT CONDITIONS": { bg: "bg-[#0A1F12]", border: "border-accent-green", text: "text-accent-green" },
  "RISK MANAGEMENT": { bg: "bg-[#1F1706]", border: "border-accent-amber", text: "text-accent-amber" },
}

export function ConditionNode({ id, data }: { id: string; data: { label: string; category: string } }) {
  const styles = CATEGORY_STYLES[data.category] || { bg: "bg-bg-elevated", border: "border-text-tertiary", text: "text-text-tertiary" }
  const setNodes = useBuilderStore((state) => state.setNodes)
  const setEdges = useBuilderStore((state) => state.setEdges)

  const onDelete = () => {
    setNodes((nds) => nds.filter((node) => node.id !== id))
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id))
  }

  return (
    <div className={`group relative flex min-h-[100px] w-[260px] flex-col justify-center rounded-xl border ${styles.border} ${styles.bg} px-5 py-4 shadow-[var(--shadow-card)] backdrop-blur-md transition-all hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(59,130,246,0.15)]`}>
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
      
      <span className="text-[15px] font-semibold text-text-primary mb-3">{data.label}</span>
      
      {/* Advanced Inline Config */}
      <div className="flex items-center gap-2 rounded-md bg-black/5 p-2 border border-bg-border/50">
        <select className="h-7 cursor-pointer rounded bg-transparent px-1 text-[12px] font-mono text-text-secondary outline-none focus:text-text-primary">
          <option>{"<"} Below</option>
          <option>{">"} Above</option>
          <option>{"="} Equal</option>
        </select>
        <input 
          type="number" 
          defaultValue={30} 
          className="h-7 w-16 rounded border border-bg-border bg-bg-surface px-2 text-center font-mono text-[13px] font-bold text-accent-blue outline-none focus:border-accent-blue"
        />
      </div>

      <Handle type="target" position={Position.Top} className={`h-4 w-4 border-2 border-bg-base ${styles.border.replace("border-", "bg-")} transition-transform hover:scale-125`} />
      <Handle type="source" position={Position.Bottom} className={`h-4 w-4 border-2 border-bg-base ${styles.border.replace("border-", "bg-")} transition-transform hover:scale-125`} />
    </div>
  )
}
