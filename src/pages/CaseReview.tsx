import { useState } from 'react'
import { MessageSquare, Reply, MessageCircle, CheckCircle, ChevronDown, ChevronRight } from 'lucide-react'
import { complaintCases, stores, projects, personnel, monthlyReviews } from '@/data/mockData'
import { COMPENSATION_TYPE_LABELS, PERSONNEL_ROLE_LABELS, REASON_CATEGORIES } from '@/types'
import type { ComplaintCase, TimelineEvent } from '@/types'

const typeIcon: Record<TimelineEvent['type'], React.ReactNode> = {
  complaint: <MessageSquare className="w-4 h-4 text-coral" />,
  response: <Reply className="w-4 h-4 text-ice" />,
  negotiation: <MessageCircle className="w-4 h-4 text-amber" />,
  resolution: <CheckCircle className="w-4 h-4 text-emerald" />,
}
const typeColor: Record<TimelineEvent['type'], string> = {
  complaint: 'bg-coral/20 border-coral/50',
  response: 'bg-ice/20 border-ice/50',
  negotiation: 'bg-amber/20 border-amber/50',
  resolution: 'bg-emerald/20 border-emerald/50',
}

export default function CaseReview() {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null)
  const [filters, setFilters] = useState({ storeId: '', projectId: '', reasonCategory: '', compType: '', typicalOnly: false })
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null)

  const f = (k: string, v: string | boolean) => setFilters(prev => ({ ...prev, [k]: v }))

  const filtered = complaintCases.filter(c => {
    if (filters.storeId && c.storeId !== filters.storeId) return false
    if (filters.projectId && c.projectId !== filters.projectId) return false
    if (filters.reasonCategory && c.reasonCategory !== filters.reasonCategory) return false
    if (filters.compType && c.compensationType !== filters.compType) return false
    if (filters.typicalOnly && !c.isTypical) return false
    return true
  })

  const selected = selectedCaseId ? complaintCases.find(c => c.id === selectedCaseId) ?? null : null
  const storeName = (id: string) => stores.find(s => s.id === id)?.name ?? id
  const projName = (id: string) => projects.find(p => p.id === id)?.name ?? id
  const personnelLabel = (id: string) => { const p = personnel.find(x => x.id === id); return p ? `${p.name}(${PERSONNEL_ROLE_LABELS[p.role]})` : id }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <select value={filters.storeId} onChange={e => f('storeId', e.target.value)}
            className="bg-dark-800 border border-slate/30 rounded-lg px-3 py-1.5 text-sm text-slate-light">
            <option value="">全部门店</option>
            {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={filters.projectId} onChange={e => f('projectId', e.target.value)}
            className="bg-dark-800 border border-slate/30 rounded-lg px-3 py-1.5 text-sm text-slate-light">
            <option value="">全部项目</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={filters.reasonCategory} onChange={e => f('reasonCategory', e.target.value)}
            className="bg-dark-800 border border-slate/30 rounded-lg px-3 py-1.5 text-sm text-slate-light">
            <option value="">全部原因</option>
            {Object.entries(REASON_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={filters.compType} onChange={e => f('compType', e.target.value)}
            className="bg-dark-800 border border-slate/30 rounded-lg px-3 py-1.5 text-sm text-slate-light">
            <option value="">全部赔付</option>
            {Object.entries(COMPENSATION_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <label className="flex items-center gap-1.5 text-sm text-slate-light cursor-pointer">
            <input type="checkbox" checked={filters.typicalOnly} onChange={e => f('typicalOnly', e.target.checked)}
              className="accent-emerald w-4 h-4 rounded" />
            仅典型案例
          </label>
          <span className="ml-auto text-xs text-slate font-tabular">{filtered.length} 条记录</span>
        </div>
      </div>

      {/* Case Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate/20 text-slate text-xs">
              <th className="px-3 py-2.5 text-left">案例ID</th>
              <th className="px-3 py-2.5 text-left">门店</th>
              <th className="px-3 py-2.5 text-left">项目</th>
              <th className="px-3 py-2.5 text-left">投诉日期</th>
              <th className="px-3 py-2.5 text-left">状态</th>
              <th className="px-3 py-2.5 text-left">原因</th>
              <th className="px-3 py-2.5 text-left">赔付类型</th>
              <th className="px-3 py-2.5 text-right">赔付金额</th>
              <th className="px-3 py-2.5 text-left">标签</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}
                onClick={() => setSelectedCaseId(selectedCaseId === c.id ? null : c.id)}
                className={`border-b border-slate/10 cursor-pointer transition-colors hover:bg-white/[0.03] ${selectedCaseId === c.id ? 'bg-ice/5' : ''}`}>
                <td className="px-3 py-2 font-tabular text-ice">{c.id}</td>
                <td className="px-3 py-2">{storeName(c.storeId)}</td>
                <td className="px-3 py-2">{projName(c.projectId)}</td>
                <td className="px-3 py-2 font-tabular text-slate-light">{c.complaintDate}</td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${c.status === 'open' ? 'bg-coral/20 text-coral-light' : 'bg-emerald/20 text-emerald-light'}`}>
                    {c.status === 'open' ? '进行中' : '已结案'}
                  </span>
                </td>
                <td className="px-3 py-2 max-w-[120px] truncate">{c.reason}</td>
                <td className="px-3 py-2">{COMPENSATION_TYPE_LABELS[c.compensationType]}</td>
                <td className="px-3 py-2 text-right font-tabular text-amber">¥{c.compensationAmount.toLocaleString()}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-1 flex-wrap">
                    {c.isRepeatCustomer && <span className="px-1.5 py-0.5 rounded text-[10px] bg-coral/20 text-coral-light">多次投诉</span>}
                    {c.isCrossStore && <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber/20 text-amber-light">跨店投诉</span>}
                    {c.isTypical && <span className="px-1.5 py-0.5 rounded text-[10px] bg-ice/20 text-ice-light">典型案例</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="glass-card rounded-xl p-5 space-y-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <span className="text-ice">{selected.id}</span> 案例详情
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div><span className="text-slate">门店</span><p className="text-white mt-0.5">{storeName(selected.storeId)}</p></div>
            <div><span className="text-slate">项目</span><p className="text-white mt-0.5">{projName(selected.projectId)}</p></div>
            <div><span className="text-slate">人员</span><p className="text-white mt-0.5">{selected.personnelIds.map(personnelLabel).join('、')}</p></div>
            <div><span className="text-slate">状态</span><p className="mt-0.5"><span className={`px-2 py-0.5 rounded-full text-xs ${selected.status === 'open' ? 'bg-coral/20 text-coral-light' : 'bg-emerald/20 text-emerald-light'}`}>{selected.status === 'open' ? '进行中' : '已结案'}</span></p></div>
            <div><span className="text-slate">投诉日期</span><p className="text-white mt-0.5 font-tabular">{selected.complaintDate}</p></div>
            <div><span className="text-slate">结案日期</span><p className="text-white mt-0.5 font-tabular">{selected.closeDate ?? '—'}</p></div>
          </div>

          {/* Timeline */}
          <div className="pt-2">
            <h4 className="text-sm text-slate mb-3">协商过程</h4>
            <div className="relative pl-6">
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate/30" />
              {selected.timeline.map((ev, i) => (
                <div key={i} className="relative pb-4 last:pb-0">
                  <div className={`absolute left-[-18px] top-0.5 w-6 h-6 rounded-full border flex items-center justify-center ${typeColor[ev.type]}`}>
                    {typeIcon[ev.type]}
                  </div>
                  <div className="ml-3">
                    <div className="flex items-center gap-2 text-xs text-slate-light">
                      <span className="font-tabular">{ev.date}</span>
                      <span>{ev.operator}</span>
                    </div>
                    <p className="text-sm text-white mt-0.5">{ev.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-1 flex-wrap">
            <span className="px-2 py-1 rounded text-xs bg-ice/10 text-ice border border-ice/20">
              {REASON_CATEGORIES[selected.reasonCategory] ?? selected.reasonCategory}
            </span>
            {selected.lesson && <p className="text-xs text-amber-light flex-1">{selected.lesson}</p>}
          </div>
        </div>
      )}

      {/* Monthly Reviews */}
      <div>
        <h3 className="text-base font-semibold text-white mb-3">月度复盘</h3>
        <div className="space-y-3">
          {monthlyReviews.map(r => {
            const rid = `${r.storeId}-${r.month}`
            const open = expandedReviewId === rid
            return (
              <div key={rid} className="glass-card rounded-xl overflow-hidden">
                <button onClick={() => setExpandedReviewId(open ? null : rid)}
                  className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-white/[0.03] transition-colors">
                  {open ? <ChevronDown className="w-4 h-4 text-slate" /> : <ChevronRight className="w-4 h-4 text-slate" />}
                  <span className="text-sm font-medium text-white">{r.storeName}</span>
                  <span className="text-xs text-slate font-tabular">{r.month}</span>
                  <span className="ml-auto text-xs text-slate-light max-w-[400px] truncate">{r.summary}</span>
                </button>
                {open && (
                  <div className="px-4 pb-4 space-y-3 text-sm">
                    <div className="grid grid-cols-4 gap-3">
                      {([
                        ['投诉数', r.keyMetrics.complaintCount, 'text-coral-light'],
                        ['结案率', `${r.keyMetrics.closeRate}%`, 'text-emerald-light'],
                        ['平均处理天数', r.keyMetrics.avgHandleDays, 'text-amber-light'],
                        ['总赔付', `¥${r.keyMetrics.totalCompensation.toLocaleString()}`, 'text-ice-light'],
                      ] as const).map(([label, val, color]) => (
                        <div key={label} className="bg-dark-800/50 rounded-lg p-2.5 text-center">
                          <div className="text-xs text-slate">{label}</div>
                          <div className={`font-tabular text-lg font-semibold ${color}`}>{val}</div>
                        </div>
                      ))}
                    </div>
                    {r.issues.length > 0 && (
                      <div><div className="text-xs text-slate mb-1">问题</div>
                        <ul className="list-disc list-inside text-xs text-coral-light space-y-0.5">{r.issues.map((x, i) => <li key={i}>{x}</li>)}</ul>
                      </div>
                    )}
                    {r.trainingSuggestions.length > 0 && (
                      <div><div className="text-xs text-slate mb-1">培训建议</div>
                        <ul className="list-disc list-inside text-xs text-amber-light space-y-0.5">{r.trainingSuggestions.map((x, i) => <li key={i}>{x}</li>)}</ul>
                      </div>
                    )}
                    {r.projectAdjustments.length > 0 && (
                      <div><div className="text-xs text-slate mb-1">项目调整</div>
                        <ul className="list-disc list-inside text-xs text-ice-light space-y-0.5">{r.projectAdjustments.map((x, i) => <li key={i}>{x}</li>)}</ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
