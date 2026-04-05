import { useState } from 'react'
import { useNotebookChapters } from '@/hooks/useNotebookChapters'
import NotebookSidebarChapter from './NotebookSidebarChapter'
import CreateChapterModal from './CreateChapterModal'
import CreateSubjectModal from './CreateSubjectModal'
import { cn } from '@/utils/cn'

const colorMap = {
  mint: { bg: 'bg-mint-100', text: 'text-mint-700', dot: 'bg-mint-400' },
  sky: { bg: 'bg-sky-100', text: 'text-sky-700', dot: 'bg-sky-400' },
  pink: { bg: 'bg-pink-100', text: 'text-pink-700', dot: 'bg-pink-400' },
  lavender: { bg: 'bg-lavender-100', text: 'text-lavender-700', dot: 'bg-lavender-300' },
  sand: { bg: 'bg-sand-100', text: 'text-sand-500', dot: 'bg-sand-300' },
}

export default function NotebookSidebarSubject({ subject, onSelectPage, activePageId, onDelete, onEdit }) {
  const [open, setOpen] = useState(true)
  const [showChapterModal, setShowChapterModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const { chapters, createChapter, deleteChapter } = useNotebookChapters(subject.id)

  const colors = colorMap[subject.color] || colorMap.mint

  return (
    <div className="mb-0.5">
      {/* Subject row */}
      <div className="flex items-center gap-1.5 group min-h-[40px] px-1 rounded-lg hover:bg-gray-50 transition-colors">
        {/* Collapse toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="p-1 rounded-lg hover:bg-gray-200 transition-colors flex-shrink-0"
          aria-label={open ? 'Recolher' : 'Expandir'}
        >
          <svg
            className={cn('h-3.5 w-3.5 text-gray-400 transition-transform', open && 'rotate-90')}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Color dot + emoji */}
        <div
          className={cn('w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs', colors.bg)}
        >
          {subject.emoji}
        </div>

        {/* Title */}
        <button
          className="text-sm font-semibold text-gray-800 truncate flex-1 text-left hover:text-gray-900"
          onClick={() => setOpen(!open)}
        >
          {subject.title}
        </button>

        {/* Chapter count */}
        {chapters.length > 0 && (
          <span className="text-[10px] text-gray-400 font-medium flex-shrink-0">
            {chapters.length}
          </span>
        )}

        {/* Action buttons — visible on hover/touch */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowChapterModal(true)}
            className="p-1.5 rounded-lg hover:bg-mint-100 text-gray-400 hover:text-mint-600 transition-colors"
            title="Novo capítulo"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
          {onEdit && (
            <button
              onClick={() => setShowEditModal(true)}
              className="p-1.5 rounded-lg hover:bg-sky-100 text-gray-400 hover:text-sky-500 transition-colors"
              title="Editar matéria"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(subject.id)}
              className="p-1.5 rounded-lg hover:bg-pink-100 text-gray-400 hover:text-pink-500 transition-colors"
              title="Excluir matéria"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Chapters */}
      {open && (
        <div className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l-2 border-gray-100 pl-2">
          {chapters.map((chapter) => (
            <NotebookSidebarChapter
              key={chapter.id}
              chapter={chapter}
              subjectId={subject.id}
              onSelectPage={onSelectPage}
              activePageId={activePageId}
              onDeleteChapter={deleteChapter}
            />
          ))}
          {chapters.length === 0 && (
            <button
              onClick={() => setShowChapterModal(true)}
              className="text-xs text-gray-400 hover:text-mint-600 py-1.5 px-2 text-left transition-colors rounded-lg hover:bg-mint-50"
            >
              + Adicionar capítulo
            </button>
          )}
        </div>
      )}

      <CreateChapterModal
        open={showChapterModal}
        onClose={() => setShowChapterModal(false)}
        onCreate={createChapter}
      />

      <CreateSubjectModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onCreate={(payload) => onEdit(subject.id, payload)}
        editData={subject}
      />
    </div>
  )
}
