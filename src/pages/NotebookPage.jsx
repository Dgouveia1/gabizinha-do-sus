import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import TopBar from '@/components/layout/TopBar'
import Spinner from '@/components/ui/Spinner'
import NotebookSidebar from '@/components/notebook/NotebookSidebar'
import NotebookCover from '@/components/notebook/NotebookCover'
import NotebookBreadcrumb from '@/components/notebook/NotebookBreadcrumb'
import NotebookEditor from '@/components/editor/NotebookEditor'
import DrawingBlock from '@/components/editor/DrawingBlock'
import DrawingModal from '@/components/editor/DrawingModal'
import NotebookSearchBar from '@/components/notebook/NotebookSearchBar'
import NotebookTableOfContents from '@/components/notebook/NotebookTableOfContents'
import CreateSubjectModal from '@/components/notebook/CreateSubjectModal'
import RecordingWidget from '@/components/notebook/RecordingWidget'
import { useNotebook } from '@/hooks/useNotebook'
import { useNotebookPage } from '@/hooks/useNotebookPage'
import { useNotebookStore } from '@/stores/notebookStore'
import { useRecentPages } from '@/hooks/useRecentPages'

export default function NotebookPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const pageId = searchParams.get('page')

  const { subjects, loading, createSubject, deleteSubject } = useNotebook()
  const {
    page, drawings, loading: pageLoading,
    updatePageTitle, saveContent, uploadAttachment,
    createDrawing, saveDrawing, deleteDrawing,
  } = useNotebookPage(pageId)

  const { saving, lastSavedAt, setSidebarOpen, tocOpen, setTocOpen } = useNotebookStore()
  const { addRecentPage } = useRecentPages()

  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [activeDrawing, setActiveDrawing] = useState(null)

  // Track recent pages whenever a page is loaded
  const trackedPageId = useRef(null)
  useEffect(() => {
    if (!page || page.id === trackedPageId.current) return
    trackedPageId.current = page.id

    // Build breadcrumb info from store
    const { subjects: storeSubjects, chapters, pages: storePages } = useNotebookStore.getState()
    let subjectTitle = '', subjectEmoji = '', chapterTitle = ''
    for (const subject of storeSubjects) {
      const subChapters = chapters[subject.id] || []
      for (const chapter of subChapters) {
        const chapterPgs = storePages[chapter.id] || []
        if (chapterPgs.some((p) => p.id === page.id)) {
          subjectTitle = subject.title
          subjectEmoji = subject.emoji
          chapterTitle = chapter.title
          break
        }
      }
      if (subjectTitle) break
    }

    addRecentPage({
      id: page.id,
      title: page.title,
      subjectTitle,
      subjectEmoji,
      chapterTitle,
    })
  }, [page, addRecentPage])

  const handleSelectPage = useCallback(
    (id) => setSearchParams({ page: id }),
    [setSearchParams]
  )

  const handleSearchNavigate = useCallback(
    (id) => {
      setSearchParams({ page: id })
      setShowSearch(false)
    },
    [setSearchParams]
  )

  // Ctrl+K for search
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (loading) {
    return (
      <>
        <TopBar title="Caderno" />
        <div className="flex items-center justify-center h-64">
          <Spinner />
        </div>
      </>
    )
  }

  const topBarActions = (
    <div className="flex items-center gap-1">
      {/* Search */}
      <button
        onClick={() => setShowSearch(true)}
        className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
        title="Pesquisar (Ctrl+K)"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </button>
      {/* TOC */}
      <button
        onClick={() => setTocOpen(!tocOpen)}
        className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
        title="Sumário"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      </button>
      {/* Hamburger (mobile only) */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors md:hidden"
        title="Menu"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
    </div>
  )

  return (
    <>
      <TopBar title="Caderno" actions={topBarActions} />

      {/* Main layout — use 100dvh for mobile browser chrome awareness */}
      <div className="flex" style={{ height: 'calc(100dvh - 56px - 72px)' }}>
        <NotebookSidebar
          onSelectPage={handleSelectPage}
          activePageId={pageId}
          onCreateSubject={() => setShowSubjectModal(true)}
          onDeleteSubject={deleteSubject}
        />

        <main className="flex-1 overflow-y-auto">
          {!pageId ? (
            // Cover page (shows recent files or empty state)
            <NotebookCover
              onSelectPage={handleSelectPage}
              onCreateSubject={() => setShowSubjectModal(true)}
            />
          ) : pageLoading ? (
            <div className="flex items-center justify-center h-64">
              <Spinner />
            </div>
          ) : page ? (
            <div className="max-w-3xl mx-auto px-4 sm:px-8 py-5">
              <NotebookBreadcrumb />

              {/* Page title */}
              <input
                value={page.title}
                onChange={(e) => updatePageTitle(e.target.value)}
                className="w-full text-2xl font-bold text-gray-900 border-none outline-none bg-transparent mb-4 placeholder-gray-300"
                style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)' }}
                placeholder="Título da página"
              />

              <NotebookEditor
                key={page.id}
                content={page.content}
                onSave={saveContent}
                onUploadImage={uploadAttachment}
                onInsertDrawing={async () => {
                  const result = await createDrawing('Desenho')
                  if (result?.data) setActiveDrawing(result.data)
                }}
              />

              {/* Drawings list */}
              {drawings.length > 0 && (
                <div className="mt-4 flex flex-col gap-2">
                  {drawings.map((d) => (
                    <DrawingBlock
                      key={d.id}
                      drawing={d}
                      onOpen={() => setActiveDrawing(d)}
                      onDelete={deleteDrawing}
                    />
                  ))}
                </div>
              )}

              {/* Auto-save indicator */}
              <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                {saving ? (
                  <span className="flex items-center gap-1">
                    <Spinner size="xs" /> Salvando...
                  </span>
                ) : lastSavedAt ? (
                  <span>Salvo automaticamente</span>
                ) : null}
              </div>

              {/* Recording widget */}
              <RecordingWidget pageId={pageId} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
              Página não encontrada
            </div>
          )}
        </main>

        <NotebookTableOfContents
          open={tocOpen}
          onClose={() => setTocOpen(false)}
          onSelectPage={handleSelectPage}
        />
      </div>

      <CreateSubjectModal
        open={showSubjectModal}
        onClose={() => setShowSubjectModal(false)}
        onCreate={createSubject}
      />

      <NotebookSearchBar
        open={showSearch}
        onClose={() => setShowSearch(false)}
        onNavigate={handleSearchNavigate}
      />

      <DrawingModal
        open={!!activeDrawing}
        onClose={() => setActiveDrawing(null)}
        drawing={activeDrawing}
        onSave={saveDrawing}
      />
    </>
  )
}
