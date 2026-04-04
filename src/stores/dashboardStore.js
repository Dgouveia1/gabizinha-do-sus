import { create } from 'zustand'

export const useDashboardStore = create((set) => ({
  todayCards: [],
  boardMetrics: [],
  loading: false,

  setTodayCards: (cards) => set({ todayCards: cards }),
  setBoardMetrics: (metrics) => set({ boardMetrics: metrics }),
  setLoading: (loading) => set({ loading }),
}))
