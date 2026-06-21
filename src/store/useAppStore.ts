import { create } from 'zustand'
import type { Alert } from '@/types'
import { alerts as mockAlerts } from '@/data/mockData'

interface AppState {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  activeAlerts: Alert[]
  dismissAlert: (id: string) => void
  showAlertPanel: boolean
  toggleAlertPanel: () => void
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  activeAlerts: mockAlerts,
  dismissAlert: (id) => set((s) => ({ activeAlerts: s.activeAlerts.filter((a) => a.id !== id) })),
  showAlertPanel: false,
  toggleAlertPanel: () => set((s) => ({ showAlertPanel: !s.showAlertPanel })),
}))
