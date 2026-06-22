import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { personnel, complaintCases, stores, projects } from '@/data/mockData'
import { PERSONNEL_ROLE_LABELS, COMPENSATION_TYPE_LABELS } from '@/types'
import type { Personnel as PersonnelType } from '@/types'

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

const TRAINING_MAP: Record<PersonnelType['role'], string> = {
  doctor: '技术操作规范与术前沟通专项培训',
  consultant: '投诉预防与客户预期管理培训',
  therapist: '术后护理规范与操作SOP培训',
}

export default function Personnel() {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')

  const filtered = useMemo(
    () => (roleFilter === 'all' ? personnel : personnel.filter(p => p.role === roleFilter)),
    [roleFilter],
  )

  const top15 = useMemo(
    () => [...filtered].sort((a, b) => b.complaintCount - a.complaintCount).slice(0, 15),
    [filtered],
  )

  const chartData = useMemo(
    () => top15.map(p => ({ name: p.name, count: p.complaintCount, role: p.role })),
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

      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-medium text-slate-light mb-4">投诉量 TOP15 人员</h2>
        <div className="h-[420px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 60, right: 20, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
              <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94A3B8', fontSize: 12 }} width={55} />
              <Tooltip
                contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(100,116,139,0.3)', borderRadius: 8, fontSize: 13 }}
                formatter={(v: number, _: string, p: any) => [v, PERSONNEL_ROLE_LABELS[p?.payload?.role] || '']}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16}>
                {chartData.map((d, i) => (
                  <Cell key={i} fill={ROLE_COLORS[d.role]} fillOpacity={0.85} />
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
              <div key={p.id} className="flex items-center gap-1 mb-1">
                <div className="w-20 text-xs text-slate-light truncate text-right pr-2 shrink-0">{p.name}</div>
                {heatmapProjects.map(proj => {
                  const related = p.relatedProjects.includes(proj.id)
                  return (
                    <div key={proj.id} className="flex-1 px-0.5">
                      <div
                        className="h-6 rounded-sm transition-colors"
                        style={{
                          background: related ? ROLE_COLORS[p.role] : 'rgba(30,41,59,0.5)',
                          opacity: related ? 0.75 : 1,
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
        <h2 className="text-sm font-medium text-slate-light mb-4">培训建议 — 高投诉人员</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {trainingTargets.map(p => (
            <div key={p.id} className="rounded-xl bg-dark-800/50 border border-dark-700/40 p-4 space-y-2">
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
