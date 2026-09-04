interface SpinnerProps {
  size?: 'sm' | 'md'
  className?: string
}

export default function Spinner({ size = 'sm', className = '' }: SpinnerProps) {
  const sizeClass = size === 'sm' ? 'w-5 h-5' : 'w-8 h-8'

  return (
    <svg
      className={`animate-spin ${sizeClass} ${className}`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="opacity-25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="opacity-75"
      />
    </svg>
  )
}
