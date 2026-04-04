import { useState, useRef } from 'react'
import { Droppable } from '@hello-pangea/dnd'
import KanbanCard from './KanbanCard'
import AddCardButton from './AddCardButton'
import { cn } from '@/utils/cn'

export default function KanbanList({
  list,
  cards,
  dragHandleProps,
  isDragging,
  onAddCard,
  onRenameList,
  onDeleteList,
}) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(list.title)
  const [menuOpen, setMenuOpen] = useState(false)
  const inputRef = useRef(null)

  function startEdit() {
    setEditing(true)
    setMenuOpen(false)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  function saveTitle() {
    setEditing(false)
    if (title.trim() && title.trim() !== list.title) {
      onRenameList(list.id, title.trim())
    } else {
      setTitle(list.title)
    }
  }

  return (
    <div
      className={cn(
        'flex-shrink-0 w-72 flex flex-col bg-gray-50 rounded-2xl border border-gray-100 transition-shadow',
        isDragging && 'shadow-xl border-mint-200 rotate-1'
      )}
      data-intro-step={list.position === 0 ? 'kanban-list' : undefined}
    >
      {/* List header — drag handle */}
      <div
        {...dragHandleProps}
        className="flex items-center gap-2 px-3 pt-3 pb-2 cursor-grab active:cursor-grabbing"
      >
        <div className="text-gray-300 flex-shrink-0 select-none">⠿</div>

        {editing ? (
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveTitle()
              if (e.key === 'Escape') { setTitle(list.title); setEditing(false) }
            }}
            className="flex-1 text-sm font-semibold bg-white border border-mint-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-mint-400"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <h3
            className="flex-1 text-sm font-semibold text-gray-700 truncate cursor-pointer select-none"
            onDoubleClick={startEdit}
          >
            {list.title}
          </h3>
        )}

        <span className="text-xs text-gray-400 font-medium flex-shrink-0">{cards.length}</span>

        <div className="relative flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o) }}
            className="p-1 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors leading-none"
          >
            ···
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-8 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-40">
                <button
                  onClick={startEdit}
                  className="w-full text-left text-sm px-3 py-2 hover:bg-gray-50 text-gray-700"
                >
                  Renomear
                </button>
                <button
                  onClick={() => { onDeleteList(list.id); setMenuOpen(false) }}
                  className="w-full text-left text-sm px-3 py-2 hover:bg-red-50 text-red-500"
                >
                  Excluir coluna
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cards drop zone */}
      <Droppable droppableId={list.id} type="CARD">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 px-3 pb-2 flex flex-col gap-2 min-h-[60px] rounded-xl transition-colors',
              snapshot.isDraggingOver && 'bg-mint-50'
            )}
          >
            {cards.map((card, i) => (
              <KanbanCard key={card.id} card={card} index={i} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Add card */}
      <div className="px-3 pb-3">
        <AddCardButton onAdd={(title) => onAddCard(list.id, title)} />
      </div>
    </div>
  )
}
