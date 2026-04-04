import { Draggable } from '@hello-pangea/dnd'
import { useUIStore } from '@/stores/uiStore'
import { isOverdue, isToday, formatDate } from '@/utils/dateHelpers'
import { cn } from '@/utils/cn'

export default function KanbanCard({ card, index }) {
  const { openCard } = useUIStore()

  const overdue = card.due_date && isOverdue(card.due_date)
  const dueToday = card.due_date && isToday(card.due_date)

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => openCard(card.id)}
          className={cn(
            'bg-white rounded-xl border border-gray-100 p-3 cursor-pointer hover:shadow-sm hover:border-mint-200 transition-all active:scale-[0.98]',
            snapshot.isDragging && 'shadow-lg rotate-1 border-mint-300'
          )}
          data-intro-step={index === 0 ? 'kanban-card' : undefined}
        >
          <p className="text-sm font-medium text-gray-800 leading-snug">{card.title}</p>

          {card.due_date && (
            <div className="mt-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium',
                  overdue
                    ? 'bg-red-100 text-red-600'
                    : dueToday
                    ? 'bg-sand-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-500'
                )}
                data-intro-step={index === 0 ? 'card-due-date' : undefined}
              >
                📅 {formatDate(card.due_date)}
                {overdue && ' · Atrasado'}
                {dueToday && ' · Hoje'}
              </span>
            </div>
          )}
        </div>
      )}
    </Draggable>
  )
}
