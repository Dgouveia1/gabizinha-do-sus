/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, no-use-before-define, no-unused-vars */
import { useEffect, useState } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { useCards } from '@/hooks/useCards'
import { useCard } from '@/hooks/useCard'
import { useBoardStore } from '@/stores/boardStore'
import CardChecklist from './CardChecklist'
import CardAttachments from './CardAttachments'
import CardLinks from './CardLinks'
import CardComments from './CardComments'
import DueDatePicker from './DueDatePicker'
import Spinner from '@/components/ui/Spinner'

export default function CardModal() {
  const { activeCardId, closeCard } = useUIStore()
  const { patchCard, deleteCard } = useCards()
  const { currentMemberRole } = useBoardStore()
  const {
    card, comments, attachments, checklistItems, links, loading,
    addComment, addChecklistItem, toggleChecklistItem, removeChecklistItem,
    addLink, removeLink, uploadAttachment, removeAttachment,
  } = useCard(activeCardId)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (card) {
      setTitle(card.title)
      setDescription(card.description || '')
    }
  }, [card])

  useEffect(() => {
    if (!activeCardId) return
    const handler = (e) => e.key === 'Escape' && closeCard()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeCardId])

  useEffect(() => {
    if (!activeCardId) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [activeCardId])

  if (!activeCardId) return null

  async function saveTitle() {
    if (title.trim() && title.trim() !== card?.title) {
      await patchCard(activeCardId, { title: title.trim() })
    }
  }

  async function saveDescription() {
    if (description !== (card?.description || '')) {
      await patchCard(activeCardId, { description: description || null })
    }
  }

  async function handleDueDateChange(date) {
    await patchCard(activeCardId, { due_date: date })
  }

  async function handleDelete() {
    if (window.confirm('Excluir esta tarefa?')) {
      await deleteCard(activeCardId)
      closeCard()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeCard} />

      {/* Panel — bottom sheet on mobile, centered on sm+ */}
      <div className="relative z-10 w-full bg-white shadow-xl rounded-t-2xl sm:rounded-2xl sm:max-w-2xl sm:mx-4 flex flex-col max-h-[92vh]">
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 bg-gray-200 rounded-full" />
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-5 pb-6 pt-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {/* Title */}
              <div className="flex items-start gap-2">
                <textarea
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={saveTitle}
                  rows={1}
                  className="flex-1 text-lg font-semibold text-gray-800 resize-none bg-transparent border-b border-transparent hover:border-gray-200 focus:border-mint-400 focus:outline-none pb-1 transition-colors"
                  style={{ height: 'auto', overflow: 'hidden' }}
                  onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px' }}
                />
                <button onClick={closeCard} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">📝 Descrição</h4>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={saveDescription}
                  placeholder="Adicione uma descrição mais detalhada..."
                  rows={3}
                  className="w-full text-sm text-gray-700 bg-gray-50 rounded-xl border border-gray-100 px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-mint-400 focus:bg-white transition-colors"
                />
              </div>

              {/* Due date */}
              <DueDatePicker value={card?.due_date} onChange={handleDueDateChange} />

              {/* Checklist */}
              <CardChecklist
                items={checklistItems}
                onAdd={addChecklistItem}
                onToggle={toggleChecklistItem}
                onRemove={removeChecklistItem}
              />

              {/* Attachments */}
              <CardAttachments
                attachments={attachments}
                onUpload={uploadAttachment}
                onRemove={removeAttachment}
              />

              {/* Links */}
              <CardLinks links={links} onAdd={addLink} onRemove={removeLink} />

              {/* Comments */}
              <CardComments comments={comments} onAdd={addComment} />

              {/* Delete */}
              {currentMemberRole === 'admin' && (
                <div className="pt-2 border-t border-gray-100">
                  <button
                    onClick={handleDelete}
                    className="text-sm text-red-400 hover:text-red-600 transition-colors"
                  >
                    🗑️ Excluir tarefa
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
