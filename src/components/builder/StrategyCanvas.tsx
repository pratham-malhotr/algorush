import * as React from "react"
import ReactFlow, { Background, Controls, Edge, Node, ReactFlowProvider, MiniMap } from "reactflow"
import "reactflow/dist/style.css"
import { useBuilderStore } from "@/store/useBuilderStore"
import { TriggerNode } from "./nodes/TriggerNode"
import { ConditionNode } from "./nodes/ConditionNode"
import { ExecuteNode } from "./nodes/ExecuteNode"

const nodeTypes = {
  triggerNode: TriggerNode,
  conditionNode: ConditionNode,
  executeNode: ExecuteNode,
}

function CanvasFlow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setNodes } = useBuilderStore()
  const reactFlowWrapper = React.useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = React.useState<any>(null)

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

      if (typeof type === "undefined" || !type) {
        return
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      
      const newNode: Node = {
        id: `node-${Date.now()}`,
        type,
        position,
        data: { label, category },
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [reactFlowInstance, setNodes]
  )

  const defaultEdgeOptions = React.useMemo(() => ({
    animated: true, 
    style: { stroke: '#3B82F6', strokeWidth: 2, filter: 'drop-shadow(0 0 5px rgba(59,130,246,0.6))' } 
  }), [])

  return (
    <div className="flex-1 h-full w-full bg-[#070A0D]" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        className="algorush-canvas"
        defaultEdgeOptions={defaultEdgeOptions}
      >
        <Background color="#1E2836" variant={"dots" as any} gap={24} size={2} />
        <Controls 
          className="bg-bg-surface border border-bg-border rounded-md shadow-sm overflow-hidden fill-text-secondary"
          showInteractive={false}
        />
        <MiniMap 
          nodeColor="#3B82F6" 
          maskColor="rgba(7,10,13,0.8)" 
          style={{ backgroundColor: '#0F1318', border: '1px solid #1E2836', borderRadius: '8px' }} 
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
