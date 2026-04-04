import { useState, useMemo } from 'react'
import { cn } from '@/utils/cn'
import { useNotebookStore } from '@/stores/notebookStore'
import NotebookSidebarSubject from './NotebookSidebarSubject'
import Button from '@/components/ui/Button'

function groupBySemester(subjects) {
  const map = {}
  subjects.forEach((s) => {
    const key = s.semester ?? 0
    if (!map[key]) map[key] = []
    map[key].push(s)
  })
  // Sort: numeric semesters first (1,2,3,...), then "0" as "Sem semestre"
  return Object.entries(map).sort(([a], [b]) => {
    const na = Number(a), nb = Number(b)
    if (na === 0) return 1
    if (nb === 0) return -1
    return na - nb
  })
}

function SemesterGroup({ semester, subjects, collapsedSemesters, onToggle, ...subjectProps }) {
  const isCollapsed = collapsedSemesters.has(semester)
  const label = Number(semester) > 0 ? `${semester}º Semestre` : 'Sem Semestre'

  return (
    <div className="mb-1">
      {/* Semester header */}
      <button
        onClick={() => onToggle(semester)}
        className={cn(
          'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors',
          'hover:bg-gray-100 text-left group'
        )}
      >
        <svg
          className={cn(
            'h-3.5 w-3.5 text-gray-400 transition-transform flex-shrink-0',
            !isCollapsed && 'rotate-90'
          )}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex-1 truncate">
          {label}
        </span>
        <span className="text-[10px] text-gray-400 font-medium bg-gray-100 px-1.5 py-0.5 rounded-full">
          {subjects.length}
        </span>
      </button>

      {/* Subjects */}
      {!isCollapsed && (
        <div className="pl-1 mt-0.5 flex flex-col gap-0.5">
          {subjects.map((subject) => (
            <NotebookSidebarSubject
              key={subject.id}
              subject={subject}
              {...subjectProps}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function NotebookSidebar({ onSelectPage, activePageId, onCreateSubject, onDeleteSubject }) {
  const { subjects, sidebarOpen, setSidebarOpen } = useNotebookStore()
  const [collapsedSemesters, setCollapsedSemesters] = useState(new Set())

  const semesterGroups = useMemo(() => groupBySemester(subjects), [subjects])

  function toggleSemester(sem) {
    setCollapsedSemesters((prev) => {
      const next = new Set(prev)
      if (next.has(sem)) next.delete(sem)
      else next.add(sem)
      return next
    })
  }

  const handleSelectPage = (pageId) => {
    onSelectPage(pageId)
    setSidebarOpen(false)
  }

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'flex flex-col bg-white border-r border-gray-100 overflow-hidden',
          // Desktop: always visible, fixed width
          'hidden md:flex w-72 flex-shrink-0',
          // Mobile: slide-in drawer
          sidebarOpen && 'fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-xs md:relative md:z-auto',
          'transition-transform'
        )}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">📖</span>
            <h2 className="text-sm font-bold text-gray-800">Caderno</h2>
          </div>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="secondary" onClick={onCreateSubject} className="text-xs">
              + Matéria
            </Button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 md:hidden"
              aria-label="Fechar menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto py-2 px-2">
          {semesterGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-2">
              <span className="text-3xl">✏️</span>
              <p className="text-xs text-gray-400">
                Nenhuma matéria ainda.<br />Crie a primeira para começar!
              </p>
              <button
                onClick={onCreateSubject}
                className="mt-2 text-xs text-mint-600 font-semibold hover:underline"
              >
                + Criar matéria
              </button>
            </div>
          ) : (
            semesterGroups.map(([semester, semSubjects]) => (
              <SemesterGroup
                key={semester}
                semester={semester}
                subjects={semSubjects}
                collapsedSemesters={collapsedSemesters}
                onToggle={toggleSemester}
                onSelectPage={handleSelectPage}
                activePageId={activePageId}
                onDelete={onDeleteSubject}
              />
            ))
          )}
        </div>
      </aside>
    </>
  )
}
