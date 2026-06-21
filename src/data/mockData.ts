import type { Store, Project, Personnel, ComplaintCase, AlertRule, MonthlyReview, Alert } from '@/types'

export const stores: Store[] = [
  { id: 's1', name: '国贸旗舰店', region: '华北', complaintCount: 47, closedCount: 42, closeRate: 89.4, avgHandleDays: 5.2, totalCompensation: 186400, monthlyComplaints: [3,5,4,6,3,4,5,3,4,3,4,3], monthlyCompensation: [12000,21000,16000,24000,13000,17000,20000,12000,16000,11000,15000,12300] },
  { id: 's2', name: '朝阳分院', region: '华北', complaintCount: 38, closedCount: 35, closeRate: 92.1, avgHandleDays: 4.1, totalCompensation: 142800, monthlyComplaints: [2,3,4,3,3,4,3,3,4,3,3,3], monthlyCompensation: [8000,12000,15000,11000,11000,14000,12000,11000,14000,10000,11000,12400] },
  { id: 's3', name: '浦东中心店', region: '华东', complaintCount: 52, closedCount: 44, closeRate: 84.6, avgHandleDays: 6.8, totalCompensation: 234600, monthlyComplaints: [4,5,4,5,4,5,5,4,5,4,4,3], monthlyCompensation: [18000,22000,17000,21000,18000,22000,21000,17000,20000,17000,17000,14600] },
  { id: 's4', name: '天河旗舰', region: '华南', complaintCount: 31, closedCount: 29, closeRate: 93.5, avgHandleDays: 3.5, totalCompensation: 98200, monthlyComplaints: [2,2,3,3,2,3,3,2,3,2,3,3], monthlyCompensation: [6000,7000,10000,9000,6000,9000,10000,7000,9000,7000,8000,10200] },
  { id: 's5', name: '锦江分院', region: '西南', complaintCount: 44, closedCount: 38, closeRate: 86.4, avgHandleDays: 5.9, totalCompensation: 198500, monthlyComplaints: [3,4,4,4,3,4,4,3,4,4,4,3], monthlyCompensation: [14000,17000,16000,18000,13000,17000,16000,13000,16000,16000,16000,13500] },
  { id: 's6', name: '江汉路店', region: '华中', complaintCount: 36, closedCount: 33, closeRate: 91.7, avgHandleDays: 4.3, totalCompensation: 128600, monthlyComplaints: [2,3,3,3,3,3,3,3,3,3,3,3], monthlyCompensation: [8000,11000,11000,11000,11000,11000,10000,10000,11000,10000,11000,11400] },
]

export const projects: Project[] = [
  { id: 'p1', name: '热玛吉', category: '光电抗衰', complaintRate: 8.2, compensationRate: 5.1, complaintCount: 28, totalCompensation: 89600, reasons: [{ name: '术后效果不达预期', count: 12, category: 'expectation' }, { name: '术前预期过高', count: 8, category: 'expectation' }, { name: '术后红肿持续', count: 5, category: 'technique' }], monthlyComplaints: [2,2,3,2,2,3,2,2,3,2,2,3] },
  { id: 'p2', name: '水光针', category: '注射美容', complaintRate: 6.5, compensationRate: 3.8, complaintCount: 22, totalCompensation: 48400, reasons: [{ name: '术后宣教不足', count: 9, category: 'education' }, { name: '效果维持时间短', count: 7, category: 'expectation' }], monthlyComplaints: [1,2,2,2,2,2,2,1,2,2,2,2] },
  { id: 'p3', name: '双眼皮手术', category: '整形外科', complaintRate: 12.1, compensationRate: 8.3, complaintCount: 35, totalCompensation: 142800, reasons: [{ name: '形态不满意', count: 14, category: 'expectation' }, { name: '术前沟通不充分', count: 10, category: 'communication' }, { name: '术后恢复问题', count: 6, category: 'technique' }], monthlyComplaints: [3,3,3,3,3,3,3,3,3,3,3,3] },
  { id: 'p4', name: '鼻综合', category: '整形外科', complaintRate: 10.8, compensationRate: 7.2, complaintCount: 24, totalCompensation: 118400, reasons: [{ name: '形态不满意', count: 10, category: 'expectation' }, { name: '假体相关问题', count: 7, category: 'technique' }], monthlyComplaints: [2,2,2,2,2,2,2,2,2,2,2,2] },
  { id: 'p5', name: '激光脱毛', category: '光电美容', complaintRate: 3.2, compensationRate: 1.5, complaintCount: 12, totalCompensation: 15600, reasons: [{ name: '排队等待过久', count: 5, category: 'service' }, { name: '脱毛效果不理想', count: 4, category: 'technique' }], monthlyComplaints: [1,1,1,1,1,1,1,1,1,1,1,1] },
  { id: 'p6', name: '玻尿酸填充', category: '注射美容', complaintRate: 5.8, compensationRate: 3.2, complaintCount: 18, totalCompensation: 37200, reasons: [{ name: '术后宣教不足', count: 7, category: 'education' }, { name: '效果不满意', count: 6, category: 'expectation' }], monthlyComplaints: [1,2,1,2,1,2,1,1,2,1,2,2] },
  { id: 'p7', name: '超声刀', category: '光电抗衰', complaintRate: 7.5, compensationRate: 4.6, complaintCount: 20, totalCompensation: 64000, reasons: [{ name: '术后效果不达预期', count: 8, category: 'expectation' }, { name: '疼痛感超出预期', count: 6, category: 'communication' }], monthlyComplaints: [2,2,2,1,2,2,1,2,2,1,2,1] },
  { id: 'p8', name: '吸脂手术', category: '整形外科', complaintRate: 9.4, compensationRate: 6.1, complaintCount: 16, totalCompensation: 78400, reasons: [{ name: '术后凹凸不平', count: 7, category: 'technique' }, { name: '恢复期长', count: 5, category: 'education' }], monthlyComplaints: [1,1,2,1,1,2,1,1,2,1,1,2] },
  { id: 'p9', name: '皮秒祛斑', category: '光电美容', complaintRate: 4.1, compensationRate: 2.3, complaintCount: 14, totalCompensation: 22400, reasons: [{ name: '色沉反黑', count: 6, category: 'technique' }, { name: '术后宣教不足', count: 4, category: 'education' }], monthlyComplaints: [1,1,1,1,1,1,1,1,1,1,2,2] },
  { id: 'p10', name: '线雕提升', category: '微创抗衰', complaintRate: 11.2, compensationRate: 7.8, complaintCount: 19, totalCompensation: 85600, reasons: [{ name: '维持时间低于预期', count: 8, category: 'expectation' }, { name: '术后不适感', count: 5, category: 'technique' }], monthlyComplaints: [2,1,2,2,1,2,2,1,2,1,2,1] },
  { id: 'p11', name: '肉毒素除皱', category: '注射美容', complaintRate: 3.8, compensationRate: 1.9, complaintCount: 10, totalCompensation: 14800, reasons: [{ name: '效果不满意', count: 4, category: 'expectation' }, { name: '表情不自然', count: 3, category: 'technique' }], monthlyComplaints: [1,1,1,1,1,1,1,1,1,1,1,0] },
  { id: 'p12', name: '光子嫩肤', category: '光电美容', complaintRate: 2.9, compensationRate: 1.2, complaintCount: 8, totalCompensation: 9600, reasons: [{ name: '排队等待过久', count: 4, category: 'service' }], monthlyComplaints: [1,1,1,1,0,1,1,0,1,1,0,0] },
]

export const personnel: Personnel[] = [
  { id: 'd1', name: '张伟', role: 'doctor', storeId: 's1', complaintCount: 8, relatedProjects: ['p1', 'p3', 'p7'] },
  { id: 'd2', name: '李芳', role: 'doctor', storeId: 's1', complaintCount: 5, relatedProjects: ['p2', 'p6', 'p11'] },
  { id: 'd3', name: '王明', role: 'doctor', storeId: 's2', complaintCount: 6, relatedProjects: ['p3', 'p4', 'p8'] },
  { id: 'd4', name: '陈静', role: 'doctor', storeId: 's3', complaintCount: 12, relatedProjects: ['p1', 'p3', 'p4', 'p10'] },
  { id: 'd5', name: '刘洋', role: 'doctor', storeId: 's3', complaintCount: 9, relatedProjects: ['p7', 'p8', 'p10'] },
  { id: 'd6', name: '赵磊', role: 'doctor', storeId: 's4', complaintCount: 4, relatedProjects: ['p1', 'p7'] },
  { id: 'd7', name: '周婷', role: 'doctor', storeId: 's5', complaintCount: 10, relatedProjects: ['p3', 'p4', 'p8'] },
  { id: 'd8', name: '吴强', role: 'doctor', storeId: 's5', complaintCount: 7, relatedProjects: ['p2', 'p6', 'p9'] },
  { id: 'd9', name: '郑华', role: 'doctor', storeId: 's6', complaintCount: 5, relatedProjects: ['p5', 'p9', 'p12'] },
  { id: 'd10', name: '孙琳', role: 'doctor', storeId: 's6', complaintCount: 6, relatedProjects: ['p1', 'p10'] },
  { id: 'c1', name: '马丽', role: 'consultant', storeId: 's1', complaintCount: 11, relatedProjects: ['p1', 'p2', 'p3', 'p6'] },
  { id: 'c2', name: '黄敏', role: 'consultant', storeId: 's2', complaintCount: 7, relatedProjects: ['p3', 'p4', 'p7'] },
  { id: 'c3', name: '林燕', role: 'consultant', storeId: 's3', complaintCount: 15, relatedProjects: ['p1', 'p3', 'p4', 'p7', 'p10'] },
  { id: 'c4', name: '何雪', role: 'consultant', storeId: 's4', complaintCount: 6, relatedProjects: ['p1', 'p5', 'p11'] },
  { id: 'c5', name: '罗娟', role: 'consultant', storeId: 's5', complaintCount: 12, relatedProjects: ['p3', 'p4', 'p8', 'p10'] },
  { id: 'c6', name: '谢颖', role: 'consultant', storeId: 's6', complaintCount: 8, relatedProjects: ['p2', 'p6', 'p9'] },
  { id: 'c7', name: '唐琴', role: 'consultant', storeId: 's1', complaintCount: 9, relatedProjects: ['p5', 'p7', 'p12'] },
  { id: 'c8', name: '韩冰', role: 'consultant', storeId: 's3', complaintCount: 10, relatedProjects: ['p2', 'p6', 'p8'] },
  { id: 't1', name: '冯露', role: 'therapist', storeId: 's1', complaintCount: 6, relatedProjects: ['p5', 'p9', 'p12'] },
  { id: 't2', name: '曹莹', role: 'therapist', storeId: 's2', complaintCount: 4, relatedProjects: ['p5', 'p12'] },
  { id: 't3', name: '许丹', role: 'therapist', storeId: 's3', complaintCount: 8, relatedProjects: ['p1', 'p7', 'p9'] },
  { id: 't4', name: '邓萍', role: 'therapist', storeId: 's4', complaintCount: 3, relatedProjects: ['p5', 'p12'] },
  { id: 't5', name: '彭悦', role: 'therapist', storeId: 's5', complaintCount: 7, relatedProjects: ['p1', 'p5', 'p7'] },
  { id: 't6', name: '蒋蓉', role: 'therapist', storeId: 's6', complaintCount: 5, relatedProjects: ['p2', 'p9', 'p11'] },
  { id: 't7', name: '沈薇', role: 'therapist', storeId: 's1', complaintCount: 4, relatedProjects: ['p2', 'p6'] },
  { id: 't8', name: '任佳', role: 'therapist', storeId: 's3', complaintCount: 6, relatedProjects: ['p5', 'p9', 'p12'] },
]

const generateCases = (): ComplaintCase[] => {
  const cases: ComplaintCase[] = []
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
  const compTypes: ComplaintCase['compensationType'][] = ['refund', 'rework', 'repair', 'gift', 'cash']
  const storeIds = ['s1', 's2', 's3', 's4', 's5', 's6']
  const projectIds = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11', 'p12']
  const doctors = personnel.filter(p => p.role === 'doctor')
  const consultants = personnel.filter(p => p.role === 'consultant')
  const therapists = personnel.filter(p => p.role === 'therapist')

  for (let i = 1; i <= 200; i++) {
    const storeId = storeIds[Math.floor(Math.random() * storeIds.length)]
    const projectId = projectIds[Math.floor(Math.random() * projectIds.length)]
    const reason = reasons[Math.floor(Math.random() * reasons.length)]
    const storeDoctors = doctors.filter(d => d.storeId === storeId)
    const storeConsultants = consultants.filter(c => c.storeId === storeId)
    const storeTherapists = therapists.filter(t => t.storeId === storeId)
    const pIds: string[] = []
    if (storeDoctors.length) pIds.push(storeDoctors[Math.floor(Math.random() * storeDoctors.length)].id)
    if (storeConsultants.length) pIds.push(storeConsultants[Math.floor(Math.random() * storeConsultants.length)].id)
    if (storeTherapists.length) pIds.push(storeTherapists[Math.floor(Math.random() * storeTherapists.length)].id)

    const month = Math.floor(Math.random() * 12) + 1
    const day = Math.floor(Math.random() * 28) + 1
    const compMonth = Math.min(month + Math.floor(Math.random() * 2) + 1, 12)
    const compType = compTypes[Math.floor(Math.random() * compTypes.length)]
    const amounts: Record<string, number> = { refund: 8000, rework: 3000, repair: 5000, gift: 1500, cash: 6000 }
    const baseAmount = amounts[compType]
    const compensationAmount = Math.round(baseAmount * (0.5 + Math.random() * 1.5))
    const isOpen = Math.random() < 0.1
    const isRepeat = Math.random() < 0.12
    const isCross = Math.random() < 0.06
    const isTypical = i <= 20 || Math.random() < 0.05

    const complaintDate = `2025-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const closeDay = Math.min(day + Math.floor(Math.random() * 10) + 1, 28)
    const closeDate = isOpen ? null : `2025-${String(compMonth).padStart(2, '0')}-${String(closeDay).padStart(2, '0')}`

    cases.push({
      id: `case${String(i).padStart(3, '0')}`,
      storeId,
      projectId,
      personnelIds: pIds,
      customerId: `cust${Math.floor(Math.random() * 500) + 1}`,
      complaintDate,
      closeDate,
      status: isOpen ? 'open' : 'closed',
      reason: reason.text,
      reasonCategory: reason.category,
      compensationType: compType,
      compensationAmount,
      timeline: [
        { date: complaintDate, type: 'complaint', content: '顾客来电投诉，表示不满', operator: '客服前台' },
        { date: complaintDate, type: 'response', content: '客服主管已回电，记录详细情况', operator: '客服主管' },
        { date: `2025-${String(month).padStart(2, '0')}-${String(Math.min(day + 2, 28)).padStart(2, '0')}`, type: 'negotiation', content: '与顾客协商赔付方案，顾客初步接受', operator: '门店经理' },
        ...(isOpen ? [] : [{ date: closeDate!, type: 'resolution' as const, content: `达成一致，${compType === 'refund' ? '办理退款' : compType === 'rework' ? '安排补做' : compType === 'repair' ? '安排修复' : compType === 'gift' ? '赠送项目' : '现金补偿'}处理`, operator: '门店经理' }]),
      ],
      isRepeatCustomer: isRepeat,
      isCrossStore: isCross,
      isTypical,
      lesson: isTypical ? `案例教训：${reason.text}需加强${reason.category === 'expectation' ? '术前预期管理' : reason.category === 'education' ? '术后宣教流程' : reason.category === 'communication' ? '医患沟通规范' : reason.category === 'technique' ? '技术操作标准' : reason.category === 'service' ? '服务流程优化' : '管理制度完善'}` : '',
    })
  }
  return cases
}

export const complaintCases: ComplaintCase[] = generateCases()

export const alertRules: AlertRule[] = [
  { id: 'ar1', type: 'amount_threshold', threshold: 15000, enabled: true, label: '单笔赔付金额超过15,000元' },
  { id: 'ar2', type: 'frequency_spike', threshold: 10, enabled: true, label: '月度客诉环比增长超过10%' },
  { id: 'ar3', type: 'repeat_customer', threshold: 3, enabled: true, label: '同一顾客投诉超过3次' },
]

export const alerts: Alert[] = [
  { id: 'al1', type: 'amount_threshold', severity: 'critical', message: '国贸旗舰店出现单笔¥28,500赔付，超预警阈值', caseId: 'case007', storeId: 's1', timestamp: '2025-11-15' },
  { id: 'al2', type: 'frequency_spike', severity: 'warning', message: '浦东中心店12月客诉环比增长15%，超预警阈值', storeId: 's3', timestamp: '2025-12-01' },
  { id: 'al3', type: 'repeat_customer', severity: 'warning', message: '顾客cust042已在3家门店投诉4次', timestamp: '2025-11-28' },
  { id: 'al4', type: 'amount_threshold', severity: 'critical', message: '锦江分院出现单笔¥22,000赔付，超预警阈值', caseId: 'case045', storeId: 's5', timestamp: '2025-12-05' },
  { id: 'al5', type: 'frequency_spike', severity: 'info', message: '双眼皮手术品类本月投诉量上升12%', timestamp: '2025-12-08' },
]

export const monthlyReviews: MonthlyReview[] = [
  {
    month: '2025-12', storeId: 's1', storeName: '国贸旗舰店',
    summary: '本月客诉量环比下降8%，结案率维持89%水平。热玛吉项目投诉仍占比最高，需加强术前预期管理。',
    keyMetrics: { complaintCount: 3, closeRate: 89.4, avgHandleDays: 5.2, totalCompensation: 12300 },
    issues: ['热玛吉术后效果投诉集中', '咨询师马丽关联投诉偏多'],
    trainingSuggestions: ['咨询师范本培训：热玛吉术前预期管理话术', '治疗师操作规范复习：超声刀操作SOP'],
    projectAdjustments: ['热玛吉：建议增加术前效果模拟环节', '双眼皮手术：强化术后48小时回访制度'],
  },
  {
    month: '2025-12', storeId: 's3', storeName: '浦东中心店',
    summary: '本月客诉量环比上升15%，结案率降至84.6%，需重点关注。双眼皮和鼻综合项目投诉率居高不下。',
    keyMetrics: { complaintCount: 3, closeRate: 84.6, avgHandleDays: 6.8, totalCompensation: 14600 },
    issues: ['客诉量环比上升15%', '平均处理时长6.8天偏长', '医生陈静关联投诉12起需关注'],
    trainingSuggestions: ['医生陈静：整形外科术前沟通专项培训', '咨询师林燕：投诉预防与客户预期管理培训'],
    projectAdjustments: ['鼻综合：建议调整术前评估流程', '线雕提升：增加术后随访频次'],
  },
  {
    month: '2025-12', storeId: 's4', storeName: '天河旗舰',
    summary: '本月运营良好，客诉量维持低位，结案率93.5%，可作标杆门店分享经验。',
    keyMetrics: { complaintCount: 3, closeRate: 93.5, avgHandleDays: 3.5, totalCompensation: 10200 },
    issues: ['激光脱毛排队等待投诉偶发'],
    trainingSuggestions: ['治疗师邓萍：分享快速预约调度经验'],
    projectAdjustments: ['激光脱毛：优化排队调度系统'],
  },
  {
    month: '2025-12', storeId: 's5', storeName: '锦江分院',
    summary: '本月赔付金额偏高，单笔大额赔付拉高整体水平，需加强术前沟通与风险评估。',
    keyMetrics: { complaintCount: 3, closeRate: 86.4, avgHandleDays: 5.9, totalCompensation: 13500 },
    issues: ['出现单笔¥22,000大额赔付', '吸脂手术投诉率9.4%偏高'],
    trainingSuggestions: ['医生周婷：吸脂手术技术提升培训', '咨询师罗娟：高风险项目预期管理话术培训'],
    projectAdjustments: ['吸脂手术：建议增加术前3D模拟展示', '线雕提升：调整术前告知书内容'],
  },
  {
    month: '2025-12', storeId: 's2', storeName: '朝阳分院',
    summary: '结案率92.1%，处理时长4.1天，整体运营平稳。鼻综合项目仍有投诉改善空间。',
    keyMetrics: { complaintCount: 3, closeRate: 92.1, avgHandleDays: 4.1, totalCompensation: 12400 },
    issues: ['鼻综合投诉率10.8%需关注'],
    trainingSuggestions: ['医生王明：鼻综合术后回访流程优化'],
    projectAdjustments: ['鼻综合：建议增加术后7天必访制度'],
  },
  {
    month: '2025-12', storeId: 's6', storeName: '江汉路店',
    summary: '客诉量中等，结案率91.7%，运营节奏稳定。皮秒祛斑色沉投诉需关注。',
    keyMetrics: { complaintCount: 3, closeRate: 91.7, avgHandleDays: 4.3, totalCompensation: 11400 },
    issues: ['皮秒祛斑色沉反黑投诉偏多'],
    trainingSuggestions: ['医生郑华：皮秒术后色沉预防技术培训', '治疗师蒋蓉：术后皮肤护理宣教优化'],
    projectAdjustments: ['皮秒祛斑：建议筛查皮肤类型适应症', '肉毒素：优化剂量评估流程'],
  },
]

export const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
