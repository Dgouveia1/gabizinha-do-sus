import { create } from 'zustand'

const ONBOARDING_KEY = 'gabizinha_onboarding_done'

export const useUIStore = create((set) => ({
  activeCardId: null,
  onboardingPending: localStorage.getItem(ONBOARDING_KEY) !== 'true',
  sidebarOpen: false,
  toast: null, // { message, type: 'success'|'error'|'info' }

  openCard: (cardId) => set({ activeCardId: cardId }),
  closeCard: () => set({ activeCardId: null }),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setOnboardingPending: (pending) => {
    if (!pending) localStorage.setItem(ONBOARDING_KEY, 'true')
    set({ onboardingPending: pending })
  },

  showToast: (message, type = 'info') => set({ toast: { message, type } }),
  clearToast: () => set({ toast: null }),
}))
