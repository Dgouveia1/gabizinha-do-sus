import { useEffect, useRef } from 'react'
import { useNotebookSearch } from '@/hooks/useNotebookSearch'
import Spinner from '@/components/ui/Spinner'

export default function NotebookSearchBar({ open, onClose, onNavigate }) {
  const { searchQuery, searchResults, searchLoading, debouncedSearch, clearSearch } =
    useNotebookSearch()
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      clearSearch()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl mx-4 bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <svg className="h-5 w-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            ref={inputRef}
            value={searchQuery}
            onChange={(e) => debouncedSearch(e.target.value)}
            placeholder="Pesquisar em todo o caderno..."
            className="flex-1 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
          />
          {searchLoading && <Spinner size="sm" />}
          <kbd className="hidden sm:inline-flex text-[10px] text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">
          {searchResults.length > 0 ? (
            <div className="py-2">
              {searchResults.map((result) => (
                <button
                  key={result.page_id}
                  onClick={() => onNavigate(result.page_id)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                    <span>{result.subject_emoji}</span>
                    <span>{result.subject_title}</span>
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    <span>{result.chapter_title}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 mb-1">{result.page_title}</p>
                  {result.snippet && (
                    <p
                      className="text-xs text-gray-500 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: result.snippet }}
                    />
                  )}
                </button>
              ))}
            </div>
          ) : searchQuery.trim() && !searchLoading ? (
            <div className="py-8 text-center text-sm text-gray-400">
              Nenhum resultado encontrado
            </div>
          ) : !searchQuery.trim() ? (
            <div className="py-8 text-center text-sm text-gray-400">
              Digite para pesquisar em todas as paginas
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
