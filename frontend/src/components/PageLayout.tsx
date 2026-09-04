import { ReactNode } from 'react'
import FloatingParticles from './FloatingParticles'

interface PageLayoutProps {
  children: ReactNode
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4 overflow-hidden">
      <FloatingParticles />
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
