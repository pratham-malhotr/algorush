import * as React from "react"
import { useBuilderStore } from "@/store/useBuilderStore"

export function NodePropertiesPanel() {
  const { nodes, selectedNodeId, updateNodeData, setSelectedNodeId } = useBuilderStore()

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center text-text-tertiary">
        <p className="text-[13px]">Select a node on the canvas to configure its properties.</p>
      </div>
    );
  }

  const handleUpdate = (updates: any) => {
    updateNodeData(selectedNode.id, updates);
  }

  return (
    <div className="flex h-full w-full flex-col p-5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[16px] font-bold text-text-primary">Node Properties</h3>
        <button 
          onClick={() => setSelectedNodeId(null)}
          className="text-[12px] text-accent-blue hover:underline"
        >
          Close
        </button>
      </div>

      {selectedNode.type === 'conditionNode' && (
        <ConditionProperties data={selectedNode.data} onChange={handleUpdate} />
      )}
      {selectedNode.type === 'executeNode' && (
        <ExecuteProperties data={selectedNode.data} onChange={handleUpdate} />
      )}
      {selectedNode.type === 'riskNode' && (
        <RiskProperties data={selectedNode.data} onChange={handleUpdate} />
      )}
      {selectedNode.type === 'triggerNode' && (
        <div className="text-[13px] text-text-secondary">
          Trigger nodes run continuously on new market data.
        </div>
      )}
    </div>
  )
}

function ConditionProperties({ data, onChange }: { data: any, onChange: (data: any) => void }) {
  const dsl = data.dslCondition || { left: { type: 'PRICE' }, comparator: 'GREATER_THAN', right: 0 };
  
  const updateDSL = (path: string, value: any) => {
    const newDsl = { ...dsl };
    if (path === 'left.type') newDsl.left.type = value;
    if (path === 'left.period') {
      newDsl.left.parameters = newDsl.left.parameters || {};
      newDsl.left.parameters.period = Number(value);
    }
    if (path === 'comparator') newDsl.comparator = value;
    if (path === 'right') newDsl.right = Number(value);
    
    onChange({ dslCondition: newDsl });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] text-text-secondary font-bold">Indicator Type</label>
        <select 
          value={dsl.left.type}
          onChange={(e) => updateDSL('left.type', e.target.value)}
          className="h-9 w-full rounded border border-bg-border bg-bg-base px-2 text-[13px] text-text-primary outline-none"
        >
          <option value="PRICE">Price</option>
          <option value="RSI">RSI</option>
          <option value="MACD">MACD</option>
          <option value="SMA">SMA</option>
          <option value="EMA">EMA</option>
          <option value="BOLLINGER_BANDS">Bollinger Bands</option>
          <option value="VWAP">VWAP</option>
        </select>
      </div>

      {['RSI', 'SMA', 'EMA', 'MACD', 'BOLLINGER_BANDS'].includes(dsl.left.type) && (
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] text-text-secondary font-bold">Period</label>
          <input 
            type="number" 
            value={dsl.left.parameters?.period || 14}
            onChange={(e) => updateDSL('left.period', e.target.value)}
            className="h-9 w-full rounded border border-bg-border bg-bg-base px-2 text-[13px] text-text-primary outline-none focus:border-accent-blue"
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] text-text-secondary font-bold">Comparator</label>
        <select 
          value={dsl.comparator}
          onChange={(e) => updateDSL('comparator', e.target.value)}
          className="h-9 w-full rounded border border-bg-border bg-bg-base px-2 text-[13px] text-text-primary outline-none"
        >
          <option value="GREATER_THAN">Greater Than {'>'}</option>
          <option value="LESS_THAN">Less Than {'<'}</option>
          <option value="EQUAL">Equal To {'=='}</option>
          <option value="CROSSES_ABOVE">Crosses Above</option>
          <option value="CROSSES_BELOW">Crosses Below</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] text-text-secondary font-bold">Value</label>
        <input 
          type="number" 
          value={dsl.right || 0}
          onChange={(e) => updateDSL('right', e.target.value)}
          className="h-9 w-full rounded border border-bg-border bg-bg-base px-2 text-[13px] text-text-primary outline-none focus:border-accent-blue"
        />
      </div>
    </div>
  );
}

function ExecuteProperties({ data, onChange }: { data: any, onChange: (data: any) => void }) {
  const dsl = data.dslAction || { type: 'BUY', quantityType: 'PERCENT_OF_ACCOUNT', quantityValue: 50 };
  
  const updateDSL = (field: string, value: any) => {
    onChange({ dslAction: { ...dsl, [field]: value } });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] text-text-secondary font-bold">Action</label>
        <select 
          value={dsl.type}
          onChange={(e) => updateDSL('type', e.target.value)}
          className="h-9 w-full rounded border border-bg-border bg-bg-base px-2 text-[13px] text-text-primary outline-none"
        >
          <option value="BUY">BUY</option>
          <option value="SELL">SELL</option>
          <option value="CLOSE_POSITION">CLOSE POSITION</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] text-text-secondary font-bold">Quantity (%)</label>
        <input 
          type="number" 
          min="1" max="100"
          value={dsl.quantityValue}
          onChange={(e) => updateDSL('quantityValue', Number(e.target.value))}
          className="h-9 w-full rounded border border-bg-border bg-bg-base px-2 text-[13px] text-text-primary outline-none focus:border-accent-blue"
        />
      </div>
    </div>
  );
}

function RiskProperties({ data, onChange }: { data: any, onChange: (data: any) => void }) {
  const dsl = data.dslRisk || { stopLossPercentage: 5, takeProfitPercentage: 10 };
  
  const updateDSL = (field: string, value: any) => {
    onChange({ dslRisk: { ...dsl, [field]: value } });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] text-text-secondary font-bold">Stop Loss (%)</label>
        <input 
          type="number" 
          step="0.1"
          value={dsl.stopLossPercentage}
          onChange={(e) => updateDSL('stopLossPercentage', Number(e.target.value))}
          className="h-9 w-full rounded border border-bg-border bg-bg-base px-2 text-[13px] text-text-primary outline-none focus:border-accent-blue"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] text-text-secondary font-bold">Take Profit (%)</label>
        <input 
          type="number" 
          step="0.1"
          value={dsl.takeProfitPercentage}
          onChange={(e) => updateDSL('takeProfitPercentage', Number(e.target.value))}
          className="h-9 w-full rounded border border-bg-border bg-bg-base px-2 text-[13px] text-text-primary outline-none focus:border-accent-blue"
        />
      </div>
    </div>
  );
}
