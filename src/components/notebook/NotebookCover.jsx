import { useState, useEffect } from 'react'
import { useRecentPages } from '@/hooks/useRecentPages'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/utils/cn'

function timeAgo(ts) {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}min atrás`
  if (hours < 24) return `${hours}h atrás`
  if (days === 1) return 'ontem'
  return `${days} dias atrás`
}

export default function NotebookCover({ onSelectPage, onCreateSubject }) {
  const { user } = useAuthStore()
  const { getRecentPages } = useRecentPages()
  const [recents, setRecents] = useState([])

  useEffect(() => {
    setRecents(getRecentPages())
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const firstName = user?.name?.split(' ')[0]
    || user?.email?.split('@')[0]
    || 'Estudante'

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Cover Hero */}
      <div
        className="relative flex flex-col items-center justify-center py-12 px-6 text-center overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #f0fdf4 0%, #fef9c3 50%, #fdf2f8 100%)',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        {/* Ruled-lines pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #86efac 27px, #86efac 28px)',
            backgroundPosition: '0 16px',
          }}
        />
        {/* Margin line */}
        <div
          className="absolute top-0 bottom-0 opacity-30"
          style={{ left: '10%', width: '1px', background: '#f9a8d4' }}
        />

        <div className="relative z-10 flex flex-col items-center gap-3">
          <div
            className="text-6xl select-none"
            style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}
          >
            📖
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Olá, {firstName}!
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Seu caderno digital está pronto 📝
            </p>
          </div>
          <button
            onClick={onCreateSubject}
            className={cn(
              'mt-2 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold',
              'bg-mint-500 text-white shadow-md hover:bg-mint-600 active:scale-95 transition-all'
            )}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nova Matéria
          </button>
        </div>
      </div>

      {/* Recent Pages */}
      <div className="flex-1 px-4 py-5 max-w-2xl mx-auto w-full">
        {recents.length > 0 ? (
          <>
            <div className="flex items-center gap-2 mb-3">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Abertas Recentemente
              </h2>
            </div>
            <div className="flex flex-col gap-2">
              {recents.map((page) => (
                <button
                  key={page.id}
                  onClick={() => onSelectPage(page.id)}
                  className={cn(
                    'group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left',
                    'bg-white border border-gray-100 hover:border-mint-200 hover:bg-mint-50',
                    'shadow-sm hover:shadow transition-all active:scale-[0.98]'
                  )}
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 text-lg">
                    {page.subjectEmoji || '📄'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {page.title || 'Sem título'}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {[page.subjectTitle, page.chapterTitle].filter(Boolean).join(' › ')}
                    </p>
                  </div>
                  <span className="text-xs text-gray-300 flex-shrink-0 group-hover:text-gray-400 transition-colors">
                    {timeAgo(page.openedAt)}
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="text-4xl">✏️</div>
            <p className="text-sm text-gray-400 max-w-xs">
              Selecione uma página no menu lateral para começar a estuda
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
