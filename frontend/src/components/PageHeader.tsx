interface PageHeaderProps {
  title: string
  subtitle?: string
  emoji?: string
  small?: boolean
}

export default function PageHeader({ title, subtitle, emoji, small = false }: PageHeaderProps) {
  return (
    <div className={`text-center ${small ? 'mb-6' : 'mb-8'}`}>
      <h1 className={`${small ? 'text-3xl' : 'text-5xl'} font-bold text-white mb-2 animate-pulse-glow`}>
        {emoji && `${emoji} `}{title}
      </h1>
      {subtitle && <p className="text-purple-200">{subtitle}</p>}
    </div>
  )
}
