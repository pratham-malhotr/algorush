"use client"

import * as React from "react"
import ReactFlow, { Background, Controls, Edge, Node, ReactFlowProvider, MiniMap, NodeMouseHandler, useReactFlow } from "reactflow"
import "reactflow/dist/style.css"
import { useBuilderStore } from "@/store/useBuilderStore"
import { TriggerNode } from "./nodes/TriggerNode"
import { ConditionNode } from "./nodes/ConditionNode"
import { ExecuteNode } from "./nodes/ExecuteNode"
import { RiskNode } from "./nodes/RiskNode"
import { Undo, Redo, Trash2, Sparkles, CheckCircle2, AlertTriangle, Wand2, LayoutGrid } from "lucide-react"

const nodeTypes = {
  triggerNode: TriggerNode,
  conditionNode: ConditionNode,
  executeNode: ExecuteNode,
  riskNode: RiskNode,
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
    clearCanvas 
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
        },
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [reactFlowInstance, setNodes]
  )

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

  const handleAutoLayout = () => {
    let y = 50
    const rearranged = nodes.map((node, idx) => {
      const updated = { ...node, position: { x: 250, y } }
      y += 120
      return updated
    })
    setNodes(rearranged)
  }

  return (
    <div className="flex-1 h-full w-full bg-bg-base relative" ref={reactFlowWrapper}>
      {/* Canvas Top Control Bar */}
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-xl border border-bg-border bg-white/90 p-1.5 backdrop-blur-md shadow-md">
        {/* Preset Templates Dropdown */}
        <select
          onChange={(e) => e.target.value && loadPresetTemplate(e.target.value)}
          defaultValue=""
          className="h-8 rounded-lg border border-bg-border bg-white px-2 text-[12px] font-semibold text-text-primary outline-none hover:border-accent-blue transition-colors cursor-pointer"
        >
          <option value="" disabled>✨ Preset Quant Templates</option>
          <option value="golden_cross">Binance 50/200 Golden Cross</option>
          <option value="rsi_oversold">ETH Volatility RSI Scalper</option>
          <option value="futures_grid">Binance Futures Grid Step Bot</option>
        </select>

        <div className="h-4 w-px bg-bg-border mx-1" />

        {/* Undo / Redo */}
        <button
          onClick={undo}
          disabled={historyIndex <= 0}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-text-primary disabled:opacity-30 transition-colors"
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </button>

        <button
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-text-primary disabled:opacity-30 transition-colors"
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-bg-border mx-1" />

        {/* Auto Arrange */}
        <button
          onClick={handleAutoLayout}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-semibold text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors"
          title="Auto Arrange Nodes"
        >
          <LayoutGrid className="h-3.5 w-3.5 text-accent-blue" />
          <span>Auto Layout</span>
        </button>

        {/* Clear Canvas */}
        <button
          onClick={clearCanvas}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-semibold text-accent-red hover:bg-accent-red/10 transition-colors"
          title="Clear Canvas"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Clear</span>
        </button>
      </div>

      {/* Graph Validation Health Pill */}
      <div className="absolute right-4 top-4 z-10">
        {validation.isValid ? (
          <div className="flex items-center gap-2 rounded-xl border border-accent-green/30 bg-accent-green/10 px-3 py-1.5 text-[12px] font-bold text-accent-green backdrop-blur-md shadow-sm">
            <CheckCircle2 className="h-4 w-4" />
            <span>Graph Health: Valid for Binance Live</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[12px] font-bold text-amber-500 backdrop-blur-md shadow-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>{validation.errors[0] || validation.warnings[0]}</span>
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
        <Background color="#CBD5E1" variant={"dots" as any} gap={24} size={2} />
        <Controls 
          className="bg-white border border-bg-border rounded-md shadow-sm overflow-hidden fill-text-secondary"
          showInteractive={false}
        />
        <MiniMap 
          nodeColor="#3B82F6" 
          maskColor="rgba(7,10,13,0.8)" 
          style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-bg-border)', borderRadius: '8px' }} 
        />
      </ReactFlow>
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
