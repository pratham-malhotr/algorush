import * as React from "react"
import ReactFlow, { Background, Controls, Edge, Node, ReactFlowProvider, MiniMap, NodeMouseHandler } from "reactflow"
import "reactflow/dist/style.css"
import { useBuilderStore } from "@/store/useBuilderStore"
import { TriggerNode } from "./nodes/TriggerNode"
import { ConditionNode } from "./nodes/ConditionNode"
import { ExecuteNode } from "./nodes/ExecuteNode"
import { RiskNode } from "./nodes/RiskNode"

const nodeTypes = {
  triggerNode: TriggerNode,
  conditionNode: ConditionNode,
  executeNode: ExecuteNode,
  riskNode: RiskNode,
}

function CanvasFlow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setNodes, setSelectedNodeId } = useBuilderStore()
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
  );

  const onPaneClick = React.useCallback(
    () => setSelectedNodeId(null),
    [setSelectedNodeId]
  );

  const defaultEdgeOptions = React.useMemo(() => ({
    animated: true, 
    style: { stroke: '#3B82F6', strokeWidth: 2, filter: 'drop-shadow(0 0 5px rgba(59,130,246,0.6))' } 
  }), [])

  return (
    <div className="flex-1 h-full w-full bg-[#F8FAFC]" ref={reactFlowWrapper}>
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
