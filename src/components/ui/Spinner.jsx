import { cn } from '@/utils/cn'

const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }

export default function Spinner({ fullscreen, size = 'md', className }) {
  const ring = (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-mint-200 border-t-mint-500',
        sizes[size],
        className
      )}
    />
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-mint-200 border-t-mint-500" />
      </div>
    )
  }

  return ring
}
