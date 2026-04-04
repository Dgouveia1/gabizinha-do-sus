import { cn } from '@/utils/cn'
import Spinner from './Spinner'

const variants = {
  primary: 'bg-mint-500 hover:bg-mint-600 text-white',
  secondary: 'bg-mint-100 hover:bg-mint-200 text-mint-700',
  outline: 'border border-mint-300 hover:bg-mint-50 text-mint-700',
  danger: 'bg-pink-500 hover:bg-pink-600 text-white',
  ghost: 'hover:bg-gray-100 text-gray-600',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-[var(--radius-btn)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-mint-400 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}
