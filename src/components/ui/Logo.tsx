import * as React from "react"

export function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Hexagonal circuit-board frame */}
        <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" stroke="#22C55E" strokeWidth="1.5" strokeLinejoin="round"/>
        <circle cx="16" cy="2" r="1.5" fill="#22C55E"/>
        <circle cx="28" cy="9" r="1.5" fill="#22C55E"/>
        <circle cx="28" cy="23" r="1.5" fill="#22C55E"/>
        <circle cx="16" cy="30" r="1.5" fill="#22C55E"/>
        <circle cx="4" cy="23" r="1.5" fill="#22C55E"/>
        <circle cx="4" cy="9" r="1.5" fill="#22C55E"/>
        {/* Inner circuit lines */}
        <path d="M4 9L12 14" stroke="#22C55E" strokeWidth="1" strokeOpacity="0.5"/>
        <path d="M28 23L20 18" stroke="#22C55E" strokeWidth="1" strokeOpacity="0.5"/>
        
        {/* Lightning bolt */}
        <path d="M18 6L10 18H16L14 26L22 14H16L18 6Z" fill="#3B82F6" />
      </svg>
      <span className="font-sans font-bold text-lg tracking-tight">
        <span className="text-text-primary">Algo</span>
        <span className="text-[#3B82F6]">Text</span>
      </span>
    </div>
  )
}
