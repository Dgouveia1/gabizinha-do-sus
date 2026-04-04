import { useUIStore } from '@/stores/uiStore'


export default function TodayTasksList({ cards }) {
  const { openCard } = useUIStore()

  if (cards.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-3xl mb-2">🎉</div>
        <p className="text-sm text-gray-400">Nenhuma tarefa para hoje. Tá tranquilo, tá favorável!</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {cards.map((card) => (
        <button
          key={card.id}
          onClick={() => openCard(card.id)}
          className="w-full text-left bg-white rounded-xl border border-gray-100 px-4 py-3 hover:border-mint-200 hover:shadow-sm transition-all"
        >
          <p className="text-sm font-medium text-gray-800">{card.title}</p>
          {card.lists?.boards && (
            <p className="text-xs text-gray-400 mt-0.5">
              {card.lists.boards.title}
              {card.lists.boards.semester ? ` · ${card.lists.boards.semester}º Sem.` : ''}
            </p>
          )}
        </button>
      ))}
    </div>
  )
}
