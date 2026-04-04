import { cn } from '@/utils/cn'

export default function PageContainer({ children, className }) {
  return (
    <div className={cn('max-w-screen-xl mx-auto px-4 py-5', className)}>
      {children}
    </div>
  )
}
