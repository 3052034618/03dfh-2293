import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { LineChart, PieChart, Pie, Cell } from 'recharts'
import { ExternalLink } from 'lucide-react'
import { projects, months, complaintCases } from '@/data/mockData'
import { REASON_CATEGORIES, COMPENSATION_TYPE_LABELS } from '@/types'
import type { Project, CompensationType } from '@/types'
import { useAppStore } from '@/store/useAppStore'

const CATEGORY_COLORS: Record<string, string> = {
  expectation: '#EF4444',
  education: '#F59E0B',
  service: '#38BDF8',
  technique: '#10B981',
  communication: '#A78BFA',
  management: '#F97316',
}

const COMP_COLORS: Record<CompensationType, string> = {
  refund: '#EF4444',
  rework: '#F59E0B',
  repair: '#38BDF8',
  gift: '#10B981',
  cash: '#A78BFA',
}

const CHART_COLORS = ['#10B981', '#38BDF8', '#F59E0B']

function formatRate(v: number) {
  return `${v.toFixed(1)}%`
}
function formatAmount(v: number) {
  return v >= 10000 ? `¥${(v / 10000).toFixed(1)}万` : `¥${v.toLocaleString()}`
}

const top3 = [...projects]
  .sort((a, b) => b.complaintRate - a.complaintRate)
  .slice(0, 3)

const trendData = months.map((m, i) => {
  const point: Record<string, string | number> = { month: m }
  top3.forEach(p => { point[p.name] = p.monthlyComplaints[i] })
  return point
})

const allReasons = projects.flatMap(p =>
  p.reasons.map(r => ({ ...r, project: p.name }))
)

const reasonMap = new Map<string, { name: string; category: string; count: number }>()
allReasons.forEach(r => {
  const key = r.name
  const existing = reasonMap.get(key)
  if (existing) { existing.count += r.count } else { reasonMap.set(key, { name: r.name, category: r.category, count: r.count }) }
})
const reasonTags = [...reasonMap.values()].sort((a, b) => b.count - a.count)
const maxCount = Math.max(...reasonTags.map(r => r.count))

function needsAdjustment(p: Project) {
  return p.complaintRate > 8 || p.compensationRate > 5
}

function getSuggestion(p: Project): string {
  const top = p.reasons[0]
  if (!top) return '持续监测'
  if (top.category === 'expectation') return '强化术前预期管理与效果模拟展示'
  if (top.category === 'communication') return '加强术前沟通规范与话术培训'
  if (top.category === 'technique') return '提升技术操作标准与术后回访'
  if (top.category === 'education') return '完善术后宣教流程与护理指导'
  if (top.category === 'service') return '优化服务流程与排队调度机制'
  return '完善管理制度与流程规范'
}

const sortedProjects = [...projects].sort((a, b) => b.complaintCount - a.complaintCount)

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="custom-tooltip">
      <p className="text-white text-sm font-medium mb-2">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: <span className="font-tabular">{typeof entry.value === 'number' && entry.value < 20 ? entry.value.toFixed(1) + '%' : entry.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function ProjectAnalysis() {
  const navigate = useNavigate()
  const setCaseFilters = useAppStore(s => s.setCaseFilters)
  const resetCaseFilters = useAppStore(s => s.resetCaseFilters)

  const trendLines = useMemo(() => top3.map((p, i) => (
    <Line
      key={p.id}
      type="monotone"
      dataKey={p.name}
      stroke={CHART_COLORS[i]}
      strokeWidth={2}
      dot={{ r: 3, fill: CHART_COLORS[i] }}
      activeDot={{ r: 5 }}
    />
  )), [])

  const goToProjectCases = (p: Project) => {
    resetCaseFilters()
    setCaseFilters({ projectId: p.id })
    navigate('/case-review')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">项目分析</h1>

      <section className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">投诉率与赔付率对比</h2>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={sortedProjects.map(p => ({
            name: p.name,
            complaintRate: p.complaintRate,
            compensationRate: p.compensationRate,
          }))} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${v}%`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="complaintRate" name="投诉率" fill="#10B981" radius={[4, 4, 0, 0]} barSize={24} />
            <Line type="monotone" dataKey="compensationRate" name="赔付率" stroke="#EF4444" strokeWidth={2} dot={{ r: 3, fill: '#EF4444' }} />
          </ComposedChart>
        </ResponsiveContainer>
      </section>

      <section className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">项目台账总览</h2>
          <p className="text-xs text-slate-light">点击任一项目可跳转至案例抽检查看明细并对账</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortedProjects.map(p => {
            const topReasons = p.reasons.slice(0, 3)
            // compensation type distribution for this project
            const typeMap = new Map<CompensationType, number>()
            let totalComp = 0
            for (const c of complaintCases) {
              if (c.projectId !== p.id) continue
              totalComp += c.compensationAmount
              typeMap.set(c.compensationType, (typeMap.get(c.compensationType) || 0) + 1)
            }
            const pieData = [...typeMap.entries()].map(([k, v]) => ({ type: k, count: v }))
            return (
              <div
                key={p.id}
                className="glass-card glass-card-hover rounded-xl p-5 border-l-4 border-l-ice cursor-pointer space-y-3"
                onClick={() => goToProjectCases(p)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-white">{p.name}</h3>
                    <span className="text-xs text-slate-light px-2 py-0.5 rounded-full bg-dark-700/50">{p.category}</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-ice shrink-0" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-slate-light">投诉件数</span>
                    <p className="font-tabular text-xl text-coral">{p.complaintCount}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-light">赔付总额</span>
                    <p className="font-tabular text-xl text-amber">{formatAmount(p.totalCompensation)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-light">投诉率</span>
                    <p className="font-tabular text-lg text-emerald">{formatRate(p.complaintRate)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-light">赔付率</span>
                    <p className="font-tabular text-lg text-ice">{formatRate(p.compensationRate)}</p>
                  </div>
                </div>
                {pieData.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-[80px] h-[80px] shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} dataKey="count" innerRadius={20} outerRadius={36} paddingAngle={1}>
                            {pieData.map(d => <Cell key={d.type} fill={COMP_COLORS[d.type]} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-col gap-1">
                      {pieData.map(d => (
                        <div key={d.type} className="flex items-center gap-1.5 text-xs">
                          <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: COMP_COLORS[d.type] }} />
                          <span className="text-slate-light">{COMPENSATION_TYPE_LABELS[d.type]}</span>
                          <span className="font-tabular text-white ml-auto">{d.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <span className="text-xs text-slate-light">主要投诉原因</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {topReasons.map(r => (
                      <span
                        key={r.name}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${CATEGORY_COLORS[r.category] || '#64748B'}18`,
                          color: CATEGORY_COLORS[r.category] || '#94A3B8',
                        }}
                      >
                        {r.name} ({r.count})
                      </span>
                    ))}
                  </div>
                </div>
                {needsAdjustment(p) && (
                  <div className="pt-2 border-t border-dark-700/40">
                    <div className="flex items-start gap-2">
                      <span className="text-amber text-sm shrink-0">💡</span>
                      <p className="text-xs text-slate-light leading-relaxed">{getSuggestion(p)}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">投诉原因标签云</h2>
        <div className="flex flex-wrap gap-3">
          {reasonTags.map(tag => {
            const scale = 0.7 + (tag.count / maxCount) * 0.6
            const color = CATEGORY_COLORS[tag.category] || '#64748B'
            return (
              <span
                key={tag.name}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-transform hover:scale-105 cursor-default"
                style={{
                  backgroundColor: `${color}18`,
                  border: `1px solid ${color}40`,
                  fontSize: `${scale}rem`,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-white/90">{tag.name}</span>
                <span className="font-tabular" style={{ color }}>{tag.count}</span>
              </span>
            )
          })}
        </div>
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-dark-700/40">
          {Object.entries(REASON_CATEGORIES).map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs text-slate-light">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[key] }} />
              {label}
            </div>
          ))}
        </div>
      </section>

      <section className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">月度趋势对比（Top 3 投诉项目）</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {trendLines}
          </LineChart>
        </ResponsiveContainer>
      </section>
    </div>
  )
}
