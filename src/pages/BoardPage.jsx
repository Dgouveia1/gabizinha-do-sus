/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, no-use-before-define, no-unused-vars */
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useBoardStore } from '@/stores/boardStore'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import TopBar from '@/components/layout/TopBar'
import KanbanBoard from '@/components/kanban/KanbanBoard'
import CardModal from '@/components/card/CardModal'
import CollaborationPanel from '@/components/collaboration/CollaborationPanel'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import SemesterBadge from '@/components/boards/SemesterBadge'

export default function BoardPage() {
  const { boardId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { activeCardId, sidebarOpen, setSidebarOpen } = useUIStore()
  const { setActiveBoard, setLists, setCardsByListId, setCurrentMemberRole, activeBoard } = useBoardStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!boardId || !user) return

    async function fetchBoard() {
      setLoading(true)

      const [boardRes, listsRes, memberRes] = await Promise.all([
        supabase.from('boards').select('*').eq('id', boardId).single(),
        supabase.from('lists').select('*, cards(*)').eq('board_id', boardId).order('position'),
        supabase.from('board_members').select('role').eq('board_id', boardId).eq('user_id', user.id).single(),
      ])

      if (boardRes.error) {
        navigate('/boards')
        return
      }

      setActiveBoard(boardRes.data)

      // Determine role
      const isOwner = boardRes.data.owner_id === user.id
      const role = isOwner ? 'admin' : memberRes.data?.role || 'editor'
      setCurrentMemberRole(role)

      // Build lists and cardsByListId
      const listsList = (listsRes.data || []).map(({ cards: _c, ...list }) => list)
      const cardsMap = {}
      ;(listsRes.data || []).forEach(({ id, cards }) => {
        cardsMap[id] = (cards || []).sort((a, b) => a.position - b.position)
      })

      setLists(listsList)
      setCardsByListId(cardsMap)
      setLoading(false)
    }

    fetchBoard()
  }, [boardId, user, navigate, setActiveBoard, setCurrentMemberRole, setLists, setCardsByListId])

  const boardActions = (
    <div className="flex items-center gap-2">
      {activeBoard && <SemesterBadge semester={activeBoard.semester} />}
      <Button
        size="sm"
        variant="outline"
        onClick={() => setSidebarOpen(true)}
      >
        👥 Membros
      </Button>
    </div>
  )

  if (loading) {
    return (
      <>
        <TopBar backTo="/boards" />
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      </>
    )
  }

  return (
    <>
      <TopBar
        title={activeBoard?.title}
        backTo="/boards"
        actions={boardActions}
      />

      <div className="pt-2">
        <KanbanBoard boardId={boardId} />
      </div>

      {activeCardId && <CardModal boardId={boardId} />}

      <CollaborationPanel
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        boardId={boardId}
      />
    </>
  )
}
