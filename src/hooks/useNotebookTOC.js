import { useMemo } from 'react'
import { useNotebookStore } from '@/stores/notebookStore'
import { extractHeadings } from '@/utils/tiptapHelpers'

export function useNotebookTOC() {
  const { subjects, chapters, pages, activePage } = useNotebookStore()

  const structuralTOC = useMemo(() => {
    return subjects.map((subject) => ({
      id: subject.id,
      title: subject.title,
      emoji: subject.emoji,
      semester: subject.semester,
      type: 'subject',
      children: (chapters[subject.id] || []).map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        type: 'chapter',
        children: (pages[chapter.id] || []).map((page) => ({
          id: page.id,
          title: page.title,
          type: 'page',
        })),
      })),
    }))
  }, [subjects, chapters, pages])

  const pageHeadings = useMemo(() => {
    if (!activePage?.content) return []
    return extractHeadings(activePage.content)
  }, [activePage])

  const totalPages = useMemo(() => {
    return Object.values(pages).reduce((sum, arr) => sum + arr.length, 0)
  }, [pages])

  return { structuralTOC, pageHeadings, totalPages }
}
