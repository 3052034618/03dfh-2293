import { useMemo } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts'
import { ArrowLeft, ExternalLink, MessageSquare } from 'lucide-react'
import { stores, projects, complaintCases, months, monthlyReviews, personnel } from '@/data/mockData'
import { COMPENSATION_TYPE_LABELS, REASON_CATEGORIES, PERSONNEL_ROLE_LABELS } from '@/types'
import type { CompensationType } from '@/types'
import { useAppStore } from '@/store/useAppStore'

const COMP_COLORS: Record<CompensationType, string> = {
  refund: '#EF4444',
  rework: '#F59E0B',
  repair: '#38BDF8',
  gift: '#10B981',
  cash: '#A78BFA',
}

const CATEGORY_COLORS: Record<string, string> = {
  expectation: '#EF4444',
  education: '#F59E0B',
  service: '#38BDF8',
  technique: '#10B981',
  communication: '#A78BFA',
  management: '#F97316',
}

function formatAmount(v: number) {
  return v >= 10000 ? `¥${(v / 10000).toFixed(1)}万` : `¥${v.toLocaleString()}`
}

export default function StoreMonthlyDetail() {
  const params = useParams<{ storeId: string }>()
  const navigate = useNavigate()
  const setCaseFilters = useAppStore(s => s.setCaseFilters)
  const resetCaseFilters = useAppStore(s => s.resetCaseFilters)
  const setSelectedCaseId = useAppStore(s => s.setSelectedCaseId)

  const store = stores.find(s => s.id === params.storeId)
  const storeCases = useMemo(
    () => (store ? complaintCases.filter(c => c.storeId === store.id) : []),
    [store],
  )
  const storeReviews = useMemo(
    () => (store ? monthlyReviews.filter(r => r.storeId === store.id) : []),
    [store],
  )

  const trendData = useMemo(() => {
    return months.map((m, i) => {
      const monthCases = storeCases.filter(c => {
        const month = parseInt(c.complaintDate.split('-')[1], 10)
        return month === i + 1
      })
      return {
        month: m,
        complaints: monthCases.length,
        amount: monthCases.reduce((s, c) => s + c.compensationAmount, 0),
      }
    })
  }, [storeCases])

  // top projects by complaint count
  const projectStat = useMemo(() => {
    const map = new Map<string, { count: number; amount: number }>()
    for (const c of storeCases) {
      const e = map.get(c.projectId) || { count: 0, amount: 0 }
      e.count += 1
      e.amount += c.compensationAmount
      map.set(c.projectId, e)
    }
    return [...map.entries()]
      .map(([pid, s]) => ({
        projectId: pid,
        name: projects.find(p => p.id === pid)?.name ?? pid,
        count: s.count,
        amount: s.amount,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }, [storeCases])

  // compensation type pie
  const compTypeStat = useMemo(() => {
    const map = new Map<CompensationType, { count: number; amount: number }>()
    for (const c of storeCases) {
      const e = map.get(c.compensationType) || { count: 0, amount: 0 }
      e.count += 1
      e.amount += c.compensationAmount
      map.set(c.compensationType, e)
    }
    return [...map.entries()].map(([t, s]) => ({ type: t, count: s.count, amount: s.amount }))
  }, [storeCases])

  // top high-comp cases
  const highCompCases = useMemo(
    () => [...storeCases].sort((a, b) => b.compensationAmount - a.compensationAmount).slice(0, 5),
    [storeCases],
  )

  // repeat customers
  const repeatCustomers = useMemo(() => {
    const m = new Map<string, { count: number; cases: string[] }>()
    for (const c of storeCases) {
      const e = m.get(c.customerId) || { count: 0, cases: [] }
      e.count += 1
      e.cases.push(c.id)
      m.set(c.customerId, e)
    }
    return [...m.entries()]
      .filter(([, v]) => v.count >= 2)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
  }, [storeCases])

  // personnel top
  const personnelTop = useMemo(() => {
    const map = new Map<string, { count: number; amount: number }>()
    for (const c of storeCases) {
      for (const pid of c.personnelIds) {
        const e = map.get(pid) || { count: 0, amount: 0 }
        e.count += 1
        e.amount += c.compensationAmount
        map.set(pid, e)
      }
    }
    return [...map.entries()]
      .map(([pid, s]) => {
        const p = personnel.find(x => x.id === pid)
        return {
          id: pid,
          name: p?.name ?? pid,
          role: p?.role,
          count: s.count,
          amount: s.amount,
        }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [storeCases])

  // reason category
  const reasonStat = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of storeCases) {
      map.set(c.reasonCategory, (map.get(c.reasonCategory) || 0) + 1)
    }
    return [...map.entries()].map(([k, v]) => ({ key: k, label: REASON_CATEGORIES[k] ?? k, count: v }))
  }, [storeCases])

  const closedCount = storeCases.filter(c => c.status === 'closed').length
  const totalAmount = storeCases.reduce((s, c) => s + c.compensationAmount, 0)
  const avgHandle = store
    ? store.avgHandleDays
    : storeCases.reduce((s, c) => s + (store?.avgHandleDays ?? 10), 0) / Math.max(1, storeCases.length)

  const goToCases = (filters: Record<string, any>) => {
    resetCaseFilters()
    setCaseFilters({ storeId: store?.id ?? '', ...filters })
    navigate('/case-review')
  }

  const goToCase = (caseId: string) => {
    resetCaseFilters()
    setCaseFilters({ storeId: store?.id ?? '' })
    setSelectedCaseId(caseId)
    navigate('/case-review')
  }

  if (!store) {
    return (
      <div className="space-y-4">
        <Link to="/overview" className="inline-flex items-center gap-2 text-slate-light hover:text-ice text-sm">
          <ArrowLeft className="w-4 h-4" /> 返回总览
        </Link>
        <div className="glass-card rounded-xl p-8 text-center text-slate-light">未找到该门店</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/overview" className="inline-flex items-center gap-2 text-slate-light hover:text-ice text-sm">
          <ArrowLeft className="w-4 h-4" /> 返回总览
        </Link>
        <Link to="/store-compare" className="text-slate-light hover:text-ice text-sm border-l border-dark-700 pl-3">
          返回门店对比
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{store.name}</h1>
          <p className="text-slate-light text-sm mt-1">{store.region}大区 · 月度经营复盘</p>
        </div>
        <button
          onClick={() => goToCases({})}
          className="inline-flex items-center gap-2 px-4 py-2 bg-ice/10 text-ice border border-ice/30 rounded-lg text-sm hover:bg-ice/20 transition-colors"
        >
          查看该门店全部案例 <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {([
          ['总投诉量', storeCases.length, 'text-coral'],
          ['结案数', closedCount, 'text-emerald'],
          ['平均处理天数', avgHandle.toFixed(1) + '天', 'text-amber'],
          ['赔付总额', formatAmount(totalAmount), 'text-ice'],
        ] as const).map(([label, val, color]) => (
          <div key={label} className="glass-card rounded-xl p-5">
            <div className="text-xs text-slate-light">{label}</div>
            <div className={`font-tabular text-2xl font-bold mt-1 ${color}`}>{val}</div>
          </div>
        ))}
      </div>

      {/* Trend */}
      <div className="glass-card rounded-xl p-5">
        <h2 className="text-sm font-medium text-slate-light mb-4">近 6 个月投诉与赔付趋势</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
              <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <YAxis yAxisId="count" tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <YAxis
                yAxisId="amount"
                orientation="right"
                tick={{ fill: '#94A3B8', fontSize: 12 }}
                tickFormatter={(v: number) => v >= 10000 ? `${(v / 10000).toFixed(0)}万` : String(v)}
              />
              <Tooltip
                contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(100,116,139,0.3)', borderRadius: 8 }}
                formatter={(v: number, name: string) => [
                  name === 'amount' ? formatAmount(v) : `${v} 件`,
                  name === 'amount' ? '赔付金额' : '投诉量',
                ]}
              />
              <Legend />
              <Line yAxisId="count" type="monotone" dataKey="complaints" name="投诉量" stroke="#10B981" strokeWidth={2} dot={{ r: 4, fill: '#10B981' }} />
              <Line yAxisId="amount" type="monotone" dataKey="amount" name="赔付金额" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4, fill: '#F59E0B' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top projects + comp type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-5">
          <h2 className="text-sm font-medium text-slate-light mb-4">高频投诉项目 Top6</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectStat} layout="vertical" margin={{ left: 60, right: 20, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
                <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94A3B8', fontSize: 12 }} width={55} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(100,116,139,0.3)', borderRadius: 8 }}
                  formatter={(v: number, name: string) => [
                    name === 'count' ? `${v} 件` : formatAmount(v),
                    name === 'count' ? '投诉数' : '赔付金额',
                  ]}
                />
                <Legend />
                <Bar dataKey="count" name="投诉数" fill="#38BDF8" radius={[0, 4, 4, 0]} barSize={14} />
                <Bar dataKey="amount" name="赔付金额" fill="#F59E0B" radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {projectStat.map(p => (
              <button
                key={p.projectId}
                onClick={() => goToCases({ projectId: p.projectId })}
                className="text-xs px-2.5 py-1 rounded-full bg-ice/10 text-ice border border-ice/30 hover:bg-ice/20 transition-colors"
              >
                {p.name} ({p.count}) →
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-xl p-5">
          <h2 className="text-sm font-medium text-slate-light mb-4">赔付类型分布</h2>
          <div className="flex items-center gap-6">
            <div className="relative w-56 h-56 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={compTypeStat}
                    dataKey="amount"
                    nameKey="type"
                    innerRadius={45}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {compTypeStat.map(d => <Cell key={d.type} fill={COMP_COLORS[d.type]} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(100,116,139,0.3)', borderRadius: 8 }}
                    formatter={(v: number, n: string) => [formatAmount(v), COMPENSATION_TYPE_LABELS[n as CompensationType]]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="font-tabular text-lg font-bold text-white">{formatAmount(totalAmount)}</div>
                  <div className="text-xs text-slate-light mt-1">合计</div>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {compTypeStat.map(d => (
                <button
                  key={d.type}
                  onClick={() => goToCases({ compType: d.type })}
                  className="w-full flex items-center gap-2 text-sm px-2 py-1.5 rounded hover:bg-dark-800/60 transition-colors text-left"
                >
                  <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: COMP_COLORS[d.type] }} />
                  <span className="text-slate-light">{COMPENSATION_TYPE_LABELS[d.type]}</span>
                  <span className="ml-auto font-tabular text-white">{d.count} 件</span>
                  <span className="font-tabular text-amber">{formatAmount(d.amount)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* High comp cases */}
      <div className="glass-card rounded-xl p-5">
        <h2 className="text-sm font-medium text-slate-light mb-4">高额赔付案例 TOP5</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          {highCompCases.map(c => {
            const proj = projects.find(p => p.id === c.projectId)
            return (
              <div
                key={c.id}
                onClick={() => goToCase(c.id)}
                className="border border-coral/50 rounded-lg p-3 cursor-pointer hover:bg-coral/5 transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-light">{c.id}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-ice" />
                </div>
                <div className="font-tabular text-lg font-bold text-coral">¥{c.compensationAmount.toLocaleString()}</div>
                <div className="text-sm text-white truncate">{proj?.name ?? c.projectId}</div>
                <div className="text-xs text-slate-light flex items-center gap-1.5">
                  <span>{COMPENSATION_TYPE_LABELS[c.compensationType]}</span>
                  <span>·</span>
                  <span>{c.complaintDate}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personnel top */}
        <div className="glass-card rounded-xl p-5">
          <h2 className="text-sm font-medium text-slate-light mb-4">高关联人员 Top5</h2>
          <div className="space-y-2">
            {personnelTop.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 px-2 py-2 rounded hover:bg-dark-800/60">
                <span className="w-6 h-6 rounded-full bg-dark-700 text-xs text-slate-light flex items-center justify-center font-tabular">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm truncate">
                    {p.name}
                    {p.role && <span className="ml-2 text-xs text-slate-light">({PERSONNEL_ROLE_LABELS[p.role]})</span>}
                  </div>
                  <div className="text-xs text-slate-light">涉及 {p.count} 起投诉 · 赔付 {formatAmount(p.amount)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Repeat customers */}
        <div className="glass-card rounded-xl p-5">
          <h2 className="text-sm font-medium text-slate-light mb-4">复诉客户（本门店）</h2>
          {repeatCustomers.length === 0 ? (
            <p className="text-slate-light text-sm">暂无复诉客户</p>
          ) : (
            <div className="space-y-2">
              {repeatCustomers.map(([cid, v]) => (
                <div key={cid} className="flex items-center gap-3 px-2 py-2 rounded hover:bg-dark-800/60">
                  <span className="font-tabular text-ice text-sm">{cid}</span>
                  <span className="text-slate-light text-xs">投诉 {v.count} 次</span>
                  <div className="ml-auto flex gap-1 flex-wrap">
                    {v.cases.slice(0, 3).map(id => (
                      <button
                        key={id}
                        onClick={() => goToCase(id)}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-coral/10 text-coral border border-coral/30 hover:bg-coral/20 font-tabular"
                      >
                        {id}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reason */}
      <div className="glass-card rounded-xl p-5">
        <h2 className="text-sm font-medium text-slate-light mb-4">投诉原因分类</h2>
        <div className="flex flex-wrap gap-2">
          {reasonStat.map(r => (
            <button
              key={r.key}
              onClick={() => goToCases({ reasonCategory: r.key })}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors hover:scale-[1.02]"
              style={{
                backgroundColor: `${CATEGORY_COLORS[r.key] || '#64748B'}18`,
                border: `1px solid ${CATEGORY_COLORS[r.key] || '#64748B'}40`,
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLORS[r.key] || '#64748B' }} />
              <span className="text-white/90">{r.label}</span>
              <span className="font-tabular text-white">{r.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Monthly review detail */}
      {storeReviews.length > 0 && (
        <div className="glass-card rounded-xl p-5">
          <h2 className="text-sm font-medium text-slate-light mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-ice" />
            月度复盘详情
          </h2>
          <div className="space-y-3">
            {storeReviews.map(r => (
              <div key={r.month} className="border border-dark-700/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{r.storeName}</span>
                  <span className="text-xs text-slate">{r.month}</span>
                </div>
                <p className="text-slate-light text-sm leading-relaxed">{r.summary}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="bg-dark-800/60 rounded px-2 py-1.5">
                    <span className="text-slate">投诉数 </span>
                    <span className="font-tabular text-coral ml-1">{r.keyMetrics.complaintCount}</span>
                  </div>
                  <div className="bg-dark-800/60 rounded px-2 py-1.5">
                    <span className="text-slate">结案率 </span>
                    <span className="font-tabular text-emerald ml-1">{r.keyMetrics.closeRate}%</span>
                  </div>
                  <div className="bg-dark-800/60 rounded px-2 py-1.5">
                    <span className="text-slate">平均处理天 </span>
                    <span className="font-tabular text-amber ml-1">{r.keyMetrics.avgHandleDays}</span>
                  </div>
                  <div className="bg-dark-800/60 rounded px-2 py-1.5">
                    <span className="text-slate">总赔付 </span>
                    <span className="font-tabular text-ice ml-1">¥{r.keyMetrics.totalCompensation.toLocaleString()}</span>
                  </div>
                </div>
                {r.issues.length > 0 && (
                  <div>
                    <div className="text-xs text-slate mb-1">问题</div>
                    <ul className="list-disc list-inside text-xs text-coral-light space-y-0.5">
                      {r.issues.map((x, i) => <li key={i}>{x}</li>)}
                    </ul>
                  </div>
                )}
                {r.trainingSuggestions.length > 0 && (
                  <div>
                    <div className="text-xs text-slate mb-1">培训建议</div>
                    <ul className="list-disc list-inside text-xs text-amber-light space-y-0.5">
                      {r.trainingSuggestions.map((x, i) => <li key={i}>{x}</li>)}
                    </ul>
                  </div>
                )}
                {r.projectAdjustments.length > 0 && (
                  <div>
                    <div className="text-xs text-slate mb-1">项目调整 / 建议动作</div>
                    <ul className="list-disc list-inside text-xs text-ice-light space-y-0.5">
                      {r.projectAdjustments.map((x, i) => <li key={i}>{x}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
