"use client"

import * as React from "react"
import ReactFlow, { Background, Controls, Edge, Node, ReactFlowProvider, MiniMap, NodeMouseHandler, useReactFlow } from "reactflow"
import "reactflow/dist/style.css"
import { useBuilderStore } from "@/store/useBuilderStore"
import { TriggerNode } from "./nodes/TriggerNode"
import { ConditionNode } from "./nodes/ConditionNode"
import { ExecuteNode } from "./nodes/ExecuteNode"
import { RiskNode } from "./nodes/RiskNode"
import { LogicGateNode } from "./nodes/LogicGateNode"
import { FilterNode } from "./nodes/FilterNode"
import { TakeProfitLadderNode } from "./nodes/TakeProfitLadderNode"
import { WebhookNode } from "./nodes/WebhookNode"
import { Undo, Redo, Trash2, Sparkles, CheckCircle2, AlertTriangle, Wand2, LayoutGrid, ShieldCheck, Download, Upload, Wrench } from "lucide-react"
import { StrategyPromptStudio } from "./StrategyPromptStudio"
import { StrategyDiagnosticsModal } from "./StrategyDiagnosticsModal"
import { StrategyImportExportModal } from "./StrategyImportExportModal"

const nodeTypes = {
  triggerNode: TriggerNode,
  conditionNode: ConditionNode,
  executeNode: ExecuteNode,
  riskNode: RiskNode,
  logicGateNode: LogicGateNode,
  filterNode: FilterNode,
  takeProfitLadderNode: TakeProfitLadderNode,
  webhookNode: WebhookNode,
}

function CanvasFlow() {
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect, 
    setNodes, 
    setEdges,
    setSelectedNodeId, 
    undo, 
    redo, 
    historyIndex, 
    history, 
    validateGraph, 
    loadPresetTemplate, 
    clearCanvas,
    autoLayoutNodes
  } = useBuilderStore()

  const reactFlowWrapper = React.useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = React.useState<any>(null)

  const validation = validateGraph()

  const onDragOver = React.useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = React.useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData("application/reactflow")
      const label = event.dataTransfer.getData("application/label")
      const category = event.dataTransfer.getData("application/category")
      const dslString = event.dataTransfer.getData("application/dsl")

      if (typeof type === "undefined" || !type) {
        return
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      
      let dslData = {}
      try {
        if (dslString) dslData = JSON.parse(dslString)
      } catch (e) { console.error("Error parsing DSL data from block", e) }

      const newNode: Node = {
        id: `node-${Date.now()}`,
        type,
        position,
        data: { 
          label, 
          category,
          dslCondition: type === 'conditionNode' ? dslData : undefined,
          dslAction: type === 'executeNode' ? dslData : undefined,
          dslRisk: type === 'riskNode' ? dslData : undefined,
          dslGate: type === 'logicGateNode' ? dslData : undefined,
          dslFilter: type === 'filterNode' ? dslData : undefined,
          dslLadder: type === 'takeProfitLadderNode' ? dslData : undefined,
          dslWebhook: type === 'webhookNode' ? dslData : undefined,
        },
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [reactFlowInstance, setNodes]
  )

  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = React.useState(false)
  const [isImportExportOpen, setIsImportExportOpen] = React.useState(false)

  const handleAutoRepair = React.useCallback(() => {
    const { nodes, edges, setNodes, setEdges } = useBuilderStore.getState()
    // Auto repair: ensure start-1 is connected to first condition, and chain all unconnected nodes
    const trigger = nodes.find(n => n.type === 'triggerNode')
    let currentTriggerId = trigger?.id || 'start-1'
    let updatedNodes = [...nodes]
    if (!trigger) {
      updatedNodes.unshift({
        id: 'start-1',
        type: 'triggerNode',
        position: { x: 250, y: 40 },
        data: { label: 'Strategy Start' }
      })
      currentTriggerId = 'start-1'
    }

    // Connect sequential chain for disconnected nodes
    const newEdges = [...edges]
    for (let i = 0; i < updatedNodes.length - 1; i++) {
      const source = updatedNodes[i].id
      const target = updatedNodes[i + 1].id
      if (!newEdges.some(e => e.source === source && e.target === target)) {
        newEdges.push({ id: `e-${source}-${target}`, source, target, animated: true })
      }
    }
    setNodes(updatedNodes)
    setEdges(newEdges)
    useBuilderStore.getState().autoLayoutNodes()
  }, [])

  const onNodeClick: NodeMouseHandler = React.useCallback(
    (event, node) => setSelectedNodeId(node.id),
    [setSelectedNodeId]
  )

  const onPaneClick = React.useCallback(
    () => setSelectedNodeId(null),
    [setSelectedNodeId]
  )

  const defaultEdgeOptions = React.useMemo(() => ({
    animated: true, 
    style: { stroke: '#3B82F6', strokeWidth: 2, filter: 'drop-shadow(0 0 5px rgba(59,130,246,0.6))' } 
  }), [])

  return (
    <div className="flex-1 h-full w-full bg-bg-base relative overflow-hidden" ref={reactFlowWrapper}>
      {/* ═══ Floating Center Command Island (Spotlight Prompt Studio) ═══ */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-2xl pointer-events-auto">
        <StrategyPromptStudio />
      </div>

      {/* ═══ Top-Left Floating Controls Pill ═══ */}
      <div className="absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-xl border border-bg-border/80 bg-bg-surface/90 p-1 backdrop-blur-md shadow-md">
        {/* Presets Dropdown */}
        <select
          onChange={(e) => e.target.value && loadPresetTemplate(e.target.value)}
          defaultValue=""
          className="hidden sm:inline-block h-7 rounded-lg border border-bg-border bg-bg-base px-2 text-[11px] font-semibold text-text-primary outline-none hover:border-accent-blue transition-colors cursor-pointer"
        >
          <option value="" disabled>✨ Preset DAGs</option>
          <option value="triple_ema">Triple EMA Confluence</option>
          <option value="bollinger_squeeze">Bollinger Squeeze Staged TP</option>
          <option value="basis_arbitrage">Delta-Neutral Basis Arbitrage</option>
          <option value="pairs_trading">Statistical Pairs Cointegration</option>
          <option value="volatility_grid">Dynamic Volatility Grid</option>
          <option value="order_flow">Order Flow Imbalance Scalper</option>
          <option value="golden_cross">50/200 Golden Cross</option>
          <option value="rsi_oversold">RSI Scalper</option>
        </select>

        <div className="hidden sm:block h-3.5 w-px bg-bg-border" />

        {/* Undo / Redo */}
        <button
          onClick={undo}
          disabled={historyIndex <= 0}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-text-primary disabled:opacity-30 transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-text-primary disabled:opacity-30 transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo className="h-3.5 w-3.5" />
        </button>

        <div className="h-3.5 w-px bg-bg-border" />

        {/* Auto Layout */}
        <button
          onClick={autoLayoutNodes}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors"
          title="Auto Arrange Nodes Hierarchically"
        >
          <LayoutGrid className="h-3.5 w-3.5 text-accent-blue" />
          <span className="hidden md:inline">Layout</span>
        </button>

        {/* Strategy Portability / Export */}
        <button
          onClick={() => setIsImportExportOpen(true)}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors"
          title="Export / Import Strategy"
        >
          <Download className="h-3.5 w-3.5 text-purple-400" />
          <span className="hidden md:inline">Port</span>
        </button>

        {/* Clear */}
        <button
          onClick={clearCanvas}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-accent-red hover:bg-accent-red/10 transition-colors"
          title="Clear Canvas"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Clear</span>
        </button>
      </div>

      {/* ═══ Top-Right Graph Validation Health Pill & Diagnostics Trigger ═══ */}
      <div className="absolute right-3 top-3 z-20 flex items-center gap-2">
        <button
          onClick={() => setIsDiagnosticsOpen(true)}
          className="flex items-center gap-1.5 rounded-xl border border-bg-border/80 bg-bg-surface/90 px-2.5 py-1 text-[11px] font-bold text-text-primary backdrop-blur-md shadow-md hover:border-accent-blue hover:text-accent-blue transition-all"
          title="Open Institutional Pre-Flight Diagnostics"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-accent-blue" />
          <span className="hidden sm:inline">Diagnostics</span>
        </button>

        {validation.isValid ? (
          <div 
            onClick={() => setIsDiagnosticsOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-500 backdrop-blur-md shadow-sm cursor-pointer hover:bg-emerald-500/20 transition-all"
            title="DAG is completely valid. Click for full institutional diagnostics."
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">DAG Valid</span>
          </div>
        ) : (
          <div 
            onClick={() => setIsDiagnosticsOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-500 backdrop-blur-md shadow-sm max-w-[220px] truncate cursor-pointer hover:bg-amber-500/20 transition-all" 
            title={validation.errors[0] || validation.warnings[0]}
          >
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{validation.errors[0] || validation.warnings[0]}</span>
          </div>
        )}
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        className="algotext-ai-canvas"
        defaultEdgeOptions={defaultEdgeOptions}
      >
        <Background color="#475569" variant={"dots" as any} gap={24} size={1.5} />
        <Controls 
          className="bg-bg-surface border border-bg-border rounded-lg shadow-sm overflow-hidden fill-text-primary"
          showInteractive={false}
        />
        <MiniMap 
          nodeColor="#3B82F6" 
          maskColor="rgba(7,10,13,0.8)" 
          style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-bg-border)', borderRadius: '8px' }} 
        />
      </ReactFlow>

      {/* Pre-Flight Diagnostics Modal */}
      <StrategyDiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        onAutoRepair={handleAutoRepair}
      />

      {/* Strategy Portability / Import-Export Modal */}
      <StrategyImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
      />
    </div>
  )
}

export function StrategyCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasFlow />
    </ReactFlowProvider>
  )
}
