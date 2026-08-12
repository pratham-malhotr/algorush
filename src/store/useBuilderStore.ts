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
  
  updateStrategy: (dsl: StrategyDSL) => void
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void
  
  setSelectedNodeId: (id: string | null) => void
  updateNodeData: (id: string, data: any) => void
  compileGraphToDSL: () => void
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
]

export const useBuilderStore = create<BuilderState>((set, get) => ({
  nodes: initialNodes,
  edges: [],
  strategyDSL: null,
  strategyName: 'My Strategy #1',
  strategyStatus: 'Draft',
  exchange: 'Binance',
  tradingPair: 'BTC/USDT',
  allocation: 50,
  maxPerTrade: 10,
  selectedNodeId: null,
  isBacktestDrawerOpen: false,
  isBacktesting: false,
  backtestResult: null,
  chatHistory: [{ role: 'assistant', content: "Hi, I'm your AI Quant. Tell me what kind of strategy you want to build." }],

  updateStrategy: (dsl: StrategyDSL) => set({ strategyDSL: dsl }),

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
    get().compileGraphToDSL();
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
    get().compileGraphToDSL();
  },
  onConnect: (connection: Connection) => {
    if (connection.source === connection.target) {
      toast.error("Cannot connect a node to itself");
      return;
    }
    const targetNode = get().nodes.find(n => n.id === connection.target);
    if (targetNode?.type === 'triggerNode') {
      toast.error("Cannot connect into a Start node");
      return;
    }
    
    set({
      edges: addEdge({ ...connection, animated: true }, get().edges),
    });
    get().compileGraphToDSL();
  },
  setNodes: (update) => {
    set((state) => ({ nodes: typeof update === 'function' ? update(state.nodes) : update }));
    get().compileGraphToDSL();
  },
  setEdges: (update) => {
    set((state) => ({ edges: typeof update === 'function' ? update(state.edges) : update }));
    get().compileGraphToDSL();
  },

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  updateNodeData: (id, newData) => {
    set((state) => ({
      nodes: state.nodes.map((node) => 
        node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
      )
    }));
    get().compileGraphToDSL();
  },
  
  addChatMessage: (msg) => set(state => ({ chatHistory: [...state.chatHistory, msg] })),

  compileGraphToDSL: () => {
    const { nodes, edges, strategyName, tradingPair, allocation } = get();
    
    const entryConditions: any[] = [];
    const exitConditions: any[] = [];
    let action: any = { type: 'BUY', quantityType: 'PERCENT_OF_ACCOUNT', quantityValue: allocation };
    let riskParams: any = { stopLossPercentage: 3, takeProfitPercentage: 6 };

    // Traverse graph from trigger nodes or process all connected nodes
    const reachableNodeIds = new Set<string>();
    const queue = nodes.filter(n => n.type === 'triggerNode').map(n => n.id);
    
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (!reachableNodeIds.has(currentId)) {
        reachableNodeIds.add(currentId);
        const outgoing = edges.filter(e => e.source === currentId).map(e => e.target);
        queue.push(...outgoing);
      }
    }

    // Include all reachable nodes, or all nodes if no trigger node exists
    const targetNodes = reachableNodeIds.size > 0 ? nodes.filter(n => reachableNodeIds.has(n.id)) : nodes;

    targetNodes.forEach(node => {
      if (node.type === 'conditionNode' && node.data.dslCondition) {
        const condition = { ...node.data.dslCondition, id: node.id };
        if (node.data.category === 'EXIT CONDITIONS') {
          exitConditions.push(condition);
        } else {
          entryConditions.push(condition);
        }
      }
      if (node.type === 'executeNode' && node.data.dslAction) {
        if (node.data.dslAction.type !== 'CLOSE_POSITION') {
           action = { ...node.data.dslAction };
           action.quantityType = 'PERCENT_OF_ACCOUNT';
           if (!action.quantityValue) {
              action.quantityValue = allocation;
           }
        } else {
           action = { type: 'CLOSE_POSITION' };
        }
      }
      if (node.type === 'riskNode' && node.data.dslRisk) {
        riskParams = { ...riskParams, ...node.data.dslRisk };
      }
    });

    const newDsl: StrategyDSL = {
      name: strategyName,
      description: 'Quant strategy created in Algorush Builder',
      instruments: [{ symbol: tradingPair, assetClass: tradingPair.includes('/') ? 'CRYPTO' : 'EQUITY' }],
      entryConditions: entryConditions.length > 0 ? entryConditions : [{
        id: 'default',
        left: { type: 'RSI', parameters: { period: 14 } },
        comparator: 'LESS_THAN',
        right: 35,
        logicalOperator: 'AND'
      }],
      exitConditions: exitConditions.length > 0 ? exitConditions : [{
        id: 'exit-default',
        left: { type: 'RSI', parameters: { period: 14 } },
        comparator: 'GREATER_THAN',
        right: 70,
        logicalOperator: 'OR'
      }],
      action,
      riskParameters: riskParams
    };

    set({ strategyDSL: newDsl });
  },
  
  setStrategyName: (name) => set({ strategyName: name }),
  setStrategyStatus: (status) => set({ strategyStatus: status }),
  setExchange: (exchange) => set({ exchange }),
  setTradingPair: (pair) => set({ tradingPair: pair }),
  setAllocation: (allocation) => {
    set({ allocation });
    get().compileGraphToDSL();
  },
  setMaxPerTrade: (max) => set({ maxPerTrade: max }),
  
  setIsBacktestDrawerOpen: (isOpen) => set({ isBacktestDrawerOpen: isOpen }),
  runBacktest: () => {
    set({ isBacktesting: true })
    
    // Simulate API delay and run engine
    setTimeout(() => {
      const data = generateMockData(90)
      const result = runLocalBacktest(get().strategyDSL, data) 
      
      set({ 
        isBacktesting: false, 
        isBacktestDrawerOpen: true,
        backtestResult: result
      })
      toast.success("Backtest completed successfully!");
    }, 1500)
  }
}))
