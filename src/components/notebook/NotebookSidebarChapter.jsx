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
    const result = await createPage(chapter.id, 'Nova página')
    if (result?.data) onSelectPage(result.data.id)
  }

  async function handleDeletePage(pageId) {
    const { removePage } = useNotebookStore.getState()
    removePage(chapter.id, pageId)
    await supabase.from('notebook_pages').delete().eq('id', pageId)
  }

  return (
    <div>
      {/* Chapter row */}
      <div className="flex items-center gap-1 group min-h-[36px]">
        <button
          onClick={() => setOpen(!open)}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          <svg
            className={cn('h-3 w-3 text-gray-400 transition-transform', open && 'rotate-90')}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          className="text-xs font-medium text-gray-600 truncate flex-1 text-left hover:text-gray-900 py-1"
          onClick={() => setOpen(!open)}
        >
          {chapter.title}
        </button>

        {/* Page count badge */}
        {chapterPages.length > 0 && (
          <span className="text-[10px] text-gray-400 font-medium flex-shrink-0 tabular-nums">
            {chapterPages.length}
          </span>
        )}

        {/* Action buttons */}
        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleAddPage}
            className="p-1 rounded-lg hover:bg-mint-100 text-gray-400 hover:text-mint-600 transition-colors"
            title="Nova página"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
          {onDeleteChapter && (
            <button
              onClick={() => onDeleteChapter(chapter.id)}
              className="p-1 rounded-lg hover:bg-pink-100 text-gray-400 hover:text-pink-500 transition-colors"
              title="Excluir capítulo"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Pages */}
      {open && (
        <div className="ml-3 flex flex-col gap-0.5">
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
              className="text-xs text-gray-400 hover:text-mint-600 px-2 py-1.5 text-left transition-colors rounded-lg hover:bg-mint-50"
            >
              + Adicionar página
            </button>
          )}
        </div>
      )}
    </div>
  )
}
