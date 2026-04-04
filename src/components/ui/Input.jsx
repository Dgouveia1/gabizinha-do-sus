import { cn } from '@/utils/cn'

export default function Input({ label, error, className, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        className={cn(
          'w-full rounded-[var(--radius-btn)] border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-transparent',
          error && 'border-pink-400 focus:ring-pink-400',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-pink-500">{error}</p>}
    </div>
  )
}
