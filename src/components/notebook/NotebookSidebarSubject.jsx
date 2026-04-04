import { useState } from 'react'
import { useNotebookChapters } from '@/hooks/useNotebookChapters'
import NotebookSidebarChapter from './NotebookSidebarChapter'
import CreateChapterModal from './CreateChapterModal'
import { cn } from '@/utils/cn'

const colorMap = {
  mint: 'bg-mint-100 text-mint-700',
  sky: 'bg-sky-100 text-sky-700',
  pink: 'bg-pink-100 text-pink-700',
  lavender: 'bg-lavender-100 text-lavender-700',
  sand: 'bg-sand-100 text-sand-700',
}

export default function NotebookSidebarSubject({ subject, onSelectPage, activePageId, onDelete }) {
  const [open, setOpen] = useState(true)
  const [showChapterModal, setShowChapterModal] = useState(false)
  const { chapters, createChapter, deleteChapter } = useNotebookChapters(subject.id)

  return (
    <div className="mb-1">
      <div className="flex items-center gap-2 group">
        <button
          onClick={() => setOpen(!open)}
          className="p-0.5 rounded hover:bg-gray-100 transition-colors"
        >
          <svg
            className={cn('h-4 w-4 text-gray-400 transition-transform', open && 'rotate-90')}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <span className="text-base">{subject.emoji}</span>
        <span
          className="text-sm font-semibold text-gray-800 truncate flex-1 cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          {subject.title}
        </span>
        {subject.semester && (
          <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full', colorMap[subject.color] || colorMap.mint)}>
            {subject.semester}o
          </span>
        )}
        <button
          onClick={() => setShowChapterModal(true)}
          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-mint-100 text-gray-400 hover:text-mint-600 transition-all"
          title="Novo capitulo"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
        {onDelete && (
          <button
            onClick={() => onDelete(subject.id)}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-pink-100 text-gray-400 hover:text-pink-500 transition-all"
            title="Excluir materia"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {open && (
        <div className="mt-1 flex flex-col gap-1">
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
              className="ml-6 text-xs text-gray-400 hover:text-mint-600 py-1 text-left transition-colors"
            >
              + Adicionar capitulo
            </button>
          )}
        </div>
      )}

      <CreateChapterModal
        open={showChapterModal}
        onClose={() => setShowChapterModal(false)}
        onCreate={createChapter}
      />
    </div>
  )
}
