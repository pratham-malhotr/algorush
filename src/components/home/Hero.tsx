"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Play } from "lucide-react"

export function Hero() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    
    // Setup canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Node particle system
    const nodes: { x: number; y: number; vx: number; vy: number; isBlue: boolean; pulse: number; pulseDir: number; baseX: number; baseY: number }[] = []
    const numNodes = Math.floor(window.innerWidth / 20) // responsive node count
    
    let mouseX = -1000;
    let mouseY = -1000;
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        isBlue: Math.random() > 0.85,
        pulse: Math.random(),
        pulseDir: 0.01,
        baseX: 0, 
        baseY: 0,
      })
      nodes[nodes.length - 1].baseX = nodes[nodes.length - 1].x;
      nodes[nodes.length - 1].baseY = nodes[nodes.length - 1].y;
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Update nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        node.x += node.vx
        node.y += node.vy
        
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1

        if (node.isBlue) {
          node.pulse += node.pulseDir
          if (node.pulse > 1 || node.pulse < 0) node.pulseDir *= -1
        }
        
        // Mouse interaction (repel)
        const dx = mouseX - node.x;
        const dy = mouseY - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (150 - dist) / 150;
          node.vx -= (dx / dist) * force * 0.5;
          node.vy -= (dy / dist) * force * 0.5;
        }
        
        // Friction / return to normal speed
        const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
        if (speed > 1.5) {
          node.vx *= 0.95;
          node.vy *= 0.95;
        }
      }

      // Draw lines
      ctx.lineWidth = 1
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.15 * (1 - dist / 120)})`
            ctx.stroke()
          }
        }
      }

      // Draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.isBlue ? 4 + node.pulse * 1.5 : 4, 0, Math.PI * 2)
        ctx.fillStyle = node.isBlue ? `rgba(59, 130, 246, ${0.4 + node.pulse * 0.6})` : "#E2E8F0"
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      window.removeEventListener("mousemove", handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] w-full flex-col items-center justify-center overflow-hidden">
      {/* Animated background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 h-full w-full pointer-events-none"
      />
      
      {/* Content */}
      <div className="relative z-10 flex w-full max-w-[720px] flex-col items-center px-4 text-center">
        <div className="mb-8 rounded-full border border-accent-blue/30 bg-accent-blue-dim/20 px-4 py-1.5 text-[12px] font-semibold uppercase tracking-wider text-accent-blue backdrop-blur-sm">
          ⚡ Crypto Algo Trading — Zero Code Required
        </div>
        
        <h1 className="mb-6 text-[36px] font-bold leading-tight tracking-tight text-text-primary md:text-[72px]">
          Build Crypto <span className="relative inline-block">
            <span className="absolute -inset-2 bg-gradient-to-r from-accent-blue to-accent-green opacity-30 blur-lg rounded-full"></span>
            <span className="relative bg-gradient-to-r from-accent-blue to-accent-green bg-clip-text text-transparent">Bots</span>
          </span>.<br />
          Trade 24/7.<br />
          No Code Needed.
        </h1>
        
        <p className="mb-10 max-w-[560px] text-[18px] leading-[1.7] text-text-secondary">
          AlgoText lets you build powerful algorithmic trading strategies using
          a simple drag-and-drop interface. Connect your wallet, set your rules,
          and let your bot trade crypto while you sleep — for just 0.05% on volume.
        </p>
        
        <div className="flex flex-row items-center gap-4 mt-2">
          <Button variant="primary" className="px-[32px] py-[24px] text-[16px] shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-shadow">
            Start Building Free →
          </Button>
          <Button variant="secondary" className="px-[32px] py-[24px] text-[16px] bg-white border border-bg-border hover:bg-black/[0.02]">
            <Play className="mr-2 h-4 w-4" /> Watch Demo
          </Button>
        </div>
        
        <div className="mt-[32px] flex flex-row flex-wrap items-center justify-center gap-6">
          {[
            "No coding required",
            "0.05% fee only on volume",
            "Your wallet, your keys",
            "Backtest before going live",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent-green" />
              <span className="text-[13px] text-text-secondary">{item}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Hero Preview Image (Mockup) */}
      <div className="relative z-10 mt-16 w-full max-w-[1100px] px-4 opacity-0 animate-[fadeInUp_1s_ease-out_0.5s_forwards]">
        <div 
          className="relative overflow-hidden rounded-[var(--radius-lg)] border border-bg-border bg-bg-base shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          style={{ transform: "rotateX(8deg) rotateY(-3deg)", transformStyle: "preserve-3d", perspective: "1000px" }}
        >
          {/* Fading edges mask */}
          <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-bg-base/90" />
          
          <div className="flex h-[400px] w-full flex-col p-4 md:h-[600px]">
            {/* Fake toolbar */}
            <div className="mb-4 flex h-10 w-full items-center rounded-md border border-bg-border bg-bg-surface px-4">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-accent-red" />
                <div className="h-3 w-3 rounded-full bg-accent-amber" />
                <div className="h-3 w-3 rounded-full bg-accent-green" />
              </div>
            </div>
            {/* Fake nodes on canvas */}
            <div className="relative flex-1 bg-white" style={{ backgroundImage: "radial-gradient(circle, #E2E8F0 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
               {/* Strategy Start Node */}
               <div className="absolute top-[40px] left-[50%] ml-[-100px] flex h-[60px] w-[200px] items-center justify-center rounded-lg border-2 border-accent-blue bg-accent-blue-dim">
                 <span className="font-semibold text-text-primary">Strategy Start</span>
                 <div className="absolute -bottom-[20px] left-1/2 h-[20px] w-[2px] bg-accent-blue" />
               </div>
               
               {/* Condition Node */}
               <div className="absolute top-[140px] left-[50%] ml-[-110px] flex h-[80px] w-[220px] flex-col justify-center rounded-lg border border-accent-blue bg-[#0F2036] px-4 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                 <span className="text-[12px] text-accent-blue">ENTRY CONDITION</span>
                 <span className="text-[14px] font-medium text-text-primary">RSI Crosses Below 30</span>
                 <div className="absolute -bottom-[20px] left-1/2 h-[20px] w-[2px] bg-accent-blue" />
               </div>

               {/* Execute Node */}
               <div className="absolute top-[260px] left-[50%] ml-[-100px] flex h-[60px] w-[200px] items-center justify-center rounded-lg border-2 border-accent-green bg-[#0A2010] shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                 <span className="font-semibold text-text-primary">Execute BUY Order</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
