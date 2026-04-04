import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  session: null,
  user: null,
  loading: true,

  setSession: (session) => set({ session }),
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  clearAuth: () => set({ session: null, user: null, loading: false }),
}))
