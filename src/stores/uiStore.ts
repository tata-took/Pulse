import { create } from 'zustand'

interface Toast {
  id: string
  message: string
  type: 'info' | 'success' | 'error' | 'warning'
}

interface UIState {
  toasts: Toast[]
  addToast: (message: string, type?: Toast['type']) => void
  removeToast: (id: string) => void
  groupOpenState: Record<string, boolean>
  setGroupOpen: (groupId: string, open: boolean) => void
  saveBannerTabId: string | null
  setSaveBannerTabId: (tabId: string | null) => void
}

export const useUIStore = create<UIState>((set) => {
  // Persist group open state in localStorage
  const savedOpenState: Record<string, boolean> = (() => {
    try {
      return JSON.parse(localStorage.getItem('pulse_group_open') || '{}')
    } catch {
      return {}
    }
  })()

  return {
    toasts: [],
    addToast: (message, type = 'info') => {
      const id = crypto.randomUUID()
      set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
      }, 3000)
    },
    removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
    groupOpenState: savedOpenState,
    setGroupOpen: (groupId, open) => {
      set((state) => {
        const next = { ...state.groupOpenState, [groupId]: open }
        localStorage.setItem('pulse_group_open', JSON.stringify(next))
        return { groupOpenState: next }
      })
    },
    saveBannerTabId: null,
    setSaveBannerTabId: (tabId) => set({ saveBannerTabId: tabId }),
  }
})
