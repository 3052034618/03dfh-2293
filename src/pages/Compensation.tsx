import { useMemo } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ComposedChart, Line,
} from 'recharts'
import { complaintCases, stores, projects, months } from '@/data/mockData'
import { COMPENSATION_TYPE_LABELS } from '@/types'
import type { CompensationType } from '@/types'

const TYPE_COLORS: Record<CompensationType, string> = {
  refund: '#EF4444',
  rework: '#F59E0B',
  repair: '#38BDF8',
  gift: '#10B981',
  cash: '#A78BFA',
}

const ALERT_THRESHOLD = 15000

const AMOUNT_RANGES = [
  { label: '0-2k', min: 0, max: 2000 },
  { label: '2k-5k', min: 2000, max: 5000 },
  { label: '5k-10k', min: 5000, max: 10000 },
  { label: '10k-15k', min: 10000, max: 15000 },
  { label: '15k-20k', min: 15000, max: 20000 },
  { label: '20k+', min: 20000, max: Infinity },
]

function resolveStore(id: string) {
  return stores.find(s => s.id === id)?.name ?? id
}

function resolveProject(id: string) {
  return projects.find(p => p.id === id)?.name ?? id
}

function formatAmount(v: number) {
  return v >= 10000 ? `¥${(v / 10000).toFixed(1)}万` : `¥${v.toLocaleString()}`
}

export default function Compensation() {
  const pieData = useMemo(() => {
    const map: Partial<Record<CompensationType, { type: CompensationType; amount: number; count: number }>> = {}
    for (const c of complaintCases) {
      if (!map[c.compensationType]) {
        map[c.compensationType] = { type: c.compensationType, amount: 0, count: 0 }
      }
      map[c.compensationType]!.amount += c.compensationAmount
      map[c.compensationType]!.count += 1
    }
    return (Object.values(map) as { type: CompensationType; amount: number; count: number }[]).sort((a, b) => b.amount - a.amount)
  }, [])

  const totalAmount = useMemo(() => complaintCases.reduce((s, c) => s + c.compensationAmount, 0), [])

  const barData = useMemo(() =>
    AMOUNT_RANGES.map(r => ({
      range: r.label,
      count: complaintCases.filter(c => c.compensationAmount >= r.min && c.compensationAmount < r.max).length,
    })), [])

  const abnormalCases = useMemo(() =>
    complaintCases.filter(c => c.compensationAmount > ALERT_THRESHOLD)
      .sort((a, b) => b.compensationAmount - a.compensationAmount), [])

  const monthlyData = useMemo(() => {
    return months.map((m, i) => {
      const monthCases = complaintCases.filter(c => {
        const month = parseInt(c.complaintDate.split('-')[1], 10)
        return month === i + 1
      })
      return {
        month: m,
        amount: monthCases.reduce((s, c) => s + c.compensationAmount, 0),
        count: monthCases.length,
      }
    })
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">赔付结构分析</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut: type distribution */}
        <div className="glass-card rounded-xl p-5">
          <h2 className="text-sm font-medium text-slate-light mb-4">赔付类型分布</h2>
          <div className="relative h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="amount"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {pieData.map(d => (
                    <Cell key={d.type} fill={TYPE_COLORS[d.type]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(100,116,139,0.3)', borderRadius: 8 }}
                  formatter={(v: number, name: string) => [formatAmount(v), COMPENSATION_TYPE_LABELS[name as CompensationType]]}
                />
                <Legend formatter={(v: string) => COMPENSATION_TYPE_LABELS[v as CompensationType]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="font-tabular text-xl font-bold text-white">{formatAmount(totalAmount)}</div>
                <div className="text-xs text-slate-light mt-1">赔付总额</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bar: amount distribution */}
        <div className="glass-card rounded-xl p-5">
          <h2 className="text-sm font-medium text-slate-light mb-4">赔付金额分布</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
                <XAxis dataKey="range" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(100,116,139,0.3)', borderRadius: 8 }}
                  formatter={(v: number) => [`${v} 件`, '案件数']}
                />
                <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Abnormal alerts */}
      <div className="glass-card rounded-xl p-5">
        <h2 className="text-sm font-medium text-slate-light mb-4">
          异常预警
          <span className="ml-2 text-coral text-xs">赔付金额 &gt; ¥{ALERT_THRESHOLD.toLocaleString()}</span>
        </h2>
        {abnormalCases.length === 0 ? (
          <p className="text-slate-light text-sm">暂无异常案件</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {abnormalCases.map(c => (
              <div
                key={c.id}
                className="border border-coral/50 rounded-lg p-4 animate-glow space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-light">{c.id}</span>
                  <span className="font-tabular text-lg font-bold text-coral">
                    ¥{c.compensationAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-white">{resolveStore(c.storeId)}</span>
                  <span className="text-slate-light">·</span>
                  <span className="text-ice">{resolveProject(c.projectId)}</span>
                </div>
                <div className="text-xs text-slate-light">
                  {c.complaintDate} | {COMPENSATION_TYPE_LABELS[c.compensationType]}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dual-axis monthly trend */}
      <div className="glass-card rounded-xl p-5">
        <h2 className="text-sm font-medium text-slate-light mb-4">月度赔付趋势</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
              <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <YAxis
                yAxisId="amount"
                tick={{ fill: '#94A3B8', fontSize: 12 }}
                tickFormatter={(v: number) => v >= 10000 ? `${(v / 10000).toFixed(0)}万` : String(v)}
              />
              <YAxis
                yAxisId="count"
                orientation="right"
                tick={{ fill: '#94A3B8', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(100,116,139,0.3)', borderRadius: 8 }}
                formatter={(v: number, name: string) => [
                  name === 'amount' ? formatAmount(v) : `${v} 件`,
                  name === 'amount' ? '赔付金额' : '案件数',
                ]}
              />
              <Bar yAxisId="amount" dataKey="amount" fill="#10B981" radius={[4, 4, 0, 0]} opacity={0.8} />
              <Line yAxisId="count" dataKey="count" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4, fill: '#F59E0B' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
