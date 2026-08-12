"use client"

import * as React from "react"
import { AreaChart, Area, Tooltip, ResponsiveContainer } from "recharts"

const MOCK_GROWTH = [
  { date: 'Mon', value: 12400 },
  { date: 'Tue', value: 12550 },
  { date: 'Wed', value: 12380 },
  { date: 'Thu', value: 12847 },
  { date: 'Fri', value: 13100 },
  { date: 'Sat', value: 13420 },
  { date: 'Sun', value: 13850 },
]

export function GrowthChart() {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-full w-full bg-bg-elevated/50 rounded-md animate-pulse" />
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={MOCK_GROWTH}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Tooltip 
          contentStyle={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-bg-border)', borderRadius: '6px' }}
          itemStyle={{ color: '#F8FAFC' }}
        />
        <Area type="monotone" dataKey="value" stroke="#3B82F6" fillOpacity={1} fill="url(#colorValue)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
