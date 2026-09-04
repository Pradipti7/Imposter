import { useMemo } from 'react'

const COLORS = ['bg-white', 'bg-pink-400/60', 'bg-purple-400/60', 'bg-indigo-300/40']

export default function FloatingParticles() {
  const particles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${(i * 3.3 + 2) % 100}%`,
      size: 2 + (i % 5) * 1.5,
      duration: 10 + (i % 6) * 3,
      delay: (i * 0.6) % 12,
      opacity: 0.1 + (i % 4) * 0.08,
      color: COLORS[i % COLORS.length],
    }))
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute rounded-full ${p.color}`}
          style={{
            left: p.left,
            bottom: '-10px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animation: `particle-drift ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}
