import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie,
} from 'recharts'
import { X, ExternalLink } from 'lucide-react'
import { personnel, complaintCases, stores, projects } from '@/data/mockData'
import { PERSONNEL_ROLE_LABELS, COMPENSATION_TYPE_LABELS } from '@/types'
import type { Personnel as PersonnelType, CompensationType, ComplaintCase } from '@/types'
import { useAppStore } from '@/store/useAppStore'

type RoleFilter = 'all' | PersonnelType['role']

const ROLE_COLORS: Record<PersonnelType['role'], string> = {
  doctor: '#38BDF8',
  consultant: '#F59E0B',
  therapist: '#10B981',
}

const ROLE_BG: Record<PersonnelType['role'], string> = {
  doctor: 'bg-ice/20 text-ice',
  consultant: 'bg-amber/20 text-amber',
  therapist: 'bg-emerald/20 text-emerald',
}

const COMP_COLORS: Record<CompensationType, string> = {
  refund: '#EF4444',
  rework: '#F59E0B',
  repair: '#38BDF8',
  gift: '#10B981',
  cash: '#A78BFA',
}

const TRAINING_MAP: Record<PersonnelType['role'], string> = {
  doctor: '技术操作规范与术前沟通专项培训',
  consultant: '投诉预防与客户预期管理培训',
  therapist: '术后护理规范与操作SOP培训',
}

function formatAmount(v: number) {
  return v >= 10000 ? `¥${(v / 10000).toFixed(1)}万` : `¥${v.toLocaleString()}`
}

export default function Personnel() {
  const navigate = useNavigate()
  const setCaseFilters = useAppStore(s => s.setCaseFilters)
  const resetCaseFilters = useAppStore(s => s.resetCaseFilters)
  const setSelectedCaseId = useAppStore(s => s.setSelectedCaseId)
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<string | null>(null)

  const filtered = useMemo(
    () => (roleFilter === 'all' ? personnel : personnel.filter(p => p.role === roleFilter)),
    [roleFilter],
  )

  const top15 = useMemo(
    () => [...filtered].sort((a, b) => b.complaintCount - a.complaintCount).slice(0, 15),
    [filtered],
  )

  const chartData = useMemo(
    () => top15.map(p => ({ name: p.name, count: p.complaintCount, role: p.role, id: p.id })),
    [top15],
  )

  const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p.name])), [])
  const storeMap = useMemo(() => new Map(stores.map(s => [s.id, s.name])), [])

  const heatmapProjects = useMemo(() => {
    const ids = new Set(top15.flatMap(p => p.relatedProjects))
    return projects.filter(p => ids.has(p.id))
  }, [top15])

  const customerData = useMemo(() => {
    const grouped = new Map<string, { count: number; storeIds: Set<string> }>()
    for (const c of complaintCases) {
      const g = grouped.get(c.customerId) || { count: 0, storeIds: new Set<string>() }
      g.count++
      g.storeIds.add(c.storeId)
      grouped.set(c.customerId, g)
    }
    return Array.from(grouped.entries())
      .filter(([, v]) => v.count >= 2 || v.storeIds.size >= 2)
      .map(([id, v]) => ({
        id,
        count: v.count,
        stores: [...v.storeIds].map(s => storeMap.get(s) || s).join('、'),
        isRepeat: v.count >= 2,
        isCross: v.storeIds.size >= 2,
      }))
      .sort((a, b) => b.count - a.count)
  }, [storeMap])

  const trainingTargets = useMemo(
    () => personnel.filter(p => p.complaintCount > 8),
    [],
  )

  // Selected personnel analytics
  const selectedPersonnel = useMemo(
    () => (selectedPersonnelId ? personnel.find(p => p.id === selectedPersonnelId) ?? null : null),
    [selectedPersonnelId],
  )

  const selectedCases = useMemo<ComplaintCase[]>(() => {
    if (!selectedPersonnel) return []
    return complaintCases.filter(c => c.personnelIds.includes(selectedPersonnel.id))
  }, [selectedPersonnel])

  const selectedProjectStat = useMemo(() => {
    if (!selectedCases.length) return []
    const m = new Map<string, { count: number; amount: number }>()
    for (const c of selectedCases) {
      const e = m.get(c.projectId) || { count: 0, amount: 0 }
      e.count += 1
      e.amount += c.compensationAmount
      m.set(c.projectId, e)
    }
    return [...m.entries()]
      .map(([pid, s]) => ({
        pid, name: projectMap.get(pid) ?? pid, count: s.count, amount: s.amount,
      }))
      .sort((a, b) => b.count - a.count)
  }, [selectedCases, projectMap])

  const selectedCompStat = useMemo(() => {
    if (!selectedCases.length) return []
    const m = new Map<CompensationType, { count: number; amount: number }>()
    for (const c of selectedCases) {
      const e = m.get(c.compensationType) || { count: 0, amount: 0 }
      e.count += 1
      e.amount += c.compensationAmount
      m.set(c.compensationType, e)
    }
    return [...m.entries()].map(([t, s]) => ({ type: t, count: s.count, amount: s.amount }))
  }, [selectedCases])

  const selectedRepeatCustomerStat = useMemo(() => {
    if (!selectedPersonnel || !selectedCases.length) return { repeat: 0, cross: 0 }
    let repeat = 0
    let cross = 0
    const seen = new Set<string>()
    for (const c of selectedCases) {
      if (seen.has(c.customerId)) continue
      seen.add(c.customerId)
      const customerAll = complaintCases.filter(x => x.customerId === c.customerId)
      if (customerAll.length >= 2) repeat += 1
      if (new Set(customerAll.map(x => x.storeId)).size >= 2) cross += 1
    }
    return { repeat, cross, unique: seen.size }
  }, [selectedPersonnel, selectedCases])

  const goCasesForPersonnel = () => {
    if (!selectedPersonnel) return
    resetCaseFilters()
    setCaseFilters({ personnelId: selectedPersonnel.id })
    navigate('/case-review')
  }
  const goCasesForPersonnelProject = (projectId: string) => {
    if (!selectedPersonnel) return
    resetCaseFilters()
    setCaseFilters({ personnelId: selectedPersonnel.id, projectId })
    navigate('/case-review')
  }
  const goCase = (caseId: string) => {
    resetCaseFilters()
    if (selectedPersonnel) setCaseFilters({ personnelId: selectedPersonnel.id })
    setSelectedCaseId(caseId)
    navigate('/case-review')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">人员关联分析</h1>
        <div className="flex gap-1 p-1 rounded-xl bg-dark-800/60">
          {(['all', ...Object.keys(PERSONNEL_ROLE_LABELS)] as RoleFilter[]).map(key => (
            <button
              key={key}
              onClick={() => setRoleFilter(key)}
              className={`px-4 py-1.5 rounded-lg text-sm transition-all ${
                roleFilter === key
                  ? 'bg-ice/20 text-ice border border-ice/30'
                  : 'text-slate-light hover:text-white'
              }`}
            >
              {key === 'all' ? '全部' : PERSONNEL_ROLE_LABELS[key as PersonnelType['role']]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <h2 className="text-sm font-medium text-slate-light mb-4">投诉量 TOP15 人员（点击查看详情）</h2>
          <div className="h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 60, right: 20, top: 5, bottom: 5 }}
                onClick={(e: any) => {
                  if (e?.activePayload?.[0]?.payload?.id) {
                    setSelectedPersonnelId(e.activePayload[0].payload.id)
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
                <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94A3B8', fontSize: 12 }} width={55} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(100,116,139,0.3)', borderRadius: 8, fontSize: 13 }}
                  formatter={(v: number, _: string, p: any) => [v, PERSONNEL_ROLE_LABELS[p?.payload?.role] || '']}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16} cursor="pointer">
                  {chartData.map((d, i) => (
                    <Cell key={i} fill={ROLE_COLORS[d.role]} fillOpacity={selectedPersonnelId === d.id ? 1 : 0.75} stroke={selectedPersonnelId === d.id ? '#fff' : 'transparent'} strokeWidth={2} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-5 mt-3 justify-center">
            {(Object.entries(ROLE_COLORS) as [PersonnelType['role'], string][]).map(([role, color]) => (
              <span key={role} className="flex items-center gap-1.5 text-xs text-slate-light">
                <span className="w-3 h-3 rounded-sm" style={{ background: color }} />
                {PERSONNEL_ROLE_LABELS[role]}
              </span>
            ))}
          </div>
        </div>

        {/* Personnel detail panel */}
        <div className="glass-card rounded-2xl p-5 min-h-[500px]">
          <h2 className="text-sm font-medium text-slate-light mb-3">人员详情</h2>
          {!selectedPersonnel ? (
            <div className="h-full flex items-center justify-center text-slate text-sm text-center py-20">
              点击左侧图表或下方培训卡片<br />查看该人员的关联案例、项目与赔付分布
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto scrollbar-thin" style={{ maxHeight: 560 }}>
              <div className="flex items-start gap-2">
                <div>
                  <h3 className="text-white font-semibold text-base">{selectedPersonnel.name}</h3>
                  <p className="text-xs text-slate-light mt-0.5">
                    {PERSONNEL_ROLE_LABELS[selectedPersonnel.role]} · {storeMap.get(selectedPersonnel.storeId)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPersonnelId(null)}
                  className="ml-auto text-slate-light hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-dark-800/60 rounded p-2">
                  <div className="text-xs text-slate">投诉数</div>
                  <div className="font-tabular text-lg text-coral font-semibold">{selectedCases.length}</div>
                </div>
                <div className="bg-dark-800/60 rounded p-2">
                  <div className="text-xs text-slate">赔付总额</div>
                  <div className="font-tabular text-lg text-amber font-semibold">{formatAmount(selectedCases.reduce((s, c) => s + c.compensationAmount, 0))}</div>
                </div>
                <div className="bg-dark-800/60 rounded p-2">
                  <div className="text-xs text-slate">结案率</div>
                  <div className="font-tabular text-lg text-emerald font-semibold">
                    {selectedCases.length ? Math.round(selectedCases.filter(c => c.status === 'closed').length / selectedCases.length * 100) : 0}%
                  </div>
                </div>
              </div>

              <div className="border-t border-dark-700/50 pt-3">
                <div className="text-xs text-slate mb-2">复诉 / 跨店客户（该人员接触）</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-coral/10 border border-coral/30 rounded px-2 py-1.5">
                    <span className="text-coral">复诉客户</span>
                    <span className="font-tabular text-white ml-2">{selectedRepeatCustomerStat.repeat} / {selectedRepeatCustomerStat.unique || 0}</span>
                  </div>
                  <div className="bg-amber/10 border border-amber/30 rounded px-2 py-1.5">
                    <span className="text-amber">跨店客户</span>
                    <span className="font-tabular text-white ml-2">{selectedRepeatCustomerStat.cross} / {selectedRepeatCustomerStat.unique || 0}</span>
                  </div>
                </div>
              </div>

              {selectedProjectStat.length > 0 && (
                <div className="border-t border-dark-700/50 pt-3">
                  <div className="text-xs text-slate mb-2">关联项目（点击可筛选案例）</div>
                  <div className="space-y-1.5">
                    {selectedProjectStat.map((p, i) => (
                      <button
                        key={p.pid}
                        onClick={() => goCasesForPersonnelProject(p.pid)}
                        className="w-full flex items-center gap-2 text-xs px-2 py-1.5 rounded hover:bg-dark-800/60 transition-colors text-left"
                      >
                        <span className="w-5 h-5 rounded bg-dark-700 text-slate-light flex items-center justify-center text-[10px] font-tabular">{i + 1}</span>
                        <span className="text-white truncate">{p.name}</span>
                        <span className="font-tabular text-coral ml-auto">{p.count}</span>
                        <span className="font-tabular text-amber">{formatAmount(p.amount)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedCompStat.length > 0 && (
                <div className="border-t border-dark-700/50 pt-3">
                  <div className="text-xs text-slate mb-2">赔付方式分布</div>
                  <div className="flex items-start gap-3">
                    <div className="w-[100px] h-[100px] shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={selectedCompStat} dataKey="count" innerRadius={26} outerRadius={46}>
                            {selectedCompStat.map(d => <Cell key={d.type} fill={COMP_COLORS[d.type]} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-1">
                      {selectedCompStat.map(d => (
                        <div key={d.type} className="flex items-center gap-2 text-xs">
                          <span className="w-2 h-2 rounded-sm" style={{ background: COMP_COLORS[d.type] }} />
                          <span className="text-slate-light">{COMPENSATION_TYPE_LABELS[d.type]}</span>
                          <span className="font-tabular text-white ml-auto">{d.count}件</span>
                          <span className="font-tabular text-amber">{formatAmount(d.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedCases.length > 0 && (
                <div className="border-t border-dark-700/50 pt-3">
                  <div className="text-xs text-slate mb-2">关联案例（赔付额 Top 8）</div>
                  <div className="space-y-1">
                    {[...selectedCases].sort((a, b) => b.compensationAmount - a.compensationAmount).slice(0, 8).map(c => (
                      <div
                        key={c.id}
                        onClick={() => goCase(c.id)}
                        className="flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-dark-800/60 cursor-pointer"
                      >
                        <span className="font-tabular text-ice">{c.id}</span>
                        <span className="text-slate-light truncate flex-1">{projectMap.get(c.projectId)}</span>
                        <span className="font-tabular text-amber">¥{c.compensationAmount.toLocaleString()}</span>
                        <ExternalLink className="w-3 h-3 text-slate-light" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={goCasesForPersonnel}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 px-3 py-2 bg-ice/10 text-ice border border-ice/30 rounded-lg text-sm hover:bg-ice/20 transition-colors"
              >
                查看该人员全部案例 <ExternalLink className="w-4 h-4" />
              </button>

              <div className="bg-dark-800/60 rounded-lg p-3 border border-dark-700/40">
                <div className="text-xs text-emerald mb-1">建议培训方向</div>
                <div className="text-xs text-slate-light leading-relaxed">{TRAINING_MAP[selectedPersonnel.role]}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-medium text-slate-light mb-4">人员 × 项目关联热力图</h2>
        <div className="overflow-x-auto scrollbar-thin">
          <div className="min-w-[700px]">
            <div className="flex items-center gap-1 mb-2 pl-20">
              {heatmapProjects.map(p => (
                <div key={p.id} className="flex-1 text-center text-[10px] text-slate truncate px-0.5" title={p.name}>
                  {p.name}
                </div>
              ))}
            </div>
            {top15.map(p => (
              <div key={p.id}
                onClick={() => setSelectedPersonnelId(p.id)}
                className="flex items-center gap-1 mb-1 cursor-pointer">
                <div className={`w-20 text-xs truncate text-right pr-2 shrink-0 ${selectedPersonnelId === p.id ? 'text-ice font-semibold' : 'text-slate-light'}`}>{p.name}</div>
                {heatmapProjects.map(proj => {
                  const related = p.relatedProjects.includes(proj.id)
                  return (
                    <div key={proj.id} className="flex-1 px-0.5">
                      <div
                        className="h-6 rounded-sm transition-colors"
                        style={{
                          background: related ? ROLE_COLORS[p.role] : 'rgba(30,41,59,0.5)',
                          opacity: related ? (selectedPersonnelId === p.id ? 1 : 0.75) : 1,
                        }}
                        title={related ? `${p.name} - ${proj.name}` : ''}
                      />
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-medium text-slate-light mb-4">客户追踪 — 复诉 / 跨店客户</h2>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate border-b border-dark-700/50">
                <th className="text-left py-2 px-3 font-medium">客户ID</th>
                <th className="text-center py-2 px-3 font-medium">投诉次数</th>
                <th className="text-left py-2 px-3 font-medium">关联门店</th>
                <th className="text-center py-2 px-3 font-medium">复诉</th>
                <th className="text-center py-2 px-3 font-medium">跨店</th>
              </tr>
            </thead>
            <tbody>
              {customerData.slice(0, 20).map(c => (
                <tr key={c.id} className="border-b border-dark-700/30 hover:bg-dark-800/30">
                  <td className="py-2 px-3 font-tabular text-white">{c.id}</td>
                  <td className="py-2 px-3 text-center font-tabular text-coral">{c.count}</td>
                  <td className="py-2 px-3 text-slate-light max-w-[200px] truncate">{c.stores}</td>
                  <td className="py-2 px-3 text-center">{c.isRepeat ? <span className="text-amber">●</span> : <span className="text-dark-600">—</span>}</td>
                  <td className="py-2 px-3 text-center">{c.isCross ? <span className="text-ice">●</span> : <span className="text-dark-600">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-medium text-slate-light mb-4">培训建议 — 高投诉人员（点击查看详情）</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {trainingTargets.map(p => (
            <div
              key={p.id}
              onClick={() => setSelectedPersonnelId(p.id)}
              className="rounded-xl bg-dark-800/50 border border-dark-700/40 p-4 space-y-2 cursor-pointer hover:bg-dark-800/80 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">{p.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${ROLE_BG[p.role]}`}>
                  {PERSONNEL_ROLE_LABELS[p.role]}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-coral font-tabular text-lg font-semibold">{p.complaintCount}</span>
                <span className="text-slate text-xs">起投诉</span>
              </div>
              <div className="text-xs text-slate-light">
                关联项目：{p.relatedProjects.map(id => projectMap.get(id)).filter(Boolean).join('、')}
              </div>
              <div className="pt-2 border-t border-dark-700/40">
                <span className="text-xs text-emerald-light">▶ 建议培训：</span>
                <span className="text-xs text-slate-light ml-1">{TRAINING_MAP[p.role]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
