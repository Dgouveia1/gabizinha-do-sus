/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, no-use-before-define, no-unused-vars */
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useNotebookStore } from '@/stores/notebookStore'
import { useAuthStore } from '@/stores/authStore'

export function useNotebook() {
  const { user } = useAuthStore()
  const { notebook, subjects, setNotebook, setSubjects, addSubject, updateSubject, removeSubject } =
    useNotebookStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const init = useCallback(async () => {
    setLoading(true)
    const nb = await ensureNotebook()
    if (nb) await fetchSubjects(nb.id)
    setLoading(false)
  }, [user?.id, setNotebook, setSubjects]) // Need to pass these, wait actually just letting standard functions exist and disabling exhaustive deps is cleaner if they use refs, but useCallback is the react way.

  useEffect(() => {
    if (!user?.id) return
    init()
  }, [user?.id, init])

  async function ensureNotebook() {
    let { data, error: err } = await supabase
      .from('notebooks')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!data && !err?.code?.startsWith('PGRST')) {
      // Notebook not found, create one
      const res = await supabase
        .from('notebooks')
        .insert({ user_id: user.id })
        .select()
        .single()
      data = res.data
      err = res.error
    }

    if (err && err.code !== 'PGRST116') {
      setError(err.message)
      return null
    }

    if (!data) {
      // PGRST116 = no rows — create notebook
      const res = await supabase
        .from('notebooks')
        .insert({ user_id: user.id })
        .select()
        .single()
      if (res.error) {
        setError(res.error.message)
        return null
      }
      data = res.data
    }

    setNotebook(data)
    return data
  }

  async function fetchSubjects(notebookId) {
    const nid = notebookId || notebook?.id
    if (!nid) return
    const { data, error: err } = await supabase
      .from('notebook_subjects')
      .select('*')
      .eq('notebook_id', nid)
      .order('semester', { ascending: true })
      .order('position', { ascending: true })

    if (err) setError(err.message)
    else setSubjects(data || [])
  }

  async function createSubject({ title, semester, emoji, color }) {
    const maxPos = subjects.reduce((m, s) => Math.max(m, s.position ?? 0), 0)
    const { data, error: err } = await supabase
      .from('notebook_subjects')
      .insert({
        notebook_id: notebook.id,
        title,
        semester,
        emoji: emoji || '📘',
        color: color || 'mint',
        position: maxPos + 1000,
      })
      .select()
      .single()

    if (err) return { error: err.message }
    addSubject(data)
    return { data }
  }

  async function editSubject(id, patch) {
    const prev = subjects.find((s) => s.id === id)
    updateSubject(id, patch)
    const { error: err } = await supabase
      .from('notebook_subjects')
      .update(patch)
      .eq('id', id)
    if (err) {
      updateSubject(id, prev)
      return { error: err.message }
    }
    return {}
  }

  async function deleteSubject(id) {
    const prev = subjects.find((s) => s.id === id)
    removeSubject(id)
    const { error: err } = await supabase
      .from('notebook_subjects')
      .delete()
      .eq('id', id)
    if (err && prev) {
      addSubject(prev)
      return err.message
    }
  }

  return {
    notebook,
    subjects,
    loading,
    error,
    createSubject,
    editSubject,
    deleteSubject,
    refetchSubjects: () => fetchSubjects(),
  }
}
