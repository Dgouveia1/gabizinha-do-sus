import { useRef, useCallback } from 'react'
import { useNotebookStore } from '@/stores/notebookStore'
import { extractPlainText } from '@/utils/tiptapHelpers'

export function useAutoSave(saveContent) {
  const timeoutRef = useRef(null)
  const pendingRef = useRef(null)
  const { setSaving, setLastSavedAt } = useNotebookStore()

  const debouncedSave = useCallback(
    (jsonContent) => {
      pendingRef.current = jsonContent
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(async () => {
        const content = pendingRef.current
        if (!content) return
        pendingRef.current = null
        setSaving(true)
        const plainText = extractPlainText(content)
        await saveContent(content, plainText)
        setSaving(false)
        setLastSavedAt(new Date())
      }, 1500)
    },
    [saveContent, setSaving, setLastSavedAt]
  )

  const flush = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    const content = pendingRef.current
    if (!content) return
    pendingRef.current = null
    setSaving(true)
    const plainText = extractPlainText(content)
    await saveContent(content, plainText)
    setSaving(false)
    setLastSavedAt(new Date())
  }, [saveContent, setSaving, setLastSavedAt])

  return { debouncedSave, flush }
}
