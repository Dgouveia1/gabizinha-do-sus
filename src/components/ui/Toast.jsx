import { useEffect } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/utils/cn'

const typeStyles = {
  success: 'bg-mint-500 text-white',
  error: 'bg-pink-500 text-white',
  info: 'bg-sky-500 text-white',
}

const icons = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
}

export default function Toast() {
  const { toast, clearToast } = useUIStore()

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(clearToast, 4000)
    return () => clearTimeout(timer)
  }, [toast])

  if (!toast) return null

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[200] sm:bottom-6 animate-in slide-in-from-bottom-4">
      <div
        className={cn(
          'flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium min-w-[200px] max-w-[90vw]',
          typeStyles[toast.type]
        )}
      >
        <span className="text-base">{icons[toast.type]}</span>
        <span>{toast.message}</span>
        <button onClick={clearToast} className="ml-auto opacity-80 hover:opacity-100">✕</button>
      </div>
    </div>
  )
}
