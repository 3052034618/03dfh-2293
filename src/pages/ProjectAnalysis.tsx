import { useMemo } from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { LineChart } from 'recharts'
import { projects, months } from '@/data/mockData'
import { REASON_CATEGORIES } from '@/types'
import type { Project } from '@/types'

const CATEGORY_COLORS: Record<string, string> = {
  expectation: '#EF4444',
  education: '#F59E0B',
  service: '#38BDF8',
  technique: '#10B981',
  communication: '#A78BFA',
  management: '#F97316',
}

const CHART_COLORS = ['#10B981', '#38BDF8', '#F59E0B']

function formatRate(v: number) {
  return `${v.toFixed(1)}%`
}

const barChartData = projects.map(p => ({
  name: p.name,
  complaintRate: p.complaintRate,
  compensationRate: p.compensationRate,
}))

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

const adjustmentProjects = projects.filter(needsAdjustment)

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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">项目分析</h1>

      <section className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">投诉率与赔付率对比</h2>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={barChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
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

      <section>
        <h2 className="text-lg font-semibold text-white mb-4">调整建议</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {adjustmentProjects.map(p => {
            const topReasons = p.reasons.slice(0, 3)
            return (
              <div key={p.id} className="glass-card glass-card-hover rounded-xl p-5 border-l-4 border-l-amber space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-white">{p.name}</h3>
                  <span className="text-xs text-slate-light px-2 py-0.5 rounded-full bg-dark-700/50">{p.category}</span>
                </div>
                <div className="flex gap-6">
                  <div>
                    <span className="text-xs text-slate-light">投诉率</span>
                    <p className="font-tabular text-lg text-coral">{formatRate(p.complaintRate)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-light">赔付率</span>
                    <p className="font-tabular text-lg text-amber">{formatRate(p.compensationRate)}</p>
                  </div>
                </div>
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
                <div className="pt-2 border-t border-dark-700/40">
                  <div className="flex items-start gap-2">
                    <span className="text-ice text-sm shrink-0">💡</span>
                    <p className="text-sm text-slate-light leading-relaxed">{getSuggestion(p)}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
