import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import KanbanList from './KanbanList'
import AddListButton from './AddListButton'
import { useBoardStore } from '@/stores/boardStore'
import { useLists } from '@/hooks/useLists'
import { useCards } from '@/hooks/useCards'
import { useUIStore } from '@/stores/uiStore'
import ConfettiCelebration from '@/components/ui/ConfettiCelebration'
import { useState } from 'react'

const DONE_LIST_NAMES = ['feito', 'concluído', 'done', 'concluido']

export default function KanbanBoard({ boardId }) {
  const { lists, cardsByListId, moveCard, moveList, snapshotForRollback, rollback } = useBoardStore()
  const { createList, renameList, deleteList, saveListPositions } = useLists(boardId)
  const { createCard, moveCardInDB } = useCards()
  const { showToast } = useUIStore()
  const [confetti, setConfetti] = useState(false)

  async function handleDragEnd(result) {
    const { source, destination, type, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    if (type === 'LIST') {
      snapshotForRollback()
      moveList({ sourceIndex: source.index, destIndex: destination.index })
      const newLists = useBoardStore.getState().lists
      try {
        await saveListPositions(newLists)
      } catch {
        rollback()
        showToast('Erro ao mover coluna.', 'error')
      }
      return
    }

    // CARD drag
    snapshotForRollback()
    const sourceListId = source.droppableId
    const destListId = destination.droppableId

    moveCard({
      sourceListId,
      destListId,
      sourceIndex: source.index,
      destIndex: destination.index,
    })

    // Check if dropped into done list → confetti
    const destList = lists.find((l) => l.id === destListId)
    if (destList && DONE_LIST_NAMES.includes(destList.title.toLowerCase())) {
      setConfetti(true)
      setTimeout(() => setConfetti(false), 100)
    }

    const newCards = useBoardStore.getState().cardsByListId[destListId]
    const movedCard = newCards?.[destination.index]
    const newPosition = movedCard?.position ?? destination.index * 1000

    const err = await moveCardInDB(draggableId, destListId, newPosition)
    if (err) {
      rollback()
      showToast('Erro ao mover tarefa.', 'error')
    }
  }

  return (
    <>
      <ConfettiCelebration trigger={confetti} />
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="board" type="LIST" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex gap-4 items-start overflow-x-auto pb-6 px-4"
              style={{ minHeight: 'calc(100vh - 160px)' }}
            >
              {lists.map((list, index) => (
                <Draggable key={list.id} draggableId={`list-${list.id}`} index={index}>
                  {(dragProvided, snapshot) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      style={dragProvided.draggableProps.style}
                    >
                      <KanbanList
                        list={list}
                        cards={cardsByListId[list.id] || []}
                        dragHandleProps={dragProvided.dragHandleProps}
                        isDragging={snapshot.isDragging}
                        onAddCard={(listId, title) => {
                          createCard(listId, title).then(({ error }) => {
                            if (error) showToast(error, 'error')
                          })
                        }}
                        onRenameList={async (listId, title) => {
                          const err = await renameList(listId, title)
                          if (err) showToast(err, 'error')
                        }}
                        onDeleteList={async (listId) => {
                          if (!window.confirm('Excluir esta coluna e todas as tarefas?')) return
                          const err = await deleteList(listId)
                          if (err) showToast(err, 'error')
                        }}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              <AddListButton onAdd={async (title) => {
                const err = await createList(title)
                if (err) showToast(err, 'error')
              }} />
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </>
  )
}
