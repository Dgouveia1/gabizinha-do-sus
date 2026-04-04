import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import TopBar from '@/components/layout/TopBar'
import Spinner from '@/components/ui/Spinner'
import NotebookSidebar from '@/components/notebook/NotebookSidebar'
import NotebookEmptyState from '@/components/notebook/NotebookEmptyState'
import NotebookBreadcrumb from '@/components/notebook/NotebookBreadcrumb'
import NotebookEditor from '@/components/editor/NotebookEditor'
import DrawingBlock from '@/components/editor/DrawingBlock'
import DrawingModal from '@/components/editor/DrawingModal'
import NotebookSearchBar from '@/components/notebook/NotebookSearchBar'
import NotebookTableOfContents from '@/components/notebook/NotebookTableOfContents'
import CreateSubjectModal from '@/components/notebook/CreateSubjectModal'
import { useNotebook } from '@/hooks/useNotebook'
import { useNotebookPage } from '@/hooks/useNotebookPage'
import { useNotebookStore } from '@/stores/notebookStore'

export default function NotebookPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const pageId = searchParams.get('page')
  const { subjects, loading, createSubject, deleteSubject } = useNotebook()
  const { page, drawings, loading: pageLoading, updatePageTitle, saveContent, uploadAttachment, createDrawing, saveDrawing, deleteDrawing } =
    useNotebookPage(pageId)
  const { saving, lastSavedAt, setSidebarOpen, tocOpen, setTocOpen } = useNotebookStore()
  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [activeDrawing, setActiveDrawing] = useState(null)

  const handleSelectPage = useCallback(
    (id) => {
      setSearchParams({ page: id })
    },
    [setSearchParams]
  )

  const handleSearchNavigate = useCallback(
    (id) => {
      setSearchParams({ page: id })
      setShowSearch(false)
    },
    [setSearchParams]
  )

  // Keyboard shortcut: Ctrl+K for search
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
      <button
        onClick={() => setShowSearch(true)}
        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        title="Pesquisar (Ctrl+K)"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </button>
      <button
        onClick={() => setTocOpen(!tocOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        title="Sumario"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      </button>
      <button
        onClick={() => setSidebarOpen(true)}
        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors md:hidden"
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
      <div className="flex h-[calc(100vh-56px-72px)]">
        <NotebookSidebar
          onSelectPage={handleSelectPage}
          activePageId={pageId}
          onCreateSubject={() => setShowSubjectModal(true)}
          onDeleteSubject={deleteSubject}
        />

        <main className="flex-1 overflow-y-auto">
          {!pageId ? (
            subjects.length === 0 ? (
              <NotebookEmptyState onCreateSubject={() => setShowSubjectModal(true)} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
                <div className="text-5xl mb-4">📖</div>
                <p className="text-sm text-gray-500">
                  Selecione uma pagina na barra lateral para comecar
                </p>
              </div>
            )
          ) : pageLoading ? (
            <div className="flex items-center justify-center h-64">
              <Spinner />
            </div>
          ) : page ? (
            <div className="max-w-4xl mx-auto px-4 sm:px-8 py-5">
              <NotebookBreadcrumb />
              <input
                value={page.title}
                onChange={(e) => updatePageTitle(e.target.value)}
                className="w-full text-2xl font-bold text-gray-900 border-none outline-none bg-transparent mb-4 placeholder-gray-300"
                placeholder="Titulo da pagina"
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
              <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
                {saving ? (
                  <span className="flex items-center gap-1">
                    <Spinner size="xs" /> Salvando...
                  </span>
                ) : lastSavedAt ? (
                  <span>Salvo automaticamente</span>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
              Pagina nao encontrada
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
