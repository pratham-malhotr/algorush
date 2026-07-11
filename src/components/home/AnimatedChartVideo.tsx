"use client"

import * as React from "react"
import { useEffect, useRef } from "react"

export function AnimatedChartVideo() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    const points: { x: number, y: number, isGreen: boolean }[] = []
    
    const resize = () => {
      const parent = canvas.parentElement
      if (parent) {
        const rect = parent.getBoundingClientRect()
        canvas.width = rect.width || 800
        canvas.height = rect.height || 400
      } else {
        canvas.width = 800
        canvas.height = 400
      }
    }
    resize()
    window.addEventListener("resize", resize)

    // Generate initial chart data
    let currentY = canvas.height / 2
    for (let i = 0; i < 100; i++) {
      const change = (Math.random() - 0.45) * 40
      const nextY = Math.max(50, Math.min(canvas.height - 50, currentY + change))
      points.push({ 
        x: i * (canvas.width / 50), 
        y: nextY,
        isGreen: nextY < currentY
      })
      currentY = nextY
    }

    let offset = 0

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)"
      ctx.lineWidth = 1
      for(let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath()
        ctx.moveTo(i - (offset % 50), 0)
        ctx.lineTo(i - (offset % 50), canvas.height)
        ctx.stroke()
      }
      for(let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(canvas.width, i)
        ctx.stroke()
      }

      // Draw Candlesticks & Line
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, points[0].y)

      for (let i = 0; i < points.length; i++) {
        const p = points[i]
        const drawX = p.x - offset
        
        // Line chart connecting closes
        ctx.lineTo(drawX, p.y)
        
        // Candlestick bodies
        if (i > 0 && drawX > 0 && drawX < canvas.width) {
          const prev = points[i-1]
          const color = p.isGreen ? "#22c55e" : "#ef4444"
          ctx.fillStyle = color
          ctx.strokeStyle = color
          
          // Wick
          ctx.beginPath()
          ctx.moveTo(drawX - (canvas.width/50)/2, Math.min(prev.y, p.y) - 20)
          ctx.lineTo(drawX - (canvas.width/50)/2, Math.max(prev.y, p.y) + 20)
          ctx.stroke()
          
          // Body
          const bodyHeight = Math.abs(prev.y - p.y) || 2
          const yPos = Math.min(prev.y, p.y)
          ctx.fillRect(drawX - (canvas.width/50) + 4, yPos, (canvas.width/50) - 8, bodyHeight)
        }
      }

      ctx.strokeStyle = "rgba(59, 130, 246, 0.5)"
      ctx.lineWidth = 3
      ctx.stroke()

      // Gradient fill below line
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, "rgba(59, 130, 246, 0.2)")
      gradient.addColorStop(1, "rgba(59, 130, 246, 0)")
      
      ctx.lineTo(canvas.width, canvas.height)
      ctx.lineTo(0, canvas.height)
      ctx.fillStyle = gradient
      ctx.fill()

      // Move chart forward
      offset += 1.5
      
      // Generate new points as it moves
      if (offset > canvas.width / 50) {
        offset = 0
        const lastY = points[points.length - 1].y
        const change = (Math.random() - 0.48) * 50
        const nextY = Math.max(50, Math.min(canvas.height - 50, lastY + change))
        
        points.shift() // remove first
        points.forEach(p => p.x -= canvas.width / 50) // shift remaining left
        points.push({
          x: points[points.length - 1].x + canvas.width / 50,
          y: nextY,
          isGreen: nextY < lastY
        })
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full opacity-90 mix-blend-screen"
    />
  )
}
