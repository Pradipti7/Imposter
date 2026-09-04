import { ReactNode } from 'react'
import PlayerAvatar from './PlayerAvatar'

interface PlayerListItemProps {
  name: string
  highlight?: boolean
  highlightLabel?: string
  suffix?: ReactNode
  dimmed?: boolean
  className?: string
}

export default function PlayerListItem({
  name,
  highlight = false,
  highlightLabel,
  suffix,
  dimmed = false,
  className = '',
}: PlayerListItemProps) {
  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg
        ${highlight ? 'bg-green-500/20 border border-green-400/50' : 'bg-white/10'}
        ${dimmed ? 'bg-white/5 opacity-50' : ''}
        ${className}
      `}
    >
      <PlayerAvatar name={name} />
      <span className={`text-white text-sm flex-1 ${dimmed ? 'line-through text-purple-300' : ''}`}>{name}</span>
      {highlightLabel && <span className="ml-auto text-xs text-green-300">{highlightLabel}</span>}
      {suffix}
    </div>
  )
}
