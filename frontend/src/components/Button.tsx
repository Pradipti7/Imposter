import { ReactNode } from 'react'
import Spinner from './Spinner'

type Variant = 'green' | 'blue' | 'red' | 'amber' | 'purple'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: Variant
  fullWidth?: boolean
  loading?: boolean
  className?: string
}

const variantClasses: Record<Variant, string> = {
  green: 'from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 shadow-green-500/25 hover:shadow-green-500/40',
  blue: 'from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 shadow-blue-500/25 hover:shadow-blue-500/40',
  red: 'from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 shadow-red-500/25 hover:shadow-red-500/40',
  amber: 'from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-amber-500/25 hover:shadow-amber-500/40',
  purple: 'from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 shadow-purple-500/25 hover:shadow-purple-500/40',
}

export default function Button({
  children,
  onClick,
  disabled = false,
  variant = 'green',
  fullWidth = true,
  loading = false,
  className = '',
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        py-4 bg-gradient-to-r text-white font-bold rounded-xl
        transition-all duration-200
        transform hover:scale-[1.03] active:scale-[0.97]
        disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
        shadow-lg text-lg inline-flex items-center justify-center gap-2
        relative overflow-hidden
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      <span className="relative z-10 flex items-center gap-2">
        {loading && <Spinner />}
        {children}
      </span>
    </button>
  )
}
