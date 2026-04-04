import { cn } from '@/utils/cn'

const sizes = { sm: 'h-7 w-7 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-14 w-14 text-lg', xl: 'h-20 w-20 text-2xl' }

export default function Avatar({ src, name, size = 'md', className }) {
  const initials = name
    ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={cn('rounded-full object-cover bg-mint-100', sizes[size], className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold bg-mint-200 text-mint-700',
        sizes[size],
        className
      )}
    >
      {initials}
    </div>
  )
}
