import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`
        relative bg-white/10 backdrop-blur-lg rounded-2xl p-8
        shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]
        border border-white/20
        transition-all duration-500
        hover:shadow-[0_8px_40px_rgba(168,85,247,0.2),inset_0_1px_0_rgba(255,255,255,0.15)]
        hover:border-white/30
        ${className}
      `}
    >
      {children}
    </div>
  )
}
