/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, no-use-before-define, no-unused-vars */
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useBoardStore } from '@/stores/boardStore'
import { useAuthStore } from '@/stores/authStore'

export function useBoards() {
  const { user } = useAuthStore()
  const { boards, setBoards } = useBoardStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBoards = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    const { data, error } = await supabase
      .from('boards')
      .select('*, board_members(role, user_id)')
      .eq('owner_id', user.id)
      .order('semester', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setBoards(data || [])
    setLoading(false)
  }, [setBoards])

  useEffect(() => {
    if (!user?.id) return
    fetchBoards()
  }, [user?.id, fetchBoards])

  async function createBoard({ title, description, semester }) {
    const { data, error } = await supabase
      .from('boards')
      .insert({ title, description, semester, owner_id: user.id })
      .select()
      .single()

    if (error) return { error: error.message }

    // Also add owner as admin member
    await supabase.from('board_members').insert({
      board_id: data.id,
      user_id: user.id,
      role: 'admin',
    })

    await fetchBoards()
    return { data }
  }

  async function deleteBoard(boardId) {
    const { error } = await supabase.from('boards').delete().eq('id', boardId)
    if (!error) setBoards(boards.filter((b) => b.id !== boardId))
    return error?.message
  }

  return { boards, loading, error, createBoard, deleteBoard, refetch: fetchBoards }
}
