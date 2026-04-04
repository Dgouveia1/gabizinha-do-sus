import { useMemo } from 'react'
import { useNotebookStore } from '@/stores/notebookStore'

export default function NotebookBreadcrumb() {
  const { activePage, subjects, chapters } = useNotebookStore()

  const breadcrumb = useMemo(() => {
    if (!activePage) return null

    let chapter = null
    let subject = null

    // Find chapter
    for (const [, chapterList] of Object.entries(chapters)) {
      const found = chapterList.find((c) => c.id === activePage.chapter_id)
      if (found) {
        chapter = found
        break
      }
    }

    // Find subject
    if (chapter) {
      subject = subjects.find((s) =>
        (chapters[s.id] || []).some((c) => c.id === chapter.id)
      )
    }

    return { subject, chapter }
  }, [activePage, subjects, chapters])

  if (!breadcrumb) return null

  return (
    <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
      {breadcrumb.subject && (
        <>
          <span className="flex items-center gap-1">
            <span>{breadcrumb.subject.emoji}</span>
            <span className="text-gray-500">{breadcrumb.subject.title}</span>
          </span>
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </>
      )}
      {breadcrumb.chapter && (
        <>
          <span className="text-gray-500">{breadcrumb.chapter.title}</span>
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </>
      )}
      <span className="text-gray-600 font-medium">{activePage?.title}</span>
    </nav>
  )
}
