import { isOverdue, isToday } from '@/utils/dateHelpers'
import { cn } from '@/utils/cn'

export default function DueDatePicker({ value, onChange }) {
  const overdue = value && isOverdue(value)
  const dueToday = value && isToday(value)

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-700 mb-2">📅 Data de entrega</h4>
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value || null)}
          data-intro-step="card-due-date"
          className={cn(
            'rounded-xl border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-mint-400',
            overdue ? 'border-red-300 text-red-600 bg-red-50' :
            dueToday ? 'border-yellow-300 text-yellow-700 bg-yellow-50' :
            'border-gray-200 text-gray-700 bg-white'
          )}
        />
        {overdue && <span className="text-xs text-red-500 font-medium">Atrasado!</span>}
        {dueToday && <span className="text-xs text-yellow-600 font-medium">Hoje!</span>}
        {value && (
          <button
            onClick={() => onChange(null)}
            className="text-xs text-gray-400 hover:text-red-400 transition-colors"
          >
            Remover
          </button>
        )}
      </div>
    </div>
  )
}
