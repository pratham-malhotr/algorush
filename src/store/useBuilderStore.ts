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
  timeframe: string
  allocation: number
  maxPerTrade: number
  selectedNodeId: string | null
  isBacktestDrawerOpen: boolean
  isBacktesting: boolean
  backtestResult: BacktestResult | null
  chatHistory: ChatMessage[]
  isAnimatingBuild: boolean
  
  // Undo/Redo stack
  history: { nodes: Node[]; edges: Edge[] }[]
  historyIndex: number
  undo: () => void
  redo: () => void

  workspaceMode: 'canvas' | 'scratchpad' | 'code'
  setWorkspaceMode: (mode: 'canvas' | 'scratchpad' | 'code') => void
  isOptimizerModalOpen: boolean
  setIsOptimizerModalOpen: (isOpen: boolean) => void
  autoLayoutNodes: () => void

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
  setIsAnimatingBuild: (isAnimating: boolean) => void

  setStrategyName: (name: string) => void
  setStrategyStatus: (status: StrategyStatus) => void
  setExchange: (exchange: string) => void
  setTradingPair: (pair: string) => void
  setTimeframe: (tf: string) => void
  setAllocation: (allocation: number) => void
  setMaxPerTrade: (max: number) => void
  
  setIsBacktestDrawerOpen: (isOpen: boolean) => void
  setBacktestResult: (result: BacktestResult | null) => void
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
  strategyDSL: {
    name: 'Binance Golden Cross Bot',
    description: 'Quant strategy compiled by AlgoText Engine',
    instruments: [{ symbol: 'BTC/USDT', assetClass: 'CRYPTO' }],
    timeframe: '1h',
    entryConditions: [{
      id: 'entry-1',
      left: { type: 'EMA', parameters: { period: 50 } },
      comparator: 'CROSSES_ABOVE',
      right: { type: 'EMA', parameters: { period: 200 } },
      logicalOperator: 'AND'
    }],
    exitConditions: [],
    action: { type: 'BUY', orderType: 'MARKET', quantityType: 'PERCENT_OF_ACCOUNT', quantityValue: 50 },
    riskParameters: { stopLossPercentage: 3, takeProfitPercentage: 6, riskPerTradePct: 1.5 }
  },
  strategyName: 'Binance Golden Cross Bot',
  strategyStatus: 'Draft',
  exchange: 'Binance',
  tradingPair: 'BTC/USDT',
  timeframe: '1h',
  allocation: 50,
  maxPerTrade: 10,
  selectedNodeId: null,
  isBacktestDrawerOpen: false,
  isBacktesting: false,
  backtestResult: null,
  chatHistory: [{ role: 'assistant', content: "Hi! I'm your AI Quant Copilot. Write your trading strategy below in natural language (e.g. 'Go short BTC when 50 EMA crosses below 200 EMA and MACD histogram < 0, exit when RSI < 30 or 3% trailing stop, 5x leverage'), and I'll generate your visual algorithm, compile execution code, and run backtests." }],
  isAnimatingBuild: false,
  workspaceMode: 'canvas',
  setWorkspaceMode: (mode) => set({ workspaceMode: mode }),
  isOptimizerModalOpen: false,
  setIsOptimizerModalOpen: (isOpen) => set({ isOptimizerModalOpen: isOpen }),
  
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

  setIsAnimatingBuild: (isAnimating) => set({ isAnimatingBuild: isAnimating }),

  compileGraphToDSL: () => {
    // Skip compilation during animated node builds to prevent incomplete DSL
    if (get().isAnimatingBuild) return;
    
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
      entryConditions: entryConditions.length > 0 ? entryConditions : (nodes.some(n => n.type === 'conditionNode') ? [] : [{
        id: 'default-entry',
        left: { type: 'EMA', parameters: { period: 50 } },
        comparator: 'CROSSES_ABOVE',
        right: { type: 'EMA', parameters: { period: 200 } },
        logicalOperator: 'AND'
      }]),
      exitConditions: exitConditions,
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
    } else if (templateId === "futures_grid" || templateId === "volatility_grid") {
      name = "Binance Futures Dynamic Volatility Grid"
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
    } else if (templateId === "triple_ema") {
      name = "Triple EMA Trend Confirmation + Volatility Guard"
      pair = "BTC/USDT"
      presetNodes = [
        { id: 'start', type: 'triggerNode', position: { x: 250, y: 40 }, data: { label: 'Strategy Start' } },
        { id: 'entry-ema-fast', type: 'conditionNode', position: { x: 120, y: 160 }, data: { category: 'ENTRY CONDITIONS', label: 'EMA 20 > EMA 50', dslCondition: { left: { type: 'EMA', parameters: { period: 20 } }, comparator: 'GREATER_THAN', right: { type: 'EMA', parameters: { period: 50 } }, logicalOperator: 'AND' } } },
        { id: 'entry-ema-slow', type: 'conditionNode', position: { x: 380, y: 160 }, data: { category: 'ENTRY CONDITIONS', label: 'EMA 50 > EMA 200', dslCondition: { left: { type: 'EMA', parameters: { period: 50 } }, comparator: 'GREATER_THAN', right: { type: 'EMA', parameters: { period: 200 } }, logicalOperator: 'AND' } } },
        { id: 'entry-rsi-filter', type: 'conditionNode', position: { x: 250, y: 280 }, data: { category: 'ENTRY CONDITIONS', label: 'RSI Filter (45 - 68)', dslCondition: { left: { type: 'RSI', parameters: { period: 14 } }, comparator: 'GREATER_THAN', right: 45, logicalOperator: 'AND' } } },
        { id: 'exec-buy', type: 'executeNode', position: { x: 250, y: 400 }, data: { label: 'Buy Long (35% Position)', dslAction: { type: 'BUY', orderType: 'MARKET', quantityType: 'PERCENT_OF_ACCOUNT', quantityValue: 35 } } },
        { id: 'risk-atr', type: 'riskNode', position: { x: 250, y: 520 }, data: { label: 'Dynamic ATR Trailing Bracket', dslRisk: { stopLossPercentage: 2.2, takeProfitPercentage: 6.5, trailingStopPercentage: 1.8 } } },
      ]
      presetEdges = [
        { id: 'e1', source: 'start', target: 'entry-ema-fast', animated: true },
        { id: 'e2', source: 'start', target: 'entry-ema-slow', animated: true },
        { id: 'e3', source: 'entry-ema-fast', target: 'entry-rsi-filter', animated: true },
        { id: 'e4', source: 'entry-ema-slow', target: 'entry-rsi-filter', animated: true },
        { id: 'e5', source: 'entry-rsi-filter', target: 'exec-buy', animated: true },
        { id: 'e6', source: 'exec-buy', target: 'risk-atr', animated: true },
      ]
    } else if (templateId === "bollinger_squeeze") {
      name = "Bollinger Squeeze Mean Reversion with ATR Stop"
      pair = "ETH/USDT"
      presetNodes = [
        { id: 'start', type: 'triggerNode', position: { x: 250, y: 40 }, data: { label: 'Strategy Start' } },
        { id: 'entry-bb-lower', type: 'conditionNode', position: { x: 250, y: 160 }, data: { category: 'ENTRY CONDITIONS', label: 'Price Pierces Lower BB', dslCondition: { left: { type: 'PRICE' }, comparator: 'LESS_THAN', right: { type: 'BOLLINGER_LOWER', parameters: { period: 20, multiplier: 2.0 } }, logicalOperator: 'AND' } } },
        { id: 'entry-rsi-oversold', type: 'conditionNode', position: { x: 250, y: 280 }, data: { category: 'ENTRY CONDITIONS', label: 'RSI < 30 Confirmation', dslCondition: { left: { type: 'RSI', parameters: { period: 14 } }, comparator: 'LESS_THAN', right: 30, logicalOperator: 'AND' } } },
        { id: 'exec-long', type: 'executeNode', position: { x: 250, y: 400 }, data: { label: 'Buy Long (40% Equity)', dslAction: { type: 'BUY', orderType: 'LIMIT', quantityType: 'PERCENT_OF_ACCOUNT', quantityValue: 40 } } },
        { id: 'risk-bracket', type: 'riskNode', position: { x: 250, y: 520 }, data: { label: 'ATR Risk Stop (2.0% / 5.5%)', dslRisk: { stopLossPercentage: 2.0, takeProfitPercentage: 5.5, trailingStopPercentage: 1.5 } } },
      ]
      presetEdges = [
        { id: 'e1', source: 'start', target: 'entry-bb-lower', animated: true },
        { id: 'e2', source: 'entry-bb-lower', target: 'entry-rsi-oversold', animated: true },
        { id: 'e3', source: 'entry-rsi-oversold', target: 'exec-long', animated: true },
        { id: 'e4', source: 'exec-long', target: 'risk-bracket', animated: true },
      ]
    } else if (templateId === "basis_arbitrage") {
      name = "Spot-Futures Basis Funding Rate Arbitrage"
      pair = "SOL/USDT"
      presetNodes = [
        { id: 'start', type: 'triggerNode', position: { x: 250, y: 40 }, data: { label: 'Hourly Funding Check' } },
        { id: 'entry-funding', type: 'conditionNode', position: { x: 250, y: 160 }, data: { category: 'ENTRY CONDITIONS', label: 'Perpetual Funding Rate > 0.035%', dslCondition: { left: { type: 'FUNDING_RATE' }, comparator: 'GREATER_THAN', right: 0.00035, logicalOperator: 'AND' } } },
        { id: 'exec-arb', type: 'executeNode', position: { x: 250, y: 280 }, data: { label: 'Delta-Neutral 1x Cash & Carry', dslAction: { type: 'BUY', orderType: 'MARKET', quantityType: 'PERCENT_OF_ACCOUNT', quantityValue: 50 } } },
        { id: 'risk-arb', type: 'riskNode', position: { x: 250, y: 400 }, data: { label: 'Delta Tolerance Guard (0.01)', dslRisk: { stopLossPercentage: 1.0, takeProfitPercentage: 10.0 } } },
      ]
      presetEdges = [
        { id: 'e1', source: 'start', target: 'entry-funding', animated: true },
        { id: 'e2', source: 'entry-funding', target: 'exec-arb', animated: true },
        { id: 'e3', source: 'exec-arb', target: 'risk-arb', animated: true },
      ]
    } else if (templateId === "order_flow") {
      name = "High-Frequency Order Flow Imbalance Scalper"
      pair = "BTC/USDT"
      presetNodes = [
        { id: 'start', type: 'triggerNode', position: { x: 250, y: 40 }, data: { label: 'Tick Stream Scanner' } },
        { id: 'entry-imbalance', type: 'conditionNode', position: { x: 250, y: 160 }, data: { category: 'ENTRY CONDITIONS', label: 'Bid/Ask Imbalance Ratio > 1.8', dslCondition: { left: { type: 'ORDERBOOK_IMBALANCE' }, comparator: 'GREATER_THAN', right: 1.8, logicalOperator: 'AND' } } },
        { id: 'exec-snap', type: 'executeNode', position: { x: 250, y: 280 }, data: { label: 'Taker Fill Long (20% Account)', dslAction: { type: 'BUY', orderType: 'MARKET', quantityType: 'PERCENT_OF_ACCOUNT', quantityValue: 20 } } },
        { id: 'risk-micro', type: 'riskNode', position: { x: 250, y: 400 }, data: { label: 'Ultra-Tight Scalp (0.8% SL / 1.6% TP)', dslRisk: { stopLossPercentage: 0.8, takeProfitPercentage: 1.6 } } },
      ]
      presetEdges = [
        { id: 'e1', source: 'start', target: 'entry-imbalance', animated: true },
        { id: 'e2', source: 'entry-imbalance', target: 'exec-snap', animated: true },
        { id: 'e3', source: 'exec-snap', target: 'risk-micro', animated: true },
      ]
    } else if (templateId === "pairs_trading") {
      name = "Statistical Pairs Cointegration Alpha (BTC/ETH)"
      pair = "ETH/USDT"
      presetNodes = [
        { id: 'start', type: 'triggerNode', position: { x: 250, y: 40 }, data: { label: '15m Spread Monitor' } },
        { id: 'entry-zscore', type: 'conditionNode', position: { x: 250, y: 160 }, data: { category: 'ENTRY CONDITIONS', label: 'Z-Score Spread < -2.10', dslCondition: { left: { type: 'PRICE' }, comparator: 'LESS_THAN', right: 0.052, logicalOperator: 'AND' } } },
        { id: 'exec-pair', type: 'executeNode', position: { x: 250, y: 280 }, data: { label: 'Long Spread (Hedge Ratio 1.42)', dslAction: { type: 'BUY', orderType: 'LIMIT', quantityType: 'PERCENT_OF_ACCOUNT', quantityValue: 30 } } },
        { id: 'risk-pair', type: 'riskNode', position: { x: 250, y: 400 }, data: { label: 'Cointegration Break Guard', dslRisk: { stopLossPercentage: 2.5, takeProfitPercentage: 5.0 } } },
      ]
      presetEdges = [
        { id: 'e1', source: 'start', target: 'entry-zscore', animated: true },
        { id: 'e2', source: 'entry-zscore', target: 'exec-pair', animated: true },
        { id: 'e3', source: 'exec-pair', target: 'risk-pair', animated: true },
      ]
    }

    set({
      strategyName: name,
      tradingPair: pair,
      nodes: presetNodes,
      edges: presetEdges,
      history: [{ nodes: presetNodes, edges: presetEdges }],
      historyIndex: 0,
      backtestResult: null,
    })
    get().compileGraphToDSL()
    const data = generateMockData(90)
    const freshResult = runLocalBacktest(get().strategyDSL, data)
    set({ backtestResult: freshResult })
    toast.success(`Loaded institutional preset: ${name}`)
  },

  autoLayoutNodes: () => {
    const { nodes } = get()
    const triggers = nodes.filter(n => n.type === 'triggerNode')
    const entries = nodes.filter(n => n.type === 'conditionNode' && n.data?.category !== 'EXIT CONDITIONS')
    const execs = nodes.filter(n => n.type === 'executeNode')
    const exits = nodes.filter(n => n.type === 'conditionNode' && n.data?.category === 'EXIT CONDITIONS')
    const risks = nodes.filter(n => n.type === 'riskNode')
    const others = nodes.filter(n => !['triggerNode', 'conditionNode', 'executeNode', 'riskNode'].includes(n.type || ''))

    const layers = [triggers, entries, execs, exits, risks, others].filter(l => l.length > 0)

    const layoutedNodes = nodes.map(node => {
      const layerIdx = layers.findIndex(layer => layer.some(n => n.id === node.id))
      const layer = layers[layerIdx] || [node]
      const nodeIdx = layer.findIndex(n => n.id === node.id)
      const totalInLayer = layer.length
      const spacingX = 260
      const startX = 280 - ((totalInLayer - 1) * spacingX) / 2
      const x = Math.round(startX + nodeIdx * spacingX)
      const y = Math.round(50 + layerIdx * 135)

      return {
        ...node,
        position: { x, y }
      }
    })

    set({ nodes: layoutedNodes })
    toast.success("✨ Nodes aligned hierarchically in DAG layout!")
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
      backtestResult: null,
    })
    get().compileGraphToDSL()
    toast.info("Canvas cleared")
  },
  
  setStrategyName: (name) => set({ strategyName: name }),
  setStrategyStatus: (status) => set({ strategyStatus: status }),
  setExchange: (exchange) => set({ exchange }),
  setTradingPair: (pair) => set({ tradingPair: pair }),
  setTimeframe: (tf) => set({ timeframe: tf }),
  setAllocation: (allocation) => {
    set({ allocation })
    get().compileGraphToDSL()
  },
  setMaxPerTrade: (max) => set({ maxPerTrade: max }),
  
  setIsBacktestDrawerOpen: (isOpen) => set({ isBacktestDrawerOpen: isOpen }),
  setBacktestResult: (result) => set({ backtestResult: result }),
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
