import { create } from 'zustand'
import type { Alert, CompensationType } from '@/types'
import { alerts as mockAlerts } from '@/data/mockData'

export interface CaseFilters {
  storeId: string
  projectId: string
  personnelId: string
  reasonCategory: string
  compType: CompensationType | ''
  amountMin: number
  amountMax: number
  typicalOnly: boolean
}

export const emptyCaseFilters: CaseFilters = {
  storeId: '',
  projectId: '',
  personnelId: '',
  reasonCategory: '',
  compType: '',
  amountMin: 0,
  amountMax: Infinity,
  typicalOnly: false,
}

interface AppState {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  activeAlerts: Alert[]
  dismissAlert: (id: string) => void
  showAlertPanel: boolean
  toggleAlertPanel: () => void
  selectedCaseId: string | null
  setSelectedCaseId: (id: string | null) => void
  caseFilters: CaseFilters
  setCaseFilters: (f: Partial<CaseFilters>) => void
  resetCaseFilters: () => void
  selectedPersonnelId: string | null
  setSelectedPersonnelId: (id: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  activeAlerts: mockAlerts,
  dismissAlert: (id) => set((s) => ({ activeAlerts: s.activeAlerts.filter((a) => a.id !== id) })),
  showAlertPanel: false,
  toggleAlertPanel: () => set((s) => ({ showAlertPanel: !s.showAlertPanel })),
  selectedCaseId: null,
  setSelectedCaseId: (id) => set({ selectedCaseId: id }),
  caseFilters: { ...emptyCaseFilters },
  setCaseFilters: (f) => set((s) => ({ caseFilters: { ...s.caseFilters, ...f } })),
  resetCaseFilters: () => set({ caseFilters: { ...emptyCaseFilters } }),
  selectedPersonnelId: null,
  setSelectedPersonnelId: (id) => set({ selectedPersonnelId: id }),
}))
