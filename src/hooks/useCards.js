import { supabase } from '@/lib/supabase'
import { useBoardStore } from '@/stores/boardStore'

export function useCards() {
  const { addCard, updateCard, removeCard, cardsByListId } = useBoardStore()

  async function createCard(listId, title) {
    const listCards = cardsByListId[listId] || []
    const maxPos = listCards.reduce((m, c) => Math.max(m, c.position ?? 0), 0)

    const { data, error } = await supabase
      .from('cards')
      .insert({ list_id: listId, title, position: maxPos + 1000 })
      .select()
      .single()

    if (!error) addCard(listId, data)
    return { data, error: error?.message }
  }

  async function patchCard(cardId, patch) {
    // Find current values for rollback
    const prev = {}
    for (const cards of Object.values(cardsByListId)) {
      const card = cards.find((c) => c.id === cardId)
      if (card) {
        for (const key of Object.keys(patch)) prev[key] = card[key]
        break
      }
    }
    updateCard(cardId, patch)
    const { error } = await supabase.from('cards').update(patch).eq('id', cardId)
    if (error) updateCard(cardId, prev)
    return error?.message
  }

  async function deleteCard(cardId) {
    // Find card and its list for rollback
    let removedCard = null
    let listId = null
    for (const [lid, cards] of Object.entries(cardsByListId)) {
      const card = cards.find((c) => c.id === cardId)
      if (card) { removedCard = { ...card }; listId = lid; break }
    }
    removeCard(cardId)
    const { error } = await supabase.from('cards').delete().eq('id', cardId)
    if (error && removedCard) addCard(listId, removedCard)
    return error?.message
  }

  async function moveCardInDB(cardId, newListId, newPosition) {
    const { error } = await supabase
      .from('cards')
      .update({ list_id: newListId, position: newPosition })
      .eq('id', cardId)
    return error?.message
  }

  return { createCard, patchCard, deleteCard, moveCardInDB }
}
