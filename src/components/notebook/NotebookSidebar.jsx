import { cn } from '@/utils/cn'
import { useNotebookStore } from '@/stores/notebookStore'
import NotebookSidebarSubject from './NotebookSidebarSubject'
import Button from '@/components/ui/Button'

export default function NotebookSidebar({ onSelectPage, activePageId, onCreateSubject, onDeleteSubject }) {
  const { subjects, sidebarOpen, setSidebarOpen } = useNotebookStore()

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'flex flex-col bg-gray-50 border-r border-gray-100 overflow-y-auto',
          // Desktop: always visible, fixed width
          'hidden md:flex w-72 flex-shrink-0',
          // Mobile: slide-out panel
          sidebarOpen && 'fixed inset-y-0 left-0 z-50 flex w-72 md:relative md:z-auto'
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Materias</h2>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="secondary" onClick={onCreateSubject}>
              + Nova
            </Button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg hover:bg-gray-200 text-gray-400 md:hidden"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-1">
          {subjects.map((subject) => (
            <NotebookSidebarSubject
              key={subject.id}
              subject={subject}
              onSelectPage={(pageId) => {
                onSelectPage(pageId)
                setSidebarOpen(false)
              }}
              activePageId={activePageId}
              onDelete={onDeleteSubject}
            />
          ))}
          {subjects.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-6">
              Nenhuma materia ainda
            </p>
          )}
        </div>
      </aside>
    </>
  )
}
