const GRADIENTS = [
  'from-pink-400 to-purple-500',
  'from-violet-400 to-indigo-500',
  'from-cyan-400 to-blue-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-red-500',
  'from-fuchsia-400 to-pink-500',
  'from-lime-400 to-green-500',
]

interface PlayerAvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  highlight?: boolean
  index?: number
  className?: string
}

const sizeClasses: Record<string, string> = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-xl',
  lg: 'w-14 h-14 text-2xl',
}

export default function PlayerAvatar({ name, size = 'sm', highlight = false, index = 0, className = '' }: PlayerAvatarProps) {
  const gradient = GRADIENTS[index % GRADIENTS.length]

  return (
    <div
      className={`
        rounded-full bg-gradient-to-br ${gradient}
        flex items-center justify-center text-white font-bold
        shadow-lg
        ${highlight ? 'ring-2 ring-green-400 ring-offset-2 ring-offset-transparent animate-pulse scale-110' : ''}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {name[0].toUpperCase()}
    </div>
  )
}
