interface PlayerAvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses: Record<string, string> = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-xl',
  lg: 'w-14 h-14 text-2xl',
}

export default function PlayerAvatar({ name, size = 'sm', className = '' }: PlayerAvatarProps) {
  return (
    <div
      className={`
        rounded-full bg-gradient-to-br from-pink-400 to-purple-500
        flex items-center justify-center text-white font-bold
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {name[0].toUpperCase()}
    </div>
  )
}
