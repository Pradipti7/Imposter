interface PageHeaderProps {
  title: string
  subtitle?: string
  emoji?: string
  small?: boolean
}

export default function PageHeader({ title, subtitle, emoji, small = false }: PageHeaderProps) {
  return (
    <div className={`text-center ${small ? 'mb-6' : 'mb-8'}`}>
      <h1
        className={`
          ${small ? 'text-3xl' : 'text-5xl'} font-bold mb-2 animate-pulse-glow
          bg-gradient-to-r from-white via-pink-200 to-purple-200 bg-clip-text text-transparent
          drop-shadow-lg
        `}
      >
        {emoji && <span className="inline-block mr-1 animate-bounce-in">{emoji}</span>}
        {title}
      </h1>
      {subtitle && (
        <p className="text-purple-200/80 tracking-wide text-sm mt-1">
          {subtitle}
        </p>
      )}
    </div>
  )
}
