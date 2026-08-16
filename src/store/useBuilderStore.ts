import { create } from 'zustand'
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow'
import { BacktestResult, generateMockData, runLocalBacktest } from '@/lib/backtester/engine'
import { StrategyDSL } from '@/lib/types/strategy'
import { toast } from 'sonner'

export type StrategyStatus = "Draft" | "Live" | "Paused"

export type ChatMessage = { role: 'user' | 'assistant', content: string };

export interface GraphValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
}

interface BuilderState {
  nodes: Node[]
  edges: Edge[]
  strategyDSL: StrategyDSL | null
  strategyName: string
  strategyStatus: StrategyStatus
  exchange: string
  tradingPair: string
  allocation: number
  maxPerTrade: number
  selectedNodeId: string | null
  isBacktestDrawerOpen: boolean
  isBacktesting: boolean
  backtestResult: BacktestResult | null
  chatHistory: ChatMessage[]
  
  // Undo/Redo stack
  history: { nodes: Node[]; edges: Edge[] }[]
  historyIndex: number
  undo: () => void
  redo: () => void

  updateStrategy: (dsl: StrategyDSL) => void
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void
  
  setSelectedNodeId: (id: string | null) => void
  updateNodeData: (id: string, data: any) => void
  compileGraphToDSL: () => void
  validateGraph: () => GraphValidationResult
  loadPresetTemplate: (templateId: string) => void
  clearCanvas: () => void
  addChatMessage: (msg: ChatMessage) => void

  setStrategyName: (name: string) => void
  setStrategyStatus: (status: StrategyStatus) => void
  setExchange: (exchange: string) => void
  setTradingPair: (pair: string) => void
  setAllocation: (allocation: number) => void
  setMaxPerTrade: (max: number) => void
  
  setIsBacktestDrawerOpen: (isOpen: boolean) => void
  runBacktest: () => void
}

const initialNodes: Node[] = [
  {
    id: 'start-1',
    type: 'triggerNode',
    position: { x: 250, y: 50 },
    data: { label: 'Strategy Start' },
  },
  {
    id: 'entry-1',
    type: 'conditionNode',
    position: { x: 250, y: 170 },
    data: { 
      category: 'ENTRY CONDITIONS', 
      label: '50/200 Golden Cross', 
      dslCondition: { left: { type: 'EMA', parameters: { period: 50 } }, comparator: 'CROSSES_ABOVE', right: { type: 'EMA', parameters: { period: 200 } }, logicalOperator: 'AND' } 
    },
  },
  {
    id: 'exec-1',
    type: 'executeNode',
    position: { x: 250, y: 290 },
    data: { 
      label: 'Buy 50% Position', 
      dslAction: { type: 'BUY', orderType: 'MARKET', quantityType: 'PERCENT_OF_ACCOUNT', quantityValue: 50 } 
    },
  },
  {
    id: 'risk-1',
    type: 'riskNode',
    position: { x: 250, y: 410 },
    data: { 
      label: 'Risk & SL/TP Bracket', 
      dslRisk: { stopLossPercentage: 3, takeProfitPercentage: 6, riskPerTradePct: 1.5 } 
    },
  }
]

const initialEdges: Edge[] = [
  { id: 'e-start-entry', source: 'start-1', target: 'entry-1', animated: true },
  { id: 'e-entry-exec', source: 'entry-1', target: 'exec-1', animated: true },
  { id: 'e-exec-risk', source: 'exec-1', target: 'risk-1', animated: true },
]

export const useBuilderStore = create<BuilderState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  strategyDSL: null,
  strategyName: 'Binance Golden Cross Bot',
  strategyStatus: 'Draft',
  exchange: 'Binance',
  tradingPair: 'BTC/USDT',
  allocation: 50,
  maxPerTrade: 10,
  selectedNodeId: null,
  isBacktestDrawerOpen: false,
  isBacktesting: false,
  backtestResult: null,
  chatHistory: [{ role: 'assistant', content: "Hi! I'm your AI Quant Copilot. I can build, optimize, and test quantitative strategies for Binance and crypto exchanges." }],
  
  history: [{ nodes: initialNodes, edges: initialEdges }],
  historyIndex: 0,

  undo: () => {
    const { history, historyIndex } = get()
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1]
      set({ nodes: prev.nodes, edges: prev.edges, historyIndex: historyIndex - 1 })
      get().compileGraphToDSL()
      toast.info("Undo action")
    }
  },

  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1]
      set({ nodes: next.nodes, edges: next.edges, historyIndex: historyIndex + 1 })
      get().compileGraphToDSL()
      toast.info("Redo action")
    }
  },

  updateStrategy: (dsl: StrategyDSL) => set({ strategyDSL: dsl }),

  onNodesChange: (changes: NodeChange[]) => {
    const newNodes = applyNodeChanges(changes, get().nodes)
    set({ nodes: newNodes })
    get().compileGraphToDSL()
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    const newEdges = applyEdgeChanges(changes, get().edges)
    set({ edges: newEdges })
    get().compileGraphToDSL()
  },

  onConnect: (connection: Connection) => {
    if (connection.source === connection.target) {
      toast.error("Cannot connect a node to itself")
      return
    }
    const targetNode = get().nodes.find(n => n.id === connection.target)
    if (targetNode?.type === 'triggerNode') {
      toast.error("Cannot connect into a Start node")
      return
    }
    
    const newEdges = addEdge({ ...connection, animated: true }, get().edges)
    set((state) => ({
      edges: newEdges,
      history: [...state.history.slice(0, state.historyIndex + 1), { nodes: state.nodes, edges: newEdges }],
      historyIndex: state.historyIndex + 1,
    }))
    get().compileGraphToDSL()
  },

  setNodes: (update) => {
    set((state) => {
      const newNodes = typeof update === 'function' ? update(state.nodes) : update
      return {
        nodes: newNodes,
        history: [...state.history.slice(0, state.historyIndex + 1), { nodes: newNodes, edges: state.edges }],
        historyIndex: state.historyIndex + 1,
      }
    })
    get().compileGraphToDSL()
  },

  setEdges: (update) => {
    set((state) => {
      const newEdges = typeof update === 'function' ? update(state.edges) : update
      return {
        edges: newEdges,
        history: [...state.history.slice(0, state.historyIndex + 1), { nodes: state.nodes, edges: newEdges }],
        historyIndex: state.historyIndex + 1,
      }
    })
    get().compileGraphToDSL()
  },

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  updateNodeData: (id, newData) => {
    set((state) => ({
      nodes: state.nodes.map((node) => 
        node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
      )
    }))
    get().compileGraphToDSL()
  },
  
  addChatMessage: (msg) => set(state => ({ chatHistory: [...state.chatHistory, msg] })),

  validateGraph: (): GraphValidationResult => {
    const { nodes, edges } = get()
    const warnings: string[] = []
    const errors: string[] = []

    const triggerNode = nodes.find(n => n.type === 'triggerNode')
    if (!triggerNode) {
      errors.push("Missing Strategy Start trigger node.")
    }

    const conditionNodes = nodes.filter(n => n.type === 'conditionNode')
    if (conditionNodes.length === 0) {
      warnings.push("No entry/exit condition blocks connected. Strategy will use default triggers.")
    }

    const executeNodes = nodes.filter(n => n.type === 'executeNode')
    if (executeNodes.length === 0) {
      errors.push("Missing Execution node (BUY / SELL action required).")
    }

    // Check for unconnected nodes
    nodes.forEach(n => {
      if (n.type !== 'triggerNode') {
        const isConnected = edges.some(e => e.source === n.id || e.target === n.id)
        if (!isConnected) {
          warnings.push(`Node '${n.data.label || n.id}' is unconnected.`)
        }
      }
    })

    const riskNodes = nodes.filter(n => n.type === 'riskNode')
    if (riskNodes.length === 0) {
      warnings.push("No explicit Risk Management node found. Recommending Stop Loss/Take Profit bracket.")
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
    }
  },

  compileGraphToDSL: () => {
    const { nodes, edges, strategyName, tradingPair, allocation } = get()
    
    const entryConditions: any[] = []
    const exitConditions: any[] = []
    let action: any = { type: 'BUY', quantityType: 'PERCENT_OF_ACCOUNT', quantityValue: allocation }
    let riskParams: any = { stopLossPercentage: 3, takeProfitPercentage: 6, riskPerTradePct: 1 }

    // Traverse graph from trigger nodes or process all connected nodes
    const reachableNodeIds = new Set<string>()
    const queue = nodes.filter(n => n.type === 'triggerNode').map(n => n.id)
    
    while (queue.length > 0) {
      const currentId = queue.shift()!
      if (!reachableNodeIds.has(currentId)) {
        reachableNodeIds.add(currentId)
        const outgoing = edges.filter(e => e.source === currentId).map(e => e.target)
        queue.push(...outgoing)
      }
    }

    const targetNodes = reachableNodeIds.size > 0 ? nodes.filter(n => reachableNodeIds.has(n.id)) : nodes

    targetNodes.forEach(node => {
      if (node.type === 'conditionNode' && node.data.dslCondition) {
        const condition = { ...node.data.dslCondition, id: node.id }
        if (node.data.category === 'EXIT CONDITIONS') {
          exitConditions.push(condition)
        } else {
          entryConditions.push(condition)
        }
      }
      if (node.type === 'executeNode' && node.data.dslAction) {
        if (node.data.dslAction.type !== 'CLOSE_POSITION') {
           action = { ...node.data.dslAction }
           if (!action.quantityValue) {
              action.quantityValue = allocation
           }
        } else {
           action = { type: 'CLOSE_POSITION' }
        }
      }
      if (node.type === 'riskNode' && node.data.dslRisk) {
        riskParams = { ...riskParams, ...node.data.dslRisk }
      }
    })

    const newDsl: StrategyDSL = {
      name: strategyName,
      description: 'Quant strategy compiled by AlgoText Engine',
      instruments: [{ symbol: tradingPair, assetClass: tradingPair.includes('/') ? 'CRYPTO' : 'EQUITY' }],
      entryConditions: entryConditions.length > 0 ? entryConditions : [{
        id: 'default-entry',
        left: { type: 'EMA', parameters: { period: 50 } },
        comparator: 'CROSSES_ABOVE',
        right: { type: 'EMA', parameters: { period: 200 } },
        logicalOperator: 'AND'
      }],
      exitConditions: exitConditions.length > 0 ? exitConditions : [{
        id: 'default-exit',
        left: { type: 'RSI', parameters: { period: 14 } },
        comparator: 'GREATER_THAN',
        right: 70,
        logicalOperator: 'OR'
      }],
      action,
      riskParameters: riskParams
    }

    set({ strategyDSL: newDsl })
  },

  loadPresetTemplate: (templateId: string) => {
    let presetNodes: Node[] = []
    let presetEdges: Edge[] = []
    let name = "Custom Strategy"
    let pair = "BTC/USDT"

    if (templateId === "golden_cross") {
      name = "Binance Futures Golden Cross (50/200 EMA)"
      pair = "BTC/USDT"
      presetNodes = [
        { id: 'start', type: 'triggerNode', position: { x: 250, y: 40 }, data: { label: 'Strategy Start' } },
        { id: 'entry-ema', type: 'conditionNode', position: { x: 250, y: 160 }, data: { category: 'ENTRY CONDITIONS', label: 'EMA Golden Cross', dslCondition: { left: { type: 'EMA', timeframe: '1h', parameters: { period: 50 } }, comparator: 'CROSSES_ABOVE', right: { type: 'EMA', timeframe: '1h', parameters: { period: 200 } }, logicalOperator: 'AND' } } },
        { id: 'exec-buy', type: 'executeNode', position: { x: 250, y: 280 }, data: { label: 'Buy Long (50% Account)', dslAction: { type: 'BUY', orderType: 'MARKET', quantityType: 'PERCENT_OF_ACCOUNT', quantityValue: 50 } } },
        { id: 'exit-rsi', type: 'conditionNode', position: { x: 250, y: 400 }, data: { category: 'EXIT CONDITIONS', label: 'Exit RSI Overbought (>75)', dslCondition: { left: { type: 'RSI', parameters: { period: 14 } }, comparator: 'GREATER_THAN', right: 75, logicalOperator: 'OR' } } },
        { id: 'risk-guard', type: 'riskNode', position: { x: 250, y: 520 }, data: { label: 'Risk Guard (3% SL / 6% TP)', dslRisk: { stopLossPercentage: 3.0, takeProfitPercentage: 6.0, trailingStopPercentage: 1.5 } } },
      ]
      presetEdges = [
        { id: 'e1', source: 'start', target: 'entry-ema', animated: true },
        { id: 'e2', source: 'entry-ema', target: 'exec-buy', animated: true },
        { id: 'e3', source: 'exec-buy', target: 'exit-rsi', animated: true },
        { id: 'e4', source: 'exit-rsi', target: 'risk-guard', animated: true },
      ]
    } else if (templateId === "rsi_oversold") {
      name = "ETH Volatility RSI Reversion Scalper"
      pair = "ETH/USDT"
      presetNodes = [
        { id: 'start', type: 'triggerNode', position: { x: 250, y: 40 }, data: { label: 'Strategy Start' } },
        { id: 'entry-rsi', type: 'conditionNode', position: { x: 250, y: 160 }, data: { category: 'ENTRY CONDITIONS', label: 'RSI Oversold (<28)', dslCondition: { left: { type: 'RSI', timeframe: '5m', parameters: { period: 14 } }, comparator: 'LESS_THAN', right: 28, logicalOperator: 'AND' } } },
        { id: 'exec-buy', type: 'executeNode', position: { x: 250, y: 280 }, data: { label: 'Buy (Half-Kelly Sizing)', dslAction: { type: 'BUY', orderType: 'MARKET', quantityType: 'KELLY_CRITERION', quantityValue: 0.5 } } },
        { id: 'risk-tight', type: 'riskNode', position: { x: 250, y: 400 }, data: { label: 'Tight SL (1.5%) / TP (4.0%)', dslRisk: { stopLossPercentage: 1.5, takeProfitPercentage: 4.0 } } },
      ]
      presetEdges = [
        { id: 'e1', source: 'start', target: 'entry-rsi', animated: true },
        { id: 'e2', source: 'entry-rsi', target: 'exec-buy', animated: true },
        { id: 'e3', source: 'exec-buy', target: 'risk-tight', animated: true },
      ]
    } else if (templateId === "futures_grid") {
      name = "Binance Futures Grid Step Strategy"
      pair = "SOL/USDT"
      presetNodes = [
        { id: 'start', type: 'triggerNode', position: { x: 250, y: 40 }, data: { label: 'Strategy Start' } },
        { id: 'entry-bollinger', type: 'conditionNode', position: { x: 250, y: 160 }, data: { category: 'ENTRY CONDITIONS', label: 'Lower BB Breakout', dslCondition: { left: { type: 'PRICE' }, comparator: 'LESS_THAN', right: { type: 'BOLLINGER_LOWER', parameters: { period: 20, multiplier: 2.0 } }, logicalOperator: 'AND' } } },
        { id: 'exec-limit', type: 'executeNode', position: { x: 250, y: 280 }, data: { label: 'Grid Limit Order (25%)', dslAction: { type: 'BUY', orderType: 'LIMIT', quantityType: 'PERCENT_OF_ACCOUNT', quantityValue: 25 } } },
        { id: 'risk-grid', type: 'riskNode', position: { x: 250, y: 400 }, data: { label: 'Max Drawdown Guard (5%)', dslRisk: { stopLossPercentage: 4.0, takeProfitPercentage: 8.0, maxDailyDrawdownPct: 5.0 } } },
      ]
      presetEdges = [
        { id: 'e1', source: 'start', target: 'entry-bollinger', animated: true },
        { id: 'e2', source: 'entry-bollinger', target: 'exec-limit', animated: true },
        { id: 'e3', source: 'exec-limit', target: 'risk-grid', animated: true },
      ]
    }

    set({
      strategyName: name,
      tradingPair: pair,
      nodes: presetNodes,
      edges: presetEdges,
      history: [{ nodes: presetNodes, edges: presetEdges }],
      historyIndex: 0,
    })
    get().compileGraphToDSL()
    toast.success(`Loaded preset template: ${name}`)
  },

  clearCanvas: () => {
    const cleanNodes: Node[] = [
      { id: 'start-1', type: 'triggerNode', position: { x: 250, y: 50 }, data: { label: 'Strategy Start' } },
    ]
    set({
      nodes: cleanNodes,
      edges: [],
      history: [{ nodes: cleanNodes, edges: [] }],
      historyIndex: 0,
      selectedNodeId: null,
    })
    get().compileGraphToDSL()
    toast.info("Canvas cleared")
  },
  
  setStrategyName: (name) => set({ strategyName: name }),
  setStrategyStatus: (status) => set({ strategyStatus: status }),
  setExchange: (exchange) => set({ exchange }),
  setTradingPair: (pair) => set({ tradingPair: pair }),
  setAllocation: (allocation) => {
    set({ allocation })
    get().compileGraphToDSL()
  },
  setMaxPerTrade: (max) => set({ maxPerTrade: max }),
  
  setIsBacktestDrawerOpen: (isOpen) => set({ isBacktestDrawerOpen: isOpen }),
  runBacktest: () => {
    set({ isBacktesting: true })
    setTimeout(() => {
      const data = generateMockData(90)
      const result = runLocalBacktest(get().strategyDSL, data) 
      set({ 
        isBacktesting: false, 
        isBacktestDrawerOpen: true,
        backtestResult: result
      })
      toast.success("Quant backtest engine completed!")
    }, 1500)
  }
}))
