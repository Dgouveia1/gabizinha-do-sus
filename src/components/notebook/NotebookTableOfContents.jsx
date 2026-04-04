import { useNotebookTOC } from '@/hooks/useNotebookTOC'
import { useNotebookStore } from '@/stores/notebookStore'
import { cn } from '@/utils/cn'

export default function NotebookTableOfContents({ open, onClose, onSelectPage }) {
  const { structuralTOC, pageHeadings, totalPages } = useNotebookTOC()
  const { activePageId } = useNotebookStore()

  if (!open) return null

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 md:hidden"
        onClick={onClose}
      />
      <aside
        className={cn(
          'fixed right-0 top-14 bottom-[72px] z-50 w-80 bg-white border-l border-gray-100 shadow-lg overflow-y-auto',
          'md:relative md:top-0 md:bottom-0 md:z-auto md:shadow-none'
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">Sumario</h2>
            <p className="text-[10px] text-gray-400">{totalPages} paginas</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-4 py-3">
          {/* Structural TOC */}
          {structuralTOC.map((subject) => (
            <div key={subject.id} className="mb-3">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 mb-1">
                <span>{subject.emoji}</span>
                <span className="truncate">{subject.title}</span>
                {subject.semester && (
                  <span className="text-[10px] text-gray-400 font-normal">
                    {subject.semester}o sem
                  </span>
                )}
              </div>
              {subject.children.map((chapter) => (
                <div key={chapter.id} className="ml-4 mb-1">
                  <p className="text-xs font-medium text-gray-600 mb-0.5">{chapter.title}</p>
                  {chapter.children.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => onSelectPage(page.id)}
                      className={cn(
                        'block w-full text-left ml-2 px-2 py-0.5 rounded text-xs truncate transition-colors',
                        page.id === activePageId
                          ? 'bg-mint-100 text-mint-700 font-medium'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      {page.title}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ))}

          {structuralTOC.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-6">
              Nenhum conteudo ainda
            </p>
          )}

          {/* In-page headings */}
          {pageHeadings.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Nesta pagina
              </h3>
              {pageHeadings.map((heading, i) => (
                <p
                  key={i}
                  className={cn(
                    'text-xs text-gray-600 py-0.5 truncate',
                    heading.level === 1 && 'font-semibold',
                    heading.level === 2 && 'ml-3',
                    heading.level === 3 && 'ml-6 text-gray-400'
                  )}
                >
                  {heading.text}
                </p>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
