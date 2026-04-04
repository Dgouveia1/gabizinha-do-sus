/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, no-use-before-define, no-unused-vars */
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useNotebookStore } from '@/stores/notebookStore'

export function useNotebookChapters(subjectId) {
  const { chapters, setChaptersForSubject, addChapter, updateChapter, removeChapter } =
    useNotebookStore()
  const [loading, setLoading] = useState(false)

  const subjectChapters = chapters[subjectId] || []

  const fetchChapters = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('notebook_chapters')
      .select('*')
      .eq('subject_id', subjectId)
      .order('position', { ascending: true })

    setChaptersForSubject(subjectId, data || [])
    setLoading(false)
  }, [subjectId, setChaptersForSubject])

  useEffect(() => {
    if (!subjectId) return
    fetchChapters()
  }, [subjectId, fetchChapters])

  async function createChapter(title) {
    const maxPos = subjectChapters.reduce((m, c) => Math.max(m, c.position ?? 0), 0)
    const { data, error } = await supabase
      .from('notebook_chapters')
      .insert({ subject_id: subjectId, title, position: maxPos + 1000 })
      .select()
      .single()

    if (error) return { error: error.message }
    addChapter(subjectId, data)
    return { data }
  }

  async function editChapter(chapterId, patch) {
    const prev = subjectChapters.find((c) => c.id === chapterId)
    updateChapter(subjectId, chapterId, patch)
    const { error } = await supabase
      .from('notebook_chapters')
      .update(patch)
      .eq('id', chapterId)
    if (error) {
      updateChapter(subjectId, chapterId, prev)
      return { error: error.message }
    }
    return {}
  }

  async function deleteChapter(chapterId) {
    const prev = subjectChapters.find((c) => c.id === chapterId)
    removeChapter(subjectId, chapterId)
    const { error } = await supabase
      .from('notebook_chapters')
      .delete()
      .eq('id', chapterId)
    if (error && prev) addChapter(subjectId, prev)
    return error?.message
  }

  return {
    chapters: subjectChapters,
    loading,
    createChapter,
    editChapter,
    deleteChapter,
    refetch: fetchChapters,
  }
}
