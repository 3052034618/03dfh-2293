export interface Store {
  id: string
  name: string
  region: string
  complaintCount: number
  closedCount: number
  closeRate: number
  avgHandleDays: number
  totalCompensation: number
  monthlyComplaints: number[]
  monthlyCompensation: number[]
}

export interface Project {
  id: string
  name: string
  category: string
  complaintRate: number
  compensationRate: number
  complaintCount: number
  totalCompensation: number
  reasons: ReasonTag[]
  monthlyComplaints: number[]
}

export interface Personnel {
  id: string
  name: string
  role: 'doctor' | 'consultant' | 'therapist'
  storeId: string
  complaintCount: number
  relatedProjects: string[]
}

export interface ComplaintCase {
  id: string
  storeId: string
  projectId: string
  personnelIds: string[]
  customerId: string
  complaintDate: string
  closeDate: string | null
  status: 'open' | 'closed'
  reason: string
  reasonCategory: string
  compensationType: CompensationType
  compensationAmount: number
  timeline: TimelineEvent[]
  isRepeatCustomer: boolean
  isCrossStore: boolean
  isTypical: boolean
  lesson: string
}

export type CompensationType = 'refund' | 'rework' | 'repair' | 'gift' | 'cash'

export interface TimelineEvent {
  date: string
  type: 'complaint' | 'response' | 'negotiation' | 'resolution'
  content: string
  operator: string
}

export interface ReasonTag {
  name: string
  count: number
  category: string
}

export interface AlertRule {
  id: string
  type: 'amount_threshold' | 'frequency_spike' | 'repeat_customer'
  threshold: number
  enabled: boolean
  label: string
}

export interface MonthlyReview {
  month: string
  storeId: string
  storeName: string
  summary: string
  keyMetrics: Record<string, number>
  issues: string[]
  trainingSuggestions: string[]
  projectAdjustments: string[]
}

export interface Alert {
  id: string
  type: 'amount_threshold' | 'frequency_spike' | 'repeat_customer'
  severity: 'critical' | 'warning' | 'info'
  message: string
  caseId?: string
  storeId?: string
  timestamp: string
}

export const COMPENSATION_TYPE_LABELS: Record<CompensationType, string> = {
  refund: '退款',
  rework: '补做',
  repair: '修复',
  gift: '赠品',
  cash: '现金补偿',
}

export const PERSONNEL_ROLE_LABELS: Record<Personnel['role'], string> = {
  doctor: '医生',
  consultant: '咨询师',
  therapist: '治疗师',
}

export const REASON_CATEGORIES: Record<string, string> = {
  expectation: '术前预期',
  education: '术后宣教',
  service: '服务体验',
  technique: '技术效果',
  communication: '沟通问题',
  management: '管理流程',
}
