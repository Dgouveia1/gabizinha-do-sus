/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, no-use-before-define, no-unused-vars */
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useDashboardStore } from '@/stores/dashboardStore'
import { useAuthStore } from '@/stores/authStore'
import { todayISO, isOverdue } from '@/utils/dateHelpers'

const DONE_LIST_NAMES = ['feito', 'concluído', 'done', 'concluido']

export function useDashboard() {
  const { user } = useAuthStore()
  const { todayCards, boardMetrics, loading, setTodayCards, setBoardMetrics, setLoading } =
    useDashboardStore()

  useEffect(() => {
    if (!user?.id) return
    fetchDashboard()
  }, [user?.id])

  async function fetchDashboard() {
    setLoading(true)
    const today = todayISO()

    const [todayRes, boardsRes] = await Promise.all([
      // Cards due today across all boards
      supabase
        .from('cards')
        .select('*, lists!inner(board_id, title, boards!inner(title, semester))')
        .eq('due_date', today),
      // All boards for metrics
      supabase
        .from('boards')
        .select('id, title, semester, lists(id, title, cards(id, due_date))')
        .order('semester'),
    ])

    if (todayRes.data) setTodayCards(todayRes.data)

    if (boardsRes.data) {
      const metrics = boardsRes.data.map((board) => {
        let totalCards = 0
        let doneCards = 0
        let overdueCards = 0

        board.lists?.forEach((list) => {
          const isDoneList = DONE_LIST_NAMES.includes(list.title.toLowerCase())
          list.cards?.forEach((card) => {
            totalCards++
            if (isDoneList) doneCards++
            else if (card.due_date && isOverdue(card.due_date)) overdueCards++
          })
        })

        return { boardId: board.id, title: board.title, semester: board.semester, totalCards, doneCards, overdueCards }
      })
      setBoardMetrics(metrics)
    }

    setLoading(false)
  }

  return { todayCards, boardMetrics, loading, refetch: fetchDashboard }
}
