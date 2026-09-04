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
  green: 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
  blue: 'from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700',
  red: 'from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700',
  amber: 'from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700',
  purple: 'from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700',
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
        py-4 bg-gradient-to-r text-white font-bold rounded-xl transition-all transform hover:scale-105
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        shadow-lg text-lg inline-flex items-center justify-center gap-2
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
}
