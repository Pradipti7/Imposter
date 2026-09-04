interface ErrorBannerProps {
  message: string
}

export default function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div className="mb-4 p-3 bg-red-500/20 border border-red-400/50 rounded-lg text-red-200 text-sm animate-shake backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="text-lg">⚠️</span>
        <span>{message}</span>
      </div>
    </div>
  )
}
