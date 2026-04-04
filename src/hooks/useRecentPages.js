// Tracks last 8 opened notebook pages in localStorage
const KEY = 'nb_recent_v1'
const MAX = 8

function readStorage() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function useRecentPages() {
  function getRecentPages() {
    return readStorage()
  }

  function addRecentPage({ id, title, subjectTitle, subjectEmoji, chapterTitle }) {
    const current = readStorage().filter((p) => p.id !== id)
    const next = [
      { id, title, subjectTitle, subjectEmoji, chapterTitle, openedAt: Date.now() },
      ...current,
    ].slice(0, MAX)
    localStorage.setItem(KEY, JSON.stringify(next))
  }

  function clearRecent() {
    localStorage.removeItem(KEY)
  }

  return { getRecentPages, addRecentPage, clearRecent }
}
