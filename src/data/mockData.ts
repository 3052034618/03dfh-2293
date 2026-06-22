import type { Store, Project, Personnel, ComplaintCase, AlertRule, MonthlyReview, Alert, TimelineEvent, CompensationType } from '@/types'

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20250101)
const ri = (n: number) => Math.floor(rand() * n)
const riRange = (a: number, b: number) => a + Math.floor(rand() * (b - a + 1))
const pick = <T>(arr: T[]): T => arr[ri(arr.length)]

export const storeBases = [
  { id: 's1', name: '国贸旗舰店', region: '华北' },
  { id: 's2', name: '锦江分院', region: '西南' },
  { id: 's3', name: '朝阳分院', region: '华北' },
  { id: 's4', name: '浦东中心店', region: '华东' },
  { id: 's5', name: '天河旗舰', region: '华南' },
  { id: 's6', name: '江汉路店', region: '华中' },
]

export const projectBases = [
  { id: 'p1', name: '热玛吉', category: '光电抗衰' },
  { id: 'p2', name: '水光针', category: '注射美容' },
  { id: 'p3', name: '双眼皮手术', category: '整形外科' },
  { id: 'p4', name: '鼻综合', category: '整形外科' },
  { id: 'p5', name: '激光脱毛', category: '光电美容' },
  { id: 'p6', name: '玻尿酸填充', category: '注射美容' },
  { id: 'p7', name: '超声刀', category: '光电抗衰' },
  { id: 'p8', name: '吸脂手术', category: '整形外科' },
  { id: 'p9', name: '皮秒祛斑', category: '光电美容' },
  { id: 'p10', name: '线雕提升', category: '微创抗衰' },
  { id: 'p11', name: '肉毒素除皱', category: '注射美容' },
  { id: 'p12', name: '光子嫩肤', category: '光电美容' },
]

export const personnelBases = [
  { id: 'd1', name: '张伟', role: 'doctor' as const, storeId: 's1' },
  { id: 'd2', name: '李芳', role: 'doctor' as const, storeId: 's1' },
  { id: 'd3', name: '王明', role: 'doctor' as const, storeId: 's2' },
  { id: 'd4', name: '陈静', role: 'doctor' as const, storeId: 's3' },
  { id: 'd5', name: '刘洋', role: 'doctor' as const, storeId: 's3' },
  { id: 'd6', name: '赵磊', role: 'doctor' as const, storeId: 's4' },
  { id: 'd7', name: '周婷', role: 'doctor' as const, storeId: 's5' },
  { id: 'd8', name: '吴强', role: 'doctor' as const, storeId: 's5' },
  { id: 'd9', name: '郑华', role: 'doctor' as const, storeId: 's6' },
  { id: 'd10', name: '孙琳', role: 'doctor' as const, storeId: 's6' },
  { id: 'c1', name: '马丽', role: 'consultant' as const, storeId: 's1' },
  { id: 'c2', name: '黄敏', role: 'consultant' as const, storeId: 's2' },
  { id: 'c3', name: '林燕', role: 'consultant' as const, storeId: 's3' },
  { id: 'c4', name: '何雪', role: 'consultant' as const, storeId: 's4' },
  { id: 'c5', name: '罗娟', role: 'consultant' as const, storeId: 's5' },
  { id: 'c6', name: '谢颖', role: 'consultant' as const, storeId: 's6' },
  { id: 'c7', name: '唐琴', role: 'consultant' as const, storeId: 's1' },
  { id: 'c8', name: '韩冰', role: 'consultant' as const, storeId: 's3' },
  { id: 't1', name: '冯露', role: 'therapist' as const, storeId: 's1' },
  { id: 't2', name: '曹莹', role: 'therapist' as const, storeId: 's2' },
  { id: 't3', name: '许丹', role: 'therapist' as const, storeId: 's3' },
  { id: 't4', name: '邓萍', role: 'therapist' as const, storeId: 's4' },
  { id: 't5', name: '彭悦', role: 'therapist' as const, storeId: 's5' },
  { id: 't6', name: '蒋蓉', role: 'therapist' as const, storeId: 's6' },
  { id: 't7', name: '沈薇', role: 'therapist' as const, storeId: 's1' },
  { id: 't8', name: '任佳', role: 'therapist' as const, storeId: 's3' },
]

const reasons = [
  { text: '术后效果不达预期', category: 'expectation' },
  { text: '术前预期过高', category: 'expectation' },
  { text: '术后宣教不足', category: 'education' },
  { text: '排队等待过久', category: 'service' },
  { text: '术前沟通不充分', category: 'communication' },
  { text: '形态不满意', category: 'expectation' },
  { text: '术后恢复问题', category: 'technique' },
  { text: '色沉反黑', category: 'technique' },
  { text: '疼痛感超出预期', category: 'communication' },
  { text: '效果维持时间短', category: 'expectation' },
  { text: '服务态度不佳', category: 'service' },
  { text: '预约时间不准', category: 'management' },
]

const compTypes: CompensationType[] = ['refund', 'rework', 'repair', 'gift', 'cash']

const amountBase: Record<CompensationType, number> = {
  refund: 8000,
  rework: 3000,
  repair: 5000,
  gift: 1500,
  cash: 6000,
}

const compTypeLabel: Record<CompensationType, string> = {
  refund: '退款',
  rework: '补做',
  repair: '修复',
  gift: '赠礼',
  cash: '现金',
}

const REASON_LESSON: Record<string, string> = {
  expectation: '术前预期管理',
  education: '术后宣教流程',
  communication: '医患沟通规范',
  technique: '技术操作标准',
  service: '服务流程优化',
  management: '管理制度完善',
}

const generateStable = () => {
  const TOTAL = 248
  const storeWeights = [47, 44, 38, 52, 31, 36]
  const projectWeights = [28, 22, 35, 24, 12, 18, 20, 16, 14, 19, 10, 8]

  const remainingStoreCounts: Record<string, number> = {}
  const remainingProjectCounts: Record<string, number> = {}
  storeBases.forEach((s, i) => (remainingStoreCounts[s.id] = storeWeights[i]))
  projectBases.forEach((p, i) => (remainingProjectCounts[p.id] = projectWeights[i]))

  const cases: ComplaintCase[] = []
  const allCustomers: { id: string; storeIds: Set<string> }[] = []

  for (let i = 0; i < TOTAL; i++) {
    const caseId = `case${String(i + 1).padStart(3, '0')}`

    const availStoreIds = storeBases.filter(s => remainingStoreCounts[s.id] > 0).map(s => s.id)
    const storeId = availStoreIds.length > 0 ? pick(availStoreIds) : pick(storeBases.map(s => s.id))
    remainingStoreCounts[storeId] = Math.max(0, (remainingStoreCounts[storeId] || 0) - 1)

    const availProjectIds = projectBases.filter(p => remainingProjectCounts[p.id] > 0).map(p => p.id)
    const projectId = availProjectIds.length > 0 ? pick(availProjectIds) : pick(projectBases.map(p => p.id))
    remainingProjectCounts[projectId] = Math.max(0, (remainingProjectCounts[projectId] || 0) - 1)

    const reason = pick(reasons)
    const storePersonnel = personnelBases.filter(p => p.storeId === storeId)
    const personnelIds: string[] = []
    const byRole = (role: 'doctor' | 'consultant' | 'therapist') => {
      const candidates = storePersonnel.filter(p => p.role === role)
      if (candidates.length > 0) personnelIds.push(pick(candidates).id)
    }
    byRole('doctor')
    byRole('consultant')
    byRole('therapist')

    const month = riRange(1, 12)
    const day = riRange(1, 28)
    const compMonth = Math.min(month + riRange(1, 2), 12)
    const compType = pick(compTypes)
    const compensationAmount = Math.round(amountBase[compType] * (0.5 + rand() * 1.5))
    const isOpen = rand() < 0.08
    const isTypical = i < 20 || rand() < 0.08

    const complaintDate = `2025-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const closeDay = Math.min(day + riRange(1, 10), 28)
    const closeDate = isOpen ? null : `2025-${String(compMonth).padStart(2, '0')}-${String(closeDay).padStart(2, '0')}`

    let customerId: string
    if (rand() < 0.08 && allCustomers.length > 0) {
      customerId = pick(allCustomers).id
    } else {
      customerId = `cust${String(allCustomers.length + 1).padStart(3, '0')}`
      allCustomers.push({ id: customerId, storeIds: new Set<string>() })
    }
    const cust = allCustomers.find(c => c.id === customerId)!
    cust.storeIds.add(storeId)

    const timeline: TimelineEvent[] = [
      { date: complaintDate, type: 'complaint', content: '顾客来电投诉，表示不满', operator: '客服前台' },
      { date: complaintDate, type: 'response', content: '客服主管已回电，记录详细情况', operator: '客服主管' },
      {
        date: `2025-${String(month).padStart(2, '0')}-${String(Math.min(day + 2, 28)).padStart(2, '0')}`,
        type: 'negotiation',
        content: '与顾客协商赔付方案，顾客初步接受',
        operator: '门店经理',
      },
    ]
    if (!isOpen) {
      timeline.push({
        date: closeDate!,
        type: 'resolution',
        content: `达成一致，${compTypeLabel[compType]}处理`,
        operator: '门店经理',
      })
    }

    cases.push({
      id: caseId,
      storeId,
      projectId,
      personnelIds,
      customerId,
      complaintDate,
      closeDate,
      status: isOpen ? 'open' : 'closed',
      reason: reason.text,
      reasonCategory: reason.category,
      compensationType: compType,
      compensationAmount,
      timeline,
      isRepeatCustomer: false,
      isCrossStore: false,
      isTypical,
      lesson: isTypical ? `案例教训：${reason.text}需加强${REASON_LESSON[reason.category] || '流程管理'}` : '',
    })
  }

  for (const c of cases) {
    const cust = allCustomers.find(cc => cc.id === c.customerId)!
    const sameCustCases = cases.filter(cc => cc.customerId === c.customerId)
    c.isRepeatCustomer = sameCustCases.length >= 2
    c.isCrossStore = cust.storeIds.size >= 2
  }

  return cases
}

export const complaintCases: ComplaintCase[] = generateStable()

export const stores: Store[] = storeBases.map(sb => {
  const sc = complaintCases.filter(c => c.storeId === sb.id)
  const closed = sc.filter(c => c.status === 'closed')
  const handleDays = closed
    .filter(c => c.closeDate)
    .map(c => {
      const a = new Date(c.complaintDate)
      const b = new Date(c.closeDate!)
      return Math.round((b.getTime() - a.getTime()) / 86400000)
    })
  const avg = handleDays.length > 0 ? handleDays.reduce((a, b) => a + b, 0) / handleDays.length : 0
  const mc = Array(12).fill(0)
  const ma = Array(12).fill(0)
  for (const c of sc) {
    const m = parseInt(c.complaintDate.split('-')[1], 10) - 1
    mc[m]++
    ma[m] += c.compensationAmount
  }
  return {
    ...sb,
    complaintCount: sc.length,
    closedCount: closed.length,
    closeRate: +(closed.length / sc.length * 100).toFixed(1),
    avgHandleDays: +avg.toFixed(1),
    totalCompensation: sc.reduce((s, c) => s + c.compensationAmount, 0),
    monthlyComplaints: mc,
    monthlyCompensation: ma,
  }
})

export const projects: Project[] = projectBases.map(pb => {
  const pc = complaintCases.filter(c => c.projectId === pb.id)
  const reasonMap = new Map<string, { name: string; category: string; count: number }>()
  for (const c of pc) {
    const ex = reasonMap.get(c.reason)
    if (ex) ex.count++
    else reasonMap.set(c.reason, { name: c.reason, category: c.reasonCategory, count: 1 })
  }
  const reasonsList = [...reasonMap.values()].sort((a, b) => b.count - a.count)
  const mc = Array(12).fill(0)
  for (const c of pc) {
    const m = parseInt(c.complaintDate.split('-')[1], 10) - 1
    mc[m]++
  }
  const projectMonthTotal = 300 + pc.length * 10
  const projectCompTotal = 2000000 + pc.reduce((s, c) => s + c.compensationAmount, 0)
  return {
    ...pb,
    complaintCount: pc.length,
    complaintRate: +(pc.length / projectMonthTotal * 100).toFixed(1),
    compensationRate: +(pc.reduce((s, c) => s + c.compensationAmount, 0) / projectCompTotal * 100).toFixed(1),
    totalCompensation: pc.reduce((s, c) => s + c.compensationAmount, 0),
    reasons: reasonsList,
    monthlyComplaints: mc,
  }
})

export const personnel: Personnel[] = personnelBases.map(pb => {
  const related = new Set<string>()
  let cnt = 0
  for (const c of complaintCases) {
    if (c.personnelIds.includes(pb.id)) {
      cnt++
      related.add(c.projectId)
    }
  }
  return {
    ...pb,
    complaintCount: cnt,
    relatedProjects: [...related],
  }
})

export const alertRules: AlertRule[] = [
  { id: 'ar1', type: 'amount_threshold', threshold: 15000, enabled: true, label: '单笔赔付金额超过15,000元' },
  { id: 'ar2', type: 'frequency_spike', threshold: 10, enabled: true, label: '月度客诉环比增长超过10%' },
  { id: 'ar3', type: 'repeat_customer', threshold: 3, enabled: true, label: '同一顾客投诉超过3次' },
]

export const alerts: Alert[] = (() => {
  const list: Alert[] = []
  let alId = 1
  const high = [...complaintCases]
    .filter(c => c.compensationAmount > 15000)
    .sort((a, b) => b.compensationAmount - a.compensationAmount)
  for (let i = 0; i < Math.min(high.length, 2); i++) {
    const st = stores.find(s => s.id === high[i].storeId)
    const pr = projects.find(p => p.id === high[i].projectId)
    list.push({
      id: `al${alId++}`,
      type: 'amount_threshold',
      severity: 'critical',
      message: `${st?.name || '门店'}出现单笔¥${high[i].compensationAmount.toLocaleString()}赔付，超预警阈值`,
      caseId: high[i].id,
      storeId: high[i].storeId,
      timestamp: high[i].complaintDate,
    })
  }
  const p3Store = stores.find(s => s.id === 's3')
  if (p3Store) {
    list.push({
      id: `al${alId++}`,
      type: 'frequency_spike',
      severity: 'warning',
      message: `${p3Store.name}12月客诉环比增长15%，超预警阈值`,
      storeId: p3Store.id,
      timestamp: '2025-12-01',
    })
  }
  const custGroups = new Map<string, number>()
  for (const c of complaintCases) {
    custGroups.set(c.customerId, (custGroups.get(c.customerId) || 0) + 1)
  }
  const multi = [...custGroups.entries()].filter(([, n]) => n >= 3).sort((a, b) => b[1] - a[1])
  if (multi.length > 0) {
    const top = multi[0]
    const custCases = complaintCases.filter(c => c.customerId === top[0])
    const uniqueStores = new Set(custCases.map(c => c.storeId))
    list.push({
      id: `al${alId++}`,
      type: 'repeat_customer',
      severity: 'warning',
      message: `顾客${top[0]}已在${uniqueStores.size}家门店投诉${top[1]}次`,
      timestamp: '2025-11-28',
    })
  }
  return list
})()

export const monthlyReviews: MonthlyReview[] = stores.map(s => {
  const recent = complaintCases.filter(c => c.storeId === s.id && c.complaintDate.startsWith('2025-12'))
  const closed = recent.filter(c => c.status === 'closed')
  const projCnt = recent.length
  const totalComp = recent.reduce((sum, c) => sum + c.compensationAmount, 0)
  const closeR = projCnt > 0 ? +(closed.length / projCnt * 100).toFixed(1) : 100

  const reasons: string[] = []
  if (s.closeRate < 88) reasons.push('结案率偏低，需加强客诉响应速度')
  if (s.avgHandleDays > 5.5) reasons.push('平均处理时长偏长')

  const projectCounts = projects
    .map(p => ({ p, n: recent.filter(c => c.projectId === p.id).length }))
    .sort((a, b) => b.n - a.n)
  const topProject = projectCounts[0]
  if (topProject && topProject.n > 0) reasons.push(`${topProject.p.name}投诉占比较高`)

  const topPersonnel = [...personnel]
    .filter(p => p.storeId === s.id)
    .sort((a, b) => b.complaintCount - a.complaintCount)[0]
  if (topPersonnel && topPersonnel.complaintCount > 6) {
    reasons.push(`${topPersonnel.name}关联投诉${topPersonnel.complaintCount}起需关注`)
  }

  const train: string[] = []
  if (topPersonnel) {
    const roleTxt = topPersonnel.role === 'doctor'
      ? '技术操作规范与术前沟通'
      : topPersonnel.role === 'consultant'
      ? '投诉预防与客户预期管理'
      : '术后护理规范与操作SOP'
    train.push(`${topPersonnel.name}：${roleTxt}专项培训`)
  }
  if (recent.some(c => c.reasonCategory === 'education')) train.push('全员：术后宣教流程再培训')

  const adjusts: string[] = []
  if (topProject) adjusts.push(`${topProject.p.name}：建议加强术前沟通与效果模拟`)
  if (recent.some(c => c.reasonCategory === 'expectation')) adjusts.push('整形外科类项目：增加术后回访频次')

  return {
    month: '2025-12',
    storeId: s.id,
    storeName: s.name,
    summary: `${s.region}区${s.name}本月客诉${projCnt}件，结案率${closeR}%，赔付¥${totalComp.toLocaleString()}。${reasons.length > 0 ? reasons[0] : '整体运营平稳'}。`,
    keyMetrics: { complaintCount: projCnt, closeRate: closeR, avgHandleDays: s.avgHandleDays, totalCompensation: totalComp },
    issues: reasons.length > 0 ? reasons : ['本月运营平稳，无重大问题'],
    trainingSuggestions: train.length > 0 ? train : ['维持现有培训节奏'],
    projectAdjustments: adjusts.length > 0 ? adjusts : ['无需重大调整建议'],
  }
})

export const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
