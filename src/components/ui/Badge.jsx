import { cn } from '@/utils/cn'

const variants = {
  mint: 'bg-mint-100 text-mint-700',
  sky: 'bg-sky-100 text-sky-700',
  pink: 'bg-pink-100 text-pink-700',
  lavender: 'bg-lavender-100 text-lavender-700',
  sand: 'bg-sand-100 text-yellow-700',
  gray: 'bg-gray-100 text-gray-600',
  red: 'bg-red-100 text-red-600',
}

export default function Badge({ children, variant = 'gray', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
