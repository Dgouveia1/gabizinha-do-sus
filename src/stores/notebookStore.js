import { create } from 'zustand'

export const useNotebookStore = create((set) => ({
  notebook: null,
  subjects: [],
  chapters: {},       // { [subjectId]: chapter[] }
  pages: {},          // { [chapterId]: page[] }
  activePage: null,
  activePageId: null,
  sidebarOpen: false,
  searchQuery: '',
  searchResults: [],
  searchLoading: false,
  tocOpen: false,
  saving: false,
  lastSavedAt: null,

  setNotebook: (notebook) => set({ notebook }),

  setSubjects: (subjects) => set({ subjects }),

  addSubject: (subject) =>
    set((s) => ({ subjects: [...s.subjects, subject] })),

  updateSubject: (id, patch) =>
    set((s) => ({
      subjects: s.subjects.map((sub) => (sub.id === id ? { ...sub, ...patch } : sub)),
    })),

  removeSubject: (id) =>
    set((s) => {
      const { [id]: _, ...restChapters } = s.chapters
      return {
        subjects: s.subjects.filter((sub) => sub.id !== id),
        chapters: restChapters,
      }
    }),

  setChaptersForSubject: (subjectId, chapters) =>
    set((s) => ({ chapters: { ...s.chapters, [subjectId]: chapters } })),

  addChapter: (subjectId, chapter) =>
    set((s) => ({
      chapters: {
        ...s.chapters,
        [subjectId]: [...(s.chapters[subjectId] || []), chapter],
      },
    })),

  updateChapter: (subjectId, chapterId, patch) =>
    set((s) => ({
      chapters: {
        ...s.chapters,
        [subjectId]: (s.chapters[subjectId] || []).map((ch) =>
          ch.id === chapterId ? { ...ch, ...patch } : ch
        ),
      },
    })),

  removeChapter: (subjectId, chapterId) =>
    set((s) => {
      const { [chapterId]: _, ...restPages } = s.pages
      return {
        chapters: {
          ...s.chapters,
          [subjectId]: (s.chapters[subjectId] || []).filter((ch) => ch.id !== chapterId),
        },
        pages: restPages,
      }
    }),

  setPagesForChapter: (chapterId, pages) =>
    set((s) => ({ pages: { ...s.pages, [chapterId]: pages } })),

  addPage: (chapterId, page) =>
    set((s) => ({
      pages: {
        ...s.pages,
        [chapterId]: [...(s.pages[chapterId] || []), page],
      },
    })),

  updatePage: (chapterId, pageId, patch) =>
    set((s) => ({
      pages: {
        ...s.pages,
        [chapterId]: (s.pages[chapterId] || []).map((pg) =>
          pg.id === pageId ? { ...pg, ...patch } : pg
        ),
      },
    })),

  removePage: (chapterId, pageId) =>
    set((s) => ({
      pages: {
        ...s.pages,
        [chapterId]: (s.pages[chapterId] || []).filter((pg) => pg.id !== pageId),
      },
      activePage: s.activePageId === pageId ? null : s.activePage,
      activePageId: s.activePageId === pageId ? null : s.activePageId,
    })),

  setActivePage: (page) => set({ activePage: page, activePageId: page?.id || null }),
  setActivePageId: (id) => set({ activePageId: id }),
  clearActivePage: () => set({ activePage: null, activePageId: null }),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  setSearchQuery: (q) => set({ searchQuery: q }),
  setSearchResults: (results) => set({ searchResults: results }),
  setSearchLoading: (loading) => set({ searchLoading: loading }),

  setTocOpen: (open) => set({ tocOpen: open }),
  toggleToc: () => set((s) => ({ tocOpen: !s.tocOpen })),

  setSaving: (saving) => set({ saving }),
  setLastSavedAt: (date) => set({ lastSavedAt: date }),
}))
