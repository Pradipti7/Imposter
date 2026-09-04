interface PlayerAvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  highlight?: boolean
  className?: string
}

const sizeClasses: Record<string, string> = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-xl',
  lg: 'w-14 h-14 text-2xl',
}

export default function PlayerAvatar({ name, size = 'sm', highlight = false, className = '' }: PlayerAvatarProps) {
  return (
    <div
      className={`
        rounded-full bg-gradient-to-br from-pink-400 to-purple-500
        flex items-center justify-center text-white font-bold
        ${highlight ? 'ring-2 ring-green-400 ring-offset-2 ring-offset-transparent animate-pulse' : ''}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {name[0].toUpperCase()}
    </div>
  )
}
