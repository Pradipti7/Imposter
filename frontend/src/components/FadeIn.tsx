import { ReactNode } from 'react'

interface FadeInProps {
  children: ReactNode
  className?: string
}

export default function FadeIn({ children, className = '' }: FadeInProps) {
  return (
    <div className={`animate-fade-in-up opacity-0 ${className}`}>
      {children}
    </div>
  )
}
