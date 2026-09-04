import { ReactNode } from 'react'
import PlayerAvatar from './PlayerAvatar'

interface PlayerListItemProps {
  name: string
  highlight?: boolean
  highlightLabel?: string
  suffix?: ReactNode
  dimmed?: boolean
  index?: number
  className?: string
}

export default function PlayerListItem({
  name,
  highlight = false,
  highlightLabel,
  suffix,
  dimmed = false,
  index = 0,
  className = '',
}: PlayerListItemProps) {
  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg
        transition-all duration-300
        animate-slide-in-right opacity-0
        ${highlight
          ? 'bg-green-500/20 border border-green-400/50 shadow-[0_0_15px_rgba(74,222,128,0.15)]'
          : 'bg-white/10 hover:bg-white/15'
        }
        ${dimmed ? 'bg-white/5 opacity-40' : ''}
        ${className}
      `}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <PlayerAvatar name={name} index={index} />
      <span className={`text-white text-sm flex-1 font-medium ${dimmed ? 'line-through text-purple-300/60' : ''}`}>
        {name}
      </span>
      {highlightLabel && (
        <span className="ml-auto text-xs text-green-300 font-semibold bg-green-500/10 px-2 py-0.5 rounded-full">
          {highlightLabel}
        </span>
      )}
      {suffix}
    </div>
  )
}
