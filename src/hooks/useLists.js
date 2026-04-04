import { supabase } from '@/lib/supabase'
import { useBoardStore } from '@/stores/boardStore'

export function useLists(boardId) {
  const { addList, updateList, removeList, lists } = useBoardStore()

  async function createList(title) {
    const maxPos = lists.reduce((m, l) => Math.max(m, l.position ?? 0), 0)
    const { data, error } = await supabase
      .from('lists')
      .insert({ board_id: boardId, title, position: maxPos + 1000 })
      .select()
      .single()

    if (!error) addList(data)
    return error?.message
  }

  async function renameList(listId, title) {
    updateList(listId, { title })
    const { error } = await supabase.from('lists').update({ title }).eq('id', listId)
    if (error) updateList(listId, { title: lists.find((l) => l.id === listId)?.title })
    return error?.message
  }

  async function deleteList(listId) {
    removeList(listId)
    const { error } = await supabase.from('lists').delete().eq('id', listId)
    return error?.message
  }

  async function saveListPositions(orderedLists) {
    const results = await Promise.all(
      orderedLists.map((l) =>
        supabase.from('lists').update({ position: l.position }).eq('id', l.id)
      )
    )
    const failed = results.find((r) => r.error)
    if (failed) throw new Error(failed.error.message)
  }

  return { createList, renameList, deleteList, saveListPositions }
}
