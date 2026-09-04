import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
}

export default function Card({ children }: CardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]">
      {children}
    </div>
  )
}
