import { useMemo } from 'react'

export default function FloatingParticles() {
  const particles = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      id: i,
      left: `${(i * 4.3 + 2) % 100}%`,
      size: 2 + (i % 4),
      duration: 8 + (i % 5) * 2,
      delay: (i * 0.7) % 10,
      opacity: 0.15 + (i % 3) * 0.1,
    }))
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-white"
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
