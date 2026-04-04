/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, no-use-before-define, no-unused-vars */
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useNotebookStore } from '@/stores/notebookStore'
import { useNotebookPage } from '@/hooks/useNotebookPage'
import NotebookSidebarPage from './NotebookSidebarPage'
import { cn } from '@/utils/cn'

export default function NotebookSidebarChapter({ chapter, onSelectPage, activePageId, onDeleteChapter }) {
  const [open, setOpen] = useState(true)
  const { pages } = useNotebookStore()
  const { createPage } = useNotebookPage()
  const chapterPages = pages[chapter.id] || []

  useEffect(() => {
    async function fetchPages() {
      const { setPagesForChapter } = useNotebookStore.getState()
      const { data } = await supabase
        .from('notebook_pages')
        .select('id, title, is_favorite, position, chapter_id')
        .eq('chapter_id', chapter.id)
        .order('position', { ascending: true })
      setPagesForChapter(chapter.id, data || [])
    }

    fetchPages()
  }, [chapter.id])

  async function handleAddPage() {
    const result = await createPage(chapter.id, 'Nova pagina')
    if (result?.data) onSelectPage(result.data.id)
  }

  async function handleDeletePage(pageId) {
    const { removePage } = useNotebookStore.getState()
    removePage(chapter.id, pageId)
    await supabase.from('notebook_pages').delete().eq('id', pageId)
  }

  return (
    <div className="ml-2">
      <div className="flex items-center gap-1 group">
        <button
          onClick={() => setOpen(!open)}
          className="p-0.5 rounded hover:bg-gray-100 transition-colors"
        >
          <svg
            className={cn('h-3.5 w-3.5 text-gray-400 transition-transform', open && 'rotate-90')}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <span
          className="text-sm font-medium text-gray-700 truncate flex-1 cursor-pointer hover:text-gray-900"
          onClick={() => setOpen(!open)}
        >
          {chapter.title}
        </span>
        <button
          onClick={handleAddPage}
          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-mint-100 text-gray-400 hover:text-mint-600 transition-all"
          title="Nova pagina"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
        {onDeleteChapter && (
          <button
            onClick={() => onDeleteChapter(chapter.id)}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-pink-100 text-gray-400 hover:text-pink-500 transition-all"
            title="Excluir capitulo"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
      {open && (
        <div className="ml-3 mt-0.5 flex flex-col gap-0.5">
          {chapterPages.map((page) => (
            <NotebookSidebarPage
              key={page.id}
              page={page}
              isActive={page.id === activePageId}
              onSelect={onSelectPage}
              onDelete={handleDeletePage}
            />
          ))}
          {chapterPages.length === 0 && (
            <button
              onClick={handleAddPage}
              className="text-xs text-gray-400 hover:text-mint-600 px-3 py-1 text-left transition-colors"
            >
              + Adicionar pagina
            </button>
          )}
        </div>
      )}
    </div>
  )
}
