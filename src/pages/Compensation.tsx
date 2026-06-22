import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ComposedChart, Line,
} from 'recharts'
import { ExternalLink, X } from 'lucide-react'
import { complaintCases, stores, projects, months } from '@/data/mockData'
import { COMPENSATION_TYPE_LABELS } from '@/types'
import type { CompensationType } from '@/types'
import { useAppStore } from '@/store/useAppStore'

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
  const navigate = useNavigate()
  const setSelectedCaseId = useAppStore(s => s.setSelectedCaseId)
  const setCaseFilters = useAppStore(s => s.setCaseFilters)
  const resetCaseFilters = useAppStore(s => s.resetCaseFilters)
  const [activeCompType, setActiveCompType] = useState<CompensationType | null>(null)
  const [activeRangeIdx, setActiveRangeIdx] = useState<number | null>(null)

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
    AMOUNT_RANGES.map((r, i) => ({
      range: r.label,
      min: r.min,
      max: r.max,
      idx: i,
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

  // Combined preview list based on active selection
  const previewCases = useMemo(() => {
    let list = complaintCases
    if (activeCompType) list = list.filter(c => c.compensationType === activeCompType)
    if (activeRangeIdx != null) {
      const r = AMOUNT_RANGES[activeRangeIdx]
      list = list.filter(c => c.compensationAmount >= r.min && c.compensationAmount < r.max)
    }
    return [...list].sort((a, b) => b.compensationAmount - a.compensationAmount)
  }, [activeCompType, activeRangeIdx])

  const previewSummary = useMemo(() => {
    const total = previewCases.reduce((s, c) => s + c.compensationAmount, 0)
    return { count: previewCases.length, total }
  }, [previewCases])

  const goToCase = (caseId: string) => {
    resetCaseFilters()
    if (activeCompType) setCaseFilters({ compType: activeCompType })
    if (activeRangeIdx != null) {
      const r = AMOUNT_RANGES[activeRangeIdx]
      setCaseFilters({ amountMin: r.min, amountMax: r.max })
    }
    setSelectedCaseId(caseId)
    navigate('/case-review')
  }

  const goToFilteredCases = () => {
    resetCaseFilters()
    if (activeCompType) setCaseFilters({ compType: activeCompType })
    if (activeRangeIdx != null) {
      const r = AMOUNT_RANGES[activeRangeIdx]
      setCaseFilters({ amountMin: r.min, amountMax: r.max })
    }
    navigate('/case-review')
  }

  const toggleCompType = (t: CompensationType) => {
    setActiveCompType(activeCompType === t ? null : t)
  }
  const toggleRange = (i: number) => {
    setActiveRangeIdx(activeRangeIdx === i ? null : i)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">赔付结构分析</h1>

      {(activeCompType || activeRangeIdx != null) && (
        <div className="glass-card rounded-xl p-4 flex flex-wrap items-center gap-3">
          <span className="text-sm text-slate-light">当前筛选：</span>
          {activeCompType && (
            <button
              onClick={() => setActiveCompType(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coral/10 text-coral border border-coral/30 text-sm hover:bg-coral/20 transition-colors"
            >
              赔付方式：{COMPENSATION_TYPE_LABELS[activeCompType]}
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {activeRangeIdx != null && (
            <button
              onClick={() => setActiveRangeIdx(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber/10 text-amber border border-amber/30 text-sm hover:bg-amber/20 transition-colors"
            >
              金额区间：{AMOUNT_RANGES[activeRangeIdx].label}
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <div className="ml-auto flex items-center gap-4 text-sm">
            <span className="text-slate-light">
              匹配 <span className="font-tabular text-coral font-semibold">{previewSummary.count}</span> 件
            </span>
            <span className="text-slate-light">
              合计 <span className="font-tabular text-amber font-semibold">{formatAmount(previewSummary.total)}</span>
            </span>
            <button
              onClick={goToFilteredCases}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-ice/10 text-ice border border-ice/30 rounded-lg hover:bg-ice/20 transition-colors"
            >
              去案例抽检查明细 <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut: type distribution */}
        <div className="glass-card rounded-xl p-5">
          <h2 className="text-sm font-medium text-slate-light mb-4">赔付类型分布（点击筛选案例）</h2>
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
                  onClick={(d: any) => toggleCompType(d.type)}
                  style={{ cursor: 'pointer' }}
                >
                  {pieData.map(d => (
                    <Cell
                      key={d.type}
                      fill={TYPE_COLORS[d.type]}
                      stroke={activeCompType === d.type ? '#fff' : 'transparent'}
                      strokeWidth={activeCompType === d.type ? 2 : 0}
                      opacity={!activeCompType || activeCompType === d.type ? 1 : 0.35}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(100,116,139,0.3)', borderRadius: 8 }}
                  formatter={(v: number, name: string, p: any) => [
                    `${formatAmount(v)}（${p.payload.count} 件）`,
                    COMPENSATION_TYPE_LABELS[name as CompensationType],
                  ]}
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
          <div className="flex flex-wrap gap-2 mt-3">
            {pieData.map(d => (
              <button
                key={d.type}
                onClick={() => toggleCompType(d.type)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-colors ${activeCompType === d.type ? 'ring-2 ring-white/60' : ''}`}
                style={{
                  background: `${TYPE_COLORS[d.type]}22`,
                  border: `1px solid ${TYPE_COLORS[d.type]}55`,
                  color: TYPE_COLORS[d.type],
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: TYPE_COLORS[d.type] }} />
                {COMPENSATION_TYPE_LABELS[d.type]} · {d.count}件
              </button>
            ))}
          </div>
        </div>

        {/* Bar: amount distribution */}
        <div className="glass-card rounded-xl p-5">
          <h2 className="text-sm font-medium text-slate-light mb-4">赔付金额分布（点击筛选案例）</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                onClick={(e: any) => {
                  if (e?.activePayload?.[0]?.payload?.idx != null) {
                    toggleRange(e.activePayload[0].payload.idx)
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
                <XAxis dataKey="range" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(100,116,139,0.3)', borderRadius: 8 }}
                  formatter={(v: number) => [`${v} 件`, '案件数']}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} cursor="pointer">
                  {barData.map((d, i) => (
                    <Cell
                      key={i}
                      fill={activeRangeIdx === d.idx ? '#F59E0B' : '#10B981'}
                      fillOpacity={activeRangeIdx == null || activeRangeIdx === d.idx ? 1 : 0.35}
                      stroke={activeRangeIdx === d.idx ? '#fff' : 'transparent'}
                      strokeWidth={2}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Preview filtered cases */}
      {(activeCompType || activeRangeIdx != null) && previewCases.length > 0 && (
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-slate-light">
              匹配案例预览（Top 8 by 赔付额）
            </h2>
            <span className="text-xs text-slate">共 {previewCases.length} 条，合计 {formatAmount(previewSummary.total)}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {previewCases.slice(0, 8).map(c => (
              <div
                key={c.id}
                onClick={() => goToCase(c.id)}
                className="border border-dark-700/60 rounded-lg p-3 cursor-pointer hover:bg-white/[0.03] transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-light">{c.id}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-ice" />
                </div>
                <div className="font-tabular text-base font-bold text-amber">¥{c.compensationAmount.toLocaleString()}</div>
                <div className="text-sm text-white truncate">{resolveProject(c.projectId)}</div>
                <div className="text-xs text-slate-light flex items-center gap-1.5">
                  <span>{resolveStore(c.storeId)}</span>
                  <span>·</span>
                  <span>{COMPENSATION_TYPE_LABELS[c.compensationType]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                className="border border-coral/50 rounded-lg p-4 animate-glow space-y-2 cursor-pointer hover:bg-coral/5 transition-colors"
                onClick={() => goToCase(c.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-light">{c.id}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-tabular text-lg font-bold text-coral">
                      ¥{c.compensationAmount.toLocaleString()}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-ice" />
                  </div>
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
