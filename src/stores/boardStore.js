import { create } from 'zustand'
import { reorderItems, recalculatePositions } from '@/utils/positionHelpers'

export const useBoardStore = create((set, get) => ({
  boards: [],
  activeBoard: null,
  lists: [],
  cardsByListId: {},
  currentMemberRole: null,
  _snapshot: null,

  setBoards: (boards) => set({ boards }),

  setActiveBoard: (board) => set({ activeBoard: board }),

  setCurrentMemberRole: (role) => set({ currentMemberRole: role }),

  setLists: (lists) => set({ lists }),

  setCardsByListId: (map) => set({ cardsByListId: map }),

  addList: (list) =>
    set((s) => ({ lists: [...s.lists, list] })),

  updateList: (listId, patch) =>
    set((s) => ({
      lists: s.lists.map((l) => (l.id === listId ? { ...l, ...patch } : l)),
    })),

  removeList: (listId) =>
    set((s) => {
      const { [listId]: _, ...rest } = s.cardsByListId
      return { lists: s.lists.filter((l) => l.id !== listId), cardsByListId: rest }
    }),

  addCard: (listId, card) =>
    set((s) => ({
      cardsByListId: {
        ...s.cardsByListId,
        [listId]: [...(s.cardsByListId[listId] || []), card],
      },
    })),

  updateCard: (cardId, patch) =>
    set((s) => {
      const updated = {}
      for (const [lid, cards] of Object.entries(s.cardsByListId)) {
        updated[lid] = cards.map((c) => (c.id === cardId ? { ...c, ...patch } : c))
      }
      return { cardsByListId: updated }
    }),

  removeCard: (cardId) =>
    set((s) => {
      const updated = {}
      for (const [lid, cards] of Object.entries(s.cardsByListId)) {
        updated[lid] = cards.filter((c) => c.id !== cardId)
      }
      return { cardsByListId: updated }
    }),

  // Snapshot current state for rollback on drag error
  snapshotForRollback: () => {
    const { lists, cardsByListId } = get()
    const cardsCopy = {}
    for (const [lid, cards] of Object.entries(cardsByListId)) {
      cardsCopy[lid] = cards.map((c) => ({ ...c }))
    }
    set({ _snapshot: { lists: lists.map((l) => ({ ...l })), cardsByListId: cardsCopy } })
  },

  rollback: () => {
    const snap = get()._snapshot
    if (snap) set({ lists: snap.lists, cardsByListId: snap.cardsByListId, _snapshot: null })
  },

  moveCard: ({ sourceListId, destListId, sourceIndex, destIndex }) =>
    set((s) => {
      const srcCards = [...(s.cardsByListId[sourceListId] || [])]
      const [moved] = srcCards.splice(sourceIndex, 1)

      let destCards
      if (sourceListId === destListId) {
        srcCards.splice(destIndex, 0, moved)
        destCards = recalculatePositions(srcCards)
        return {
          cardsByListId: { ...s.cardsByListId, [sourceListId]: destCards },
        }
      } else {
        const destArr = [...(s.cardsByListId[destListId] || [])]
        destArr.splice(destIndex, 0, { ...moved, list_id: destListId })
        return {
          cardsByListId: {
            ...s.cardsByListId,
            [sourceListId]: recalculatePositions(srcCards),
            [destListId]: recalculatePositions(destArr),
          },
        }
      }
    }),

  moveList: ({ sourceIndex, destIndex }) =>
    set((s) => {
      const newLists = reorderItems(s.lists, sourceIndex, destIndex)
      return { lists: recalculatePositions(newLists) }
    }),
}))
